import feathersMongoose from 'feathers-mongoose';
const { Service } = feathersMongoose;
import CompanyVerifications from '../../models/company-verifications.model.js';
import hooks from './company-verifications.hooks.js';

export default function (app) {
  const options = { Model: CompanyVerifications, paginate: app.get('paginate') };
  app.use('/company-verifications', new Service(options));
  const service = app.service('company-verifications');
  service.hooks(hooks(app));
}

