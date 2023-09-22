import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import Redis from 'ioredis';

import config from './config.js';
import typeDefs from './schema.js';
import resolvers from './resolvers.js';
import HauntedPlacesDataSource from './haunted-places-without-cach.js';
//import HauntedPlacesDataSource from './haunted-places-with-cach.js';
// import HauntedPlacesDataSource from './haunted-places-with-dataloader.js';

async function main() {
  let redis = new Redis(config.REDIS_URL);
  const hauntedPlaces = new HauntedPlacesDataSource(redis);

  let server = new ApolloServer({
    typeDefs,
    resolvers,
  });

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
