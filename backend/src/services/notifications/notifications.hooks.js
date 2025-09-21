import { hooks as authHooks } from '@feathersjs/authentication';

const { authenticate } = authHooks;

const authIfExternal = (ctx, next) => {
  if (ctx.params.provider) {
    return authenticate('jwt')(ctx, next);
  }
};

export default (app) => ({
  before: {
    all: [],
    find: [ authIfExternal, async (ctx) => {
      // Only recipient sees theirs unless admin
      if (ctx.params.user?.role === 'admin') return;
      if (!ctx.params.user) throw Object.assign(new Error('Not authenticated'), { code: 401 });
      ctx.params.query = ctx.params.query || {};
      ctx.params.query.recipientUserId = ctx.params.user._id;
    } ],
    get: [ authIfExternal ],
    create: [ /* allow internal or external create; external is authenticated by default channels */ ],
    patch: [ authIfExternal, async (ctx) => {
      // Only recipient can mark read
      const current = await app.service('notifications').get(ctx.id, ctx.params);
      if (ctx.params.user.role !== 'admin' && current.recipientUserId.toString() !== ctx.params.user._id.toString()) {
        throw Object.assign(new Error('Not authorized'), { code: 403 });
      }
    } ],
    remove: [ authIfExternal ]
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

