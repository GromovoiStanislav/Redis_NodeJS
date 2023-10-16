import 'dotenv/config';

import express, { json, urlencoded } from 'express';
const app = express();
import {
  reload,
  create,
  getAll,
  search,
  getOne,
  update,
  deleteAlbum,
} from './controllers/album.controller.js';

(async () => {
  app.use(json());
  app.use(urlencoded({ extended: true }));

  app.post('/api/reload', reload);
  app.post('/api/albums', create);
  app.get('/api/albums/', getAll);
  app.get('/api/albums/search', search);
  app.get('/api/albums/:entityID', getOne);
  app.put('/api/albums/:entityID', update);
  app.delete('/api/albums/:entityID', deleteAlbum);
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
})();
