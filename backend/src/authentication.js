const { AuthenticationService, JWTStrategy } = require('@feathersjs/authentication');
const { LocalStrategy } = require('@feathersjs/authentication-local');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class CustomAuthenticationService extends AuthenticationService {
  async getPayload(authResult, params) {
    const payload = await super.getPayload(authResult, params);
    const { user } = authResult;

    return {
      ...payload,
      userId: user._id || user.id,
      email: user.email,
      role: user.role
    };
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
    const authResult = await super.authenticate(authentication, params);

    if (authResult.user) {
      // Create refresh token
      const refreshToken = await this.createRefreshToken(authResult.user);

      return {
        ...authResult,
        refreshToken
      };
    }

    return authResult;
  }
}

module.exports = app => {
  const authentication = new CustomAuthenticationService(app);

  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new LocalStrategy());

  app.use('/authentication', authentication);
};
