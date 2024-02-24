import { redis } from './lib/redis.js';

const main = async () => {
  // Redis#call() can be used to call arbitrary Redis commands.
  // The first parameter is the command name, the rest are arguments.
  await redis.call('JSON.SET', 'doc', '$', '{"f1": {"a":1}, "f2":{"a":2}}');
  const json = await redis.call('JSON.GET', 'doc', '$..f1');
  console.log(json); // [{"a":1}]

  await redis.quit();
};

main();
