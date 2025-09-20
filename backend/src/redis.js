const Redis = require('ioredis');
const logger = require('./logger');

module.exports = function (app) {
  const redisUrl = process.env.REDIS_URI || app.get('redis');

  const redis = new Redis(redisUrl, {
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
  });

  redis.on('connect', () => {
    logger.info('Connected to Redis');
  });

  redis.on('error', (err) => {
    logger.error('Redis connection error:', err);
  });

  redis.on('close', () => {
    logger.warn('Redis connection closed');
  });

  app.set('redis', redis);
};
