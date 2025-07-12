const jwt = require('jsonwebtoken');
const { getDB } = require('../db');
const UserModel = require('../models/user.model');
const logger = require('../logger');

class AuthenticationService {
  constructor(app) {
    this.app = app;
    this.config = app.get('config');
    this.userModel = new UserModel(getDB());
  }

  async create(data) {
    const { email, password, strategy = 'local' } = data;

    if (strategy !== 'local') {
      throw new Error('Only local authentication strategy is supported');
    }

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      // Find user by email
      const user = await this.userModel.findByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated. Please contact support.');
      }

      // Validate password
      const isValidPassword = await this.userModel.validatePassword(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const payload = {
        userId: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      const token = jwt.sign(payload, this.config.auth.jwt.secret, {
        expiresIn: this.config.auth.jwt.expiresIn,
      });

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;

      logger.info(`User logged in: ${user.email}`);

      return {
        accessToken: token,
        user: userWithoutPassword,
      };
    } catch (error) {
      logger.error('Authentication failed', { email, error: error.message });
      throw error;
    }
  }

  async remove(id) {
    // For logout, we could add token blacklisting here if needed
    // For now, we'll just return success since JWT is stateless
    logger.info(`User logged out: ${id}`);
    return { message: 'Logged out successfully' };
  }

  // Verify JWT token middleware
  async authenticate(token) {
    try {
      if (!token) {
        throw new Error('No token provided');
      }

      // Remove 'Bearer ' prefix if present
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

      // Verify token
      const decoded = jwt.verify(cleanToken, this.config.auth.jwt.secret);

      // Get fresh user data
      const user = await this.userModel.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      return {
        ...decoded,
        user,
      };
    } catch (error) {
      logger.error('Token verification failed', { error: error.message });
      throw new Error('Invalid or expired token');
    }
  }
}

// Authentication middleware
const authenticateToken = (app) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Access token required' });
      }

      const authService = new AuthenticationService(app);
      const authResult = await authService.authenticate(authHeader);

      // Add user info to request and service context
      req.user = authResult.user;
      req.userId = authResult.userId;

      // Store user info for service context
      req.serviceContext = {
        user: authResult.user,
        userId: authResult.userId
      };

      next();
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  };
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = (app) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const authService = new AuthenticationService(app);
        const authResult = await authService.authenticate(authHeader);
        req.user = authResult.user;
        req.userId = authResult.userId;
      }
      next();
    } catch (error) {
      // Continue without authentication
      next();
    }
  };
};

module.exports = {
  AuthenticationService,
  authenticateToken,
  optionalAuth,
};
