import express from 'express';
import constrollers from './controller.js';


const app = express();
app.use(express.json());

app.post('/api/send', constrollers.sendMessageToRedis);
app.get('/', (req, res) => res.json({ msg: 'Welcome' }));


app.listen(3000, () => {
  console.log(`Server is running at http://localhost:3000`);
});
