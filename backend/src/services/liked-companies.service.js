const LikedCompanyModel = require('../models/liked-company.model');
const UserModel = require('../models/user.model');
const { getDB } = require('../db');
const logger = require('../logger');

class LikedCompaniesService {
  constructor(app) {
    this.app = app;
    this.likedCompanyModel = new LikedCompanyModel(getDB());
    this.userModel = new UserModel(getDB());
  }

  async create(data, params) {
    try {
      const userId = params.user?._id;
      if (!userId) {
        throw new Error('Authentication required');
      }

      const { companyId } = data;
      if (!companyId) {
        throw new Error('Company ID is required');
      }

      // Verify the company exists and has role 'company' when ID is a real ObjectId
      const is24Hex = typeof companyId === 'string' && /^[a-fA-F0-9]{24}$/.test(companyId);
      if (is24Hex) {
        const company = await this.userModel.findById(companyId);
        if (!company) {
          throw new Error('Company not found');
        }
        if (company.role !== 'company') {
          throw new Error('Can only like companies');
        }
      }

      // Create the like (supports ObjectId or plain string IDs for dummy data)
      const likedCompany = await this.likedCompanyModel.create(userId, companyId);
      
      logger.info(`Company liked: ${companyId} by user: ${userId}`);
      return {
        success: true,
        data: likedCompany,
        message: 'Company liked successfully'
      };
    } catch (error) {
      logger.error('Failed to like company', {
        userId: params.user?._id,
        companyId: data.companyId,
        error: error.message
      });
      throw error;
    }
  }

  async remove(id, params) {
    try {
      const userId = params.user?._id;
      if (!userId) {
        throw new Error('Authentication required');
      }

      // The 'id' parameter is actually the companyId in this context
      const companyId = id;

      const result = await this.likedCompanyModel.remove(userId, companyId);

      logger.info(`Company unliked: ${companyId} by user: ${userId}`);
      return {
        success: true,
        message: 'Company unliked successfully'
      };
    } catch (error) {
      logger.error('Failed to unlike company', {
        userId: params.user?._id,
        companyId: id,
        error: error.message
      });
      throw error;
    }
  }

  async find(params) {
    try {
      const userId = params.user?._id;
      if (!userId) {
        throw new Error('Authentication required');
      }

      const { query = {} } = params;
      const limit = parseInt(query.$limit || query.limit) || 50;
      const skip = parseInt(query.$skip || query.skip) || 0;
      const includeCompanyDetails = query.includeCompanyDetails === 'true';

      let likedCompanies;
      
      if (includeCompanyDetails) {
        // Get liked companies with full company details
        likedCompanies = await this.likedCompanyModel.getLikedCompaniesWithDetails(userId, {
          limit,
          skip
        });
      } else {
        // Get just the liked company records
        likedCompanies = await this.likedCompanyModel.findByUserId(userId, {
          limit,
          skip
        });
      }

      const total = await this.likedCompanyModel.count(userId);

      logger.info(`Liked companies fetched for user: ${userId}`, {
        count: likedCompanies.length,
        total,
        includeCompanyDetails
      });

      return {
        success: true,
        data: likedCompanies,
        total,
        limit,
        skip,
        message: 'Liked companies fetched successfully'
      };
    } catch (error) {
      logger.error('Failed to fetch liked companies', {
        userId: params.user?._id,
        error: error.message
      });
      throw error;
    }
  }

  async get(companyId, params) {
    try {
      const userId = params.user?._id;
      if (!userId) {
        throw new Error('Authentication required');
      }

      const isLiked = await this.likedCompanyModel.isLiked(userId, companyId);

      return {
        success: true,
        data: { isLiked },
        message: 'Company like status fetched successfully'
      };
    } catch (error) {
      logger.error('Failed to get company like status', {
        userId: params.user?._id,
        companyId,
        error: error.message
      });
      throw error;
    }
  }

  // Custom method to toggle like status
  async toggle(companyId, params) {
    try {
      const userId = params.user?._id;
      if (!userId) {
        throw new Error('Authentication required');
      }

      const isLiked = await this.likedCompanyModel.isLiked(userId, companyId);
      
      if (isLiked) {
        // Unlike the company
        await this.likedCompanyModel.remove(userId, companyId);
        return {
          success: true,
          data: { isLiked: false },
          message: 'Company unliked successfully'
        };
      } else {
        // Like the company
        const likedCompany = await this.likedCompanyModel.create(userId, companyId);
        return {
          success: true,
          data: { isLiked: true, likedCompany },
          message: 'Company liked successfully'
        };
      }
    } catch (error) {
      logger.error('Failed to toggle company like', {
        userId: params.user?._id,
        companyId,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = LikedCompaniesService;
