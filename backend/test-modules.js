// Test each module individually
require('dotenv').config({ path: '.env.development' });

console.log('Testing modules individually...');

async function testModules() {
  try {
    // Test basic imports
    console.log('1. Testing basic imports...');
    const express = require('@feathersjs/express');
    const feathers = require('@feathersjs/feathers');
    console.log('✅ Feathers imports OK');

    // Test config
    console.log('2. Testing config...');
    const config = require('./src/config');
    console.log('✅ Config OK:', config.app.name);

    // Test logger
    console.log('3. Testing logger...');
    const logger = require('./src/logger');
    console.log('✅ Logger OK');

    // Test database module
    console.log('4. Testing database module...');
    const { connectToMongoDB } = require('./src/db');
    console.log('✅ Database module OK');

    // Test redis module
    console.log('5. Testing redis module...');
    const { connectToRedis } = require('./src/redis');
    console.log('✅ Redis module OK');

    // Test services
    console.log('6. Testing services...');
    const services = require('./src/services');
    console.log('✅ Services module OK');

    // Test middleware
    console.log('7. Testing middleware...');
    const middleware = require('./src/middleware');
    console.log('✅ Middleware module OK');

    console.log('🎉 All modules loaded successfully!');

    // Try creating a basic app
    console.log('8. Testing app creation...');
    const app = express(feathers());
    console.log('✅ App created successfully');

    // Test basic configuration
    app.use(require('cors')());
    app.use(express.json());
    console.log('✅ Basic middleware configured');

    console.log('🚀 Ready to start full application!');

  } catch (error) {
    console.error('❌ Error testing modules:', error);
    console.error('Stack:', error.stack);
  }
}

testModules();
