import { createClient } from 'redis';

const keys = {
  redisHost: '127.0.0.1',
  redisPort: 6379,
};

const redisClient = createClient({
  host: keys.redisHost,
  port: keys.redisPort,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

await redisClient.connect();

export default redisClient;
