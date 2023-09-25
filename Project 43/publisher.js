import 'dotenv/config';
import { createClient } from 'redis';
import express from 'express';

const pub = createClient({
  url: process.env.REDIS_URL || `redis://127.0.0.1:6379`,
});
await pub.connect();

const app = express();

app.use(
  express.json({
    limit: '10kb',
  })
);

app.post('/customers', (req, res) => {
  const { body } = req;

  body.created = new Date();

  pub.publish('customers-new', JSON.stringify(body, null, 2));
  res.sendStatus(201);
});

app.post('/users', (req, res) => {
  const { body } = req;

  body.created = new Date();

  pub.publish('users', JSON.stringify(body, null, 2));
  res.sendStatus(201);
});

app.listen(3000, () => {
  console.log('Server started on 3000 port!');
});
