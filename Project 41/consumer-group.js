import 'dotenv/config';
import { createClient, commandOptions } from 'redis';

if (process.argv.length !== 3) {
  console.log('usage: node consumer_group.js <consumerName>');
  process.exit(1);
}

function randomSleep(minSeconds, maxSeconds) {
  const minMilliseconds = minSeconds * 1000;
  const maxMilliseconds = maxSeconds * 1000;
  const delay =
    Math.floor(Math.random() * (maxMilliseconds - minMilliseconds + 1)) +
    minMilliseconds;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

const STREAM_KEY = 'jobs';
const CONSUMER_GROUP_NAME = 'staff';
const CONSUMER_NAME = process.argv[2];

const r = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
});
await r.connect();

console.log(`Starting consumer ${CONSUMER_NAME}.`);

// Create the consumer group (and stream) if needed...
try {
  await r.xGroupCreate(STREAM_KEY, CONSUMER_GROUP_NAME, '0', {
    MKSTREAM: true,
  });
  console.log('Created consumer group.');
  console.log();
} catch (e) {
  console.log('Consumer group already exists, skipped creation.');
  console.log();
}

while (true) {
  try {
    let response = await r.xReadGroup(
      commandOptions({
        isolated: true,
      }),
      CONSUMER_GROUP_NAME,
      CONSUMER_NAME,
      [
        {
          key: STREAM_KEY,
          id: '>', // Next ID that no consumer in this group has seen.
        },
      ],
      {
        COUNT: 1,
        BLOCK: 5000,
      }
    );

    if (response) {
      const currentJobId = response[0].messages[0].id;
      const currentJobDetails = response[0].messages[0].message;

      console.log(
        `Performing job ${currentJobId}: ${JSON.stringify(currentJobDetails)}`
      );
      await randomSleep(3, 8);

      // Tell Redis we processed this job.
      await r.xAck(STREAM_KEY, CONSUMER_GROUP_NAME, currentJobId);
      console.log(`Acknowledged processing of job ${currentJobId}`);
      console.log();
    } else {
      console.log('Nothing to do right now.');
      console.log();
    }
  } catch (err) {
    console.log(err);
  }
}
