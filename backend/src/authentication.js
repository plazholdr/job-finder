const { AuthenticationService, JWTStrategy } = require('@feathersjs/authentication');
const { LocalStrategy } = require('@feathersjs/authentication-local');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Local strategy that accepts either email or username in the same field
class EmailOrUsernameStrategy extends LocalStrategy {
  async findEntity(identifier, params) {
    const entityService = this.entityService;
    const id = String(identifier || '').toLowerCase();
    const query = {
      $or: [
        { email: id },
        { username: id }
      ],
      $limit: 1
    };
    const result = await entityService.find({ ...params, query });
    const list = result && Array.isArray(result.data) ? result.data : result;
    const entity = Array.isArray(list) ? list[0] : list;
    return entity;
  }
}

class CustomAuthenticationService extends AuthenticationService {
  async getPayload(authResult, params) {
    const { user } = authResult || {};

    // If we already have the user (local login path), avoid super.getPayload() which fetches via users.get
    if (user) {
      return {
        userId: user._id || user.id,
        email: user.email,
        role: user.role
      };
    }

    // Fallback to default behavior for other strategies
    return super.getPayload(authResult, params);
  }

  async createAccessToken(payload, optsOverride, secretOverride) {
    const jwtOptions = {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      issuer: 'job-finder',
      audience: 'job-finder-users',
      subject: payload.userId.toString()
    };

    const secret = secretOverride || process.env.JWT_SECRET;
    return jwt.sign(payload, secret, { ...jwtOptions, ...optsOverride });
  }

  async createRefreshToken(user) {
    const payload = {
      userId: user._id || user.id,
      tokenId: crypto.randomBytes(16).toString('hex'),
      type: 'refresh'
    };

    const jwtOptions = {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: 'job-finder',
      audience: 'job-finder-users',
      subject: user._id.toString()
    };

    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const refreshToken = jwt.sign(payload, secret, jwtOptions);

    // Store refresh token in Redis
    const redis = this.app.get('redis');
    const key = `refresh_token:${user._id}:${payload.tokenId}`;
    await redis.setex(key, 7 * 24 * 60 * 60, refreshToken); // 7 days

    return refreshToken;
  }

  async authenticate(authentication, params) {
    // Defer to Feathers strategies (LocalStrategy/JWTStrategy) and keep hooks intact
    return super.authenticate(authentication, params);
  }

  async create(data, params) {
    // Authenticate via registered strategy to obtain the authResult (includes user for 'local')
    const authResult = await super.authenticate(data, params);
    const payload = await this.getPayload(authResult, params);
    const accessToken = await this.createAccessToken(payload);

    const result = { accessToken, authentication: { strategy: data && data.strategy } };

    // Attach refresh token when a user is present (e.g., local strategy)
    if (authResult && authResult.user) {
      result.refreshToken = await this.createRefreshToken(authResult.user);
    }

    return result;
  }
}

module.exports = app => {
  const authentication = new CustomAuthenticationService(app);
  // Rely on configuration from config/default.json for strategies and options
  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new EmailOrUsernameStrategy());
  app.use('/authentication', authentication);

  // Allow clients to send either { email, password } or { username, password }
  app.service('authentication').hooks({
    before: {
      create: [ (ctx) => { if (ctx.data && ctx.data.username && !ctx.data.email) { ctx.data.email = ctx.data.username; } return ctx; } ]
    }
  });
};
