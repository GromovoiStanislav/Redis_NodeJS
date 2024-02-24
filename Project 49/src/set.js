import { redis } from './lib/redis.js';

const main = async () => {
  const numbers = [1, 3, 5, 7, 9];
  // or `await redis.desaddl("user-set", 1, 3, 5, 7, 9)`;
  await redis.sadd('user-set', numbers);

  const elementCount = await redis.scard('user-set');
  console.log(elementCount); // 5

  await redis.sadd('user-set', '1');
  const newElementCount = await redis.scard('user-set');
  console.log(newElementCount); // 5

  const isMember = await redis.sismember('user-set', 3);
  console.log(isMember); // 1 (means true, and if it's 0, it means false)

  {
    const isMember = await redis.sismember('user-set', 4);
    console.log(isMember); // 0 (means true, and if it's 0, it means false)
  }

  const all = await redis.smembers('user-set');
  console.log(all); // [ '1', '3', '5', '7', '9' ]

  await redis.quit();
};

main();
