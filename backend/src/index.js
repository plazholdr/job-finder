require('dotenv').config();
const express = require('@feathersjs/express');
const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./logger');
const services = require('./services');
const middleware = require('./middleware');
const { connectToMongoDB } = require('./db');
const { connectToRedis } = require('./redis');

// Create an Express compatible Feathers application
const app = express(feathers());

// Enable security, CORS, compression, and body parsing
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up Plugins and providers
app.configure(express.rest());
app.configure(socketio());

// Configure services and middleware
app.configure(services);
app.configure(middleware);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = app.get('mongoConnected') ? 'connected' : 'disconnected';
    const redisStatus = app.get('redisConnected') ? 'connected' : 'disconnected';

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: dbStatus,
        redis: redisStatus
      }
    });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: error.message
    });
  }
});

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger }));

// Start the server
async function start() {
  try {
    // Connect to MongoDB
    await connectToMongoDB();
    app.set('mongoConnected', true);

    // Connect to Redis
    await connectToRedis();
    app.set('redisConnected', true);

    // Start the server
    const port = process.env.PORT || 3030;
    const server = app.listen(port);

    server.on('listening', () => {
      logger.info(`Feathers application started on http://localhost:${port}`);
    });

    return app;
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  start();
}

module.exports = app;
