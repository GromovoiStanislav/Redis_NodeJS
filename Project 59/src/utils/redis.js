import { createClient } from 'redis';

const redisConfig = {
  url: process.env.REDIS_URL,
};

const _createClient = async () => {
  const client = createClient(redisConfig);

  client.on('error', (err) => {
    console.error('@redis error', err);
  });

  client.on('connect', () => {
    console.log('@redis connect');
  });

  client.on('reconnecting', () => {
    console.log('@redis reconnecting');
  });

  client.on('end', () => {
    console.log('@redis disconnect');
  });

  try {
    await client.connect();
  } catch (err) {
    console.error(err);
  }

  return client;
};

let redisClient;

const pageController = async (req, res, next) => {
  if (!redisClient) {
    try {
      redisClient = await _createClient();
    } catch (err) {
      console.error(err);
    }
  }

  console.log('@redis middleware', req.path);

  const cacheKey = req.path;

  try {
    const data = await redisClient.get(cacheKey);

    if (data) {
      console.log('@from cache');

      try {
        return res.send(JSON.parse(data));
      } catch {
        return res.send(data);
      }
    }

    res.saveHtmlToCache = (html) => {
      console.log('@to cache');

      redisClient
        .set(cacheKey, html, {
          EX: 60,
          NX: true,
        })
        .catch(console.error);
    };

    res.saveJsonToCache = (data) => {
      console.log('@to cache');

      redisClient
        .set(cacheKey, JSON.stringify(data), {
          EX: 60,
          NX: true,
        })
        .catch(console.error);
    };

    res.clearCache = () => {
      console.log('@clear cache');

      redisClient.flushAll().catch(console.error);
    };

    next();
  } catch (err) {
    console.error(err);
  }
};

export { pageController };
