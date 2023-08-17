import { MongoClient } from 'mongodb';
import { createClient } from 'redis';

// Create Redis Client
let redisClient = createClient({ url: `redis://127.0.0.1:6379` });
redisClient.on('error', (error) => console.error(error));
await redisClient.connect();
console.log('Connected to Redis...');

// Connection Mongo
const url = 'mongodb://localhost:27017';
const mongoClient = new MongoClient(url);

// Use connect method to connect to the server
await mongoClient.connect();
console.log('Connected to Mongo...');
const db = mongoClient.db('test');
const userCollection = db.collection('users');

let user = await redisClient.get('Tom');
if (user) {
  console.log('from Redis:', JSON.parse(user));
} else {
  user = await userCollection.findOne({ name: 'Tom' });
  console.log('from Mongo:', user);
  await redisClient.set('Tom', JSON.stringify(user), { EX: 60 });
}

{
  const start = new Date().getTime();
  await redisClient.get('Tom');
  const end = new Date().getTime();
  console.log('from Redis:', end - start);
}
{
  const start = new Date().getTime();
  await userCollection.findOne({ name: 'Tom' });
  const end = new Date().getTime();
  console.log('from Mongo:', end - start);
}

await mongoClient.close();
await redisClient.disconnect();
