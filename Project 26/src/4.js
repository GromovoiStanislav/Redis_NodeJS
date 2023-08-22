import { redis } from './lib/redis.js';

let count = await redis.incr('count');
console.log(count);

count = await redis.incr('count');
console.log(count);

count = await redis.incr('count');
console.log(count);

count = await redis.decr('count');
console.log(count);

count = await redis
  .createScript("return redis.call('INCR', KEYS[1]);")
  .exec(['count'], []);
console.log(count);
