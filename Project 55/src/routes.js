import Router from '@koa/router';
import { createCar, getCar, getCars, searchCars } from './db.js';

const router = new Router();

router.get('/cars', async (ctx) => {
  ctx.body = await getCars();
});

router.get('/cars/search', async (ctx) => {
  ctx.body = await searchCars(ctx.request.query.q);
});

router.get('/cars/:id', async (ctx) => {
  const car = await getCar(ctx.params.id);
  if (!car) {
    ctx.body = { id: 'Not found' };
    return;
  }

  ctx.body = car;
});

router.post('/cars', async (ctx) => {
  ctx.body = await createCar(ctx.request.body);
});

export { router };
