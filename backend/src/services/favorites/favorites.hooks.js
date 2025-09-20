const { authenticate } = require('@feathersjs/authentication').hooks;

module.exports = (app) => ({
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

