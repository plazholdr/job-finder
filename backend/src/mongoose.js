import mongoose from 'mongoose';
import logger from './logger.js';

export default function (app) {
  const mongoUrl = process.env.MONGODB_URI || app.get('mongodb');

  mongoose.connect(mongoUrl).then(() => {
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
