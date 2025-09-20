const jwt = require('jsonwebtoken');
const { BadRequest, NotAuthenticated } = require('@feathersjs/errors');

class RefreshTokenService {
  constructor(options, app) {
    this.options = options || {};
    this.app = app;
  }

  async create(data, params) {
    const { refreshToken } = data;
    
    if (!refreshToken) {
      throw new BadRequest('Refresh token is required');
    }

    try {
      // Verify refresh token
      const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
      const decoded = jwt.verify(refreshToken, secret);
      
      if (decoded.type !== 'refresh') {
        throw new NotAuthenticated('Invalid token type');
      }

      // Check if refresh token exists in Redis
      const redis = this.app.get('redis');
      const key = `refresh_token:${decoded.userId}:${decoded.tokenId}`;
      const storedToken = await redis.get(key);
      
      if (!storedToken || storedToken !== refreshToken) {
        throw new NotAuthenticated('Invalid or expired refresh token');
      }

      // Get user
      const userService = this.app.service('users');
      const user = await userService.get(decoded.userId);
      
      if (!user || !user.isActive) {
        throw new NotAuthenticated('User not found or inactive');
      }

      // Create new access token
      const authService = this.app.service('authentication');
      const payload = {
        userId: user._id,
        email: user.email,
        role: user.role
      };
      
      const accessToken = await authService.createAccessToken(payload);
      
      // Optionally create new refresh token (refresh token rotation)
      const newRefreshToken = await authService.createRefreshToken(user);
      
      // Remove old refresh token
      await redis.del(key);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: user.toJSON()
      };
      
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new NotAuthenticated('Invalid or expired refresh token');
      }
      throw error;
    }
  }
}

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/refresh-token', new RefreshTokenService(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('refresh-token');

  service.hooks({
    before: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    },
    after: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    },
    error: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    }
  });
};
