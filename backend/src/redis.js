const { createClient } = require('redis');
const logger = require('./logger');
const config = require('./config');

let redisClient;

async function connectToRedis() {
  try {
    const { uri, options } = config.db.redis;

    // Skip Redis connection if URI is not provided
    if (!uri) {
      logger.info('Redis URI not provided, skipping Redis connection');
      return null;
    }

    redisClient = createClient({
      url: uri,
      socket: {
        connectTimeout: 2000,
        lazyConnect: true
      },
      ...options
    });

    redisClient.on('error', (err) => logger.error('Redis Client Error', err));

    await redisClient.connect();
    logger.info(`Connected to Redis (${config.app.env})`);

    return redisClient;
  } catch (error) {
    logger.error('Failed to connect to Redis', error);
    throw error;
  }
}

function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectToRedis first.');
  }
  return redisClient;
}

async function closeRedisConnection() {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
}

module.exports = {
  connectToRedis,
  getRedisClient,
  closeRedisConnection
};
