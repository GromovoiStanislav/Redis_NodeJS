import express from 'express';
import constrollers from './controller.js';
import RedisConfig from './config.js';

const app = express();
app.use(express.json());

app.post('/api/send', constrollers.sendMessageToRedis);
app.get('/', (req, res) => res.json({ msg: 'Welcome' }));

// consume from channel redis "my-channel"
const redisConfig = new RedisConfig();
redisConfig.consume('my-channel', (message) => {
  console.log('📨 Received message:', message);
});

app.listen(3000, () => {
  console.log(`Server is running at http://localhost:3000`);
});
