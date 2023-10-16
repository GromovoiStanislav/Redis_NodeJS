import 'dotenv/config';

import { createClient } from 'redis';
import { Schema, Repository } from 'redis-om';

import albumsList from '../db/albumsList.json' assert { type: 'json' };
import usersList from '../db/usersList.json' assert { type: 'json' };

(async () => {
  const client = createClient({
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

  const schema = new Schema('album', albumStructure, { dataStructure: 'JSON' });

  const repository = new Repository(schema, client);

  await client.flushAll();

  console.log('Entries Deleted');

  albumsList.forEach(async (albumJSON, index) => {
    const ownerIndex = index % usersList.length;
    albumJSON.owner = usersList[ownerIndex].username;
    await repository.save(albumJSON);
  });

  await repository.dropIndex();
  console.log('Index Dropped');
  await repository.createIndex();
  console.log('Entries Indexed');
  const results = await repository.search().return.all();
  console.log(`Entries created: ${results.length}`);

  process.exit(0);
})();
