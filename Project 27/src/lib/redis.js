import 'dotenv/config';
import Redis from 'ioredis';

// Create Redis Client

export const client = new Redis(
  process.env.REDIS_URL || 'redis://127.0.0.1:6379'
);

//export const client = new Redis(6379, '127.0.0.1');

//export const client = new Redis({
//   port: 6379, // Redis port
//   host: "127.0.0.1", // Redis host
//   db: 0, // Defaults to 0
// });
console.log('Connected to Redis...');
