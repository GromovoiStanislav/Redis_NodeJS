import 'dotenv/config';
import { createClient } from 'redis';

// Create Redis Client
let redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
});
redisClient.on('error', (error) => console.error(error));
await redisClient.connect();
console.log('Connected to Redis...');

export { redisClient };
