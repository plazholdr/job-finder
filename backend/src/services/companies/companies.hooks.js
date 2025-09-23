import { hooks as authHooks } from '@feathersjs/authentication';
import { iff, isProvider } from 'feathers-hooks-common';
import { VERIFICATION_STATUS } from '../../constants/enums.js';

const { authenticate } = authHooks;

export default (app) => ({
  before: {
    all: [],
    find: [
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

        // Public (unauthenticated) and student users only see approved companies
        const isExternal = !!context.params.provider;
        const role = context.params.user?.role;
        if (isExternal && role !== 'admin') {
          q.verifiedStatus = VERIFICATION_STATUS.APPROVED;
        }

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
          ...(q.verifiedStatus !== undefined ? { verifiedStatus: q.verifiedStatus } : {}),
          $sort: Object.keys($sort).length ? $sort : undefined
        };

        // Remove custom params so they don't leak to the adapter
        ['q','keyword','nature','industry','city','location','salaryMin','salaryMax','latest','sort','sortBy','recommended']
          .forEach(k => delete context.params.query[k]);
      }
    ],
    get: [ async (context) => {
      // Public or student can only view approved companies
      const isExternal = !!context.params.provider;
      const role = context.params.user?.role;
      if (isExternal && role !== 'admin') {
        const doc = await app.service('companies').Model.findById(context.id).lean();
        if (!doc || doc.verifiedStatus !== VERIFICATION_STATUS.APPROVED) {
          const e = new Error('Not found'); e.code = 404; throw e;
        }
      }
    } ],
    create: [
      authenticate('jwt'),
      async (context) => {
        // owner is the authenticated user
        context.data.ownerUserId = context.params.user._id;
        context.data.verifiedStatus = VERIFICATION_STATUS.PENDING;
        context.data.submittedAt = new Date();
      }
    ],
    update: [ authenticate('jwt') ],
    patch: [
      authenticate('jwt'),
      // Admin or owner can patch; capture previous for notifications
      async (context) => {
        const prev = await app.service('companies').get(context.id);
        context.params._before = { verifiedStatus: prev.verifiedStatus, ownerUserId: prev.ownerUserId };
        if (context.params.user.role === 'admin') return;
        if (prev.ownerUserId.toString() !== context.params.user._id.toString()) {
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
    get: [],
    create: [ async (context) => {
      // Notify admins of a new company submission and receipt to owner
      try {
        const admins = await app.service('users').find({ paginate: false, query: { role: 'admin' } });
        await Promise.all((admins||[]).map(a => app.service('notifications').create({
          recipientUserId: a._id,
          recipientRole: 'admin',
          type: 'system',
          title: 'New company submitted',
          body: `${context.result?.name || 'Company'} is pending verification.`
        }).catch(()=>{})));
      } catch (_) {}
      try {
        await app.service('notifications').create({
          recipientUserId: context.params.user._id,
          recipientRole: 'company',
          type: 'system',
          title: 'Company submitted',
          body: 'Your company profile has been submitted for verification.'
        }).catch(()=>{});
      } catch (_) {}
    } ],
    update: [],
    patch: [ async (context) => {
      // If verification status changed (including direct admin patch), notify owner
      try {
        const before = context.params._before || {};
        const after = context.result || {};
        if (before.verifiedStatus !== undefined && after.verifiedStatus !== undefined && before.verifiedStatus !== after.verifiedStatus) {
          const approved = after.verifiedStatus === VERIFICATION_STATUS.APPROVED;
          const rejected = after.verifiedStatus === VERIFICATION_STATUS.REJECTED;
          const title = approved ? 'Company approved' : rejected ? 'Company rejected' : 'Company status updated';
          const body = approved ? 'Your company is verified.' : rejected ? (after.rejectionReason || 'Your company verification was rejected.') : 'Your company verification status changed.';
          await app.service('notifications').create({
            recipientUserId: before.ownerUserId || after.ownerUserId,
            recipientRole: 'company',
            type: 'system',
            title, body
          }).catch(()=>{});
        }
      } catch (_) {}
    } ],
    remove: []
  },
  error: { all: [], find: [], get: [], create: [], update: [], patch: [], remove: [] }
});

