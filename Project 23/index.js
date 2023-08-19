import express from 'express';
import { nanoid } from 'nanoid';
import cookieParser from 'cookie-parser';
import { redisClient } from './redis.js';
import { middleware } from './middleware.js';

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(middleware);

app.get('/', async (req, res) => {
  const userId = req.cookies['userId'];
  res.send(`userId: ${userId}`);
});

app.post('/comments', async (req, res) => {
  const { text, tags } = req.body;

  const commentId = nanoid();

  const comment = {
    text,
    tags,
    timestamp: new Date().toISOString(),
    upvotes: 0,
    author: req.cookies['userId'],
  };

  // await Promise.all([
  //   //add commeent to list
  //   redisClient.rpush('comments', commentId),
  //   //redisClient.json.set(`comment:${commentId}`, '$', comment),
  //   redisClient.call(
  //     'JSON.SET',
  //     `comment:${commentId}`,
  //     '$',
  //     JSON.stringify(comment)
  //   ),

  redisClient.call(
    'JSON.NUMINCRBY',
    `comment:PS16FWLTQC9oAaMKflkiN`,
    '$.upvotes',
    1
  );

  // //add tags to set
  // redisClient.sadd(`trags:${commentId}`, tags),

  // //add comment to hash
  // //await redisClient.hset(`comment_ditails:${commentId}`, comment); // Error
  // redisClient.hset(`comment_details:${commentId}`, 'text', comment.text),
  // redisClient.hset(
  //   `comment_details:${commentId}`,
  //   'timestamp',
  //   comment.timestamp
  // ),
  // redisClient.hset(`comment_details:${commentId}`, 'author', comment.author),
  //]);

  res.send(commentId);
});

app.get('/comments', async (req, res) => {
  const commentIds = await redisClient.lrange('comments', 0, -1);

  const comments = await Promise.all(
    commentIds.map(async (commentId) => {
      const details = await redisClient.hgetall(`comment_details:${commentId}`);
      const tags = await redisClient.smembers(`trags:${commentId}`);
      return {
        commentId,
        details,
        tags,
      };
    })
  );

  res.json(comments);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log('Server started on port ' + PORT);
});
