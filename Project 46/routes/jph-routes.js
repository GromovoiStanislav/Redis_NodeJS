import { Router } from 'express';

import redisClient from '../db/redis-db.js';
import redisMiddleware from '../middlewares/redis-middleware.js';

import JphApi from '../jsonplaceholder/jph-api.js';

const routes = Router();

routes.use(redisMiddleware);

routes.get('/posts', async (request, response) => {
  const data = await JphApi.fetchPosts();
  console.log('Data Fetched from Server');
  redisClient.setEx('posts', 300, JSON.stringify(data));
  response.send(data);
});

routes.get('/comments', async (request, response) => {
  const data = await JphApi.fetchComments();
  console.log('Data Fetched from Server');
  redisClient.setEx('comments', 300, JSON.stringify(data));
  response.send(data);
});

routes.get('/users', async (request, response) => {
  const data = await JphApi.fetchUsers();
  console.log('Data Fetched from Server');
  redisClient.setEx('users', 300, JSON.stringify(data));
  response.send(data);
});

export default routes;
