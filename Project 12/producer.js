import { createClient } from 'redis';

const client = createClient({
  url: `redis://127.0.0.1:6379`,
});
await client.connect();

async function send(queueKey, message) {
  // Добавляем запись в начало очереди
  const lenght = await client.lPush(queueKey, message);
  console.log('Запись добавлена в очередь. Длина очереди:', lenght);
}

let k1 = 0,
  k2 = 0;

setInterval(() => {
  send('queue1', `Новое сообщение для queue1 ${++k1}`);
  send('queue1', `Новое сообщение для queue1 ${++k1}`);
  send('queue1', `Новое сообщение для queue1 ${++k1}`);
}, 5000);

setInterval(() => {
  send('queue1', `Новое сообщение для queue2 ${++k2}`);
  send('queue1', `Новое сообщение для queue2 ${++k2}`);
}, 10000);

// Закрываем соединение с Redis
//client.quit();
