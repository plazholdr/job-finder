import feathersMongoose from 'feathers-mongoose';
const { Service } = feathersMongoose;
import InternshipExtension from '../../models/internship-extensions.model.js';
import hooks from './internship-extensions.hooks.js';

export default function (app) {
  const options = { Model: InternshipExtension, paginate: app.get('paginate') };
  app.use('/internship-extensions', new Service(options));
  const service = app.service('internship-extensions');
  service.hooks(hooks(app));
}

