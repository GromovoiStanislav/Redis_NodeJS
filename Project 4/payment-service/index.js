const express = require('express');
const app = express();

const NRP = require('node-redis-pubsub');
const nrp = new NRP({
  PORT: 6379,
  //url: process.env.REDIS_URL,
  scope: 'microservice',
});

let wallet = 30000;

nrp.on('NEW_ORDER', (data) => {
  const { name, quantity, totalPrice } = data.receipt;
  const orderId = data.orderId;

  if (totalPrice <= wallet) {
    wallet -= totalPrice;
    nrp.emit('ORDER_SCS', {
      orderId,
      message: 'Order placed',
      receipt: data.receipt,
      amountRemainingInWallet: wallet,
    });
  } else {
    nrp.emit('ORDER_ERR', {
      orderId,
      error: 'Low on wallet money',
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server at ${PORT}`);
});
