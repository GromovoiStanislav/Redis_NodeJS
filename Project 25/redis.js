import 'dotenv/config';
import { Redis } from '@upstash/redis';

// Create Redis Client

// export const redisClient = new Redis({
//   url: 'https://worthy-glowworm-36772.upstash.io',
//   token:
//     'AY-kACQgZTJmZGYyNjAtMzFkMy00MmI2LTgxMTctZGE4YTg3Mjk5NWRiMzQyNzFjZmE5YTFhNDE2MDgyYjkyMDE2MTE4M2ZkZGE=',
// });

export const redisClient = Redis.fromEnv();

console.log('Connected to Redis...');
