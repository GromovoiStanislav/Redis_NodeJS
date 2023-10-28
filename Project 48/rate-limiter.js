const Redis = require('ioredis');
const moment = require('moment');

const redisClient = new Redis({ url: 'redis://localhost:6379' });

const RATELIMIT_DURATION_IN_SECONDS = 60;
const NUMBER_OF_REQUEST_ALLOWED = 5;

module.exports = {
  rateLimiter: async (req, res, next) => {
    const userId = req.headers['user_id'];
    const currentTime = moment().unix();

    const result = await redisClient.hgetall(userId);

    if (Object.keys(result).length === 0) {
      await redisClient.hmset(userId, {
        createdAt: currentTime,
        count: 1,
      });
      await redisClient.expire(userId, RATELIMIT_DURATION_IN_SECONDS);
      return next();
    }

    if (result) {
      if (currentTime - result['createdAt'] > RATELIMIT_DURATION_IN_SECONDS) {
        await redisClient.hmset(userId, {
          createdAt: currentTime,
          count: 1,
        });
        return next();
      }

      if (result['count'] >= NUMBER_OF_REQUEST_ALLOWED) {
        return res.status(429).json({
          success: false,
          message: 'user-ratelimited',
        });
      } else {
        await redisClient.hmset(userId, {
          count: parseInt(result['count']) + 1,
        });
        return next();
      }
    }

    next();
  },
};
