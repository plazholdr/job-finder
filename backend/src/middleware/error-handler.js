import logger from '../logger.js';

export default function (app) {
  app.use((error, req, res, next) => {
    if (error) {
      const message = `${error.code ? `(${error.code}) ` : ''}Route: ${req.url} - ${error.message}`;

      if (error.code === 404) {
        logger.warn(message);
      } else {
        logger.error(message);
        logger.error(error.stack);
      }
    }

    next(error);
  });
};
