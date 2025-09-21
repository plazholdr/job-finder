import { hooks as authHooks } from '@feathersjs/authentication';
import { RequestStatus as RS, EmploymentStatus as ES } from '../../constants/enums.js';

const { authenticate } = authHooks;

export default (app) => {
  // Filters
  async function ensureAccessFind(ctx) {
    const user = ctx.params.user; const q = ctx.params.query || {};
    if (!user) return ctx;
    if (user.role === 'student') {
      const Employment = app.service('employment-records')?.Model;
      const employmentIds = await Employment.find({ userId: user._id }).select('_id').lean();
      ctx.params.query = { ...q, employmentId: { $in: employmentIds.map(e => e._id) } };
    } else if (user.role === 'company') {
      const company = await app.service('companies').Model.findOne({ ownerUserId: user._id }).lean();
      const Employment = app.service('employment-records')?.Model;
      const employmentIds = await Employment.find({ companyId: company?._id }).select('_id').lean();
      ctx.params.query = { ...q, employmentId: { $in: employmentIds.map(e => e._id) } };
    }
    return ctx;
  }

  // Create: only student can initiate resignation
  async function onCreate(ctx) {
    const user = ctx.params.user; const body = ctx.data || {};
    if (user.role !== 'student') throw Object.assign(new Error('Only students can resign'), { code: 403 });
    const Employment = app.service('employment-records')?.Model;
    const emp = await Employment.findById(body.employmentId).lean();
    if (!emp) throw Object.assign(new Error('Employment not found'), { code: 404 });
    if (String(emp.userId) !== String(user._id)) throw Object.assign(new Error('Forbidden'), { code: 403 });
    ctx.data = { employmentId: emp._id, initiatedBy: 'student', reason: body.reason, proposedLastDay: body.proposedLastDay ? new Date(body.proposedLastDay) : null, status: RS.PENDING };

    // Notify company owner
    try {
      const company = await app.service('companies').Model.findById(emp.companyId).lean();
      if (company?.ownerUserId) {
        await app.service('notifications').create({ recipientUserId: company.ownerUserId, recipientRole: 'company', type: 'resignation_requested', title: 'Resignation requested', data: { employmentId: emp._id } });
      }
    } catch (_) {}
  }

  async function applyAction(ctx) {
    const user = ctx.params.user; const id = ctx.id;
    const Resignations = app.service('resignations')?.Model;
    const doc = await Resignations.findById(id);
    if (!doc) throw Object.assign(new Error('Not found'), { code: 404 });
    const Employment = app.service('employment-records')?.Model;
    const emp = await Employment.findById(doc.employmentId).lean();
    if (!emp) throw Object.assign(new Error('Employment not found'), { code: 404 });

    const action = String(ctx.data.action || '').trim();
    if (!action) return ctx;

    const now = new Date();

    if (action === 'cancel' && doc.status === RS.PENDING) {
      if (user.role === 'student' && String(emp.userId) === String(user._id)) {
        ctx.data = { status: RS.CANCELLED };
        return;
      }
      throw Object.assign(new Error('Forbidden'), { code: 403 });
    }

    // Company/Admin decide
    if ((user.role === 'company' || user.role === 'admin') && doc.status === RS.PENDING) {
      // Ownership check for company
      if (user.role === 'company') {
        const company = await app.service('companies').Model.findOne({ ownerUserId: user._id }).lean();
        if (!company || String(emp.companyId) !== String(company._id)) throw Object.assign(new Error('Forbidden'), { code: 403 });
      }
      if (action === 'approve') {
        const lastDay = doc.proposedLastDay || now;
        await Employment.updateOne({ _id: emp._id }, { $set: { status: ES.TERMINATED, endDate: lastDay } });
        ctx.data = { status: RS.APPROVED, decidedBy: user._id, decidedAt: now };
        try {
          await app.service('notifications').create({ recipientUserId: emp.userId, recipientRole: 'student', type: 'resignation_approved', title: 'Resignation approved', data: { employmentId: emp._id } });
          await app.service('notifications').create({ recipientUserId: emp.userId, recipientRole: 'student', type: 'employment_terminated', title: 'Employment terminated', data: { employmentId: emp._id } });
        } catch (_) {}
        return;
      }
      if (action === 'reject') {
        ctx.data = { status: RS.REJECTED, decidedBy: user._id, decidedAt: now };
        try {
          await app.service('notifications').create({ recipientUserId: emp.userId, recipientRole: 'student', type: 'resignation_rejected', title: 'Resignation rejected', data: { employmentId: emp._id } });
        } catch (_) {}
        return;
      }
    }

    throw Object.assign(new Error('Invalid action'), { code: 400 });
  }

  return {
    before: {
      all: [ authenticate('jwt') ],
      find: [ ensureAccessFind ],
      get: [],
      create: [ onCreate ],
      patch: [ applyAction ]
    }
  };
};

