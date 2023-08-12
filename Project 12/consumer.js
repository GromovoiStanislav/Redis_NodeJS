import { createClient } from 'redis';
import http from 'http';

const client = createClient({
  url: `redis://127.0.0.1:6379`,
});
await client.connect();

const messages = [];

async function processQueue(queueKey) {
  try {
    const reply = await client.rPop(queueKey);

    if (reply) {
      console.log(`Извлеченная запись из ${queueKey}: ${reply}`);
      messages.push(reply);
      // do something...
    }

    setImmediate(() => processQueue(queueKey));
  } catch (err) {
    console.error('Ошибка при извлечении записи из очереди:', err);
  }
}

// Запускаем обработку очереди queue
processQueue('queue1');
processQueue('queue2');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/messages') {
    // Устанавливаем заголовки ответа
    res.writeHead(200, { 'Content-Type': 'Application/json' });

    // Отправляем ответ клиенту
    res.end(JSON.stringify(messages));
  } else {
    // Если маршрут не найден
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page note found\n');
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Сервер запущен на порте ${port}`);
});
