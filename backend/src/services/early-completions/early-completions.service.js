import feathersMongoose from 'feathers-mongoose';
const { Service } = feathersMongoose;
import EarlyCompletions from '../../models/early-completions.model.js';
import hooks from './early-completions.hooks.js';

export default function (app) {
  const options = { Model: EarlyCompletions, paginate: app.get('paginate') };
  app.use('/early-completions', new Service(options));
  const service = app.service('early-completions');
  service.hooks(hooks(app));
}

