import 'dotenv/config';

import fs from 'fs/promises';
import path from 'path';

import axios from 'axios';

import {
  redisClient,
  personRepository,
  usersRepository,
  albumsRepository,
  photosRepository,
} from '../db/db.config.js';

const flushAll = async () => {
  await redisClient.flushAll();
  console.log('Entries Deleted');
};

const loadPersons = async () => {
  const filePath = path.resolve('scripts', 'persons.json');
  const rawData = await fs.readFile(filePath, 'utf-8');
  const dataArray = JSON.parse(rawData);

  dataArray.forEach(async (person) => {
    await personRepository.save(person);
  });

  //////////////// createIndex //////////////
  await personRepository.dropIndex();
  console.log('Index Dropped');
  await personRepository.createIndex();
  console.log('Entries Indexed');
  const results = await personRepository.search().return.all();
  console.log(`Entries created: ${results.length}`);
};

const loadUsers = async () => {
  const response = await axios.get(
    'https://jsonplaceholder.typicode.com/users'
  );
  response.data.forEach(async (person) => {
    await usersRepository.save(person);
  });

  //////////////// createIndex //////////////
  await usersRepository.dropIndex();
  console.log('Index Dropped');
  await usersRepository.createIndex();
  console.log('Entries Indexed');
  const results = await usersRepository.search().return.all();
  console.log(`Entries created: ${results.length}`);
};

const loadAlbums = async () => {
  const response = await axios.get(
    'https://jsonplaceholder.typicode.com/albums'
  );
  response.data.forEach(async (album) => {
    await albumsRepository.save(album);
  });

  //////////////// createIndex //////////////
  await albumsRepository.dropIndex();
  console.log('Index Dropped');
  await albumsRepository.createIndex();
  console.log('Entries Indexed');
  const results = await albumsRepository.search().return.all();
  console.log(`Entries created: ${results.length}`);
};

const loadPhotos = async () => {
  const response = await axios.get(
    'https://jsonplaceholder.typicode.com/photos'
  );
  response.data.forEach(async (photo) => {
    await photosRepository.save(photo);
  });

  //////////////// createIndex //////////////
  await photosRepository.dropIndex();
  console.log('Index Dropped');
  await photosRepository.createIndex();
  console.log('Entries Indexed');
  const results = await photosRepository.search().return.all();
  console.log(`Entries created: ${results.length}`);
};

await flushAll();
await loadPersons();
await loadUsers();
await loadAlbums();
await loadPhotos();
process.exit(0);
