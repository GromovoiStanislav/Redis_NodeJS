require('dotenv').config();

const { REDIS_URL, PORT } = process.env;

module.exports = {
  redis: {
    endpointUri: REDIS_URL || 'redis://127.0.0.1:6379',
  },
  app: {
    port: PORT || 3000,
  },
};
