const { getDB } = require('../db');
const UserModel = require('../models/user.model');
const logger = require('../logger');

class UsersService {
  constructor(app) {
    this.app = app;
    this.userModel = new UserModel(getDB());
  }

  async create(data) {
    try {
      const user = await this.userModel.create(data);
      logger.info(`New user created: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('User creation failed', { error: error.message, data: { ...data, password: '[REDACTED]' } });
      throw error;
    }
  }

  async find(params = {}) {
    try {
      const { query = {}, $limit = 50, $skip = 0, $sort = { createdAt: -1 } } = params;
      
      // Remove sensitive query parameters
      const { password, ...safeQuery } = query;
      
      const options = {
        limit: parseInt($limit),
        skip: parseInt($skip),
        sort: $sort,
      };

      const users = await this.userModel.find(safeQuery, options);
      const total = await this.userModel.count(safeQuery);

      return {
        total,
        limit: options.limit,
        skip: options.skip,
        data: users,
      };
    } catch (error) {
      logger.error('Users find failed', { error: error.message });
      throw error;
    }
  }

  async get(id) {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      logger.error('User get failed', { id, error: error.message });
      throw error;
    }
  }

  async patch(id, data) {
    try {
      const user = await this.userModel.updateById(id, data);
      logger.info(`User updated: ${id}`);
      return user;
    } catch (error) {
      logger.error('User update failed', { id, error: error.message });
      throw error;
    }
  }

  async remove(id) {
    try {
      const success = await this.userModel.deleteById(id);
      if (!success) {
        throw new Error('User not found');
      }
      logger.info(`User deleted: ${id}`);
      return { id, deleted: true };
    } catch (error) {
      logger.error('User deletion failed', { id, error: error.message });
      throw error;
    }
  }

  // Get current user profile
  async getCurrentUser(userId) {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      logger.error('Get current user failed', { userId, error: error.message });
      throw error;
    }
  }

  // Update current user profile
  async updateCurrentUser(userId, data) {
    try {
      // Prevent updating sensitive fields
      const { role, isActive, emailVerified, ...safeData } = data;
      
      const user = await this.userModel.updateById(userId, safeData);
      logger.info(`Current user updated: ${userId}`);
      return user;
    } catch (error) {
      logger.error('Current user update failed', { userId, error: error.message });
      throw error;
    }
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Get user with password
      const user = await this.userModel.findByEmail((await this.userModel.findById(userId)).email);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await this.userModel.validatePassword(currentPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      await this.userModel.updatePassword(userId, newPassword);
      logger.info(`Password changed for user: ${userId}`);
      
      return { message: 'Password updated successfully' };
    } catch (error) {
      logger.error('Password change failed', { userId, error: error.message });
      throw error;
    }
  }
}

module.exports = UsersService;
