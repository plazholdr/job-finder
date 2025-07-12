// Load environment-specific .env file based on NODE_ENV
const path = require('path');
const dotenv = require('dotenv');

console.log('🔧 Loading environment configuration...');

// Load environment variables from .env.{NODE_ENV} file
const NODE_ENV = process.env.NODE_ENV || 'development';
const envPath = path.resolve(process.cwd(), `.env.${NODE_ENV}`);
console.log(`📁 Environment file: ${envPath}`);

dotenv.config({ path: envPath });

// Fallback to .env if environment-specific file doesn't exist
dotenv.config();

console.log(`🌍 Environment: ${NODE_ENV}`);
console.log(`🚪 Port: ${process.env.PORT || 'not set'}`);

// Add error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('📦 Loading dependencies...');

// Declare app variable outside try block
let app;

try {
  const express = require('@feathersjs/express');
  console.log('✅ Feathers Express loaded');

  const feathers = require('@feathersjs/feathers');
  console.log('✅ Feathers core loaded');

  const socketio = require('@feathersjs/socketio');
  console.log('✅ Socket.IO loaded');

  const cors = require('cors');
  console.log('✅ CORS loaded');

  const helmet = require('helmet');
  console.log('✅ Helmet loaded');

  console.log('📋 Loading application modules...');

  const config = require('./config');
  console.log('✅ Config loaded');

  const logger = require('./logger');
  console.log('✅ Logger loaded');

  const services = require('./services');
  console.log('✅ Services loaded');

  const middleware = require('./middleware');
  console.log('✅ Middleware loaded');

  const { connectToMongoDB } = require('./db');
  console.log('✅ Database module loaded');

  const { connectToRedis } = require('./redis');
  console.log('✅ Redis module loaded');

  console.log('🚀 Creating Feathers application...');

  // Create an Express compatible Feathers application
  app = express(feathers());
  console.log('✅ Feathers app created');

  // Enable security, CORS, compression, and body parsing
  console.log('🔒 Setting up security and middleware...');

  app.use(helmet({
    contentSecurityPolicy: false
  }));
  console.log('✅ Helmet configured');

  app.use(cors(config.cors));
  console.log('✅ CORS configured');

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  console.log('✅ Body parsing configured');

  // Make config available throughout the application
  app.set('config', config);
  console.log('✅ Config set on app');

  // Set up Plugins and providers
  console.log('🔌 Configuring plugins...');

  app.configure(express.rest());
  console.log('✅ REST API configured');

  app.configure(socketio());
  console.log('✅ Socket.IO configured');

  // Configure services and middleware
  console.log('⚙️ Configuring services and middleware...');

  app.configure(services);
  console.log('✅ Services configured');

  app.configure(middleware);
  console.log('✅ Middleware configured');

} catch (error) {
  console.error('❌ Error during application setup:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = app.get('mongoConnected') ? 'connected' : 'disconnected';
    const redisStatus = app.get('redisConnected') ? 'connected' : 'disconnected';

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.app.env,
      version: config.app.version,
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
      environment: config.app.env,
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
    try {
      await connectToRedis();
      app.set('redisConnected', true);
    } catch (error) {
      logger.warn('Redis connection failed, continuing without Redis', error);
      app.set('redisConnected', false);
    }

    // Start the server
    const { port, host } = config.app;
    const server = app.listen(port, host, () => {
      logger.info(`${config.app.name} started on http://${host}:${port} in ${config.app.env} mode`);
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
