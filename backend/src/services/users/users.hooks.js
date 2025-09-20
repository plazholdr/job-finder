const { authenticate } = require('@feathersjs/authentication').hooks;
const { hashPassword, protect } = require('@feathersjs/authentication-local').hooks;
const { disallow, iff, isProvider } = require('feathers-hooks-common');

module.exports = {
  before: {
    all: [],
    find: [ authenticate('jwt') ],
    get: [ authenticate('jwt') ],
    create: [ 
      hashPassword('password'),
      // Validate required fields
      (context) => {
        const { email, password, role } = context.data;
        if (!email || !password || !role) {
          throw new Error('Email, password, and role are required');
        }
      }
    ],
    update: [ 
      disallow('external'),
      hashPassword('password') 
    ],
    patch: [ 
      authenticate('jwt'),
      iff(
        isProvider('external'),
        // Users can only update their own profile
        (context) => {
          if (context.params.user.role !== 'admin') {
            context.id = context.params.user._id;
          }
        }
      ),
      hashPassword('password')
    ],
    remove: [ 
      authenticate('jwt'),
      iff(
        isProvider('external'),
        // Only admins can delete users, or users can delete themselves
        (context) => {
          if (context.params.user.role !== 'admin') {
            context.id = context.params.user._id;
          }
        }
      )
    ]
  },

  after: {
    all: [ 
      // Make sure the password field is never sent to the client
      protect('password') 
    ],
    find: [],
    get: [],
    create: [
      // Send welcome email or verification email here
      (context) => {
        // TODO: Implement email verification
        console.log('User created:', context.result.email);
      }
    ],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
