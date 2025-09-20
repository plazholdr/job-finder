const { authenticate } = require('@feathersjs/authentication').hooks;
const mongoose = require('mongoose');
const { isCompanyVerified } = require('../../utils/access');

module.exports = (app) => ({
  before: {
    all: [ authenticate('jwt') ],
    find: [ async (ctx) => {
      // Company sees its invites; user sees invites addressed to them; admin sees all
      if (ctx.params.user.role === 'admin') return;
      ctx.params.query = ctx.params.query || {};
      if (ctx.params.user.role === 'company') {
        const Companies = require('../../models/companies.model');
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
      ctx.data.companyId = company._id;
      ctx.data.status = 'pending';
    } ],
    patch: [ async (ctx) => {
      const { status } = ctx.data;
      if (!['accepted','declined'].includes(status)) throw new Error('Only accept/decline allowed');
      const invite = await app.service('invites').get(ctx.id);
      // Only the target user can respond
      if (invite.userId.toString() !== ctx.params.user._id.toString()) throw new Error('Not authorized');
      ctx.data = { status, respondedAt: new Date() };
    } ],
    remove: []
  },
  after: {
    all: [],
    create: [ async (ctx) => {
      // notify user
      await app.service('notifications').create({
        recipientUserId: ctx.result.userId,
        recipientRole: 'student',
        type: 'invite_sent',
        title: 'New invite',
        body: 'A company has invited you.',
        data: { inviteId: ctx.result._id }
      }).catch(()=>{});
    } ],
    patch: [ async (ctx) => {
      const updated = ctx.result;
      const invite = await app.service('invites').get(updated._id);
      const type = updated.status === 'accepted' ? 'invite_accepted' : 'invite_declined';
      const company = await require('../../models/companies.model').findById(invite.companyId);
      if (company) {
        await app.service('notifications').create({
          recipientUserId: company.ownerUserId,
          recipientRole: 'company',
          type,
          title: updated.status === 'accepted' ? 'Invite accepted' : 'Invite declined',
          body: 'Your invite has been ' + updated.status + '.',
          data: { inviteId: updated._id, userId: invite.userId }
        }).catch(()=>{});
      }
    } ],
    find: [], get: [], update: [], remove: []
  },
  error: { all: [], find: [], get: [], create: [], update: [], patch: [], remove: [] }
});

