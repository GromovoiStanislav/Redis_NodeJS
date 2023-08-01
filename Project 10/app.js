import express from 'express';
import fetch from 'node-fetch';
import { createClient } from 'redis';

const app = express();
const port = process.env.PORT || 3000;
const REDIS_URL = process.env.PORT || `redis://127.0.0.1:6379`;

let redisClient;

(async () => {
  redisClient = createClient({
    url: REDIS_URL,
  });

  redisClient.on('error', (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
})();

const DEFAULT_EXPIRATION = 60;

// Set response
function setResponse(username, repos) {
  return `<h2>${username} has ${repos} Github repos</h2>`;
}

// Make request to Github for data
async function getRepos(req, res, next) {
  try {
    console.log('Fetching Data...');

    const { username } = req.params;

    const response = await fetch(`https://api.github.com/users/${username}`);

    const data = await response.json();

    const repos = data.public_repos;

    // Set data to Redis
    redisClient.setEx(username, DEFAULT_EXPIRATION, JSON.stringify(repos));

    res.send(setResponse(username, repos));
  } catch (err) {
    console.error(err);
    res.status(500);
  }
}

// Cache middleware
async function cache(req, res, next) {
  const { username } = req.params;

  const data = await redisClient.get(username);

  if (data !== null) {
    res.send(setResponse(username, JSON.parse(data)));
  } else {
    next();
  }
}

app.get('/repos/:username', cache, getRepos);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
