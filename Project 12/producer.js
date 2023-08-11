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

send('queue', 'Новое сообщение 1');
send('queue', 'Новое сообщение 2');
send('queue', 'Новое сообщение 3');
send('queue', 'Новое сообщение 4');
send('queue', 'Новое сообщение 5');

// Закрываем соединение с Redis
client.quit();
