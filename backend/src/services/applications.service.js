const { getDB } = require('../db');
const { ObjectId } = require('mongodb');

const ApplicationModel = require('../models/application.model');
const JobModel = require('../models/job.model');
const UserModel = require('../models/user.model');
const logger = require('../logger');
const { APPLICATION_STATUS, normalizeApplicationStatus } = require('../constants/constants');


class ApplicationsService {
  constructor(app) {
    this.app = app;
    this.applicationModel = new ApplicationModel(getDB());
    this.jobModel = new JobModel(getDB());
    this.userModel = new UserModel(getDB());
  }

  async create(data, params) {
    try {
      const userId = params.user?._id;
      const userRole = params.user?.role;

      if (!userId) {
        throw new Error('Authentication required');
      }

      // Only students can create applications
      if (userRole !== 'student') {
        throw new Error('Only students can apply for jobs');
      }

      const { jobId, ...applicationData } = data;

      if (!jobId) {
        throw new Error('Job ID is required');
      }

      // Verify the job exists and is active
      const job = await this.jobModel.findById(jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      if (job.status !== 'Active' || !job.isActive) {
        throw new Error('This job is no longer accepting applications');
      }

      // Create the application
      const application = await this.applicationModel.create({
        userId,
        jobId,
        companyId: job.companyId,
        ...applicationData,
        // Ensure offer fields are always included (initially null for student applications)
        offerValidity: null,
        offerLetterUrl: null
      });

      // Update job application count
      const currentApplications = job.applications || 0;
      await this.jobModel.updateById(jobId, {
        applications: currentApplications + 1
      }, job.companyId);

      logger.info(`Application created: ${application._id} by user: ${userId} for job: ${jobId}`);
      return application;
    } catch (error) {
      logger.error('Application creation failed', {
        userId: params.user?._id,
        jobId: data.jobId,
        error: error.message
      });
      throw error;
    }
  }

  async find(params = {}) {
    try {
      const userId = params.user?._id;
      const userRole = params.user?.role;



      if (!userId) {
        throw new Error('Authentication required');
      }

      const { $limit = 50, $skip = 0, $sort = { createdAt: -1 }, status, jobId, companyId } = params.query || {};

      const normStatus = (status !== undefined && status !== null && status !== '')
        ? normalizeApplicationStatus(status).code
        : undefined;

      let query = {};
      let options = {
        limit: parseInt($limit),
        skip: parseInt($skip),
        sort: $sort,
      };

      if (userRole === 'student') {
        // Students can only see their own applications
        query.userId = userId;
      } else if (userRole === 'company') {
        // Companies can only see applications for their jobs
        query.companyId = userId;
      } else if (userRole === 'admin') {
        // Admins can see all applications
        if (companyId) query.companyId = companyId;
      } else {
        throw new Error('Access denied');
      }

      // Add additional filters
      if (normStatus !== undefined) query.status = normStatus;
      if (jobId) query.jobId = jobId;

      let applications;
      let total;

      if (userRole === 'student') {
        applications = await this.applicationModel.findByUserId(userId, { ...options, status: normStatus });
      } else if (userRole === 'company') {
        applications = await this.applicationModel.findByCompanyId(userId, { ...options, status: normStatus });
      } else {
        applications = await this.applicationModel.find(query, options);
      }

      total = await this.applicationModel.count(query);

      // Lazy auto-expire for any pending_acceptance offers that passed validity
      const now = new Date();
      const refreshed = await Promise.all(applications.map(async (app) => {
        try {
          if (app.status === APPLICATION_STATUS.PENDING_ACCEPTANCE && app.offerValidity && new Date(app.offerValidity) < now) {
            await this.applicationModel.updateStatus(app._id, APPLICATION_STATUS.REJECTED, userId, 'Offer expired');
            return await this.applicationModel.findById(app._id);
          }
        } catch (e) { /* ignore */ }
        return app;
      }));
      const applicationsRef = refreshed;

      // Enrich applications with job and user information
      const enrichedApplications = await Promise.all(
        applicationsRef.map(async (application) => {
          try {
            // Get job information
            const job = await this.jobModel.findById(application.jobId);

            // Get user information (for company view)
            let userInfo = null;
            if (userRole === 'company' || userRole === 'admin') {
              userInfo = await this.userModel.findById(application.userId, {
                projection: {
                  password: 0,
                  resetPasswordToken: 0,
                  resetPasswordExpires: 0
                }
              });
            }

            // Get company information (for student view)
            let companyInfo = null;
            if (userRole === 'student' || userRole === 'admin') {
              companyInfo = await this.userModel.findById(application.companyId, {
                projection: {
                  password: 0,
                  resetPasswordToken: 0,
                  resetPasswordExpires: 0
                }
              });
            }

            // Convert to plain object to avoid ObjectId serialization issues
            const plainApplication = JSON.parse(JSON.stringify(application));

            return {
              ...plainApplication,
              jobInfo: job ? {
                title: job.title,
                location: job.location,
                status: job.status,
                salary: job.salary,
                duration: job.duration
              } : null,
              userInfo: userInfo ? {
                firstName: userInfo.firstName,
                lastName: userInfo.lastName,
                email: userInfo.email,
                student: userInfo.student
              } : null,
              companyInfo: companyInfo ? {
                name: companyInfo.company?.name || `${companyInfo.firstName} ${companyInfo.lastName}`,
                email: companyInfo.email,
                company: companyInfo.company
              } : null
            };
          } catch (enrichError) {
            logger.warn('Failed to enrich application data', {
              applicationId: application._id,
              error: enrichError.message
            });
            return application;
          }
        })
      );

      return {
        total,
        limit: options.limit,
        skip: options.skip,
        data: enrichedApplications,
      };
    } catch (error) {
      logger.error('Applications find failed', {
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

      console.log('Applications get - ID:', id);
      console.log('Applications get - User ID:', userId);
      console.log('Applications get - User Role:', userRole);

      if (!userId) {
        throw new Error('Authentication required');
      }
      const application = await this.applicationModel.findById(id);
      console.log('Found application:', application ? { id: application._id, companyId: application.companyId, userId: application.userId } : 'null');

      if (!application) {
        const error = new Error('Application not found');
        error.code = 404;
        throw error;
      }

      // Check access permissions
      if (userRole === 'student' && application.userId.toString() !== userId.toString()) {
        throw new Error('Access denied: You can only view your own applications');
      } else if (userRole === 'company' && application.companyId.toString() !== userId.toString()) {
        throw new Error('Access denied: You can only view applications for your jobs');
      }

      // Lazy auto-expire if offer validity has passed
      try {
        const now = new Date();
        if (application.status === APPLICATION_STATUS.PENDING_ACCEPTANCE && application.offerValidity && new Date(application.offerValidity) < now) {
          await this.applicationModel.updateStatus(id, APPLICATION_STATUS.REJECTED, userId, 'Offer expired');
          const refreshed = await this.applicationModel.findById(id);
          if (refreshed) {
            Object.assign(application, refreshed);
          }
        }
      } catch (e) { /* ignore */ }

      // Enrich with job and user information
      const job = await this.jobModel.findById(application.jobId);

      let userInfo = null;
      if (userRole === 'company' || userRole === 'admin') {
        userInfo = await this.userModel.findById(application.userId, {
          projection: {
            password: 0,
            resetPasswordToken: 0,
            resetPasswordExpires: 0
          }
        });
      }

      let companyInfo = null;
      if (userRole === 'student' || userRole === 'admin') {
        companyInfo = await this.userModel.findById(application.companyId, {
          projection: {
            password: 0,
            resetPasswordToken: 0,
            resetPasswordExpires: 0
          }
        });
      }

      // Convert to plain object and serialize properly
      const plainApplication = JSON.parse(JSON.stringify(application));
      const plainJob = job ? JSON.parse(JSON.stringify(job)) : null;
      const plainUserInfo = userInfo ? JSON.parse(JSON.stringify(userInfo)) : null;
      const plainCompanyInfo = companyInfo ? JSON.parse(JSON.stringify(companyInfo)) : null;

      return {
        ...plainApplication,
        jobInfo: plainJob,
        userInfo: plainUserInfo,
        companyInfo: plainCompanyInfo
      };
    } catch (error) {
      logger.error('Application get failed', {
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

      if (!userId) {
        throw new Error('Authentication required');
      }

      const application = await this.applicationModel.findById(id);
      if (!application) {
        const error = new Error('Application not found');
        error.code = 404;
        throw error;
      }

      // Check access permissions
      if (userRole === 'student' && application.userId.toString() !== userId.toString()) {
        throw new Error('Access denied: You can only update your own applications');
      } else if (userRole === 'company' && application.companyId.toString() !== userId.toString()) {
        throw new Error('Access denied: You can only update applications for your jobs');
      }

      // Handle status updates
      const hasStatus = data.status !== undefined && data.status !== null && data.status !== '';
      const nextStatusCode = hasStatus ? normalizeApplicationStatus(data.status).code : undefined;
      if (hasStatus && nextStatusCode !== application.status) {
        let updateData = { ...data };

        // Handle offer submission when status is Pending acceptance
        if (nextStatusCode === APPLICATION_STATUS.PENDING_ACCEPTANCE) {
          if (userRole !== 'company') {
            throw new Error('Only companies can submit offers');
          }

          // Validate offer data
          if (!data.offerValidity) {
            throw new Error('Offer validity date is required');
          }

          // Handle file upload for offer letter
          if (data.offerLetter) {
            const { S3StorageUtils } = require('../utils/s3-storage');

            // Convert base64 to buffer
            const base64Data = data.offerLetter.data.split(',')[1]; // Remove data:application/pdf;base64, prefix
            const fileBuffer = Buffer.from(base64Data, 'base64');

            const uploadResult = await S3StorageUtils.uploadOfferLetter(
              fileBuffer,
              data.offerLetter.name,
              id,
              userId,
              data.offerLetter.type
            );
            updateData.offerLetterUrl = uploadResult.filePath;
          }

          // Convert offerValidity to Date
          updateData.offerValidity = new Date(data.offerValidity);
        }

        // Determine if company withdrawal intent while offer is pending
        const isCompanyWithdrawal = (
          userRole === 'company' &&
          application.status === APPLICATION_STATUS.PENDING_ACCEPTANCE &&
          (nextStatusCode === APPLICATION_STATUS.REJECTED || data?.withdraw === true || data?.action === 'withdraw')
        );
        const effectiveStatusCode = isCompanyWithdrawal
          ? APPLICATION_STATUS.WITHDRAWN
          : nextStatusCode;

        await this.applicationModel.updateStatus(
          id,
          effectiveStatusCode,
          userId,
          data.reason || ''
        );

        if (isCompanyWithdrawal) {
          await this.applicationModel.updateById(id, {
            withdrawalDate: new Date(),
            withdrawalReason: data.reason || 'Offer withdrawn by company'
          });
        }

        // Update additional fields if needed
        if (updateData.offerValidity || updateData.offerLetterUrl) {
          const { status, reason, ...additionalData } = updateData;
          await this.applicationModel.updateById(id, additionalData);
        }

        // Create internship when application is accepted
        if (nextStatusCode === APPLICATION_STATUS.ACCEPTED) {
          try {
            const InternshipsService = require('./internships.service');
            const internshipsService = new InternshipsService(this.app);

            const internshipData = {
              applicationId: id,
              jobId: application.jobId,
              companyId: application.companyId,
              startDate: data.startDate || new Date(),
              endDate: data.endDate || null
            };

            const internship = await internshipsService.create(internshipData, params);
            console.log('Internship created successfully for application:', id, 'internship ID:', internship._id);
          } catch (internshipError) {
            console.error('Failed to create internship for accepted application:', internshipError.message);
            // Don't fail the application update if internship creation fails
            // Log the error but continue
          }
        }

        logger.info(`Application status updated: ${id} to ${nextStatusCode} by user: ${userId}`);
        return await this.applicationModel.findById(id); // Return updated application
      }

      // Handle other updates
      const { status, reason, ...updateData } = data;
      const updatedApplication = await this.applicationModel.updateById(id, updateData);

      logger.info(`Application updated: ${id} by user: ${userId}`);
      return updatedApplication;
    } catch (error) {
      logger.error('Application update failed', {
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

      if (!userId) {
        throw new Error('Authentication required');
      }

      const application = await this.applicationModel.findById(id);
      if (!application) {
        const error = new Error('Application not found');
        error.code = 404;
        throw error;
      }

      // Only students can withdraw their own applications, or admins can delete any
      if (userRole === 'student' && application.userId.toString() !== userId.toString()) {
        throw new Error('Access denied: You can only withdraw your own applications');
      } else if (userRole === 'company') {
        throw new Error('Companies cannot delete applications');
      } else if (userRole !== 'admin' && userRole !== 'student') {
        throw new Error('Access denied');
      }

      // For students, mark as Rejected instead of deleting (numeric-only)
      if (userRole === 'student') {
        const withdrawnApplication = await this.applicationModel.updateStatus(
          id,
          APPLICATION_STATUS.WITHDRAWN,
          userId,
          'Application withdrawn by student'
        );

        // Capture withdrawal metadata
        await this.applicationModel.updateById(id, {
          withdrawalDate: new Date(),
          withdrawalReason: 'Application withdrawn by student'
        });

        // Decrease job application count
        const job = await this.jobModel.findById(application.jobId);
        const currentApplications = job.applications || 0;
        await this.jobModel.updateById(application.jobId, {
          applications: Math.max(0, currentApplications - 1)
        }, application.companyId);

        logger.info(`Application withdrawn: ${id} by user: ${userId}`);
        return await this.applicationModel.findById(id);
      }

      // For admins, actually delete
      await this.applicationModel.deleteById(id);

      // Decrease job application count
      const job = await this.jobModel.findById(application.jobId);
      const currentApplications = job.applications || 0;
      await this.jobModel.updateById(application.jobId, {
        applications: Math.max(0, currentApplications - 1)
      }, application.companyId);

      logger.info(`Application deleted: ${id} by admin: ${userId}`);
      return { id, deleted: true };
    } catch (error) {
      logger.error('Application deletion failed', {
        id,
        userId: params.user?._id,
        error: error.message
      });
      throw error;
    }
  }

  // Check if user has applied to a job
  async hasApplied(jobId, params) {
    try {
      const userId = params.user?._id;

      if (!userId) {
        return { hasApplied: false };
      }

      const hasApplied = await this.applicationModel.hasUserApplied(userId, jobId);
      return { hasApplied };
    } catch (error) {
      logger.error('Has applied check failed', {
        jobId,
        userId: params.user?._id,
        error: error.message
      });
      throw error;
    }
  }

  // Get application statistics for company dashboard
  async getStats(params) {
    try {
      const userId = params.user?._id;
      const userRole = params.user?.role;

      if (!userId) {
        throw new Error('Authentication required');
      }

      if (userRole !== 'company' && userRole !== 'admin') {
        throw new Error('Access denied');
      }

      const companyId = userRole === 'company' ? userId : params.query?.companyId;
      if (!companyId) {
        throw new Error('Company ID is required');
      }

      const stats = await this.applicationModel.getCompanyStats(companyId);
      return stats;
    } catch (error) {
      logger.error('Application stats failed', {
        userId: params.user?._id,
        error: error.message
      });
      throw error;
    }
  }

  // Counts per status for a given job (with lazy auto-expire)
  async counts(params) {
    try {
      const userId = params.user?._id;
      const userRole = params.user?.role;
      const jobId = params.query?.jobId;

      if (!userId) throw new Error('Authentication required');
      if (!jobId) throw new Error('jobId is required');

      const jobObjectId = typeof jobId === 'string' ? new ObjectId(jobId) : jobId;

      // Scope: company can only see their own job's applications
      const match = { jobId: jobObjectId };
      if (userRole === 'company') {
        match.companyId = userId;
      } else if (userRole !== 'admin') {
        throw new Error('Access denied');
      }

      // Lazy auto-expire before counting
      await this.applicationModel.expireOverdueOffers(match);

      const pipeline = [
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ];
      const result = await this.applicationModel.collection.aggregate(pipeline).toArray();

      const byCode = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
      let total = 0;
      for (const r of result) {
        const code = typeof r._id === 'number' ? r._id : normalizeApplicationStatus(r._id).code;
        byCode[code] = r.count;
        total += r.count;
      }

      return { success: true, data: { total, byCode } };
    } catch (error) {
      logger.error('Applications counts failed', {
        userId: params.user?._id,
        error: error.message
      });
      throw error;
    }
  }

  // Download offer letter method
  async downloadOfferLetter(params) {
    try {
      const applicationId = params.applicationId;
      const userId = params.userId;
      const userRole = params.user?.role;

      if (!userId) {
        throw new Error('Authentication required');
      }

      if (!applicationId) {
        throw new Error('Application ID is required');
      }

      // Get application to check if it has an offer letter
      const application = await this.applicationModel.findById(applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      // Check if user has access to this application
      if (userRole === 'student' && application.userId.toString() !== userId.toString()) {
        throw new Error('Access denied: You can only download your own offer letters');
      }

      if (!application.offerLetterUrl) {
        throw new Error('No offer letter found for this application');
      }

      // Download file from Google Cloud Storage using the same pattern as resume
      const StorageUtils = require('../utils/storage');
      const result = await StorageUtils.downloadFile(application.offerLetterUrl);

      logger.info(`Offer letter downloaded for application: ${applicationId}`);

      return {
        success: true,
        fileBuffer: result.fileBuffer,
        fileName: result.fileName,
        mimeType: result.mimeType
      };
    } catch (error) {
      logger.error('Offer letter download failed', {
        applicationId: params.applicationId,
        userId: params.userId,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = ApplicationsService;
