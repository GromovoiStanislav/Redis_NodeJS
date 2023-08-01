const express = require('express');
const axios = require('axios');
const redis = require('redis');

const app = express();
const port = process.env.PORT || 3000;

let redisClient;

(async () => {
  redisClient = redis.createClient();

  redisClient.on('error', (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
})();

const DEFAULT_EXPIRATION = 3600;

app.get('/photos', async (req, res) => {
  try {
    const cacheResults = await redisClient.get('photos');

    if (cacheResults) {
      console.log('from cache');
      return res.json(JSON.parse(cacheResults));
    } else {
      const { data } = await axios.get(
        'https://jsonplaceholder.typicode.com/photos'
      );
      setCache('photos', data);
      console.log('from axios');
      res.json(data);
    }
  } catch (error) {
    console.error(error);
    res.status(404).send('Data unavailable');
  }
});

const setCache = (key, value) => {
  redisClient.setEx(key, DEFAULT_EXPIRATION, JSON.stringify(value));
};

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
