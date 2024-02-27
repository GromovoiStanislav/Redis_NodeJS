import Koa from 'koa';
import { koaBody } from 'koa-body';

import { router } from './routes.js';
import { client } from './db.js';

const startServer = async () => {
  const app = new Koa();

  app.use(koaBody());
  app.use(router.routes());

  return app;
};

startServer()
  .then(async (app) => {
    await new Promise((resolve) => app.listen({ port: 3000 }, resolve));
  })
  .catch(async (err) => {
    console.error(err);
    await client.quit();
    process.exit(1);
  });
