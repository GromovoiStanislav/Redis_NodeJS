import express from 'express';
import { createClient } from 'redis';
import axios from 'axios';

// Create Redis Client
let redisClient = createClient({ url: `redis://127.0.0.1:6379` });
redisClient.on('error', (error) => console.error(error));
await redisClient.connect();
console.log('Connected to Redis...');

const app = express();

app.get('/rockets', async (req, res, next) => {
  try {
    const reply = await redisClient.get('rockets');
    if (reply) {
      console.log('using cached data');
      res.send(JSON.parse(reply));
      return;
    }

    const { data } = await axios.get('https://api.spacexdata.com/v4/rockets');
    const saveResult = await redisClient.set('rockets', JSON.stringify(data), {
      EX: 10,
    });
    console.log('new data cached', saveResult);
    res.send(data);
  } catch (error) {
    res.send(error.message);
  }
});

app.get('/rockets/:rocket_id', async (req, res, next) => {
  try {
    const { rocket_id } = req.params;
    const reply = await redisClient.get(rocket_id);
    if (reply) {
      console.log('using cached data');
      res.send(JSON.parse(reply));
      return;
    }
    const { data } = await axios.get(
      `https://api.spacexdata.com/v4/rockets/${rocket_id}`
    );
    const saveResult = await redisClient.set(rocket_id, JSON.stringify(data), {
      EX: 10,
    });
    console.log('new data cached', saveResult);
    res.send(data);
  } catch (error) {
    res.send(error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log('Server started on port ' + PORT);
});
