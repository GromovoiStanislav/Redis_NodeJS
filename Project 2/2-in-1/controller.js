import RedisConfig from './config.js';

const sendMessageToRedis = async (req, res) => {
  try {
    const { message } = req.body;
    const redisConfig = new RedisConfig();
    redisConfig.produce('my-channel', message);

    res.status(200).json({
      status: 'Ok!',
      message: '📨 Message successfully send!',
    });
  } catch (error) {
    console.log(error);
  }
};

const constrollers = { sendMessageToRedis };

export default constrollers;
