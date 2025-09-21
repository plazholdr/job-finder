import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication';
import { LocalStrategy } from '@feathersjs/authentication-local';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export default (app) => {
  // Ensure strategies are allowed; prefer config but fall back to explicit
  const baseConfig = app.get('authentication') || {};
  const mergedConfig = {
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
  app.set('authentication', mergedConfig);

  // Use native Feathers AuthenticationService
  const authentication = new AuthenticationService(app);

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
      create: [ async (ctx) => {
        if (ctx.data) {
          if (ctx.data.username && !ctx.data.email) ctx.data.email = ctx.data.username;
          if (ctx.data.email) ctx.data.email = String(ctx.data.email).toLowerCase();

          // Debug: verify lookup and password compare internally to help diagnose login failures
          if (ctx.data.strategy === 'local' && ctx.data.email && ctx.data.password) {
            try {
              const users = app.service('users');
              const found = await users.find({ paginate: false, query: { email: ctx.data.email } });
              const entity = Array.isArray(found) ? found[0] : found?.data?.[0];
              const hasPwd = !!(entity && entity.password);
              const cmp = hasPwd ? await bcrypt.compare(ctx.data.password, entity.password) : false;
              console.log('Auth debug:', { email: ctx.data.email, found: !!entity, hasPwd, cmp });
            } catch (e) {
              console.log('Auth debug error:', e.message);
            }
          }
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
