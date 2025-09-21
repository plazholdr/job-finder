import { hooks as authHooks } from '@feathersjs/authentication';

const { authenticate } = authHooks;

function onlyAdmin() {
  return async (ctx) => {
    const role = ctx.params?.user?.role;
    if (role !== 'admin') {
      const err = new Error('Admin only');
      err.code = 403;
      throw err;
    }
  };
}

export default (app) => ({
  before: {
    all: [ authenticate('jwt'), onlyAdmin() ],
    find: [],
    get: [],
    create: [() => { throw Object.assign(new Error('Method not allowed'), { code: 405 }); }],
    update: [() => { throw Object.assign(new Error('Method not allowed'), { code: 405 }); }],
    patch:  [() => { throw Object.assign(new Error('Method not allowed'), { code: 405 }); }],
    remove: [() => { throw Object.assign(new Error('Method not allowed'), { code: 405 }); }],
  },
  after: {
    all: [],
  },
  error: { all: [] }
});

