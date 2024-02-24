import 'dotenv/config';
import Redis from 'ioredis';

// export const redis = new Redis(
//   process.env.REDIS_URL || 'redis://127.0.0.1:6379'
// );

export const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  username: process.env.REDIS_USER || '',
  password: process.env.REDIS_PASSWORD || '',
  db: 0, // Defaults to 0
});
console.log('Connected to Redis...');
