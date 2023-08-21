import express from 'express';
import { nanoid } from 'nanoid';
import cookieParser from 'cookie-parser';
import { redisClient } from './redis.js';
import { middleware } from './middleware.js';

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(middleware);

app.get('/user', async (req, res) => {
  const userId = req.cookies['userId'];
  res.send(`userId: ${userId}`);
});

app.delete('/all', async (req, res) => {
  await redisClient.flushall();
  res.send('OK');
});

//////////////////////////////////////////////////////////////////////

app.post('/v1/comments', async (req, res) => {
  const { text, tags } = req.body;

  const commentId = nanoid();

  const comment = {
    text,
    tags: JSON.stringify(tags),
    timestamp: new Date().toISOString(),
    upvotes: 0,
    author: req.cookies['userId'],
  };

  await Promise.all([
    // add commeent to list
    redisClient.rpush('comments', commentId),

    // add tags to set
    redisClient.sadd(`tags:${commentId}`, tags),

    // add comment to hash
    redisClient.hmset(`comment_details:${commentId}`, comment),
  ]);

  res.send(commentId);
});

app.put('/v1/comments/:commentId', async (req, res) => {
  const { commentId } = req.params;
  const { text, tags } = req.body;

  const index = await redisClient.lpos('comments', commentId);
  if (index === null) {
    res.status(404).send('Not found');
    return;
  }

  await Promise.all([
    redisClient.hincrby(`comment_details:${commentId}`, 'upvotes', 1),
    redisClient.hset(`comment_details:${commentId}`, 'text', text),
    redisClient.hset(
      `comment_details:${commentId}`,
      'tags',
      JSON.stringify(tags)
    ),
    await redisClient.del(`tags:${commentId}`),
    redisClient.sadd(`tags:${commentId}`, tags),
  ]);

  res.send('OK');
});

app.delete('/v1/comments/:commentId', async (req, res) => {
  const { commentId } = req.params;

  const index = await redisClient.lpos('comments', commentId);
  if (index === null) {
    res.status(404).send('Not found');
    return;
  }

  await Promise.all([
    redisClient.lrem('comments', 0, commentId),
    redisClient.del(`comment_details:${commentId}`),
    redisClient.del(`tags:${commentId}`),
  ]);

  res.send('OK');
});

app.get('/v1/comments', async (req, res) => {
  const commentIds = await redisClient.lrange('comments', 0, -1);

  const comments = await Promise.all(
    commentIds.map(async (commentId) => {
      const details = await redisClient.hgetall(`comment_details:${commentId}`);
      try {
        details.tags = JSON.parse(details.tags);
      } catch (err) {}

      const tags = await redisClient.smembers(`tags:${commentId}`);
      return {
        commentId,
        details,
        tags,
      };
    })
  );

  res.json(comments);
});

app.get('/v1/comments/:commentId', async (req, res) => {
  const { commentId } = req.params;

  const index = await redisClient.lpos('comments', commentId);
  if (index === null) {
    res.status(404).send('Not found');
    return;
  }

  const [details, tags] = await Promise.all([
    redisClient.hgetall(`comment_details:${commentId}`),
    redisClient.smembers(`tags:${commentId}`),
  ]);

  details.tags = JSON.parse(details.tags);

  const comment = {
    commentId,
    details,
    tags,
  };

  res.json(comment);
});

/////////////////////////////////////////////////////////

app.post('/v2/comments', async (req, res) => {
  const { text, tags } = req.body;

  const commentId = nanoid();

  const comment = {
    text,
    tags,
    timestamp: new Date().toISOString(),
    upvotes: 0,
    author: req.cookies['userId'],
  };

  await Promise.all([
    // add commeent to list
    redisClient.rpush('comments', commentId),

    // add commeent to JSON
    redisClient.call(
      'JSON.SET',
      `comment:${commentId}`,
      '$',
      JSON.stringify(comment)
    ),
  ]);

  res.send(commentId);
});

app.put('/v2/comments/:commentId', async (req, res) => {
  const { commentId } = req.params;
  const { text, tags } = req.body;

  const index = await redisClient.lpos('comments', commentId);
  if (index === null) {
    res.status(404).send('Not found');
    return;
  }

  await Promise.all([
    redisClient.call('JSON.NUMINCRBY', `comment:${commentId}`, '$.upvotes', 1),

    redisClient.call(
      'JSON.SET',
      `comment:${commentId}`,
      '$.text',
      JSON.stringify(text)
    ),

    redisClient.call(
      'JSON.SET',
      `comment:${commentId}`,
      '$.tags',
      JSON.stringify(tags)
    ),
  ]);

  res.send('OK');
});

app.delete('/v2/comments/:commentId', async (req, res) => {
  const { commentId } = req.params;

  const index = await redisClient.lpos('comments', commentId);
  if (index === null) {
    res.status(404).send('Not found');
    return;
  }

  await Promise.all([
    redisClient.lrem('comments', 0, commentId),
    //redisClient.call('JSON.DEL', `comment:${commentId}`),
    redisClient.del(`comment:${commentId}`),
  ]);

  res.send('OK');
});

app.get('/v2/comments', async (req, res) => {
  const commentIds = await redisClient.lrange('comments', 0, -1);

  const comments = await Promise.all(
    commentIds.map(async (commentId) => {
      const details = JSON.parse(
        await redisClient.call('JSON.GET', `comment:${commentId}`)
      );
      return {
        commentId,
        details,
      };
    })
  );

  res.json(comments);
});

app.get('/v2/comments/:commentId', async (req, res) => {
  const { commentId } = req.params;

  const index = await redisClient.lpos('comments', commentId);
  if (index === null) {
    res.status(404).send('Not found');
    return;
  }

  const details = JSON.parse(
    await redisClient.call('JSON.GET', `comment:${commentId}`)
  );
  const comment = {
    commentId,
    details,
  };

  res.json(comment);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log('Server started on port ' + PORT);
});
