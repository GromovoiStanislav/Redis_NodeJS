import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyIO from 'fastify-socket.io';
import Redis from 'ioredis';
import closeWithGrace from 'close-with-grace';
dotenv.config();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '127.0.0.1';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://127.0.0.1:5500/';
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const CONNECTION_COUNT_KEY = 'chat:connection-count';
const CONNECTION_COUNT_UPDATED_CHANNEL = 'chat:connection-count-updated';
const NEW_MESSAGE_CHANNEL = 'chat:new-message';
if (!REDIS_URL) {
    console.error('missing REDIS_URL');
    process.exit(1);
}
const publisher = new Redis(REDIS_URL);
const subscriber = new Redis(REDIS_URL);
let connectedClients = 0;
async function buildServer() {
    const app = fastify();
    await app.register(fastifyCors, {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    });
    await app.register(fastifyIO, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        },
    });
    const currentCount = await publisher.get(CONNECTION_COUNT_KEY);
    if (!currentCount) {
        await publisher.set(CONNECTION_COUNT_KEY, 0);
    }
    app.io.on('connection', async (io) => {
        const incResult = await publisher.incr(CONNECTION_COUNT_KEY);
        connectedClients++;
        await publisher.publish(CONNECTION_COUNT_UPDATED_CHANNEL, String(incResult));
        io.on(NEW_MESSAGE_CHANNEL, async (payload) => {
            const message = payload.message;
            if (!message) {
                return;
            }
            console.log('rest', message);
            await publisher.publish(NEW_MESSAGE_CHANNEL, message.toString());
        });
        io.on('disconnect', async () => {
            connectedClients--;
            const decrResult = await publisher.decr(CONNECTION_COUNT_KEY);
            await publisher.publish(CONNECTION_COUNT_UPDATED_CHANNEL, String(decrResult));
        });
    });
    subscriber.subscribe(CONNECTION_COUNT_UPDATED_CHANNEL, (err, count) => {
        if (err) {
            console.error(`Error subscribing to ${CONNECTION_COUNT_UPDATED_CHANNEL}`, err);
            return;
        }
        console.log(`${count} clients subscribes to ${CONNECTION_COUNT_UPDATED_CHANNEL} channel`);
    });
    subscriber.subscribe(NEW_MESSAGE_CHANNEL, (err, count) => {
        if (err) {
            console.error(`Error subscribing to ${NEW_MESSAGE_CHANNEL}`);
            return;
        }
        console.log(`${count} clients subscribes to ${NEW_MESSAGE_CHANNEL} channel`);
    });
    subscriber.on('message', (channel, text) => {
        if (channel === CONNECTION_COUNT_UPDATED_CHANNEL) {
            app.io.emit(CONNECTION_COUNT_UPDATED_CHANNEL, {
                count: text,
            });
            return;
        }
        if (channel === NEW_MESSAGE_CHANNEL) {
            app.io.emit(NEW_MESSAGE_CHANNEL, {
                message: text,
                id: randomUUID(),
                createdAt: new Date(),
            });
            return;
        }
    });
    app.get('/healthcheck', () => {
        return {
            status: 'ok',
            port: PORT,
        };
    });
    return app;
}
async function main() {
    const app = await buildServer();
    try {
        await app.listen({
            port: PORT,
            host: HOST,
        });
        closeWithGrace({ delay: 2000 }, async ({ signal, err }) => {
            if (connectedClients > 0) {
                const currentCount = parseInt((await publisher.get(CONNECTION_COUNT_KEY)) || '0', 10);
                const newCount = Math.max(currentCount - connectedClients, 0);
                await publisher.set(CONNECTION_COUNT_KEY, newCount);
            }
            await app.close();
        });
        console.log(`Server started at http://${HOST}:${PORT}`);
    }
    catch (e) {
        console.error(e);
        process.exit(1);
    }
}
main();
