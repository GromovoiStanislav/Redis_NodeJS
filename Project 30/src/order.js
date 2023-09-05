import express from 'express';
import { createClient } from 'redis';

const client = createClient({
  url: `redis://127.0.0.1:6379`,
});
client.on('error', (err) => console.log('Redis Client Error', err));
await client.connect();

const app = express();

app.post('/orders', async (req, res) => {
  const order = {
    id: Math.random().toString(36).substring(7),
    userId: Math.random().toString(36).substring(7),
    productId: Math.random().toString(36).substring(7),
    payment: 'VISA',
  };

  const result = await client.publish('orders', JSON.stringify(order));
  console.log(result);

  res.json(order);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Service ORDER running at ${PORT}`);
});
