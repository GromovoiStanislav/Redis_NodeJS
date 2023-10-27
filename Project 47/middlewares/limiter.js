const redis = require('redis');
const { rateLimit } = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

const { endpointUri } = require('../config').redis;

const redisClient = redis.createClient(endpointUri);
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

const limiter = rateLimit({
  // Redis store configuration
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),

  // Rate limiter configuration
  max: 10,
  windowMs: 10 * 1000,
});

module.exports = limiter;
