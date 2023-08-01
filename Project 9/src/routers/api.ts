import { Router } from 'express';
import users from './user';

export default function api() {
  const router = Router();

  router.use('/v1', apiV1());

  return router;
}

function apiV1() {
  const router = Router();

  router
    .use((req, res, next) => {
      console.log('API V1');
      next();
    })
    .use('/users', users());

  return router;
}
