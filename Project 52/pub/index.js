import { App } from '@tinyhttp/app';
import { json } from 'milliparsec';
import { createRedisConnection } from '../lib/redis.js';

const redis = createRedisConnection();
const app = new App();

app.use(json());

app.post('/', (req, res) => {
  redis.publish('send-user-data', JSON.stringify({ ...req.body }));
  return res.sendStatus(200);
});

app.listen(3000);
