import express from 'express';
import { createClient } from 'redis';
import axios from 'axios';

// Create Redis Client
let redisClient = createClient({ url: `redis://127.0.0.1:6379/1` });
redisClient.on('error', (error) => console.error(error));
await redisClient.connect();
console.log('Connected to Redis...');

const DEFAULT_EXPIRATION = 30; //in seconds

const app = express();
app.use(express.json());

app.get('/', async (req, res, next) => {
  res.render('searchusers');
});

app.get('/todos/:todoId', getTodoData);

async function getTodoData(req, res) {
  const todoId = req.params.todoId;
  let results;
  let isCached = false;

  try {
    results = await redisClient.get(todoId);
    if (results) {
      isCached = true;
      results = JSON.parse(results);
    } else {
      results = await fetchApiData(todoId);
      await redisClient.set(todoId, JSON.stringify(results), {
        EX: DEFAULT_EXPIRATION,
      });
      // or
      // await redisClient.setEx(todoId, DEFAULT_EXPIRATION, JSON.stringify(results));
    }

    res.send({
      fromCache: isCached,
      data: results,
    });
  } catch (error) {
    console.error(error);
    res.status(404).send('Data unavailable');
  }
}

async function fetchApiData(todoId) {
  const { data } = await axios.get(
    `https://jsonplaceholder.typicode.com/todos/${todoId}`
  );
  return data;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log('Server started on port ' + PORT);
});
