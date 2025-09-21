import feathersMongoose from 'feathers-mongoose';
const { Service } = feathersMongoose;
import Resignation from '../../models/resignations.model.js';
import hooks from './resignations.hooks.js';

export default function (app) {
  const options = { Model: Resignation, paginate: app.get('paginate') };
  app.use('/resignations', new Service(options));
  const service = app.service('resignations');
  service.hooks(hooks(app));
}

