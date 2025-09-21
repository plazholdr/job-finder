import feathers from '@feathersjs/feathers';
import express from '@feathersjs/express';
import socketio from '@feathersjs/socketio';
import configuration from '@feathersjs/configuration';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

import middleware from './middleware/index.js';
import services from './services/index.js';
import appHooks from './app.hooks.js';
import channels from './channels.js';
import authentication from './authentication.js';
import mongoose from './mongoose.js';
import redis from './redis.js';
import logger from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create Express app
const app = express(feathers());

// Load app configuration
app.configure(configuration());

// Enable security, CORS, compression and body parsing
app.use(helmet({ contentSecurityPolicy: false }));
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

// Serve OpenAPI spec and simple docs
app.get('/openapi.yaml', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'openapi.yaml'));
});

app.get('/docs', (req, res) => {
  res.type('html').send(`<!doctype html>
<html>
<head><meta charset="utf-8"/><title>Job Finder API Docs</title></head>
<body>
  <redoc spec-url="/openapi.yaml"></redoc>
  <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
</body>
</html>`);
});

// Configure error handling
app.use(express.notFound());
app.use(express.errorHandler({ logger }));

export default app;
