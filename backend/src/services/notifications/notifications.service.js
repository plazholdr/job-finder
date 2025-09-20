const { Service } = require('feathers-mongoose');
const Notifications = require('../../models/notifications.model');
const hooks = require('./notifications.hooks');

module.exports = function (app) {
  const options = { Model: Notifications, paginate: app.get('paginate') };
  app.use('/notifications', new Service(options));
  const service = app.service('notifications');
  service.hooks(hooks(app));
};

