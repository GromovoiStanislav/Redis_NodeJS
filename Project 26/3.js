import { redis } from './lib/redis.js';

const size = await redis.scard('random');
if (size === 0) {
  await redis.sadd('random', 'Hello', 'World', 'Welcome', 'to', 'Upstash');
}

const members = await redis.smembers('random');
console.log(members);

const random = await redis.srandmember('random');
console.log(random);
