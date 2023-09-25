import 'dotenv/config';
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  //url: 'redis://127.0.0.1:6379/0',
});

await client.connect();

/////////////////////////////////////////////////////////////

// await client.flushAll();

// await client.sAdd('tokens:simon', ['a', 'b', 'c']);
// await client.sAdd('tokens:suze', ['a', 'd', 'e', 'f']);
// await client.sAdd('tokens:steve', ['a', 'b', 'c', 'f', 'g']);

// await client.sRem('tokens:steve', 'c');

////////////////////////////////////////////////////////
await client.sendCommand(['FLUSHALL']);

await client.sendCommand(['SADD', 'tokens:simon', 'a', 'b', 'c']);
await client.sendCommand(['SADD', 'tokens:suze', 'a', 'd', 'e', 'f']);
await client.sendCommand(['SADD', 'tokens:steve', 'a', 'b', 'c', 'f', 'g']);

await client.sendCommand(['SREM', 'tokens:steve', 'c']);
await client.sendCommand(['DEL', 'tokens:simon']);
