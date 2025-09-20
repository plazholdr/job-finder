const rateLimit = require('./rate-limit');
const errorHandler = require('./error-handler');

module.exports = function (app) {
  // Configure rate limiting
  app.configure(rateLimit);
  
  // Configure error handling
  app.configure(errorHandler);
};
