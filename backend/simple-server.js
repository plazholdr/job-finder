// Simple Express server to test basic functionality
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '.env.development' });

console.log('Starting simple server...');

const app = express();
const port = process.env.PORT || 3030;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Job Finder API is running!', 
    timestamp: new Date().toISOString(),
    port: port
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Simple server running on port ${port}`);
  console.log(`📍 Visit: http://localhost:${port}`);
  console.log(`📍 Health: http://localhost:${port}/health`);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
