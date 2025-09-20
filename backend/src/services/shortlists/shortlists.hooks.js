const { authenticate } = require('@feathersjs/authentication').hooks;

module.exports = (app) => ({
  before: {
    all: [ authenticate('jwt') ],
    find: [ async (ctx) => {
      if (ctx.params.user.role !== 'company') throw new Error('Company only');
      const Companies = require('../../models/companies.model');
      const company = await Companies.findOne({ ownerUserId: ctx.params.user._id });
      if (!company) throw new Error('Company profile not found');
      ctx.params.query = { ...(ctx.params.query || {}), companyId: company._id };
    } ],
    create: [ async (ctx) => {
      if (ctx.params.user.role !== 'company') throw new Error('Company only');
      const Companies = require('../../models/companies.model');
      const company = await Companies.findOne({ ownerUserId: ctx.params.user._id });
      if (!company) throw new Error('Company profile not found');
      ctx.data.companyId = company._id;
    } ]
  },
  after: { },
  error: { }
});

