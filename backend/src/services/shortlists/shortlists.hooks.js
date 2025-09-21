import { hooks as authHooks } from '@feathersjs/authentication';
import Companies from '../../models/companies.model.js';

const { authenticate } = authHooks;

export default (app) => ({
  before: {
    all: [ authenticate('jwt') ],
    find: [ async (ctx) => {
      if (ctx.params.user.role !== 'company') throw new Error('Company only');
      const company = await Companies.findOne({ ownerUserId: ctx.params.user._id });
      if (!company) throw new Error('Company profile not found');
      ctx.params.query = { ...(ctx.params.query || {}), companyId: company._id };
    } ],
    create: [ async (ctx) => {
      if (ctx.params.user.role !== 'company') throw new Error('Company only');
      const company = await Companies.findOne({ ownerUserId: ctx.params.user._id });
      if (!company) throw new Error('Company profile not found');
      ctx.data.companyId = company._id;
    } ]
  },
  after: { },
  error: { }
});

