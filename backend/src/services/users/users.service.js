import feathersMongoose from 'feathers-mongoose';
const { Service } = feathersMongoose;
import Users from '../../models/users.model.js';
import hooks from './users.hooks.js';

class ExtendedUsersService extends Service {
  async get(id, params) {
    // Handle /users/me endpoint
    if (id === 'me') {
      const user = params?.user;
      if (!user) {
        const err = new Error('Authentication required');
        err.code = 401;
        throw err;
      }
      // Return the current user's data (password will be stripped by hooks)
      return super.get(user._id, params);
    }

    // Default behavior for other IDs
    return super.get(id, params);
  }
}

export default function (app) {
  const options = {
    Model: Users,
    paginate: app.get('paginate'),
    lean: true // return plain objects so password stays available for internal auth
  };

  // Initialize our service with any options it requires
  app.use('/users', new ExtendedUsersService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('users');

  service.hooks(hooks);
}
