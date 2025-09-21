import { hooks as authHooks } from '@feathersjs/authentication';
import { iff, isProvider } from 'feathers-hooks-common';
import mongoose from 'mongoose';
import { getCompanyForUser, isCompanyVerified } from '../../utils/access.js';

const { authenticate } = authHooks;

function onlyRoles(...roles) {
  return async (ctx) => {
    const r = ctx.params?.user?.role;
    if (!r || !roles.includes(r)) {
      const err = new Error('Not authorized');
      err.code = 403;
      throw err;
    }
  };
}

const STATUS = Object.freeze({ DRAFT: 0, PENDING: 1, ACTIVE: 2, CLOSED: 3 });

function computeExpiry(publishAt) {
  const base = publishAt ? new Date(publishAt) : new Date();
  const dt = new Date(base.getTime());
  dt.setDate(dt.getDate() + 30);
  return dt;
}

export default (app) => ({
  before: {
    all: [ iff(isProvider('external'), authenticate('jwt')) ],
    find: [ async (ctx) => {
      const user = ctx.params?.user;
      ctx.params.query = ctx.params.query || {};
      // Company sees own; admin sees all; students see ACTIVE only
      if (!user || user.role === 'student') {
        ctx.params.query.status = STATUS.ACTIVE; // public browse (but still auth in our app)
      } else if (user.role === 'company') {
        const company = await getCompanyForUser(app, user._id);
        if (!company) throw new Error('Company profile not found');
        ctx.params.query.companyId = company._id;
      }
    } ],
    get: [],
    create: [
      onlyRoles('company','admin'),
      async (ctx) => {
        const user = ctx.params.user;
        let companyId = null;
        if (user.role === 'company') {
          const { ok, company } = await isCompanyVerified(app, user._id);
          if (!ok) {
            const e = new Error('Company verification required');
            e.code = 403;
            throw e;
          }
          companyId = company._id;
        } else if (user.role === 'admin') {
          if (ctx.data.companyId) companyId = new mongoose.Types.ObjectId(ctx.data.companyId);
        }
        if (!companyId) throw new Error('companyId is required');

        const d = ctx.data || {};
        d.companyId = companyId;
        d.createdBy = user._id;

        // Allow client to save as draft or submit
        const submit = !!d.submitForApproval;
        delete d.submitForApproval;
        if (submit) {
          d.status = STATUS.PENDING;
          d.submittedAt = new Date();
        } else {
          d.status = STATUS.DRAFT;
        }
        ctx.data = d;
      }
    ],
    update: [ () => { throw new Error('Method not allowed'); } ],
    patch: [
      async (ctx) => {
        const user = ctx.params?.user;
        const current = await app.service('job-listings').get(ctx.id);
        // capture snapshot for after hooks
        ctx.params._before = { status: current.status };

        // Role-based authorization
        if (user.role === 'company') {
          const company = await getCompanyForUser(app, user._id);
          if (!company || String(company._id) !== String(current.companyId)) {
            const e = new Error('Not authorized'); e.code = 403; throw e;
          }
        } else if (user.role !== 'admin') {
          const e = new Error('Not authorized'); e.code = 403; throw e;
        }

        const d = ctx.data || {};

        // Company actions
        if (user.role === 'company') {
          if (d.submitForApproval) {
            d.status = STATUS.PENDING;
            d.submittedAt = new Date();
          }
          if (d.close === true && current.status === STATUS.ACTIVE) {
            d.status = STATUS.CLOSED;
            d.closedAt = new Date();
          }
          delete d.close; delete d.submitForApproval;
        }

        // Admin actions
        if (user.role === 'admin') {
          if (d.approve === true && current.status === STATUS.PENDING) {
            d.status = STATUS.ACTIVE;
            d.approvedAt = new Date();
            if (!current.publishAt) d.publishAt = new Date();
            const pub = d.publishAt || current.publishAt || new Date();
            d.expiresAt = computeExpiry(pub);
          }
          if (d.reject === true && current.status === STATUS.PENDING) {
            d.status = STATUS.DRAFT;
          }
          delete d.approve; delete d.reject;
        }

        ctx.data = d;
      }
    ],
    remove: [ onlyRoles('admin') ]
  },
  after: {
    all: [],
    create: [ async (ctx) => {
      // Notify admins when a listing is submitted for approval
      try {
        if (ctx.result.status === STATUS.PENDING) {
          const admins = await app.service('users').find({ paginate: false, query: { role: 'admin' } });
          await Promise.all((admins || []).map(a => app.service('notifications').create({
            recipientUserId: a._id,
            recipientRole: 'admin',
            type: 'job_submitted',
            title: 'New job listing submitted',
            body: `${ctx.result.title}`
          })));
        }
      } catch (_) {}
    } ],
    patch: [ async (ctx) => {
      // Transition-based notifications
      const prev = ctx.params._before || {};
      const next = ctx.result;
      const notifyCompany = async (title, body) => {
        try {
          const company = await app.service('companies').get(next.companyId);
          if (!company) return;
          await app.service('notifications').create({
            recipientUserId: company.ownerUserId,
            recipientRole: 'company',
            type: 'job_update',
            title, body
          });
        } catch (_) {}
      };
      if (prev.status === STATUS.PENDING && next.status === STATUS.ACTIVE) {
        await notifyCompany('Job approved', 'Your job listing has been approved and is now active.');
      }
      if (prev.status === STATUS.PENDING && next.status === STATUS.DRAFT) {
        await notifyCompany('Job rejected', 'Your job listing was rejected. Please review and resubmit.');
      }
      if (prev.status === STATUS.ACTIVE && next.status === STATUS.CLOSED) {
        await notifyCompany('Job closed', 'Your job listing has been closed.');
      }
    } ]
  },
  error: { }
});

