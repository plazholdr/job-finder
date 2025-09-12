const { createLogger, format, transports } = require('winston');
const config = require('./config');

// Configure the Winston logger
const logger = createLogger({
  level: config.logging.level,
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: {
    service: config.app.name,
    environment: config.app.env
  },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

module.exports = logger;
