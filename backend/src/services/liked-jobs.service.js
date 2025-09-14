const LikedJobModel = require('../models/liked-job.model');
const JobModel = require('../models/job.model');
const { getDB } = require('../db');
const logger = require('../logger');

class LikedJobsService {
  constructor(app) {
    this.app = app;
    this.likedJobModel = new LikedJobModel(getDB());
    this.jobModel = new JobModel(getDB());
  }

  async create(data, params) {
    try {
      const userId = params.user?._id;
      if (!userId) {
        throw new Error('Authentication required');
      }

      const { jobId } = data;
      if (!jobId) {
        throw new Error('Job ID is required');
      }

      // Verify the job exists and is active
      const job = await this.jobModel.findById(jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      if (job.status !== 'Active') {
        throw new Error('Can only like active jobs');
      }

      // Create the like
      const likedJob = await this.likedJobModel.create(userId, jobId);
      
      logger.info(`Job liked: ${jobId} by user: ${userId}`);
      return {
        success: true,
        data: likedJob,
        message: 'Job liked successfully'
      };
    } catch (error) {
      logger.error('Failed to like job', {
        userId: params.user?._id,
        jobId: data.jobId,
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

      // The 'id' parameter is actually the jobId in this context
      const jobId = id;

      const result = await this.likedJobModel.remove(userId, jobId);

      logger.info(`Job unliked: ${jobId} by user: ${userId}`);
      return {
        success: true,
        message: 'Job unliked successfully'
      };
    } catch (error) {
      logger.error('Failed to unlike job', {
        userId: params.user?._id,
        jobId: id,
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
      const includeJobDetails = query.includeJobDetails === 'true';

      let likedJobs;
      
      if (includeJobDetails) {
        // Get liked jobs with full job details
        likedJobs = await this.likedJobModel.getLikedJobsWithDetails(userId, {
          limit,
          skip
        });
      } else {
        // Get just the liked job records
        likedJobs = await this.likedJobModel.findByUserId(userId, {
          limit,
          skip
        });
      }

      const total = await this.likedJobModel.countByUserId(userId);

      return {
        success: true,
        data: likedJobs,
        total,
        limit,
        skip,
        message: 'Liked jobs fetched successfully'
      };
    } catch (error) {
      logger.error('Failed to fetch liked jobs', {
        userId: params.user?._id,
        error: error.message
      });
      throw error;
    }
  }

  async get(id, params) {
    try {
      const userId = params.user?._id;
      if (!userId) {
        throw new Error('Authentication required');
      }

      // The 'id' parameter is the jobId we want to check
      const jobId = id;
      
      const isLiked = await this.likedJobModel.isLiked(userId, jobId);
      
      return {
        success: true,
        data: { isLiked },
        message: 'Job like status fetched successfully'
      };
    } catch (error) {
      logger.error('Failed to check job like status', {
        userId: params.user?._id,
        jobId: id,
        error: error.message
      });
      throw error;
    }
  }

  // Custom method to get liked job IDs only (for frontend filtering)
  async getLikedJobIds(userId) {
    try {
      const likedJobs = await this.likedJobModel.findByUserId(userId);
      return likedJobs.map(like => like.jobId.toString());
    } catch (error) {
      logger.error('Failed to get liked job IDs', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  // Custom method to toggle like status
  async toggle(jobId, params) {
    try {
      const userId = params.user?._id;
      if (!userId) {
        throw new Error('Authentication required');
      }

      const isLiked = await this.likedJobModel.isLiked(userId, jobId);
      
      if (isLiked) {
        // Unlike the job
        await this.likedJobModel.remove(userId, jobId);
        return {
          success: true,
          data: { isLiked: false },
          message: 'Job unliked successfully'
        };
      } else {
        // Like the job
        const likedJob = await this.likedJobModel.create(userId, jobId);
        return {
          success: true,
          data: { isLiked: true, likedJob },
          message: 'Job liked successfully'
        };
      }
    } catch (error) {
      logger.error('Failed to toggle job like', {
        userId: params.user?._id,
        jobId,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = LikedJobsService;
