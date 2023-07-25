import express from 'express';
import {createClient} from 'redis';

const app = express();
const publisher = createClient({
    url: `redis://127.0.0.1:6379`,
});
await publisher.connect();

app.post('/products', async (req, res) => {
    const id = Math.floor(Math.random() * 10 + 1);

    const product = {
        id,
        name: `Product ${id}`,
    };
    const result = await publisher.publish('products', JSON.stringify(product));
    console.log(result)
    res.json(product);
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Express server listening at http://localhost:${PORT}`);
});
