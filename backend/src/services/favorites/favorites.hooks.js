import { hooks as authHooks } from '@feathersjs/authentication';

const { authenticate } = authHooks;

export default (app) => ({
  before: {
    all: [ authenticate('jwt') ],
    find: [ async (ctx) => {
      // user sees their own favorites
      ctx.params.query = { ...(ctx.params.query || {}), userId: ctx.params.user._id };
    } ],
    create: [ async (ctx) => { ctx.data.userId = ctx.params.user._id; } ]
  },
  after: { },
  error: { }
});

