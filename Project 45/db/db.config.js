import 'dotenv/config';

import { createClient } from 'redis';
import { Schema, Repository, EntityId } from 'redis-om';

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));
await redisClient.connect();

const personSchema = new Schema(
  'person',
  {
    name: { type: 'string' },
    age: { type: 'number' },
    children_names: { type: 'string[]', path: '$.children[*].name' },
    children_ages: { type: 'number[]', path: '$.children[*].age' },
  },
  { dataStructure: 'JSON' }
);
export const personRepository = new Repository(personSchema, redisClient);

const usersSchema = new Schema(
  'users',
  {
    id: { type: 'number', sortable: true },
    name: { type: 'string' },
    username: { type: 'string' },

    address_street: { type: 'string', path: '$.children[*].street' },
    address_suite: { type: 'string', path: '$.children[*].suite' },
    address_city: { type: 'string', path: '$.children[*].city' },
    address_zipcode: { type: 'string', path: '$.children[*].zipcode' },
    address_geo_lat: { type: 'string', path: '$.children[*].geo.lat' },
    address_geo_lng: { type: 'string', path: '$.children[*].geo.lng' },

    phone: { type: 'string' },
    website: { type: 'string' },

    company_name: { type: 'string', path: '$.children[*].name' },
    company_catchPhrase: {
      type: 'string',
      path: '$.children[*].catchPhrase',
    },
    company_bs: { type: 'string', path: '$.children[*].bs' },
  },
  { dataStructure: 'JSON' }
);
export const usersRepository = new Repository(usersSchema, redisClient);

const albumsSchema = new Schema(
  'albums',
  {
    userId: { type: 'number' },
    id: { type: 'number', sortable: true },
    title: { type: 'string' },
  },
  { dataStructure: 'JSON' }
);
export const albumsRepository = new Repository(albumsSchema, redisClient);

const photosSchema = new Schema(
  'photos',
  {
    albumId: { type: 'number' },
    id: { type: 'number', sortable: true },
    title: { type: 'string' },
    url: { type: 'string' },
    thumbnailUrl: { type: 'string' },
  },
  { dataStructure: 'JSON' }
);
export const photosRepository = new Repository(photosSchema, redisClient);

export { EntityId };
