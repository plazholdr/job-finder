// Simple test to check what's happening during startup
console.log('Starting test...');

try {
  // Load environment variables
  require('dotenv').config({ path: '.env.development' });
  console.log('Environment loaded successfully');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT:', process.env.PORT);
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
  
  // Test basic imports
  console.log('Testing imports...');
  const express = require('express');
  console.log('Express imported successfully');
  
  const cors = require('cors');
  console.log('CORS imported successfully');
  
  // Test MongoDB connection
  console.log('Testing MongoDB...');
  const { MongoClient } = require('mongodb');
  console.log('MongoDB client imported successfully');
  
  console.log('All basic tests passed!');
  
} catch (error) {
  console.error('Error during startup test:', error);
  process.exit(1);
}
