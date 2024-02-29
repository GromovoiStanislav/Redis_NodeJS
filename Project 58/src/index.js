import 'dotenv/config';
import express, { json } from 'express';
import { UserController } from './controllers/users.js';
import {
  initializeRedisClient,
  redisCachingMiddleware,
} from './middlewares/redis.js';

const initializeExpressServer = async () => {
  const app = express();
  app.use(json());

  await initializeRedisClient();

  app.get('/users', redisCachingMiddleware(), UserController.getAll);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};

initializeExpressServer()
  .then()
  .catch((e) => console.error(e));
