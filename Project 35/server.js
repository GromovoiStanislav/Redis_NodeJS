require('dotenv').config();
const redis = require('redis');
const express = require('express');

const app = express();

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
});
client.on('error', (err) => console.log('Redis Client Error', err));

app.get('/fib', async (request, response) => {
  const num = request.query.number;

  client.publish('math-subscription', num);

  response.end(
    '<h3>Notification sent to the respective subscribers! We will send you an email with the details!</h3>'
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await client.connect();
  console.log(`Express App is running on PORT: ${PORT}`);
});
