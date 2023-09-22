import 'dotenv/config';
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
});

client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('error', (err) => {
  console.error(`Redis Error: ${err}`);
});

await client.connect();

/////////////////////////////////////////////////

const STREAM_KEY = 'jobs';

const JOB_TYPES = [
  'cleaning',
  'room_service',
  'taxi',
  'extra_towels',
  'extra_pillows',
];

const generateRandomJob = () => {
  const job = {
    room: String(Math.floor(Math.random() * 401 + 100)), // Генерация случайного номера комнаты от 100 до 500
    job: JOB_TYPES[Math.floor(Math.random() * JOB_TYPES.length)], // Случайный выбор типа задания
  };
  return job;
};

const addJobToStream = async () => {
  const job = generateRandomJob();

  const jobId = await client.xAdd(STREAM_KEY, '*', job); // job: Record<string:string>
  console.log(`Created job ${jobId}:`, job);
};

const createJob = () => {
  const delay = Math.floor(Math.random() * 6) + 5; // Генерация случайной задержки от 5 до 10 секунд
  setTimeout(() => {
    addJobToStream();
    createJob();
  }, delay * 1000);
};

const start = () => {
  createJob();
};
start();
