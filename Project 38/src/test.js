import 'dotenv/config';
import Redis from 'ioredis';

const client = new Redis(process.env.REDIS_URL);
const LIMIT = 1;

console.log(
  JSON.stringify(
    await client.call('FT.SEARCH', 'places:index', '*', 'LIMIT', 0, LIMIT),
    null,
    2
  )
);
console.log();

console.log(
  JSON.stringify(
    await client.call('FT.SEARCH', 'states:index', '*', 'LIMIT', 0, LIMIT),
    null,
    2
  )
);
console.log();

console.log(
  JSON.stringify(
    await client.call(
      'FT.SEARCH',
      'places:index',
      '@city:{Westland} @state:{MI}',
      'LIMIT',
      0,
      LIMIT
    ),

    null,
    2
  )
);
