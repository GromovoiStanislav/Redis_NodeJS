import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import { createClient } from 'redis';

import config from './config.js';
import typeDefs from './schema.js';
import resolvers from './resolvers.js';
import HauntedPlacesDataSource from './haunted-places-without-cach.js';
//import HauntedPlacesDataSource from './haunted-places-with-cach.js';
//import HauntedPlacesDataSource from './haunted-places-with-dataloader.js';

async function main() {
  const redis = createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  });
  await redis.connect();

  let server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const hauntedPlaces = new HauntedPlacesDataSource(redis);

  const info = await startStandaloneServer(server, {
    listen: { port: config.PORT },
    context: async () => {
      return {
        hauntedPlaces,
      };
    },
  });

  console.log(`👻 Server ready at ${info.url} 👻`);
}

main();
