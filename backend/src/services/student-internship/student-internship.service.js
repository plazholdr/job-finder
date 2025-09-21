import { hooks as authHooks } from '@feathersjs/authentication';

class StudentInternshipService {
  constructor(options, app) {
    this.options = options || {};
    this.app = app;
  }

  // GET /student/internship/me
  async get(id, params) {
    if (id !== 'me') {
      const err = new Error('Not found');
      err.code = 404;
      throw err;
    }
    const user = params?.user;
    if (!user || user.role !== 'student') {
      const e = new Error('Student only');
      e.code = 403;
      throw e;
    }
    // Return profile plus internProfile
    const Users = this.app.service('users').Model;
    const fresh = await Users.findById(user._id).lean();
    return {
      profile: fresh?.profile || {},
      internProfile: fresh?.internProfile || {}
    };
  }

  // PATCH /student/internship/me
  async patch(id, data, params) {
    if (id !== 'me') {
      const err = new Error('Not found');
      err.code = 404;
      throw err;
    }
    const user = params?.user;
    if (!user || user.role !== 'student') {
      const e = new Error('Student only');
      e.code = 403;
      throw e;
    }

    // Whitelist internProfile fields
    const allowedRoots = ['skills','languages','courses','assignments','preferences'];
    const payload = {};
    for (const key of allowedRoots) {
      if (data?.[key] != null) payload[key] = data[key];
    }

    // Persist via users.patch (internal)
    const updated = await this.app.service('users').patch(user._id, { internProfile: payload });
    return { profile: updated?.profile || {}, internProfile: updated?.internProfile || {} };
  }
}

export default function (app) {
  const options = { paginate: false };
  app.use('/student/internship', new StudentInternshipService(options, app));

  // Minimal hooks here; auth enforced at service level too
  const service = app.service('student/internship');
  const { authenticate } = authHooks;
  service.hooks({
    before: {
      all: [ authenticate('jwt') ],
      find: [() => { throw Object.assign(new Error('Method not allowed'), { code: 405 }); }],
      get: [],
      create: [() => { throw Object.assign(new Error('Method not allowed'), { code: 405 }); }],
      update: [() => { throw Object.assign(new Error('Method not allowed'), { code: 405 }); }],
      patch: [],
      remove: [() => { throw Object.assign(new Error('Method not allowed'), { code: 405 }); }]
    }
  });
}

