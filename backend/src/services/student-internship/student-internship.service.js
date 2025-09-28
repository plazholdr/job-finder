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

    // Normalize incoming payload into users.internProfile schema
    const allowedRoots = ['skills','languages','courses','assignments','preferences'];
    const src = {};
    for (const k of allowedRoots) if (data?.[k] != null) src[k] = data[k];

    const payload = {};
    // skills/languages: pass-through arrays of strings
    if (Array.isArray(src.skills)) payload.skills = src.skills;
    if (Array.isArray(src.languages)) payload.languages = src.languages;

    // courses: [{ id,name,description }] -> [{ courseId,courseName,courseDescription }]
    if (Array.isArray(src.courses)) {
      payload.courses = src.courses.map(c => ({
        courseId: c.courseId ?? c.id ?? '',
        courseName: c.courseName ?? c.name ?? '',
        courseDescription: c.courseDescription ?? c.description ?? ''
      }));
    }

    // assignments: [{ title, nature, methodology, description }] -> natureOfAssignment
    if (Array.isArray(src.assignments)) {
      payload.assignments = src.assignments.map(a => ({
        title: a.title ?? '',
        natureOfAssignment: a.natureOfAssignment ?? a.nature ?? '',
        methodology: a.methodology ?? '',
        description: a.description ?? ''
      }));
    }

    // preferences: map simplified fields to schema
    if (src.preferences && typeof src.preferences === 'object') {
      const p = src.preferences;
      const pref = {};
      // Dates
      if (p.preferredStartDate || p.startDate) pref.preferredStartDate = p.preferredStartDate ? new Date(p.preferredStartDate) : (p.startDate ? new Date(p.startDate) : undefined);
      if (p.preferredEndDate || p.endDate) pref.preferredEndDate = p.preferredEndDate ? new Date(p.preferredEndDate) : (p.endDate ? new Date(p.endDate) : undefined);
      // Industries (array) or single industry
      if (Array.isArray(p.industries)) pref.industries = p.industries;
      else if (p.industry) pref.industries = [p.industry];
      // Locations
      if (Array.isArray(p.locations)) pref.locations = p.locations.slice(0,3);
      // Salary range
      if (p.salaryRange || p.salary) {
        const s = p.salaryRange || p.salary;
        pref.salaryRange = { min: s.min != null ? Number(s.min) : undefined, max: s.max != null ? Number(s.max) : undefined };
      }
      payload.preferences = pref;
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

