const { createClient } = require('redis');
const logger = require('./logger');

let redisClient;

async function connectToRedis() {
  try {
    const uri = process.env.REDIS_URI || 'redis://localhost:6379';
    redisClient = createClient({ url: uri });
    
    redisClient.on('error', (err) => logger.error('Redis Client Error', err));
    
    await redisClient.connect();
    logger.info('Connected to Redis');
    
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
