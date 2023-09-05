import express from 'express';
import { createClient } from 'redis';

const client = createClient({
  url: `redis://127.0.0.1:6379`,
});
client.on('error', (err) => console.log('Redis Client Error', err));
await client.connect();

client.subscribe('orders', (message, channel) => {
  //console.log(channel, message);
  console.log('Managing payment...');
  console.table(JSON.parse(message));
});

const app = express();

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Service PAYMENT running at ${PORT}`);
});
