const { Service } = require('feathers-mongoose');
const createModel = require('../../models/users.model');
const hooks = require('./users.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel,
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/users', new Service(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('users');

  service.hooks(hooks);
};
