import express from 'express';
import Redis from 'ioredis';
import axios from 'axios';

// Create Redis Client
const redisClient = new Redis('redis://127.0.0.1:6379');
//const redisClient = new Redis(6379, '127.0.0.1');
// const redisClient = new Redis({
//   port: 6379, // Redis port
//   host: "127.0.0.1", // Redis host
//   db: 0, // Defaults to 0
// });
console.log('Connected to Redis...');
const EX = 10;

const app = express();
app.use(express.json());

app.post('/', async (req, res, next) => {
  const { key, value } = req.body;

  const response = await redisClient.set(key, JSON.stringify(value));
  res.send(response);
});

app.get('/', async (req, res, next) => {
  const { key } = req.body;
  const value = await redisClient.get(key);
  res.send(JSON.parse(value));
});

///////////////////////////////////////////////////////////

app.get('/posts', async (req, res, next) => {
  try {
    const reply = await redisClient.get('posts');
    if (reply) {
      console.log('using cached data');
      res.json(JSON.parse(reply));
      return;
    }

    const { data } = await axios.get(
      'https://jsonplaceholder.typicode.com/posts'
    );
    await redisClient.set('posts', JSON.stringify(data), 'EX', EX);
    console.log('new data cached');
    res.json(data);
  } catch (error) {
    res.send(error.message);
  }
});

app.get('/posts/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const reply = await redisClient.get(`post-${id}`);
    if (reply) {
      console.log('using cached data');
      res.json(JSON.parse(reply));
      return;
    }
    const { data } = await axios.get(
      `https://jsonplaceholder.typicode.com/posts/${id}`
    );
    await redisClient.set(`post-${id}`, JSON.stringify(data), 'EX', EX);
    console.log('new data cached');
    res.json(data);
  } catch (error) {
    res.send(error.message);
  }
});

////////////////////////////////////////////////////////

const getOrSetCache = async (key, cb) => {
  const reply = await redisClient.get(key);
  if (reply) {
    console.log('using cached data');
    return JSON.parse(reply);
  }
  const freshData = await cb();
  await redisClient.setex(key, EX, JSON.stringify(freshData));
  console.log('new data cached');
  return freshData;
};

app.get('/photos/', async (req, res, next) => {
  try {
    const { albumId } = req.query;

    const photos = await getOrSetCache(
      `photos?albumId=${albumId}`,
      async () => {
        const { data } = await axios.get(
          'https://jsonplaceholder.typicode.com/photos/',
          { params: { albumId } }
        );
        return data;
      }
    );

    res.json(photos);
  } catch (error) {
    res.send(error.message);
  }
});

app.get('/photos/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const photo = await getOrSetCache(`photos:${id}`, async () => {
      const { data } = await axios.get(
        `https://jsonplaceholder.typicode.com/photos/${id}`
      );
      return data;
    });
    res.json(photo);
  } catch (error) {
    res.send(error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log('Server started on port ' + PORT);
});
