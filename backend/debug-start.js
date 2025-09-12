// Debug version of the main application
console.log('=== DEBUG STARTUP ===');

try {
  // Load environment variables
  const path = require('path');
  const dotenv = require('dotenv');
  
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const envPath = path.resolve(process.cwd(), `.env.${NODE_ENV}`);
  console.log('Loading environment from:', envPath);
  
  dotenv.config({ path: envPath });
  dotenv.config(); // Fallback
  
  console.log('Environment loaded. PORT:', process.env.PORT);
  
  // Test imports one by one
  console.log('Importing express...');
  const express = require('@feathersjs/express');
  
  console.log('Importing feathers...');
  const feathers = require('@feathersjs/feathers');
  
  console.log('Importing socketio...');
  const socketio = require('@feathersjs/socketio');
  
  console.log('Importing cors...');
  const cors = require('cors');
  
  console.log('Importing helmet...');
  const helmet = require('helmet');
  
  console.log('Importing config...');
  const config = require('./src/config');
  console.log('Config loaded successfully');
  
  console.log('Importing logger...');
  const logger = require('./src/logger');
  console.log('Logger loaded successfully');
  
  console.log('Importing services...');
  const services = require('./src/services');
  console.log('Services loaded successfully');
  
  console.log('Importing middleware...');
  const middleware = require('./src/middleware');
  console.log('Middleware loaded successfully');
  
  console.log('Importing database...');
  const { connectToMongoDB } = require('./src/db');
  console.log('Database module loaded successfully');
  
  console.log('Importing redis...');
  const { connectToRedis } = require('./src/redis');
  console.log('Redis module loaded successfully');
  
  console.log('Creating Feathers app...');
  const app = express(feathers());
  console.log('Feathers app created successfully');
  
  console.log('All imports successful! Starting server...');
  
  // Basic server setup
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Simple health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  const port = config.app.port || 3030;
  
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📍 Health check: http://localhost:${port}/health`);
  });
  
} catch (error) {
  console.error('❌ Error during startup:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
