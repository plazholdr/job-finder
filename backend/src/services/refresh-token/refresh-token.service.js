import jwt from 'jsonwebtoken';
import { BadRequest, NotAuthenticated } from '@feathersjs/errors';
import crypto from 'crypto';

class RefreshTokenService {
  constructor(options, app) {
    this.options = options || {};
    this.app = app;
  }

  signAccessToken(user) {
    const authCfg = this.app.get('authentication') || {};
    const secret = process.env.JWT_SECRET || authCfg.secret;
    const jwtOptions = authCfg.jwtOptions || { expiresIn: '1d' };
    const payload = { userId: user._id, email: user.email, role: user.role };
    return jwt.sign(payload, secret, jwtOptions);
  }

  async signRefreshToken(user) {
    const authCfg = this.app.get('authentication') || {};
    const secret = process.env.JWT_REFRESH_SECRET || authCfg.secret;
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    const payload = {
      userId: user._id,
      tokenId: crypto.randomBytes(16).toString('hex'),
      type: 'refresh'
    };

    const token = jwt.sign(payload, secret, { expiresIn });

    const redis = this.app.get('redis');
    if (redis) {
      const key = `refresh_token:${user._id}:${payload.tokenId}`;
      await redis.setex(key, 7 * 24 * 60 * 60, token);
    }
    return token;
  }

  async create(data) {
    const { refreshToken } = data;
    if (!refreshToken) {
      throw new BadRequest('Refresh token is required');
    }

    try {
      const authCfg = this.app.get('authentication') || {};
      const secret = process.env.JWT_REFRESH_SECRET || authCfg.secret;
      const decoded = jwt.verify(refreshToken, secret);
      if (decoded.type !== 'refresh') {
        throw new NotAuthenticated('Invalid token type');
      }

      const redis = this.app.get('redis');
      const key = `refresh_token:${decoded.userId}:${decoded.tokenId}`;
      const storedToken = redis ? await redis.get(key) : null;
      if (!storedToken || storedToken !== refreshToken) {
        throw new NotAuthenticated('Invalid or expired refresh token');
      }

      const user = await this.app.service('users').get(decoded.userId);
      if (!user || !user.isActive) {
        throw new NotAuthenticated('User not found or inactive');
      }

      const accessToken = this.signAccessToken(user);
      const newRefreshToken = await this.signRefreshToken(user);

      if (redis) await redis.del(key);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: typeof user.toJSON === 'function' ? user.toJSON() : user
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new NotAuthenticated('Invalid or expired refresh token');
      }
      throw error;
    }
  }
}

export default function (app) {
  const options = { paginate: app.get('paginate') };
  app.use('/refresh-token', new RefreshTokenService(options, app));
  const service = app.service('refresh-token');

  service.hooks({
    before: { all: [], find: [], get: [], create: [], update: [], patch: [], remove: [] },
    after: { all: [], find: [], get: [], create: [], update: [], patch: [], remove: [] },
    error: { all: [], find: [], get: [], create: [], update: [], patch: [], remove: [] }
  });
};
