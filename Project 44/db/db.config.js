import 'dotenv/config';

import { createClient } from 'redis';
import { Schema, Repository, EntityId } from 'redis-om';

export const client = createClient({
  url: process.env.REDIS_URL,
});
client.on('error', (err) => console.log('Redis Client Error', err));
await client.connect();

const albumStructure = {
  artist: { type: 'text' },
  owner: { type: 'text' },
  title: { type: 'text' },
  condition: { type: 'number' },
  format: { type: 'text' },
  comments: { type: 'text' },
  price: { type: 'number' },
  forSale: { type: 'boolean' },
};

export const schema = new Schema('album', albumStructure, {
  dataStructure: 'JSON',
});

export const repository = new Repository(schema, client);

export { EntityId };
