import feathersMongoose from 'feathers-mongoose';
const { Service } = feathersMongoose;
import Companies from '../../models/companies.model.js';
import hooks from './companies.hooks.js';

export default function (app) {
  // Allow use of $elemMatch in queries (e.g., internships salaryRange filters)
  const options = { Model: Companies, paginate: app.get('paginate'), whitelist: ['$elemMatch'] };
  app.use('/companies', new Service(options));
  const service = app.service('companies');
  service.hooks(hooks(app));
}

