const { Service } = require('feathers-mongoose');
const Threads = require('../../models/threads.model');
const hooks = require('./threads.hooks');

module.exports = function (app) {
  const options = { Model: Threads, paginate: app.get('paginate') };
  app.use('/threads', new Service(options));
  const service = app.service('threads');
  service.hooks(hooks(app));
};

