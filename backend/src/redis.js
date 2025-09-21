import Redis from 'ioredis';
import logger from './logger.js';

export default function (app) {
  // Allow disabling Redis via env or missing URI
  const configuredUrl = app.get('redis');
  const envUrl = process.env.REDIS_URI;
  const disabled = String(process.env.REDIS_DISABLED || '').toLowerCase() === 'true';
  const redisUrl = envUrl || configuredUrl;

  if (disabled || !redisUrl) {
    logger.warn('Redis disabled or not configured. Proceeding without Redis.');
    app.set('redis', null);
    return;
  }

  const redis = new Redis(redisUrl, {
    enableReadyCheck: false,
    maxRetriesPerRequest: 1,
    // Stop endless reconnect spam unless explicitly enabled via REDIS_RETRY=true
    retryStrategy: () => (String(process.env.REDIS_RETRY || '').toLowerCase() === 'true' ? 500 : null),
  });

  let loggedError = false;
  redis.on('connect', () => {
    logger.info('Connected to Redis');
  });

  redis.on('error', (err) => {
    if (!loggedError) {
      logger.error('Redis connection error:', err);
      loggedError = true;
    }
  });

  redis.on('close', () => {
    logger.warn('Redis connection closed');
  });

  app.set('redis', redis);
};
