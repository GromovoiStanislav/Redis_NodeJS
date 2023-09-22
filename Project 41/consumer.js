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

let lastJobId = '0';

const checkForJobs = async () => {
  console.log('Checking for jobs...');
  try {
    const response = await client.xRead([{ key: STREAM_KEY, id: lastJobId }], {
      COUNT: 1,
      BLOCK: 5000,
    });

    if (response) {
      const jobId = response[0].messages[0].id;
      const jobData = response[0].messages[0].message;

      console.log(`Performing job ${jobId}: ${JSON.stringify(jobData)}`);
      console.log();
      lastJobId = jobId;
    } else {
      console.log('Nothing to do right now, sleeping...');
      console.log();
    }
  } catch (err) {
    console.error(`Error checking for jobs: ${err}`);
    console.log();
  }

  setTimeout(checkForJobs, 1000 * 5);
};

checkForJobs();
