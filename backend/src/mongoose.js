const mongoose = require('mongoose');
const logger = require('./logger');

module.exports = function (app) {
  const mongoUrl = app.get('mongodb') || process.env.MONGODB_URI;

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
