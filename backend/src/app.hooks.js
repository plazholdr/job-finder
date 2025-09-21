// Application hooks that run for every service
import logger from './logger.js';

export default {
  before: {
    all: [
      // Log all requests
      (context) => {
        logger.info(`${context.method} ${context.path} - User: ${context.params.user?.email || 'anonymous'}`);
      }
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [
      (context) => {
        logger.error(`Error in ${context.method} ${context.path}:`, context.error);
      }
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
