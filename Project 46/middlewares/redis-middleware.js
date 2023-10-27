import redisClient from '../db/redis-db.js';

const redisMiddleware = async (req, res, next) => {
  let reply;
  switch (req.url) {
    case '/posts':
      reply = await redisClient.get('posts');
      if (reply !== null) {
        res.send(reply);
        console.log('from redis!');
      } else {
        next();
      }
      break;

    case '/users':
      reply = await redisClient.get('users');
      if (reply !== null) {
        res.send(reply);
        console.log('from redis!');
      } else {
        next();
      }

      break;

    case '/comments':
      reply = await redisClient.get('comments');
      if (reply !== null) {
        res.send(reply);
        console.log('from redis!');
      } else {
        next();
      }

      break;
  }
};

export default redisMiddleware;
