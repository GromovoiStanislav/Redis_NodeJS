import express from 'express';
import { createClient } from 'redis';
import axios from 'axios';

const USER_NAME = 'username';

// Create Redis Client
let redisClient = createClient({ url: `redis://127.0.0.1:6379` });
redisClient.on('error', (error) => console.error(error));
await redisClient.connect();
console.log('Connected to Redis...');

const EX = 30; //in seconds

const app = express();
app.use(express.json());

app.get('/repos/:username', cache, getRepos);

//Cache middleware
async function cache(req, res, next) {
  const username = req.params['username'];

  const data = await redisClient.get(username);
  if (data) {
    res.send(formatOutput(username, JSON.parse(data)));
  } else {
    next();
  }
}

// Make request to Github for data
async function getRepos(req, res, next) {
  console.log('Fetching Data...');
  try {
    const { username } = req.params;
    const { data } = await axios.get(
      `https://api.github.com/users/${username}`
    );
    const repos = data.public_repos;

    // Set data to Redis
    //redisClient.setEx(username, EX, JSON.stringify(repos));
    redisClient.set(username, JSON.stringify(repos), { EX });

    res.send(formatOutput(username, repos));
  } catch (err) {
    console.error(err);
    res.status(404);
  }
}

function formatOutput(username, repos) {
  return `<h2>${username} has ${repos} Github repos</h2>`;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log('Server started on port ' + PORT);
});
