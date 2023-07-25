const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const NRP = require('node-redis-pubsub');
const nrp = new NRP({
  PORT: 6379,
  scope: 'microservice',
});

const uuid = require('uuid'); // Import the uuid library

const food = {
  burger: 150,
  chicken: 120,
  egg: 50,
  rice: 1000,
};

const orderPromises = {}; // Object to store promises for each order

app.post('/order', (req, res) => {
  const { order } = req.body;
  if (!order.name || !order.quantity)
    return res.status(404).json({
      message: 'Order name or quantity missing',
    });

  let receipt = {
    name: order.name,
    quantity: order.quantity,
    totalPrice: order.quantity * food[order.name],
  };

  const orderId = uuid.v4(); // Generate a unique order ID

  const orderPromise = new Promise((resolve, reject) => {
    // Store the response functions to resolve/reject the promise later
    orderPromises[orderId] = { resolve, reject };
  });

  nrp.emit('NEW_ORDER', { orderId, receipt });

  orderPromise
    .then((message) => {
      res.json({
        message: message.message,
        receipt: message.receipt,
        amountRemainingInWallet: message.amountRemainingInWallet,
      });
    })
    .catch((error) => {
      res.json({
        error: error.error,
      });
    });
});

// Outside of the route handler, listen for ORDER_SCS and ORDER_ERR events
nrp.on('ORDER_SCS', (data) => {
  if (orderPromises[data.orderId]) {
    orderPromises[data.orderId].resolve(data);
    delete orderPromises[data.orderId];
  }
});

nrp.on('ORDER_ERR', (error) => {
  // Assuming the error contains the order ID to identify which promise to reject
  if (orderPromises[error.orderId]) {
    orderPromises[error.orderId].reject(error);
    delete orderPromises[error.orderId];
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server at ${PORT}`);
});
