import { client } from './lib/redis.js';

///////////////////////////////////////////

redis.set('mykey1', 'value');

redis.get('mykey1', (err, result) => {
  if (err) {
    console.error('mykey1', err);
  } else {
    console.log('mykey1', result); // Prints "value"
  }
});

redis.get('mykey1').then((result) => {
  console.log('mykey1', result); // Prints "value"
});

redis.del('mykey1');
redis.get('mykey1').then((result) => {
  console.log('mykey1', result); // Prints "null"
});

redis.set('mykey2', 'hello', 'EX', 3); //Удалится через 3 сек
setTimeout(() => {
  redis.get('mykey2').then((result) => {
    console.log('mykey2', result); // Prints "null"
  });
}, 4 * 1000);
redis.get('mykey2').then((result) => {
  console.log('mykey2', result); // Prints "hello"
});

//Сортированный список
redis.zadd('sortedSet', 1, 'one', 2, 'dos', 4, 'quatro', 3, 'three');
redis.zrange('sortedSet', 0, 2, 'WITHSCORES').then((elements) => {
  console.log('zrange', elements);
});

//Конвеер
const pipeline = redis.pipeline();
pipeline.set('foo', 'bar');
pipeline.del('cc');
pipeline.exec((err, results) => {
  console.log('Pipelining1', results); // [ [ null, 'OK' ], [ null, 0 ] ]
});

const promise = redis.pipeline().set('foo', 'bar').get('foo').exec();
promise.then((results) => {
  console.log('Pipelining2', results); //[ [ null, 'OK' ], [ null, 'bar' ] ]
});

redis
  .pipeline()
  .set('foo', 'bar')
  .get('foo', (err, result) => {
    console.log('Pipelining3', result); //Print 'bar'
  })
  .exec((err, results) => {
    console.log('Pipelining3', results); //[ [ null, 'OK' ], [ null, 'bar' ] ]
    console.log('Pipelining3', results[1][1]); //'/Print 'bar'
  });

redis
  .pipeline([
    ['set', 'foo', 'bar'],
    ['get', 'foo'],
  ])
  .exec((err, results) => {
    console.log('Pipelining4', results); //[ [ null, 'OK' ], [ null, 'bar' ] ]
  });

//Транзакции
redis
  .multi()
  .set('foo', 'bar')
  .get('foo')
  .exec((err, results) => {
    console.log('Transaction1', results); //[ [ null, 'OK' ], [ null, 'bar' ] ]
  });

redis
  .multi()
  .set('foo1') //ошибка!!!
  .set('foo2', 'new value')
  .exec((err, results) => {
    console.log('Transaction2', err.name); //ReplyError
    console.log('Transaction2', results); //undefined

    redis.get('foo2').then((result) => {
      console.log('foo2', result); // Prints "null"
    });
  });

redis
  .multi([
    ['set', 'foo', 'bar'],
    ['get', 'foo'],
  ])
  .exec((err, results) => {
    console.log('Transaction3', results); //[ [ null, 'OK' ], [ null, 'bar' ] ]
    console.log('Transaction3', results[1][1]); //'/Print 'bar'
  });

//Выполнится раньше чем асинхроные pipeline и multi !!!!
redis.set('mykey3', 'value');
redis.get('mykey3').then((result) => {
  console.log('mykey3', result); // Prints "value"
});

//Exit
setTimeout(async () => {
  if (redis) {

   //await client.flushall(); //Очистка ВСЕХ данных
   await client.flushdb(); //Очистка ВСЕХ данных

   //await client.disconnect();
   await client.quit();
  }
  if (redisServer) {
    await redisServer.stop();
  }
}, 10 * 1000);
