import 'dotenv/config';
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  //url: 'redis://127.0.0.1:6379/0',
});
client.on('error', (err) => console.log(err));
await client.connect();

const subClient = client.duplicate();
await subClient.connect();

await subClient.pSubscribe(
  '__keyspace@0__:tokens:*',

  async (message, channel) => {
    console.log(`event >>> ${message} on ${channel}`);
    const affectedKey = channel.substring('__keyspace@0__:'.length);
    const howMany = await client.sCard(affectedKey);
    console.log(`Set cardinality ${affectedKey} is ${howMany}`);

    const userName = affectedKey.split(':')[1];

    if (howMany > 0) {
      await client.zAdd('scoreboard', [
        {
          score: howMany,
          value: userName,
        },
      ]);
    } else {
      await client.zRem('scoreboard', userName);
    }

    console.log('Scores:');
    console.log(
      await client.zRangeWithScores('scoreboard', 0, -1, {
        REV: true,
      })
    );
  }
);

/////////////////////////////////////////////////

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
