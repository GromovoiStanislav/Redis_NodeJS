require('dotenv').config();
const redis = require('redis');
const fibonacci = require('../math-logic/fibonacci-series');

const subscriber = redis.createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
});
subscriber.on('error', (err) => console.log('Redis Client Error', err));
console.log('Subscriber listining...');

subscriber.connect().then(() => {
  subscriber.subscribe('math-subscription', async (message, channel) => {
    const fibNum = await fibonacci(Number.parseInt(message));
    console.log(`Fibonacci value is ${fibNum}`);
  });
});
