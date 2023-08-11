import { createClient } from 'redis';

const client = createClient({
  url: `redis://127.0.0.1:6379`,
});
await client.connect();

async function processQueue() {
  try {
    const reply = await client.rPop('queue');

    if (reply) {
      console.log(`Извлеченная запись из queue: ${reply}`);
      // do something...
    }

    processQueue();
  } catch (err) {
    console.error('Ошибка при извлечении записи из очереди:', err);
  }
}

// Запускаем обработку очереди queue1
processQueue().catch((err) => {
  console.error('Произошла ошибка:', err);
  client.quit();
});
