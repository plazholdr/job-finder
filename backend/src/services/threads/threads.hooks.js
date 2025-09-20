const { authenticate } = require('@feathersjs/authentication').hooks;

module.exports = (app) => ({
  before: {
    all: [ authenticate('jwt') ],
    find: [ async (ctx) => {
      // Only participants can find their threads
      const userId = ctx.params.user._id;
      ctx.params.query = ctx.params.query || {};
      ctx.params.query.$or = [
        { 'participants.userId': userId },
        { 'participants.companyId': await getCompanyIdIfCompany(app, userId) }
      ];
    } ],
    create: [ async (ctx) => {
      const userId = ctx.params.user._id;
      const body = ctx.data;
      // Normalize participants
      if (!body.companyId || !body.userId) throw new Error('companyId and userId required');
      ctx.data = { participants: [ { role: 'company', companyId: body.companyId }, { role: 'student', userId: body.userId } ] };
      // Upsert existing thread
      const existing = await app.service('threads').find({ paginate: false, query: { 'participants.companyId': body.companyId, 'participants.userId': body.userId } });
      if (existing.length) {
        ctx.result = existing[0];
        return ctx;
      }
    } ]
  },
  after: { },
  error: { }
});

async function getCompanyIdIfCompany(app, userId) {
  const Companies = require('../../models/companies.model');
  const c = await Companies.findOne({ ownerUserId: userId });
  return c ? c._id : null;
}

