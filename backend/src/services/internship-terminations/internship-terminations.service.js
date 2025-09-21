import feathersMongoose from 'feathers-mongoose';
const { Service } = feathersMongoose;
import InternshipTermination from '../../models/internship-terminations.model.js';
import hooks from './internship-terminations.hooks.js';

export default function (app) {
  const options = { Model: InternshipTermination, paginate: app.get('paginate') };
  app.use('/internship-terminations', new Service(options));
  const service = app.service('internship-terminations');
  service.hooks(hooks(app));
}

