import feathersMongoose from 'feathers-mongoose';
const { Service } = feathersMongoose;
import SavedJobs from '../../models/saved-jobs.model.js';
import hooks from './saved-jobs.hooks.js';

export default function (app) {
  const options = { Model: SavedJobs, paginate: app.get('paginate') };
  app.use('/saved-jobs', new Service(options));
  const service = app.service('saved-jobs');
  service.hooks(hooks(app));
}

