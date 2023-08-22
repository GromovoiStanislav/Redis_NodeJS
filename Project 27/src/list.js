import { client } from './lib/redis.js';


console.log('=================List/Array========================');

await client.rpush('mylist', 'one'); //создает новый массив если его ещё нет
await client.rpush('mylist', ['two', 'three']);
await client.lpush('mylist', 'zero'); //создает новый массив если если его ещё нет
console.log('llen', await client.llen('mylist')); //4
console.log('lrange', await client.lrange('mylist', 0, -1)); //[ 'zero', 'one', 'two', 'three' ]
console.log('lindex', await client.lindex('mylist', -1)); //three'
await client.ltrim('mylist', 1, -1);
console.log('ltrim', await client.lrange('mylist', 0, -1)); //[ 'one', 'two', 'three' ]
await client.lset('mylist', 0, 'Hello');
console.log('lsset', await client.lrange('mylist', 0, -1)); //[ 'Hello', 'two', 'three' ]
await client.lrem('mylist', 0, 'Hello'); //count=0 все, count>0 с лева на право, count<0 с права на лево
console.log('lrem', await client.lrange('mylist', 0, -1)); //[ 'two', 'three' ]

await client.lpushx('mylist2', ['one']); //НЕ создает новый массивб, а только добавляет 1 эл (не массив)
await client.rpushx('mylist2', ['two']); //НЕ создает новый массив, а только добавляет 1 эл (не массив)
console.log('lpushx & rpushx', await client.lrange('mylist2', 0, -1)); //[]

await client.lpush('mylist', ['1', '2', '3', '4', '5']);
console.log('lpush', await client.lrange('mylist', 0, -1)); //[ '5', '4', '3', '2', '1', 'two', 'three' ]
console.log('lpop', await client.lpop('mylist')); //5
console.log('rpop', await client.rpop('mylist')); //three
console.log('lpop & rpop', await client.lrange('mylist', 0, -1)); //[ '4', '3', '2', '1', 'two' ]

await client.linsert('mylist', 'BEFORE', 'two', 'one');
await client.linsert('mylist', 'AFTER', '1', '0');
console.log('linsert', await client.lrange('mylist', 0, -1)); //[ '4', '3', '2', '1', '0','one', 'two' ]

//console.log('lpos', await client.lpos('mylist', '0'));
//await client.lMove('mylist', 'mylist2', 'RIGHT', 'LEFT');
console.log('rpoplpush', await client.rpoplpush('mylist', 'mylist2'));
console.log('mylist', await client.lrange('mylist', 0, -1)); //[ '4', '3', '2', '1', '0', 'one' ]
console.log('mylist2', await client.lrange('mylist2', 0, -1)); //[ 'two' ]

console.log('sort', await client.sort('mylist','ALPHA')) //[ '0', '1', '2', '3', '4', 'one' ]

console.log('type', await client.type('mylist')); //list
console.log('del', await client.del('mylist'))//1
console.log('type', await client.type('mylist')); //none



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
