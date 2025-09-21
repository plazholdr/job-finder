import feathersMongoose from 'feathers-mongoose';
const { Service } = feathersMongoose;
import LikedJobs from '../../models/liked-jobs.model.js';
import hooks from './liked-jobs.hooks.js';

export default function (app) {
  const options = { Model: LikedJobs, paginate: app.get('paginate') };
  app.use('/liked-jobs', new Service(options));
  const service = app.service('liked-jobs');
  service.hooks(hooks(app));
}

