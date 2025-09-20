const { Service } = require('feathers-mongoose');
const Invites = require('../../models/invites.model');
const hooks = require('./invites.hooks');

module.exports = function (app) {
  const options = { Model: Invites, paginate: app.get('paginate') };
  app.use('/invites', new Service(options));
  const service = app.service('invites');
  service.hooks(hooks(app));
};

