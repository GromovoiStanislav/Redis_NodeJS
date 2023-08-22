import { client } from './lib/redis.js';

console.log('=================Hash========================');

console.log('hset', await client.hset('myhash', 'field1', 'value1')); //или
console.log('hset', await client.hset('myhash', { field2: 'value2' })); //или
console.log('hset', await client.hset('myhash', ['field3', 'value3'])); //или

console.log(
  'hmset',
  await client.hmset('myhash', { field3: 'value3', field4: 'value4' })
); //или
console.log(
  'hmset',
  await client.hmset('myhash', ['field3', 'value3', 'field4', 'value4'])
); //или
const myMap = new Map();
myMap.set('field3', 'value3');
myMap.set('field4', 'value4');
console.log('hmset', await client.hmset('myhash', myMap)); //или

console.log('hgetall', await client.hgetall('myhash')); //{ field1: 'value1', field2: 'value2',field3:'value3',field4:'value4' }
console.log('hget', await client.hget('myhash', 'field2')); //value2
console.log('hmget', await client.hget('myhash', 'field1')); //value1
console.log('hmget', await client.hget('myhash', ['field1'])); //value1
console.log('hmget', await client.hget('myhash', ['field0'])); //null
//console.log('hmget', await client.hget('myhash', ['field1', 'field2])); //ERROR ???

console.log('hkeys', await client.hkeys('myhash')); //[ 'field1', 'field2', 'field3', 'field4' ]
console.log('hvals', await client.hvals('myhash')); // ['value1', 'value2', 'value3', 'value4']

console.log('hscan', await client.hscan('myhash', 0)); //Incrementally iterate hash fields and associated values:
//['0', ['field1','value1','field2','value2','field3','value3','field4','value4']]

console.log('hdel', await client.hdel('myhash', 'field2'));
console.log('hexists', await client.hexists('myhash', 'field2')); //false
console.log('hexists', await client.hexists('myhash', 'field1')); //true
console.log('hlen', await client.hlen('myhash')); //1

console.log('hsetnx', await client.hsetnx('myhash', 'field2', 'Hello')); //Set the value of a hash field, only if the field does not exist
console.log('hsetnx', await client.hsetnx('myhash', 'field2', 'World'));
console.log('hget', await client.hget('myhash', 'field2')); //Hello

await client.hset('myhash', 'field1', 10);
console.log('hincrby', await client.hincrby('myhash', 'field1', -5)); //5
console.log('hincrbyfloat', await client.hincrbyfloat('myhash', 'field1', 2.6)); //7.6

console.log('type', await client.type('myhash')); //hash
console.log('del', await client.del('myhash')); //1
console.log('type', await client.type('myhash')); //none

console.log('===================Exit===========================');

setTimeout(async () => {
  if (client) {
    //await client.flushall(); //Очистка ВСЕХ данных
    await client.flushdb(); //Очистка ВСЕХ данных

    //await client.disconnect();
    await client.quit();
  }
  if (redisServer) {
    await redisServer.stop();
  }
}, 10 * 1000);
