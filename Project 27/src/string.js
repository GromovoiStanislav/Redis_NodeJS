import { client } from './lib/redis.js';

console.log('=================Common========================');

await client.set('key1', 'value1');
console.log('key1', await client.get('key1')); //value1

await client.set('key1', 'value2', 'NX', 'EX', 10); //'NX' - установить только если НЕ существует; 'EX', 10 - удалить через 10 сек
console.log('key1', await client.get('key1')); //value1

await client.set('key2', 'value2', 'XX', 'EX', 10); //'XX' - установить только если существует; 'EX', 10 - удалить через 10 сек
console.log('key2', await client.get('key2')); //null

await client.set('key1', 'value2', 'XX', 'EX', 10); //'XX' - установить только если существует; 'EX', 10 - удалить через 10 сек
console.log('key1', await client.get('key1')); //value2

await client.setnx('key3', 'Hello'); //установить только если НЕ существует
await client.setnx('key3', 'World');
console.log('setnx', await client.get('key3')); //Hello

console.log('getset', await client.getset('key3', 'World')); //Hello
console.log('getset', await client.get('key3')); //World

//console.log('getdel', await client.getdel('key3'));

console.log('mget', await client.mget(['key1', 'key2', 'key3'])); //[ 'value2', null, 'World' ]
await client.mset({ key2: 'Hello', key3: 'Redis' });
console.log('mset', await client.mget(['key1', 'key2', 'key3'])); //[ 'value2', 'Hello', 'Redis' ]

const myMap = new Map();
myMap.set('a', 1);
myMap.set('b', 2);
myMap.set('c', 3);
await client.mset(myMap);
console.log('mset', await client.mget(['a', 'b', 'c'])); //[ 1, 2, 3 ]

console.log(
  'msetnx',
  await client.msetnx({ key2: 'Hello', key3: 'Redis', key4: 'value4' })
); // 0 - false
console.log('msetnx', await client.mget(['key2', 'key3', 'key4'])); //[ 'Hello', 'Redis', null ]
console.log('msetnx', await client.msetnx({ key4: 'value4', key5: 'value5' })); // 1 - true
console.log('msetnx', await client.mget(['key4', 'key5'])); //[ 'value4', 'value5' ]

await client.setex('time', 10, 'hello'); //установили 10 сек
console.log('ttl', await client.ttl('time')); //10 сек
await client.expire('time', 5);
console.log('ttl', await client.ttl('time')); //5 сек
await client.expire('time', -1);
console.log('ttl', await client.get('time')); //null

await client.psetex('time2', 10 * 1000, 'hello'); //установили 10 сек в милисекундах
console.log('psetex', await client.ttl('time2')); //10 сек

await client.set('count', 10);
console.log('incr', await client.incr('count')); //11
console.log('incrby', await client.incrby('count', 5)); //16
console.log('decr', await client.decr('count')); //15
console.log('decrby', await client.decrby('count', 5)); //10
console.log('incrbyfloat', await client.incrbyfloat('count', 1.5)); //11.5

await client.append('hello.world', 'Hello');
await client.append('hello.world', ' World');
console.log('append', await client.get('hello.world')); //Hello World
console.log('exists', await client.exists('hello.world')); //1
console.log('exists', await client.exists('hello')); //0

console.log('strlen', await client.strlen('hello.world')); //11

let cursor = await client.scan(0); //Incrementally iterate the keys space
console.log('scan', cursor);
while (+cursor[0] > 0) {
  cursor = await client.scan(cursor[0]);
  console.log('scan', cursor);
}

console.log('type', await client.type('hello.world')); //string
console.log('del', await client.del('hello.world')); //1
console.log('type', await client.type('hello.world')); //none

console.log('=================Transactions=============================');

// Transactions (Multi/Exec)
const res = await client
  .multi()
  .set('another-key', 'another-value')
  .set('other-key', 'other-value')
  .get('another-key')
  .get('other-key')
  .exec();
console.log('Transactions', res); // [ [ null, 'OK' ],[ null, 'OK' ], [ null, 'another-value' ],[ null, 'other-value' ] ]

const [setKeyReply, otherKeyValue] = await client
  .multi()
  .set('other-key', 'other-value')
  .get('another-key')
  .exec(); // [ [ null, 'OK' ], [ null, 'another-value' ] ]
console.log('Transactions', setKeyReply[1], otherKeyValue[1]); //'OK', 'another-value'

client.sadd('users:1:tokens', 'Tm9kZSBSZWRpcw==');
client.sget('users:1:tokens');

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
