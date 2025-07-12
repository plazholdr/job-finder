const { getDB } = require('../db');
const JobModel = require('../models/job.model');
const StorageUtils = require('../utils/storage');
const logger = require('../logger');

class JobsService {
  constructor(app) {
    this.app = app;
    this.jobModel = new JobModel(getDB());
  }

  async create(data, params) {
    try {
      // Get companyId from authenticated user
      const companyId = params.user?._id;
      if (!companyId) {
        throw new Error('Authentication required');
      }

      // Validate user role
      if (params.user?.role !== 'company') {
        throw new Error('Only companies can create job listings');
      }

      // Add companyId to job data
      const jobData = {
        ...data,
        companyId
      };

      const job = await this.jobModel.create(jobData);
      logger.info(`Job created: ${job._id} by company: ${companyId}`);
      return job;
    } catch (error) {
      logger.error('Job creation failed', { 
        companyId: params.user?._id, 
        error: error.message 
      });
      throw error;
    }
  }

  async find(params = {}) {
    try {
      const companyId = params.user?._id;
      const userRole = params.user?.role;

      let query = {};
      
      if (userRole === 'company') {
        // Companies can only see their own jobs
        query.companyId = companyId;
      } else if (userRole === 'admin') {
        // Admins can see all jobs
        // Apply any filters from params.query
        query = { ...params.query };
      } else if (userRole === 'student') {
        // Students can only see active jobs
        query.status = 'Active';
        query.isActive = true;
      } else {
        throw new Error('Access denied');
      }

      const { $limit = 50, $skip = 0, $sort = { createdAt: -1 }, status, search } = params.query || {};
      
      // Add status filter if provided
      if (status && userRole === 'company') {
        query.status = status;
      }

      const options = {
        limit: parseInt($limit),
        skip: parseInt($skip),
        sort: $sort,
      };

      let jobs;
      let total;

      if (search) {
        // Use text search
        jobs = await this.jobModel.search(search, {
          ...options,
          companyId: userRole === 'company' ? companyId : undefined,
          status: query.status
        });
        total = jobs.length; // Approximate count for search results
      } else {
        jobs = await this.jobModel.find(query, options);
        total = await this.jobModel.count(query);
      }

      return {
        total,
        limit: options.limit,
        skip: options.skip,
        data: jobs,
      };
    } catch (error) {
      logger.error('Jobs find failed', { 
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

      const job = await this.jobModel.findById(id);
      if (!job) {
        const error = new Error('Job not found');
        error.code = 404;
        throw error;
      }

      // Debug logging
      logger.info('Job access check', {
        jobId: id,
        userId,
        userRole,
        jobStatus: job.status,
        jobIsActive: job.isActive,
        jobCompanyId: job.companyId.toString()
      });

      // Access control
      if (userRole === 'company') {
        // Companies can only see their own jobs
        if (job.companyId.toString() !== userId.toString()) {
          throw new Error('Access denied');
        }
      } else if (userRole === 'student') {
        // Students can only see active jobs
        if (job.status !== 'Active' || !job.isActive) {
          logger.warn('Student trying to access non-active job', {
            jobId: id,
            userId,
            jobStatus: job.status,
            jobIsActive: job.isActive
          });
          throw new Error('Job not available');
        }
      }
      // Admins can see all jobs

      // Filter out invalid attachments (ones with empty publicUrl or missing filePath)
      if (job.attachments && job.attachments.length > 0) {
        job.attachments = job.attachments.filter(att =>
          att.filePath && att.filePath.trim() !== '' &&
          att.publicUrl !== '' // Keep null publicUrl (for signed URLs) but remove empty strings
        );
      }

      // For students, include company information
      if (userRole === 'student') {
        try {
          const company = await this.userModel.findById(job.companyId, {
            projection: {
              password: 0,
              resetPasswordToken: 0,
              resetPasswordExpires: 0
            }
          });

          if (company) {
            return {
              ...job,
              companyInfo: company.company,
              companyName: company.company?.name || `${company.firstName} ${company.lastName}`
            };
          }
        } catch (companyError) {
          logger.warn('Failed to fetch company info for job', {
            jobId: id,
            companyId: job.companyId,
            error: companyError.message
          });
        }
      }

      return job;
    } catch (error) {
      logger.error('Job get failed', { 
        id, 
        userId: params.user?._id, 
        error: error.message 
      });
      throw error;
    }
  }

  async patch(id, data, params) {
    try {
      const companyId = params.user?._id;
      const userRole = params.user?.role;

      // Only companies and admins can update jobs
      if (userRole !== 'company' && userRole !== 'admin') {
        throw new Error('Access denied');
      }

      // For companies, ensure they can only update their own jobs
      if (userRole === 'company') {
        const job = await this.jobModel.updateById(id, data, companyId);
        logger.info(`Job updated: ${id} by company: ${companyId}`);
        return job;
      } else {
        // Admin can update any job
        const job = await this.jobModel.findById(id);
        if (!job) {
          throw new Error('Job not found');
        }
        
        const updatedJob = await this.jobModel.updateById(id, data, job.companyId);
        logger.info(`Job updated: ${id} by admin: ${companyId}`);
        return updatedJob;
      }
    } catch (error) {
      logger.error('Job update failed', { 
        id, 
        userId: params.user?._id, 
        error: error.message 
      });
      throw error;
    }
  }

  async remove(id, params) {
    try {
      const companyId = params.user?._id;
      const userRole = params.user?.role;

      // Only companies and admins can delete jobs
      if (userRole !== 'company' && userRole !== 'admin') {
        throw new Error('Access denied');
      }

      let success;
      if (userRole === 'company') {
        success = await this.jobModel.deleteById(id, companyId);
      } else {
        // Admin can delete any job
        const job = await this.jobModel.findById(id);
        if (!job) {
          throw new Error('Job not found');
        }
        success = await this.jobModel.deleteById(id, job.companyId);
      }

      if (!success) {
        throw new Error('Job not found or cannot be deleted');
      }

      logger.info(`Job deleted: ${id} by user: ${companyId}`);
      return { id, deleted: true };
    } catch (error) {
      logger.error('Job deletion failed', { 
        id, 
        userId: params.user?._id, 
        error: error.message 
      });
      throw error;
    }
  }

  // Custom method for status transitions
  async updateStatus(jobId, newStatus, companyId, reason = '') {
    try {
      const job = await this.jobModel.updateStatus(jobId, newStatus, companyId, reason);
      logger.info(`Job status updated: ${jobId} to ${newStatus} by company: ${companyId}`);
      return job;
    } catch (error) {
      logger.error('Job status update failed', { 
        jobId, 
        newStatus, 
        companyId, 
        error: error.message 
      });
      throw error;
    }
  }

  // Custom method for file uploads
  async uploadAttachment(jobId, file, companyId) {
    try {
      // Validate file
      const validation = StorageUtils.validateFile(file);
      if (!validation.isValid) {
        throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
      }

      // Verify job ownership
      const job = await this.jobModel.findById(jobId);
      if (!job) {
        throw new Error('Job not found');
      }
      
      if (job.companyId.toString() !== companyId.toString()) {
        throw new Error('Access denied: You can only upload files to your own jobs');
      }

      // Upload file to GCS
      const uploadResult = await StorageUtils.uploadJobAttachment(
        file.buffer,
        file.originalname,
        companyId,
        jobId,
        file.mimetype
      );

      // Update job with attachment info
      const attachmentData = {
        fileName: uploadResult.fileName,
        originalName: uploadResult.originalName,
        filePath: uploadResult.filePath,
        publicUrl: uploadResult.publicUrl,
        size: uploadResult.size,
        mimeType: uploadResult.mimeType,
        uploadedAt: uploadResult.uploadedAt
      };

      // Add attachment to job
      await this.jobModel.updateById(jobId, {
        $push: { attachments: attachmentData }
      }, companyId);

      logger.info(`File uploaded for job: ${jobId} by company: ${companyId}`);
      return attachmentData;
    } catch (error) {
      logger.error('File upload failed', { 
        jobId, 
        companyId, 
        error: error.message 
      });
      throw error;
    }
  }

  // Custom method for getting attachment download URL
  async getAttachmentDownloadUrl(jobId, fileName, companyId) {
    try {
      const job = await this.jobModel.findById(jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      if (job.companyId.toString() !== companyId.toString()) {
        throw new Error('Access denied: You can only download files from your own jobs');
      }

      // Find attachment
      const attachment = job.attachments.find(att => att.fileName === fileName);
      if (!attachment) {
        throw new Error('Attachment not found');
      }

      // Generate signed download URL
      const downloadUrl = await StorageUtils.generateDownloadUrl(attachment.filePath, 60); // 1 hour expiry

      logger.info(`Download URL generated for job: ${jobId}, file: ${fileName} by company: ${companyId}`);
      return downloadUrl;
    } catch (error) {
      logger.error('Download URL generation failed', {
        jobId,
        fileName,
        companyId,
        error: error.message
      });
      throw error;
    }
  }

  // Custom method for removing attachments
  async removeAttachment(jobId, fileName, companyId) {
    try {
      const job = await this.jobModel.findById(jobId);
      if (!job) {
        throw new Error('Job not found');
      }
      
      if (job.companyId.toString() !== companyId.toString()) {
        throw new Error('Access denied');
      }

      // Find attachment
      const attachment = job.attachments.find(att => att.fileName === fileName);
      if (!attachment) {
        throw new Error('Attachment not found');
      }

      // Delete from GCS
      await StorageUtils.deleteFile(attachment.filePath);

      // Remove from job
      await this.jobModel.updateById(jobId, {
        $pull: { attachments: { fileName: fileName } }
      }, companyId);

      logger.info(`Attachment removed from job: ${jobId} by company: ${companyId}`);
      return { success: true };
    } catch (error) {
      logger.error('Attachment removal failed', { 
        jobId, 
        fileName, 
        companyId, 
        error: error.message 
      });
      throw error;
    }
  }
}

module.exports = JobsService;
