import feathersMongoose from 'feathers-mongoose';
const { Service } = feathersMongoose;
import EmploymentRecord from '../../models/employment-records.model.js';
import hooks from './employment-records.hooks.js';

export default function (app) {
  const options = { Model: EmploymentRecord, paginate: app.get('paginate') };
  app.use('/employment-records', new Service(options));
  const service = app.service('employment-records');
  service.hooks(hooks(app));
}

