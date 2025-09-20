const { Service } = require('feathers-mongoose');
const Shortlists = require('../../models/shortlists.model');
const hooks = require('./shortlists.hooks');

module.exports = function (app) {
  const options = { Model: Shortlists, paginate: app.get('paginate') };
  app.use('/shortlists', new Service(options));
  const service = app.service('shortlists');
  service.hooks(hooks(app));
};

