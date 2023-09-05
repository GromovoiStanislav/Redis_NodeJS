import { EncondigService } from '../common/encoding';
import { RedisService } from '../common/redis';
import { EmailSubscriber } from './email-sub/email-subscriber';

const encodingService = new EncondigService();
const redis = new RedisService();

const start = async () => {
  const emailSubscriber = new EmailSubscriber(redis, encodingService);
  await emailSubscriber.listen();
};

start();
