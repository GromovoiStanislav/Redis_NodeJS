import { redis } from './lib/redis.js';

const main = async () => {
  const numbers = [1, 3, 5, 7, 9];
  await redis.lpush('user-list', numbers);

  const popped = await redis.lpop('user-list');
  console.log(popped); // 9

  const all = await redis.lrange('user-list', 0, -1);
  console.log(all); // [ '7', '5', '3', '1' ]

  const position = await redis.lpos('user-list', 5);
  console.log(position); // 1

  setTimeout(() => {
    // `redis` is in the block mode due to `redis.blpop()`,
    // so we duplicate a new connection to invoke LPUSH command.
    //redis.duplicate().lpush('block-list', 'hello');
    redis.duplicate().lpush('block-list', 'hello');
  }, 3000);

  const blockPopped = await redis.blpop('block-list', 0); // Resolved after 3000ms.
  console.log(blockPopped); // [ 'block-list', 'hello' ]
};

main();
