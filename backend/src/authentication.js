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
      try { await redis.setex(key, 7 * 24 * 60 * 60, refreshToken); } catch (_) {}
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
          // if (ctx.data.strategy === 'local' && ctx.data.email && ctx.data.password) {
          //   try {
          //     const users = app.service('users');
          //     const found = await users.find({ paginate: false, query: { email: ctx.data.email } });
          //     const entity = Array.isArray(found) ? found[0] : found?.data?.[0];
          //     const hasPwd = !!(entity && entity.password);
          //     const cmp = hasPwd ? await bcrypt.compare(ctx.data.password, entity.password) : false;
          //     console.log('Auth debug:', { email: ctx.data.email, found: !!entity, hasPwd, cmp });
          //   } catch (e) {
          //     console.log('Auth debug error:', e.message);
          //   }
          // }
        }
        return ctx;
      } ]
    },
    after: {
      create: [ async (ctx) => {
        // Attach user and tokens when logging in with local
        let user = ctx.params && ctx.params.user;

        // Fallback: if user not present in params (e.g., some envs), lookup by email provided
        if (!user && ctx.data && ctx.data.email) {
          try {
            const users = app.service('users');
            const found = await users.find({ paginate: false, query: { email: String(ctx.data.email).toLowerCase() } });
            user = Array.isArray(found) ? found[0] : found?.data?.[0];
          } catch (_) {}
        }

        if (user) {
          // Check if company user is approved before allowing login
          if (user.role === 'company') {
            try {
              const { isCompanyVerified } = await import('./utils/access.js');
              const { ok, company } = await isCompanyVerified(app, user._id);

              if (!company) {
                // No company profile yet - allow login to complete setup
                console.log('Company user has no company profile yet, allowing login for setup');
              } else if (!ok) {
                // Company exists but not approved - deny login
                const err = new Error('Your company is pending approval. Please wait for admin approval before signing in.');
                err.code = 403;
                err.className = 'forbidden';
                err.name = 'Forbidden';
                throw err;
              }
            } catch (importErr) {
              if (importErr.name === 'COMPANY_PENDING_APPROVAL') {
                throw importErr;
              }
              console.error('Error checking company verification:', importErr);
            }
          }

          // Ensure accessToken exists (fallback for environments where core didn't attach it)
          if (!ctx.result.accessToken) {
            try {
              const authCfg = app.get('authentication') || {};
              const secret = process.env.JWT_SECRET || authCfg.secret;
              const expiresIn = (authCfg.jwtOptions && authCfg.jwtOptions.expiresIn) || '1d';
              const payload = { sub: String(user._id || user.id), userId: String(user._id || user.id), strategy: 'jwt' };
              ctx.result.accessToken = jwt.sign(payload, secret, { expiresIn });
            } catch (_) {}
          }
          ctx.result.user = user;
          ctx.result.refreshToken = await issueRefreshToken(user);
        }
        return ctx;
      } ]
    }
  });
};
