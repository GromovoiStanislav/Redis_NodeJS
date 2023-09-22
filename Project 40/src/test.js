import 'dotenv/config';
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
});
await client.connect();

console.log(
  JSON.stringify(await client.ft.search('places:index', '*'), null, 2)
);

console.log(
  JSON.stringify(await client.ft.search('places:index', 'Lake'), null, 2)
);

console.log(
  JSON.stringify(
    await client.ft.search('places:index', '@city:{Westland}'),
    null,
    2
  )
);

console.log(
  JSON.stringify(
    await client.ft.search(
      'places:index',
      '@location:{Crescent Valley High school}'
    ),
    null,
    2
  )
);

console.log(
  JSON.stringify(
    await client.ft.search('places:index', '@city:{Westland} @state:{MI}', {
      LIMIT: { from: 0, size: 10000 },
    }),
    null,
    2
  )
);

console.log(
  JSON.stringify(
    await client.ft.search('states:index', '*', {
      LIMIT: { from: 0, size: 10000 },
    }),
    null,
    2
  )
);

console.log(
  JSON.stringify(
    await client.ft.search('states:index', '@city:{Colorado}'),
    null,
    2
  )
);

console.log(
  JSON.stringify(
    await client.ft.search('cities:index', '@name:{Westland} @state:{MI}'),
    null,
    2
  )
);
console.log(
  JSON.stringify(
    await client.ft.search('cities:index', '*', {
      LIMIT: { from: 0, size: 2 },
    }),
    null,
    2
  )
);
console.log(
  JSON.stringify(
    await client.ft.search('cities:index', '*', {
      LIMIT: { from: 1, size: 3 },
    }),
    null,
    2
  )
);

setTimeout(async () => await client.quit(), 3000);
