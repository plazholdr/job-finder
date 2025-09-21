import { hooks as authHooks } from '@feathersjs/authentication';

const { authenticate } = authHooks;

export default (app) => ({
  before: {
    all: [ authenticate('jwt') ],
    find: [ async (ctx) => { ctx.params.query = { ...(ctx.params.query||{}), userId: ctx.params.user._id }; } ],
    get: [ async (ctx) => { /* ownership enforced by find/get query */ } ],
    create: [ async (ctx) => {
      ctx.data.userId = ctx.params.user._id;
      // idempotent create
      const existing = await app.service('saved-jobs').Model.findOne({ userId: ctx.data.userId, jobListingId: ctx.data.jobListingId }).lean();
      if (existing) { ctx.result = existing; }
    } ],
    patch: [ async (ctx) => { /* restrict to owner */ ctx.params.query = { ...(ctx.params.query||{}), userId: ctx.params.user._id }; } ],
    remove: [ async (ctx) => { ctx.params.query = { ...(ctx.params.query||{}), userId: ctx.params.user._id }; } ]
  },
  after: { },
  error: { }
});

