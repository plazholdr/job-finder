const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const configuration = require('@feathersjs/configuration');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');
const channels = require('./channels');
const authentication = require('./authentication');
const mongoose = require('./mongoose');
const redis = require('./redis');
const logger = require('./logger');

// Create Express app
const app = express(feathers());

// Load app configuration
app.configure(configuration());

// Enable security, CORS, compression and body parsing
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Set up Plugins and providers
app.configure(express.rest());
app.configure(socketio());

// Configure database
app.configure(mongoose);
app.configure(redis);

// Configure authentication
app.configure(authentication);

// Configure middleware
app.configure(middleware);

// Configure services
app.configure(services);

// Configure channels
app.configure(channels);

// Configure hooks
app.hooks(appHooks);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Configure error handling
app.use(express.notFound());
app.use(express.errorHandler({ logger }));

module.exports = app;
