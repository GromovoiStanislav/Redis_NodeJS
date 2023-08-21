import 'dotenv/config';
import { Redis } from '@upstash/redis';

// Create Redis Client
export const redisClient = Redis.fromEnv();

console.log('Connected to Redis...');
