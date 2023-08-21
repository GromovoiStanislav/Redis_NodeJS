import { redis } from './lib/redis.js';

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
console.log(typeof res2, res2);
if (JSON.stringify(value) != JSON.stringify(res2)) {
  throw new Error('value not equal');
}

// sorted set
// await redis.zadd('scores', { score: 1, member: 'team1' });
// await redis.zadd('scores', { score: 3, member: 'team2' });
// await redis.zadd('scores', { score: 0, member: 'team3' });

// await redis.zadd(
//   'scores',
//   ...[
//     { score: 1, member: 'team1' },
//     { score: 3, member: 'team2' },
//     { score: 0, member: 'team3' },
//   ]
// );

await redis.zadd(
  'scores',
  { score: 1, member: 'team1' },
  { score: 3, member: 'team2' },
  { score: 0, member: 'team3' }
);

data = await redis.zrange('scores', 0, 100);
console.log(data);
data = await redis.zrange('scores', 0, 100, { withScores: true });
console.log(data);

// list
await redis.lpush('elements', 'item 1');
await redis.lpush('elements', 'item 2');
await redis.lpush('elements', 'item 3');
data = await redis.lrange('elements', 0, 100);
console.log(data);

// hash
await redis.hset('people', { name: 'joe', age: 25 });
data = await redis.hget('people', 'name');
console.log(data);
data = await redis.hgetall('people');
console.log(data);

// sets
await redis.sadd('animals', 'cat');
await redis.sadd('animals', 'dog');
await redis.sadd('animals', 'cat');
data = await redis.smembers('animals');
console.log(data);
data = await redis.spop('animals', 1);
console.log(data);
data = await redis.smembers('animals');
console.log(data);
