const config = {
  PORT: process.env.PORT ?? 3000,
  REDIS_URL: process.env.REDIS_URL ?? 'redis://localhost:6379/0',
};

export default config;
