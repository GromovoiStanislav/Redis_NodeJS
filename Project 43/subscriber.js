import 'dotenv/config';
import { createClient } from 'redis';
import { writeFile } from 'node:fs';
import { resolve } from 'node:path';

const client = createClient({
  url: process.env.REDIS_URL || `redis://127.0.0.1:6379`,
});
await client.connect();
const sub = client.duplicate();
sub.on('error', (err) => console.error(err));
await sub.connect();

let msg_count = 0;

const listener = async (message, channel) => {
  console.log(`${channel} : ${message}`);

  writeFile(resolve('data', `${channel}.json`), message, (err) => {
    if (err) {
      console.error(err);
    }
  });

  msg_count += 1;
  if (msg_count === 2) {
    await sub.unsubscribe();
    await sub.quit();
  }
};

await sub.pSubscribe('customers*', listener);
await sub.subscribe('users', listener);
