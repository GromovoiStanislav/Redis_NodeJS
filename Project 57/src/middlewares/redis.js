import { createClient } from 'redis';
import { sha1 } from 'object-hash';

// initialize the Redis client variable
let redisClient = undefined;

const initializeRedisClient = async () => {
  // read the Redis connection URL from the envs
  let redisURL = process.env.REDIS_URL;
  if (redisURL) {
    // create the Redis client object
    redisClient = createClient({ url: redisURL }).on('error', (e) => {
      console.error(`Failed to create the Redis client with error:`);
      console.error(e);
    });

    try {
      // connect to the Redis server
      await redisClient.connect();
      console.log(`Connected to Redis successfully!`);
    } catch (e) {
      console.error(`Connection to Redis failed with error:`);
      console.error(e);
    }
  }
};

const requestToKey = (req) => {
  // build a custom object to use as part of the Redis key
  const reqDataToHash = {
    query: req.query,
    body: req.body,
  };

  // `${req.path}@...` to make it easier to find
  // keys on a Redis client
  return `${req.path}@${sha1(reqDataToHash)}`;
};

const isRedisWorking = () => {
  // verify wheter there is an active connection to a Redis server or not
  return !!redisClient?.isOpen;
};

const writeData = async (key, data, options) => {
  if (isRedisWorking()) {
    try {
      // write data to the Redis cache
      await redisClient.set(key, data, options);
    } catch (e) {
      console.error(`Failed to cache data for key=${key}`, e);
    }
  }
};

const readData = async (key) => {
  let cachedValue = undefined;
  if (isRedisWorking()) {
    // try to get the cached response from redis
    return await redisClient.get(key);
  }

  return cachedValue;
};

const redisCachingMiddleware = (
  options = {
    EX: 21600, // 6h
  }
) => {
  return async (req, res, next) => {
    if (isRedisWorking()) {
      const key = requestToKey(req);
      // if there is some cached data, retrieve it and return it
      const cachedValue = await readData(key);
      if (cachedValue) {
        try {
          // if it is JSON data, then return it
          return res.json(JSON.parse(cachedValue));
        } catch {
          // if it is not JSON data, then return it
          return res.send(cachedValue);
        }
      } else {
        // override how res.send behaves to introduce the caching logic
        const oldSend = res.send;
        res.send = async (data) => {
          // set the function back to avoid the 'double-send' effect
          res.send = oldSend;

          // cache the response only if it is successful
          if (res.statusCode.toString().startsWith('2')) {
            await writeData(key, data, options);
          }

          return res.send(data);
        };

        // continue to the controller function
        next();
      }
    } else {
      // proceed with no caching
      next();
    }
  };
};

export { initializeRedisClient, redisCachingMiddleware };
