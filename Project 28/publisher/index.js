const Fastify = require('fastify');
const { EMAIL_QUEUE, getRedisService } = require('../commom/redis');

const buildMessage = (body) => JSON.stringify(body);

const sendMessageToQueue = async ({ message, queue, redis }) => {
  await redis.publish(queue, buildMessage(message));
  console.log('>> Message publish with content:', message);
};

// Server
const app = Fastify();
const redis = getRedisService();

app.post('/pub', async (request, reply) => {
  await sendMessageToQueue({
    message: request.body,
    queue: EMAIL_QUEUE,
    redis,
  });
  reply.send({ message: 'sended' });
});

app.listen({ port: 3000 }).then(() => console.log('Server is running!'));
