const { AuthenticationService, JWTStrategy } = require('@feathersjs/authentication');
const { LocalStrategy } = require('@feathersjs/authentication-local');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

module.exports = app => {
  // Use native Feathers AuthenticationService
  const authentication = new AuthenticationService(app);

  // Ensure strategies are allowed; prefer config but fall back to explicit
  const baseConfig = app.get('authentication') || {};
  authentication.configuration = {
    ...baseConfig,
    authStrategies: Array.isArray(baseConfig.authStrategies) && baseConfig.authStrategies.length
      ? baseConfig.authStrategies
      : ['jwt', 'local'],
    local: {
      usernameField: 'email',
      passwordField: 'password',
      ...(baseConfig.local || {})
    }
  };

  // Register stock strategies
  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new LocalStrategy());

  // Mount service
  app.use('/authentication', authentication);

  const service = app.service('authentication');

  // Helper to issue refresh token (native style, via hook; no custom service subclass)
  async function issueRefreshToken(user) {
    const payload = {
      userId: user._id || user.id,
      tokenId: crypto.randomBytes(16).toString('hex'),
      type: 'refresh'
    };
    const authCfg = app.get('authentication') || {};
    const secret = process.env.JWT_REFRESH_SECRET || authCfg.secret;
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    const refreshToken = jwt.sign(payload, secret, { expiresIn });

    const redis = app.get('redis');
    if (redis) {
      const key = `refresh_token:${payload.userId}:${payload.tokenId}`;
      await redis.setex(key, 7 * 24 * 60 * 60, refreshToken);
    }
    return refreshToken;
  }

  // Hooks
  service.hooks({
    before: {
      create: [ (ctx) => {
        if (ctx.data) {
          if (ctx.data.username && !ctx.data.email) ctx.data.email = ctx.data.username;
          if (ctx.data.email) ctx.data.email = String(ctx.data.email).toLowerCase();
        }
        return ctx;
      } ]
    },
    after: {
      create: [ async (ctx) => {
        // Attach user and a refresh token when logging in with local
        if (ctx.params && ctx.params.user) {
          ctx.result.user = ctx.params.user;
          ctx.result.refreshToken = await issueRefreshToken(ctx.params.user);
        }
        return ctx;
      } ]
    }
  });
};
