import { hooks as authHooks } from '@feathersjs/authentication';
import mongoose from 'mongoose';
import Companies from '../../models/companies.model.js';
import { isCompanyVerified } from '../../utils/access.js';
import { INVITE_STATUS } from '../../constants/enums.js';

const { authenticate } = authHooks;

export default (app) => ({
  before: {
    all: [ authenticate('jwt') ],
    find: [ async (ctx) => {
      // Company sees its invites; user sees invites addressed to them; admin sees all
      if (ctx.params.user.role === 'admin') return;
      ctx.params.query = ctx.params.query || {};
      if (ctx.params.user.role === 'company') {
        const company = await Companies.findOne({ ownerUserId: ctx.params.user._id });
        if (!company) throw new Error('Company profile not found');
        ctx.params.query.companyId = company._id;
      } else {
        ctx.params.query.userId = ctx.params.user._id;
      }
    } ],
    get: [ authenticate('jwt') ],
    create: [ async (ctx) => {
      if (ctx.params.user.role !== 'company') throw new Error('Only verified companies can create invites');
      const { ok, company } = await isCompanyVerified(app, ctx.params.user._id);
      if (!ok) throw new Error('Company not verified');

      const normalize = (item) => ({
        type: item.type || 'profile_access',
        userId: item.userId,
        message: item.message,
        companyId: company._id,
        status: INVITE_STATUS.PENDING
      });

      const data = Array.isArray(ctx.data) ? ctx.data.map(normalize) : [ normalize(ctx.data) ];

      // De-duplicate: skip if there is an existing PENDING invite for same company-user-type
      const InviteModel = app.service('invites')?.Model;
      const filtered = [];
      for (const item of data) {
        if (!item.userId) continue;
        const exists = await InviteModel.findOne({ companyId: item.companyId, userId: item.userId, type: item.type, status: INVITE_STATUS.PENDING }).lean();
        if (!exists) filtered.push(item);
      }

      ctx.data = Array.isArray(ctx.data) ? filtered : (filtered[0] || null);
      if (!ctx.data) {
        // no-op creation: avoid error, return 204-ish with message through result
        ctx.result = Array.isArray(ctx.data) ? [] : null;
      }
    } ],
    patch: [ async (ctx) => {
      const { status } = ctx.data;
      let newStatus;
      if (typeof status === 'number') {
        if (![INVITE_STATUS.ACCEPTED, INVITE_STATUS.DECLINED].includes(status)) {
          throw new Error('Only accept/decline allowed');
        }
        newStatus = status;
      } else if (typeof status === 'string') {
        if (status === 'accepted') newStatus = INVITE_STATUS.ACCEPTED;
        else if (status === 'declined') newStatus = INVITE_STATUS.DECLINED;
        else throw new Error('Only accept/decline allowed');
      } else {
        throw new Error('Invalid status');
      }
      const invite = await app.service('invites').get(ctx.id);
      // Only the target user can respond
      if (invite.userId.toString() !== ctx.params.user._id.toString()) throw new Error('Not authorized');
      ctx.data = { status: newStatus, respondedAt: new Date() };
    } ],
    remove: []
  },
  after: {
    all: [],
    create: [ async (ctx) => {
      const make = async (inv) => app.service('notifications').create({
        recipientUserId: inv.userId,
        recipientRole: 'student',
        type: 'invite_sent',
        title: 'Invitation received',
        body: 'A company has invited you to connect.',
        data: { inviteId: inv._id }
      }).catch(()=>{});
      if (Array.isArray(ctx.result)) {
        await Promise.all(ctx.result.map(make));
      } else if (ctx.result) {
        await make(ctx.result);
      }
    } ],
    patch: [ async (ctx) => {
      const updated = ctx.result;
      const invite = await app.service('invites').get(updated._id);
      const type = updated.status === INVITE_STATUS.ACCEPTED ? 'invite_accepted' : 'invite_declined';
      const company = await Companies.findById(invite.companyId);
      if (company) {
        await app.service('notifications').create({
          recipientUserId: company.ownerUserId,
          recipientRole: 'company',
          type,
          title: updated.status === INVITE_STATUS.ACCEPTED ? 'Invite accepted' : 'Invite declined',
          body: 'Your invite has been ' + (updated.status === INVITE_STATUS.ACCEPTED ? 'accepted' : 'declined') + '.',
          data: { inviteId: updated._id, userId: invite.userId }
        }).catch(()=>{});
      }
    } ],
    find: [], get: [], update: [], remove: []
  },
  error: { all: [], find: [], get: [], create: [], update: [], patch: [], remove: [] }
});

