import { redis } from './lib/redis.js';

redis.use(async (req, next) => {
  console.log('req', JSON.stringify(req, null, 2));
  const res = await next(req);
  console.log('res', JSON.stringify(res, null, 2));
  return res;
});

// string
await redis.set('key', 'value');
let data = await redis.get('key');
console.log(data);

await redis.set('key2', 'value2', { ex: 1 });

const key = 'key';
const value = { hello: 'world' };
const res1 = await redis.set(key, value);
console.log(res1);
const res2 = await redis.get(key);
console.log(res2);
