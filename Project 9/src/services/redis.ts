import { createClient } from 'redis';

const client = createClient();

client.on('error', (err) => {
  console.log('Redis Error', err);
});

export function connect() {
  return client.connect();
}

export default client;
