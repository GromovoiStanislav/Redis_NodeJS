import express from 'express';
import configure from './routers';
import { connect } from './services/redis';

const app = express();
const port = process.env.PORT || 3000;

configure(app);

app.listen(port, async () => {
  console.log(`Listening on port ${port}`);

  try {
    await connect();
    console.log('Redis connected!');
  } catch (e) {
    console.log('Error connecting to Redis');
  }
});
