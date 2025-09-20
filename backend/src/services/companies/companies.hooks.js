const { authenticate } = require('@feathersjs/authentication').hooks;
const { iff, isProvider } = require('feathers-hooks-common');

module.exports = (app) => ({
  before: {
    all: [],
    find: [
      authenticate('jwt'),
      async (context) => {
        const q = { ...(context.params.query || {}) };

        // Custom params
        const keyword = (q.q || q.keyword || '').trim();
        const nature = q.nature || q.industry;
        const city = q.city || q.location;
        const salaryMin = q.salaryMin ? Number(q.salaryMin) : undefined;
        const salaryMax = q.salaryMax ? Number(q.salaryMax) : undefined;
        const latest = q.latest === 'true' || q.sort === 'latest';
        const sortBy = q.sortBy || q.sort;
        const recommended = q.recommended === 'true';

        // Build Mongo query
        const query = {};
        if (keyword) query.name = { $regex: keyword, $options: 'i' };
        if (nature) query.industry = { $regex: String(nature), $options: 'i' };
        if (city) {
          query.$or = [
            { 'address.city': { $regex: String(city), $options: 'i' } },
            { 'address.fullAddress': { $regex: String(city), $options: 'i' } }
          ];
        }
        // Salary range filter (based on internships array)
        if (salaryMin != null || salaryMax != null) {
          const r = {};
          if (salaryMin != null) r.max = { $gte: salaryMin };
          if (salaryMax != null) r.min = { ...(r.min || {}), $lte: salaryMax };
          query.internships = { $elemMatch: { 'salaryRange.min': r.min?.$lte, 'salaryRange.max': r.max?.$gte } };
          // Better filter using $elemMatch with predicates
          const elem = {};
          if (salaryMin != null) elem['salaryRange.max'] = { $gte: salaryMin };
          if (salaryMax != null) elem['salaryRange.min'] = { ...(elem['salaryRange.min'] || {}), $lte: salaryMax };
          query.internships = { $elemMatch: elem };
        }

        // Recommendations: simple industry-based using user internProfile
        if (recommended && context.params.user) {
          try {
            const user = await app.service('users').get(context.params.user._id);
            const prefs = user && user.internProfile && user.internProfile.preferences;
            const industries = (prefs && prefs.industries) || [];
            if (industries.length) {
              query.industry = { $in: industries };
            }
          } catch (_) {}
        }

        // Apply sorting
        const $sort = {};
        if (sortBy === 'name') $sort.name = 1;
        else if (sortBy === 'salary') $sort['internships.salaryRange.max'] = -1;
        else if (latest) $sort.createdAt = -1;
        else if (q.$sort) Object.assign($sort, q.$sort);

        context.params.query = {
          ...query,
          $sort: Object.keys($sort).length ? $sort : undefined
        };

        // Remove custom params so they don't leak to the adapter
        ['q','keyword','nature','industry','city','location','salaryMin','salaryMax','latest','sort','sortBy','recommended']
          .forEach(k => delete context.params.query[k]);
      }
    ],
    get: [ authenticate('jwt') ],
    create: [
      authenticate('jwt'),
      async (context) => {
        // owner is the authenticated user
        context.data.ownerUserId = context.params.user._id;
        context.data.verifiedStatus = 'pending';
        context.data.submittedAt = new Date();
      }
    ],
    update: [ authenticate('jwt') ],
    patch: [
      authenticate('jwt'),
      // Only owner or admin can patch
      async (context) => {
        if (context.params.user.role === 'admin') return;
        const company = await app.service('companies').get(context.id);
        if (company.ownerUserId.toString() !== context.params.user._id.toString()) {
          throw new Error('Not authorized');
        }
      }
    ],
    remove: [ authenticate('jwt') ]
  },
  after: {
    all: [],
    find: [
      // Attach computed internship stats for list view
      async (context) => {
        const mapCompany = (c) => ({
          ...c,
          internshipListingCount: Array.isArray(c.internships) ? c.internships.length : 0,
          internshipTopTitles: Array.isArray(c.internships) ? c.internships.slice(0, 3).map(j => j.title) : []
        });
        if (Array.isArray(context.result?.data)) {
          context.result.data = context.result.data.map(doc => mapCompany(doc));
        } else if (Array.isArray(context.result)) {
          context.result = context.result.map(doc => mapCompany(doc));
        } else if (context.result) {
          context.result = mapCompany(context.result);
        }
        return context;
      }
    ],
    get: [], create: [], update: [], patch: [], remove: []
  },
  error: { all: [], find: [], get: [], create: [], update: [], patch: [], remove: [] }
});

