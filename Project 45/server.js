import 'dotenv/config';

import express, { json, urlencoded } from 'express';
const app = express();

import {
  getAll as getAllPersons,
  getOne as getOnePerson,
} from './controllers/persons.controller.js';

import {
  getAll as getAllUsers,
  getOne as getOneUser,
} from './controllers/users.controller.js';

import {
  getAll as getAllAlbums,
  getOne as getOneAlbum,
  getAllByUserId as getAlbumsByUserId,
} from './controllers/albums.controller.js';

import {
  getAll as getAllPhotos,
  getOne as getOnePhoto,
  getAllByAlbumId as getPhotosByAlbumId,
} from './controllers/photos.controller.js';

(async () => {
  app.use(json());
  app.use(urlencoded({ extended: true }));

  app.get('/api/persons', getAllPersons);
  app.get('/api/persons/:entityID', getOnePerson);

  app.get('/api/users/', getAllUsers);
  app.get('/api/users/:id', getOneUser);
  app.get('/api/users/:userId/albums', getAlbumsByUserId);

  app.get('/api/albums/', getAllAlbums);
  app.get('/api/albums/:id', getOneAlbum);
  app.get('/api/albums/:albumId/photos', getPhotosByAlbumId);

  app.get('/api/photos/', getAllPhotos);
  app.get('/api/photos/:id', getOnePhoto);

  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
})();
