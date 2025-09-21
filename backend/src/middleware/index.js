import rateLimit from './rate-limit.js';
import errorHandler from './error-handler.js';

export default function (app) {
  // Configure rate limiting
  app.configure(rateLimit);

  // Configure error handling
  app.configure(errorHandler);
};
