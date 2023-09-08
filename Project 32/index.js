const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const redis = require('redis');

const client = redis.createClient({
  url: `redis://127.0.0.1:6379`,
});
client.on('error', (err) => console.log('Redis Client Error', err));

const app = express();
app.set('view engine', 'ejs');

const server = http.createServer(app);
const io = socketio(server).listen(server);

async function getAllMessages(socket) {
  const data = await client.lRange('messages', '0', '-1');

  data.map((x) => {
    const usernameMessage = x.split(':');
    const redisUsername = usernameMessage[0];
    const redisMessage = usernameMessage[1];

    socket.emit('message', {
      from: redisUsername,
      message: redisMessage,
    });
  });
}

io.on('connection', (socket) => {
  getAllMessages(socket);

  socket.on('message', async ({ message, from }) => {
    await client.rPush('messages', `${from}:${message}`);
    io.emit('message', { from, message });
  });

  socket.on('disconnect', () => {
    io.emit('leave', 'any');
  });
});

app.get('/chat', (req, res) => {
  const username = req.query.username;

  io.emit('joined', username);
  res.render('chat', { username });
});

app.get('/', (req, res) => {
  res.render('index');
});

const PORT = 3000;
server.listen(PORT, async () => {
  console.log(`Server started at ${PORT}`);
  await client.connect();
  console.log(`Redis started`);
});
