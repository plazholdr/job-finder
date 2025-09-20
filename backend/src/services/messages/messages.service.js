const { Service } = require('feathers-mongoose');
const Messages = require('../../models/messages.model');
const hooks = require('./messages.hooks');

module.exports = function (app) {
  const options = { Model: Messages, paginate: app.get('paginate') };
  app.use('/messages', new Service(options));
  const service = app.service('messages');
  service.hooks(hooks(app));
};

