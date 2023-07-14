import express from 'express';
import RedisConfig from './config.js';

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.json({ msg: 'Welcome' }));

// consume from channel redis "my-channel"
const redisConfig = new RedisConfig();
redisConfig.consume('my-channel', (message) => {
  console.log('📨 Received message:', message);
});

app.listen(3001, () => {
  console.log(`Server is running at http://localhost:3001`);
});
