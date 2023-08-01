import { Router } from 'express';
import redisClient from '../services/redis';

export default function users() {
    const router = Router();

    router
        .get('/', (req, res, next) => {
            res.json({
                id: 1,
                firstname: 'Matt',
                lastname: 'Morgan',
            });
        })
        .post('/login', async (req, res, next) => {
            const body = req.body;
            const username = body.username;
            let attempts = 0;
            let user: any;

            const stored = await redisClient.get(`un-${username}`);

            if (!!stored) {
                attempts = Number(stored);
            }

            if (attempts > 4) {
                res.status(401).json({ tooMany: true });
                return;
            }

            // const user = db.getUser(username, body.password);

            if (!user) {
                attempts++;

                await redisClient.setEx(`un-${username}`, 30, `${attempts}`);

                res.status(401).json({ tooMany: false });
                return;
            }

            res.status(200).json({ success: true });
        });

    return router;
}