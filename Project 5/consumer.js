import express from 'express';
import {createClient} from 'redis';

const app = express();

const subscriber = createClient({
    url: `redis://127.0.0.1:6379`,
});
await subscriber.connect();

const products = [];

subscriber.subscribe('products',  (message, channel) => {
    console.log(channel, message);
    products.push(JSON.parse(message));
});

app.get('/products', async (req, res) => {
    res.json(products);
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Express server listening at http://localhost:${PORT}`);
});
