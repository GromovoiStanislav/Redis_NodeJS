import 'dotenv/config';
import { createClient } from 'redis';
import { EntityId, Repository, Schema } from 'redis-om';

export const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});
await client.connect();

const postSchema = new Schema('Post', {
  title: { type: 'string' },
  content: { type: 'string' },
  isPublished: { type: 'boolean' },
});

export const postRepository = new Repository(postSchema, client);
await postRepository.createIndex();

const personExist = async (id) => client.EXISTS(`Post:${id}`);

export { EntityId, personExist };
