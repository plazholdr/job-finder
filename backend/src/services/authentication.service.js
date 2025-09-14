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
    const { email, username, password, strategy = 'local' } = data;

    if (strategy !== 'local') {
      throw new Error('Only local authentication strategy is supported');
    }

    if ((!email && !username) || !password) {
      throw new Error('Email/username and password are required');
    }

    try {
      // Determine identifier and find user by email or username
      const identifier = (email || username || '').trim();
      const looksLikeEmail = /.+@.+\..+/.test(identifier);
      const user = looksLikeEmail
        ? await this.userModel.findByEmail(identifier)
        : await this.userModel.collection.findOne({ username: identifier.toLowerCase() });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Consistency guard: if company is verified but legacy approval fields not synced, fix them
      if (user.role === 'company') {
        const company = user.company || {};
        const isVerified = (company.verificationStatus === 'verified') || (company.verificationStatusCode === 1);
        const isSuspended = (company.verificationStatus === 'suspended') || (company.verificationStatusCode === 3);
        if (isVerified && !isSuspended) {
          let needsSync = false;
          const update = { updatedAt: new Date() };
          if (company.approvalStatusCode !== 1 || company.approvalStatus !== 'approved') {
            update['company.approvalStatus'] = 'approved';
            update['company.approvalStatusCode'] = 1;
            needsSync = true;
            // update local object too
            user.company = { ...(user.company || {}), approvalStatus: 'approved', approvalStatusCode: 1 };
          }
          if (user.isActive !== true) {
            update.isActive = true;
            needsSync = true;
            user.isActive = true;
          }
          if (needsSync) {
            try {
              await this.userModel.collection.updateOne(
                { _id: this.userModel.toObjectId(user._id) },
                { $set: update }
              );
            } catch (e) {
              // non-fatal; proceed
            }
          }
        }
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated. Please contact support.');
      }

      // Block login for rejected company accounts
      if (user.role === 'company' && (user.company?.verificationStatusCode === 2 || user.company?.verificationStatus === 'rejected')) {
        throw new Error('Your company registration was rejected. Please check the email we sent for the reason and appeal instructions.');
      }

      // Validate password
      const isValidPassword = await this.userModel.validatePassword(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const payload = {
        // Always store string form to avoid ObjectId serialization issues
        userId: user._id?.toString(),
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

      console.log('Auth result:', authResult);
      console.log('User ID from auth result:', authResult.userId);

      // Add user info to request. Ensure userId is a string to avoid ObjectId errors downstream
      req.user = authResult.user;
      req.userId = (authResult.user && authResult.user._id && authResult.user._id.toString) ? authResult.user._id.toString() : (authResult.userId && authResult.userId.toString ? authResult.userId.toString() : authResult.userId);

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
        // Normalize to string
        req.userId = (authResult.user && authResult.user._id && authResult.user._id.toString) ? authResult.user._id.toString() : (authResult.userId && authResult.userId.toString ? authResult.userId.toString() : authResult.userId);
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
