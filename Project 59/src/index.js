import 'dotenv/config';
import express, { json } from 'express';
import { pageController } from './utils/redis.js';
import { renderPage } from './controllers/renderPage.js';

const app = express();
app.use(json());
app.use(pageController);

const CACHED_PAGES = ['/', '/catalog', '/users'];

app.get('*', pageController, (req, res) => {
  console.log('@route handler', req.path);

  if (req.path === '/clear-cache') {
    if (
      req.headers['x-verification-code'] &&
      req.headers['x-verification-code'] !== process.env.VERIFICATION_CODE
    ) {
      return res.sendStatus(403);
    }

    res.clearCache();
    return res.sendStatus(200);
  }

  if (CACHED_PAGES.includes(req.path)) {
    return renderPage(req, res);
  }

  return res.sendStatus(404);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server ready on port ${port}`);
});
