import { hooks as authHooks } from '@feathersjs/authentication';
import { TimesheetStatus as TS } from '../../constants/enums.js';

const { authenticate } = authHooks;

export default (app) => {
  // Resolve models lazily in handlers to avoid circular init

  async function ensureAccessFind(ctx) {
    const user = ctx.params.user; const q = ctx.params.query || {};
    if (!user) return ctx;
    const Employment = app.service('employment-records')?.Model;
    if (user.role === 'student') {
      const employmentIds = await Employment.find({ userId: user._id }).select('_id').lean();
      ctx.params.query = { ...q, employmentId: { $in: employmentIds.map(e => e._id) } };
    } else if (user.role === 'company') {
      const company = await app.service('companies').Model.findOne({ ownerUserId: user._id }).lean();
      if (!company) throw Object.assign(new Error('Company not found'), { code: 404 });
      const employmentIds = await Employment.find({ companyId: company._id }).select('_id').lean();
      ctx.params.query = { ...q, employmentId: { $in: employmentIds.map(e => e._id) } };
    }
    return ctx;
  }

  async function ensureAccessGet(ctx) {
    const user = ctx.params.user; if (!user) return ctx;
    const Timesheets = app.service('timesheets')?.Model;
    const Employment = app.service('employment-records')?.Model;
    const doc = await Timesheets.findById(ctx.id).lean(); if (!doc) return ctx;
    const emp = await Employment.findById(doc.employmentId).lean();
    if (!emp) return ctx;
    if (user.role === 'student' && String(emp.userId) !== String(user._id)) throw Object.assign(new Error('Forbidden'), { code: 403 });
    if (user.role === 'company') {
      const company = await app.service('companies').Model.findOne({ ownerUserId: user._id }).lean();
      if (!company || String(emp.companyId) !== String(company._id)) throw Object.assign(new Error('Forbidden'), { code: 403 });
    }
    return ctx;
  }

  async function onCreate(ctx) {
    const user = ctx.params.user;
    const body = ctx.data || {};
    const Employment = app.service('employment-records')?.Model;
    const emp = await Employment.findById(body.employmentId).lean();
    if (!emp) throw Object.assign(new Error('Employment not found'), { code: 404 });
    if (user.role !== 'student' || String(emp.userId) !== String(user._id)) throw Object.assign(new Error('Only the student can create timesheets'), { code: 403 });
    const total = (body.items || []).reduce((s, it) => s + (Number(it.hours) || 0), 0);
    ctx.data = { ...body, cadence: emp.cadence || 'weekly', status: TS.DRAFT, totalHours: total };
  }

  async function applyAction(ctx) {
    const user = ctx.params.user; const id = ctx.id;
    const Timesheets = app.service('timesheets')?.Model;
    const doc = await Timesheets.findById(id);
    if (!doc) throw Object.assign(new Error('Not found'), { code: 404 });
    const Employment = app.service('employment-records')?.Model;
    const emp = await Employment.findById(doc.employmentId).lean();
    if (!emp) throw Object.assign(new Error('Employment not found'), { code: 404 });

    const action = String(ctx.data.action || '').trim();
    if (!action) {
      // allow update of items while DRAFT or REJECTED by student
      if (user.role === 'student' && String(emp.userId) === String(user._id) && [TS.DRAFT, TS.REJECTED].includes(doc.status)) {
        const items = ctx.data.items ?? doc.items;
        const total = (items || []).reduce((s, it) => s + (Number(it.hours) || 0), 0);
        ctx.data = { items, totalHours: total };
        return;
      }
      throw Object.assign(new Error('Invalid patch'), { code: 400 });
    }

    const now = new Date();

    if (user.role === 'student' && String(emp.userId) === String(user._id)) {
      if (action === 'submit' && [TS.DRAFT, TS.REJECTED].includes(doc.status)) { ctx.data = { status: TS.SUBMITTED, submittedAt: now }; return; }
      if (action === 'withdrawSubmission' && doc.status === TS.SUBMITTED) { ctx.data = { status: TS.DRAFT }; return; }
      throw Object.assign(new Error('Invalid action'), { code: 400 });
    }

    if (user.role === 'company') {
      const company = await app.service('companies').Model.findOne({ ownerUserId: user._id }).lean();
      if (!company || String(emp.companyId) !== String(company._id)) throw Object.assign(new Error('Forbidden'), { code: 403 });
      if (action === 'approve' && doc.status === TS.SUBMITTED) { ctx.data = { status: TS.APPROVED, reviewedBy: user._id, reviewedAt: now }; return; }
      if (action === 'reject' && doc.status === TS.SUBMITTED) { ctx.data = { status: TS.REJECTED, reviewedBy: user._id, reviewedAt: now, feedback: ctx.data.feedback }; return; }
      throw Object.assign(new Error('Invalid action'), { code: 400 });
    }

    if (user.role === 'admin') {
      if (action === 'approve' && doc.status === TS.SUBMITTED) { ctx.data = { status: TS.APPROVED, reviewedBy: user._id, reviewedAt: now }; return; }
      if (action === 'reject' && doc.status === TS.SUBMITTED) { ctx.data = { status: TS.REJECTED, reviewedBy: user._id, reviewedAt: now, feedback: ctx.data.feedback }; return; }
    }

    throw Object.assign(new Error('Invalid action'), { code: 400 });
  }

  return {
    before: {
      all: [ authenticate('jwt') ],
      find: [ ensureAccessFind ],
      get: [ ensureAccessGet ],
      create: [ onCreate ],
      patch: [ applyAction ]
    },
    after: {
      patch: [ async (ctx) => {
        // Notifications
        try {
          const t = ctx.result; const Employment = app.service('employment-records')?.Model; const emp = await Employment.findById(t.employmentId).lean();
          if (!emp) return;
          if (t.status === TS.SUBMITTED) {
            const company = await app.service('companies').Model.findById(emp.companyId).lean();
            if (company?.ownerUserId) await app.service('notifications').create({ recipientUserId: company.ownerUserId, recipientRole: 'company', type: 'timesheet_submitted', title: 'Timesheet submitted', data: { timesheetId: t._id, employmentId: t.employmentId } });
          }
          if (t.status === TS.APPROVED) await app.service('notifications').create({ recipientUserId: emp.userId, recipientRole: 'student', type: 'timesheet_approved', title: 'Timesheet approved', data: { timesheetId: t._id, employmentId: t.employmentId } });
          if (t.status === TS.REJECTED) await app.service('notifications').create({ recipientUserId: emp.userId, recipientRole: 'student', type: 'timesheet_rejected', title: 'Timesheet rejected', data: { timesheetId: t._id, employmentId: t.employmentId } });
        } catch (_) {}
      } ]
    },
    error: {}
  };
};

