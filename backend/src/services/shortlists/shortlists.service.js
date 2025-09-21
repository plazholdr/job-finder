import feathersMongoose from 'feathers-mongoose';
const { Service } = feathersMongoose;
import Shortlists from '../../models/shortlists.model.js';
import hooks from './shortlists.hooks.js';

export default function (app) {
  const options = { Model: Shortlists, paginate: app.get('paginate') };
  app.use('/shortlists', new Service(options));
  const service = app.service('shortlists');
  service.hooks(hooks(app));
}

