const server = require('http').createServer();
const redis = require('redis');
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});


const client = redis.createClient({
  url: `redis://127.0.0.1:6379`,
});
client.on('error', (err) => console.log('Redis Client Error', err));

const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
  await client.connect();
  console.log(`Server started at ${PORT}`);
});

io.on('connect', (ioSocket) => {
  ioSocket.on('joinRoom', async (key) => {
    ioSocket.join(key);

    const messageData = await client.get(key);

    if (!messageData) {
      // the first data in the chat room
      ioSocket.emit('history', []);
    }

    // need to make sure that we are grabbing this history data on the frontend
    ioSocket.emit('history', JSON.parse(messageData));
  });

  ioSocket.on('message', async (message) => {
    // save message
    await saveMessage(message);
    // to everybody in the room including myself
    ioSocket.nsp.to(message.key).emit('message', message);
  });
});

const saveMessage = async (message) => {
  const { key } = message;

  const data = await client.get(key);

  if (!data) {
    // the first message in the chat room
    await client.set(key, JSON.stringify([message]));
    return;
  }

  const json = JSON.parse(data);
  json.push(message);

  await client.set(key, JSON.stringify(json));
};
