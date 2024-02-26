import { redis } from './lib/redis.js';

// https://redis.io/topics/streams-intro

const main = async () => {
  const channel = 'ioredis_channel';
  // We want to know how many messages have been written in this channel
  let messageCount = await redis.xlen(channel);
  console.log(
    `current message count in channel ${channel} is ${messageCount} messages`
  );

  // Write a message into. Messages are key value
  const myMessage = 'hello world';
  await redis.xadd(channel, '*', myMessage, 'message');

  messageCount = await redis.xlen(channel);
  console.log(
    `current message count in channel ${channel} is ${messageCount} messages`
  );

  // Use xread to read all messages in channel
  let messages = await redis.xread(['STREAMS', channel, 0]);
  messages = messages[0][1];
  console.log(
    `reading messages from channel ${channel}, found ${messages.length} messages`
  );
  for (let i = 0; i < messages.length; i++) {
    let msg = messages[i];
    msg = msg[1][0].toString();
    console.log('reading message:', msg);
  }
  process.exit(0);
};

main();

// current message count in channel ioredis_channel is 0 messages
// current message count in channel ioredis_channel is 1 messages
// reading messages from channel ioredis_channel, found 1 messages
// reading message: hello world
