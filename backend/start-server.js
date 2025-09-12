// Simplified server startup
require('dotenv').config({ path: '.env.development' });

console.log('🚀 Starting Job Finder Backend Server...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', process.env.PORT || 3030);

async function startServer() {
  try {
    // Load dependencies
    console.log('📦 Loading dependencies...');
    const express = require('@feathersjs/express');
    const feathers = require('@feathersjs/feathers');
    const cors = require('cors');
    const helmet = require('helmet');
    
    // Load application modules
    console.log('📋 Loading application modules...');
    const config = require('./src/config');
    const logger = require('./src/logger');
    
    // Create Feathers app
    console.log('🏗️ Creating application...');
    const app = express(feathers());
    
    // Basic middleware
    console.log('⚙️ Setting up middleware...');
    app.use(helmet({ contentSecurityPolicy: false }));
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Basic routes
    app.get('/', (req, res) => {
      res.json({
        message: 'Job Finder API is running!',
        timestamp: new Date().toISOString(),
        environment: config.app.env,
        version: config.app.version
      });
    });
    
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: config.app.env,
        version: config.app.version
      });
    });
    
    // Start server
    const port = config.app.port || 3030;
    const host = config.app.host || '0.0.0.0';
    
    const server = app.listen(port, host, () => {
      console.log('🎉 Server started successfully!');
      console.log(`📍 Server running on: http://${host}:${port}`);
      console.log(`📍 Health check: http://${host}:${port}/health`);
      console.log(`📍 API docs: http://${host}:${port}/`);
      console.log('');
      console.log('✅ Backend is ready to accept connections!');
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
    
    return app;
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Start the server
startServer();
