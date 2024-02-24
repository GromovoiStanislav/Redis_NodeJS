import { redis } from './lib/redis.js';

const main = async () => {
  // ioredis supports all Redis commands:

  await redis.set('foo', 'bar');

  redis.get('foo', function (err, result) {
    if (err) {
      console.error(err);
    } else {
      console.log(result);
    }
  });

  // Or using a promise if the last argument isn't a function
  redis.get('foo').then(function (result) {
    console.log(result);
  });

  await redis.del('foo');

  await redis.set('key', 100, 'EX', 10); // set's key to value 100 and expires it after 10 seconds

  // Arguments to commands are flattened, so the following are the same:
  await redis.sadd('set', 1, 3, 5, 7);
  await redis.sadd('set', [1, 3, 5, 7]);

  console.log(await redis.spop('set')); //return '7' or another item in the set

  const all = await redis.smembers('set');
  console.log(all); // [ 1', '3', '5']

  // Most responses are strings, or arrays of strings
  await redis.zadd('sortedSet', 1, 'one', 2, 'dos', 4, 'quatro', 3, 'three');
  redis.zrange('sortedSet', 0, 2, 'WITHSCORES').then((res) => console.log(res)); // Promise resolves to ["one", "1", "dos", "2", "three", "3"] as if the command was ` redis> ZRANGE sortedSet 0 2 WITHSCORES `

  // Some responses have transformers to JS values
  await redis.hset('myhash', 'field1', 'Hello');
  redis.hgetall('myhash').then((res) => console.log(res)); // Promise resolves to Object {field1: "Hello"} rather than a string, or array of strings

  // Change the server configuration
  //redis.config('set', 'notify-keyspace-events', 'KEA');

  await redis.quit();
};

main();
