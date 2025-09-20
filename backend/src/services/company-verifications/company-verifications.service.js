const { Service } = require('feathers-mongoose');
const CompanyVerifications = require('../../models/company-verifications.model');
const hooks = require('./company-verifications.hooks');

module.exports = function (app) {
  const options = { Model: CompanyVerifications, paginate: app.get('paginate') };
  app.use('/company-verifications', new Service(options));
  const service = app.service('company-verifications');
  service.hooks(hooks(app));
};

