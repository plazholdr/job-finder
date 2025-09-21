import mongoose from 'mongoose';
import logger from './logger.js';

export default function (app) {
  const isTest = String(process.env.NODE_ENV || '').toLowerCase() === 'test' || !!process.env.JEST_WORKER_ID;
  const configuredUrl = process.env.MONGODB_URI || app.get('mongodb');

  // In test, if no explicit MONGODB_URI is provided, leave connection management to tests (MongoMemoryServer)
  if (isTest && !process.env.MONGODB_URI) {
    app.set('mongooseClient', mongoose);
    return;
  }

  // If already connected, don't reconnect
  if (mongoose.connection && mongoose.connection.readyState !== 0) {
    app.set('mongooseClient', mongoose);
    return;
  }

  mongoose.connect(configuredUrl).then(() => {
    logger.info('Connected to MongoDB');
  }).catch(err => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  });

  mongoose.connection.on('error', err => {
    logger.error('MongoDB error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  app.set('mongooseClient', mongoose);
};
