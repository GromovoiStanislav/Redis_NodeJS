import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { createClient } from 'redis';

const app = express();
app.use(express.json());
app.use(cookieParser());

const client = createClient({
  url: `redis://127.0.0.1:6379`,
});
await client.connect();

const fakeUser = {
  name: 'John',
  email: 'john@mail.com',
  password: 'pass1234',
};


// 1. Get the counter value
// 2. Get the token value using the counter
// 3. Get the payload inside the token
app.post('/protected1', async (req, res) => {
  const { id } = req.body;
  const data = await client.get(String(id));
  if (data) {
    const payload = jwt.verify(data, 'secret');
    return res.json(payload);
  }
  return res.status(401).send('Unauthorized');
});


app.post('/protected2', async (req, res) => {
  const id = req.cookies['jwt-id'];
  if (id) {
    const data = await client.get(String(id));
    if (data) {
      const payload = jwt.verify(data, 'secret');
      return res.json(payload);
    }
  }
  return res.status(401).send('Unauthorized');
});


// 1. Increment the counter.
// 2. Map the counter to newly created token.
// 3. Send the counter as response to store it in a cookie.
app.post('/login', async (req, res) => {
  try {
    const data = await client.get('counter');
    const counter = (parseInt(data) || 0) + 1;
    await client.set('counter', counter);
    const token = jwt.sign(fakeUser, 'secret', { expiresIn: '1d' });
    await client.set(String(counter), token);
    res.cookie('jwt-id', counter);
    return res.status(200).send('logged in');
  } catch (err) {
    console.log(err);
    return res.status(500).send('Something wrong!');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
