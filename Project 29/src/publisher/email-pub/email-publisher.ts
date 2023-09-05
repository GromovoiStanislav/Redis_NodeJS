import { FastifyRequest, FastifyReply } from 'fastify';
import { EncondigService } from '../../common/encoding';
import { RedisService, CHANNEL } from '../../common/redis';

export class EmailPublisher {
  constructor(
    private readonly redis: RedisService,
    private readonly encodingService: EncondigService
  ) {}

  publish = async (request: FastifyRequest, reply: FastifyReply) => {
    const message = this.buildMessage(request);
    const encodedMessage = this.encodingService.encode(message);

    await this.publishMessage(encodedMessage);
    reply.send({ message: 'sended' });
  };

  private buildMessage(request: FastifyRequest) {
    const body = request.body;
    const message = JSON.stringify(body);
    return message;
  }

  private async publishMessage(message: string) {
    await this.redis.publish(CHANNEL, message);
    console.log('>> Message publish with content:', message);
  }
}
