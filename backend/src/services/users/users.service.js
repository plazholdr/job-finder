import feathersMongoose from 'feathers-mongoose';
const { Service } = feathersMongoose;
import Users from '../../models/users.model.js';
import hooks from './users.hooks.js';

export default function (app) {
  const options = {
    Model: Users,
    paginate: app.get('paginate'),
    lean: true // return plain objects so password stays available for internal auth
  };

  // Initialize our service with any options it requires
  app.use('/users', new Service(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('users');

  service.hooks(hooks);
}
