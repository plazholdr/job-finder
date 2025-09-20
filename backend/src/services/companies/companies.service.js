const { Service } = require('feathers-mongoose');
const Companies = require('../../models/companies.model');
const hooks = require('./companies.hooks');

module.exports = function (app) {
  const options = { Model: Companies, paginate: app.get('paginate') };
  app.use('/companies', new Service(options));
  const service = app.service('companies');
  service.hooks(hooks(app));
};

