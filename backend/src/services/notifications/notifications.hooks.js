const { authenticate } = require('@feathersjs/authentication').hooks;

module.exports = (app) => ({
  before: {
    all: [ authenticate('jwt') ],
    find: [ async (ctx) => {
      // Only recipient sees theirs unless admin
      if (ctx.params.user.role === 'admin') return;
      ctx.params.query = ctx.params.query || {};
      ctx.params.query.recipientUserId = ctx.params.user._id;
    } ],
    get: [ authenticate('jwt') ],
    create: [ /* usually internal from hooks, still authenticated */ ],
    patch: [ async (ctx) => {
      // Only recipient can mark read
      const current = await app.service('notifications').get(ctx.id);
      if (ctx.params.user.role !== 'admin' && current.recipientUserId.toString() !== ctx.params.user._id.toString()) {
        throw new Error('Not authorized');
      }
    } ],
    remove: [ authenticate('jwt') ]
  },
  after: {
    all: [],
    create: [ async (ctx) => {
      // Publish to user-specific channel if available
      try {
        const userId = ctx.result.recipientUserId.toString();
        app.channel(`users/${userId}`).send({
          type: 'notification',
          payload: ctx.result
        });
      } catch (_) {}
    } ]
  },
  error: { }
});

