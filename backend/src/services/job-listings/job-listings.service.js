import feathersMongoose from 'feathers-mongoose';
const { Service } = feathersMongoose;
import JobListings from '../../models/job-listings.model.js';
import hooks from './job-listings.hooks.js';

export default function (app) {
  const options = { Model: JobListings, paginate: app.get('paginate') };
  app.use('/job-listings', new Service(options));
  const service = app.service('job-listings');
  service.hooks(hooks(app));
}

