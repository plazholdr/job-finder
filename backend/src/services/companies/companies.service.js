import feathersMongoose from 'feathers-mongoose';
const { Service } = feathersMongoose;
import Companies from '../../models/companies.model.js';
import hooks from './companies.hooks.js';

export default function (app) {
  const options = { Model: Companies, paginate: app.get('paginate') };
  app.use('/companies', new Service(options));
  const service = app.service('companies');
  service.hooks(hooks(app));
}

