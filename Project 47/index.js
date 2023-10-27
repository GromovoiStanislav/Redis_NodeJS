const express = require('express');
const path = require('path');
const limiter = require('./middlewares/limiter');

const { port } = require('./config').app;

const app = express();

app.use('/', express.static(path.join(__dirname, './public')));

app.get('/api/ping', limiter, (req, res) => {
  return res.send('PONG');
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
