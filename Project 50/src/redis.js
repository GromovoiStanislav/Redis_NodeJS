const Redis = require('ioredis');

// const redis = new Redis(
//   process.env.REDIS_URL || 'redis://127.0.0.1:6379'
// );

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  username: process.env.REDIS_USER || '',
  password: process.env.REDIS_PASSWORD || '',
  db: 0, // Defaults to 0
});

// Create a shared Redis instance for the entire application.
// Redis is single-thread so you don't need to create multiple instances
// or use a connection pool.
module.exports = redis;
