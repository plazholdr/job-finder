// Load environment variables first
require('dotenv').config();

const logger = require('./logger');
const app = require('./app');

const port = app.get('port');
const started = app.listen(port);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

const logStarted = () =>
  logger.info('Feathers application started on http://%s:%d', app.get('host'), port);

if (started && typeof started.then === 'function') {
  // Feathers v5 may return a Promise<Server>
  started
    .then(() => logStarted())
    .catch(err => {
      logger.error('Failed to start server:', err);
      process.exit(1);
    });
} else if (started && typeof started.on === 'function') {
  // Node HTTP server
  started.on('listening', logStarted);
} else {
  // Fallback
  logStarted();
}
