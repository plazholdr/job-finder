import feathersMongoose from 'feathers-mongoose';
const { Service } = feathersMongoose;
import Applications from '../../models/applications.model.js';
import hooks from './applications.hooks.js';

export default function (app) {
  const options = { Model: Applications, paginate: app.get('paginate') };
  app.use('/applications', new Service(options));
  const service = app.service('applications');
  service.hooks(hooks(app));
}

