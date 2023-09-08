import http from 'http';
import ws from 'websocket';
import redis from 'redis';

let connections = [];
const WebSocketServer = ws.server;

const subscriber = redis.createClient({
  url: `redis://127.0.0.1:6379`,
});
subscriber.on('error', (err) => console.log('Redis Client Error', err));
await subscriber.connect();

const publisher = redis.createClient({
  url: `redis://127.0.0.1:6379`,
});
publisher.on('error', (err) => console.log('Redis Client Error', err));
await publisher.connect();

subscriber.subscribe('livechat', function (message, channel) {
  try {
    console.log(
      `Server received message in channel ${channel} msg: ${message}`
    );

    connections.forEach((c) => c.send(message));
  } catch (ex) {
    console.log('ERR::' + ex);
  }
});

const httpserver = http.createServer();
const websocket = new WebSocketServer({
  httpServer: httpserver,
});

httpserver.listen(3000, () => console.log('Server is listening on port 3000'));

websocket.on('request', (request) => {
  const con = request.accept(null, request.origin);
  con.on('open', () => console.log('opened'));
  con.on('close', () => console.log('CLOSED!!!'));
  con.on('message', (message) => {
    //publish the message to redis
    console.log(`Received message ${message.utf8Data}`);
    publisher.publish('livechat', message.utf8Data);
  });
  connections.push(con);
});

/*
    //client code
    let ws = new WebSocket("ws://localhost:3000");
    ws.onmessage = message => console.log(`Received: ${message.data}`);
    ws.send("Hello! I'm client")

*/
/*
    //code clean up after closing server
    subscriber.unsubscribe();
    subscriber.quit();
    publisher.quit();
*/
