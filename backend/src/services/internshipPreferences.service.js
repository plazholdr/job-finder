const { getDB } = require('../db');
const InternshipPreferencesModel = require('../models/internshipPreferences.model');
const logger = require('../logger');

class InternshipPreferencesService {
  constructor(app) {
    this.app = app;
    this.preferencesModel = new InternshipPreferencesModel(getDB());
  }

  async create(data, params) {
    try {
      // Get userId from authenticated user
      const userId = params.user?._id || params.userId;
      if (!userId) {
        throw new Error('Authentication required');
      }

      // Validate user role
      if (params.user?.role !== 'student') {
        throw new Error('Only students can create internship preferences');
      }

      const preferencesData = {
        userId,
        preferences: data
      };

      const preferences = await this.preferencesModel.create(preferencesData);
      logger.info(`Internship preferences created for user: ${userId}`);
      return preferences;
    } catch (error) {
      logger.error('Internship preferences creation failed', { 
        userId: params.user?._id, 
        error: error.message 
      });
      throw error;
    }
  }

  async find(params = {}) {
    try {
      // Only allow users to see their own preferences or admins to see all
      const userId = params.user?._id;
      const userRole = params.user?.role;

      let query = {};
      
      if (userRole === 'student') {
        // Students can only see their own preferences
        query.userId = userId;
      } else if (userRole === 'admin') {
        // Admins can see all preferences
        // Apply any filters from params.query
        query = { ...params.query };
      } else {
        throw new Error('Access denied');
      }

      const { $limit = 50, $skip = 0, $sort = { createdAt: -1 } } = params.query || {};
      
      const options = {
        limit: parseInt($limit),
        skip: parseInt($skip),
        sort: $sort,
      };

      const preferences = await this.preferencesModel.find(query, options);
      const total = await this.preferencesModel.count(query);

      return {
        total,
        limit: options.limit,
        skip: options.skip,
        data: preferences,
      };
    } catch (error) {
      logger.error('Internship preferences find failed', { 
        userId: params.user?._id, 
        error: error.message 
      });
      throw error;
    }
  }

  async get(id, params) {
    try {
      const userId = params.user?._id;
      const userRole = params.user?.role;

      // For students, id should be 'me' to get their own preferences
      // For admins, id can be any userId
      let targetUserId;
      
      if (id === 'me' || (userRole === 'student' && id === userId.toString())) {
        targetUserId = userId;
      } else if (userRole === 'admin') {
        targetUserId = id;
      } else {
        throw new Error('Access denied');
      }

      const preferences = await this.preferencesModel.findByUserId(targetUserId);
      if (!preferences) {
        const error = new Error('Internship preferences not found');
        error.code = 404;
        throw error;
      }

      return preferences;
    } catch (error) {
      logger.error('Internship preferences get failed', { 
        id, 
        userId: params.user?._id, 
        error: error.message 
      });
      throw error;
    }
  }

  async patch(id, data, params) {
    try {
      const userId = params.user?._id;
      const userRole = params.user?.role;

      // Validate access
      let targetUserId;
      
      if (id === 'me' || (userRole === 'student' && id === userId.toString())) {
        targetUserId = userId;
      } else if (userRole === 'admin') {
        targetUserId = id;
      } else {
        throw new Error('Access denied');
      }

      // Only allow students to update their own preferences
      if (userRole === 'student' && targetUserId.toString() !== userId.toString()) {
        throw new Error('Students can only update their own preferences');
      }

      const updateData = {
        preferences: data
      };

      const preferences = await this.preferencesModel.updateByUserId(targetUserId, updateData);
      logger.info(`Internship preferences updated for user: ${targetUserId}`);
      return preferences;
    } catch (error) {
      logger.error('Internship preferences update failed', { 
        id, 
        userId: params.user?._id, 
        error: error.message 
      });
      throw error;
    }
  }

  async remove(id, params) {
    try {
      const userId = params.user?._id;
      const userRole = params.user?.role;

      // Validate access
      let targetUserId;
      
      if (id === 'me' || (userRole === 'student' && id === userId.toString())) {
        targetUserId = userId;
      } else if (userRole === 'admin') {
        targetUserId = id;
      } else {
        throw new Error('Access denied');
      }

      // Only allow students to delete their own preferences
      if (userRole === 'student' && targetUserId.toString() !== userId.toString()) {
        throw new Error('Students can only delete their own preferences');
      }

      const success = await this.preferencesModel.deleteByUserId(targetUserId);
      if (!success) {
        throw new Error('Internship preferences not found');
      }

      logger.info(`Internship preferences deleted for user: ${targetUserId}`);
      return { id: targetUserId, deleted: true };
    } catch (error) {
      logger.error('Internship preferences deletion failed', { 
        id, 
        userId: params.user?._id, 
        error: error.message 
      });
      throw error;
    }
  }

  // Helper method to get current user's preferences
  async getCurrentUserPreferences(userId) {
    try {
      const preferences = await this.preferencesModel.findByUserId(userId);
      return preferences;
    } catch (error) {
      logger.error('Get current user preferences failed', { userId, error: error.message });
      throw error;
    }
  }

  // Helper method to update current user's preferences
  async updateCurrentUserPreferences(userId, data) {
    try {
      const updateData = {
        preferences: data
      };

      const preferences = await this.preferencesModel.updateByUserId(userId, updateData);
      logger.info(`Current user preferences updated: ${userId}`);
      return preferences;
    } catch (error) {
      logger.error('Current user preferences update failed', { userId, error: error.message });
      throw error;
    }
  }
}

module.exports = InternshipPreferencesService;
