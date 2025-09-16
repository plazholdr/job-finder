const { ObjectId } = require('mongodb');
const { APPLICATION_STATUS, normalizeApplicationStatus } = require('../constants/constants');

class ApplicationModel {
  constructor(db) {
    this.collection = db.collection('applications');
    this.createIndexes();
  }

  async createIndexes() {
    try {
      // Create indexes for better query performance
      await this.collection.createIndex({ userId: 1 });
      await this.collection.createIndex({ jobId: 1 });
      await this.collection.createIndex({ companyId: 1 });
      await this.collection.createIndex({ status: 1 }); // numeric status 0..4
      await this.collection.createIndex({ createdAt: -1 });

      // Compound indexes for common queries
      await this.collection.createIndex({ jobId: 1, userId: 1 }, { unique: true }); // Prevent duplicate applications
      await this.collection.createIndex({ companyId: 1, status: 1 });
      await this.collection.createIndex({ userId: 1, status: 1 });

      await this.collection.createIndex({ withdrawalDate: -1 });

    } catch (error) {
      console.warn('Failed to create application indexes:', error.message);
    }
  }

  async create(applicationData) {
    const {
      userId,
      jobId,
      companyId,
      personalInformation,
      internshipDetails,
      courseInformation,
      assignmentInformation,
      coverLetter,
      resumeUrl,
      portfolioUrl,
      additionalDocuments = [],
      offerValidity,
      offerLetterUrl,
    } = applicationData;

    // Validate required fields
    if (!userId || !jobId || !companyId) {
      throw new Error('User ID, Job ID, and Company ID are required');
    }

    // Convert string IDs to ObjectIds
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const jobObjectId = typeof jobId === 'string' ? new ObjectId(jobId) : jobId;
    const companyObjectId = typeof companyId === 'string' ? new ObjectId(companyId) : companyId;

    // Check if user has already applied to this job
    const existingApplication = await this.collection.findOne({
      userId: userObjectId,
      jobId: jobObjectId
    });

    if (existingApplication) {
      throw new Error('You have already applied to this job');
    }

    // Create application document
    const applicationDoc = {
      userId: userObjectId,
      jobId: jobObjectId,
      companyId: companyObjectId,

      // Application content
      personalInformation: personalInformation || '',
      internshipDetails: internshipDetails || '',
      courseInformation: Array.isArray(courseInformation) ? courseInformation : [],
      assignmentInformation: Array.isArray(assignmentInformation) ? assignmentInformation : [],
      coverLetter: coverLetter || '',

      // File attachments
      resumeUrl: resumeUrl || null,
      portfolioUrl: portfolioUrl || null,
      additionalDocuments: additionalDocuments,

      // Application status workflow (numeric only)
      status: APPLICATION_STATUS.NEW,

      // Status history for tracking (store numeric code)
      statusHistory: [{
        status: APPLICATION_STATUS.NEW,
        changedAt: new Date(),
        changedBy: userObjectId,
        reason: 'Application submitted'
      }],

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
      submittedAt: new Date(),

      // Review tracking
      reviewedAt: null,
      reviewedBy: null,
      reviewNotes: null,

      // Interview tracking
      interviewScheduledAt: null,
      interviewCompletedAt: null,
      interviewNotes: null,

      // Offer tracking
      offeredAt: null,
      offerAcceptedAt: null,
      offerRejectedAt: null,
      rejectionReason: null,

      // Offer details - always set to null initially for student applications
      offerValidity: null,
      offerLetterUrl: null,

      withdrawalDate: null,
      withdrawalReason: null
    };

    const result = await this.collection.insertOne(applicationDoc);
    return { ...applicationDoc, _id: result.insertedId };
  }

  async findById(applicationId) {
    const applicationObjectId = typeof applicationId === 'string' ? new ObjectId(applicationId) : applicationId;
    return await this.collection.findOne({ _id: applicationObjectId });
  }

  async findByUserId(userId, options = {}) {
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const { limit = 50, skip = 0, sort = { createdAt: -1 }, status } = options;

    const query = { userId: userObjectId };
    if (status !== undefined && status !== null) {
      query.status = typeof status === 'string' && /^\d+$/.test(status) ? parseInt(status, 10) : status;
    }

    const applications = await this.collection
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    return applications;
  }

  async findByJobId(jobId, options = {}) {
    const jobObjectId = typeof jobId === 'string' ? new ObjectId(jobId) : jobId;
    const { limit = 50, skip = 0, sort = { createdAt: -1 }, status } = options;

    const query = { jobId: jobObjectId };
    if (status !== undefined && status !== null) {
      query.status = typeof status === 'string' && /^\d+$/.test(status) ? parseInt(status, 10) : status;
    }

    const applications = await this.collection
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    return applications;
  }

  async findByCompanyId(companyId, options = {}) {
    const companyObjectId = typeof companyId === 'string' ? new ObjectId(companyId) : companyId;
    const { limit = 50, skip = 0, sort = { createdAt: -1 }, status } = options;

    const query = { companyId: companyObjectId };
    if (status !== undefined && status !== null) {
      query.status = typeof status === 'string' && /^\d+$/.test(status) ? parseInt(status, 10) : status;
    }



    const applications = await this.collection
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    return applications;
  }

  async find(query = {}, options = {}) {
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

    const applications = await this.collection
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    return applications;
  }

  async count(query = {}) {
    return await this.collection.countDocuments(query);
  }

  async updateStatus(applicationId, newStatus, changedBy, reason = '') {
    const applicationObjectId = typeof applicationId === 'string' ? new ObjectId(applicationId) : applicationId;
    const changedByObjectId = typeof changedBy === 'string' ? new ObjectId(changedBy) : changedBy;

    const norm = normalizeApplicationStatus(newStatus);

    const setData = {
      status: norm.code,
      updatedAt: new Date()
    };

    // Add specific timestamp fields based on status code
    switch (norm.code) {
      case APPLICATION_STATUS.SHORTLISTED:
        setData.reviewedAt = new Date();
        setData.reviewedBy = changedByObjectId;
        break;
      case APPLICATION_STATUS.PENDING_ACCEPTANCE:
        setData.offeredAt = new Date();
        break;
      case APPLICATION_STATUS.ACCEPTED:
        setData.offerAcceptedAt = new Date();
        break;
      case APPLICATION_STATUS.REJECTED:
        setData.offerRejectedAt = new Date();
        if (reason) setData.rejectionReason = reason;
        break;
      default:
        break;
    }

    const updateData = {
      $set: setData,
      $push: {
        statusHistory: {
          status: norm.code,
          statusName: norm.name,
          changedAt: new Date(),
          changedBy: changedByObjectId,
          reason: reason || `Status changed to ${norm.name}`
        }
      }
    };

    const result = await this.collection.updateOne(
      { _id: applicationObjectId },
      updateData
    );

    if (result.matchedCount === 0) {
      throw new Error('Application not found');
    }

    return await this.findById(applicationId);
  }

  async updateById(applicationId, updateData) {
    const applicationObjectId = typeof applicationId === 'string' ? new ObjectId(applicationId) : applicationId;

    const result = await this.collection.updateOne(
      { _id: applicationObjectId },
      {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      throw new Error('Application not found');
    }

    return await this.findById(applicationId);
  }

  async deleteById(applicationId) {
    const applicationObjectId = typeof applicationId === 'string' ? new ObjectId(applicationId) : applicationId;

    const result = await this.collection.deleteOne({ _id: applicationObjectId });

    if (result.deletedCount === 0) {
      throw new Error('Application not found');
    }

    return { _id: applicationId, deleted: true };
  }

  // Check if user has applied to a specific job
  async hasUserApplied(userId, jobId) {
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const jobObjectId = typeof jobId === 'string' ? new ObjectId(jobId) : jobId;

    const application = await this.collection.findOne({
      userId: userObjectId,
      jobId: jobObjectId
    });

    return !!application;
  }

  // Auto-expire offers that have passed validity (lazy maintenance helper)
  async expireOverdueOffers(filter = {}) {
    const now = new Date();
    const query = {
      ...(filter || {}),
      status: APPLICATION_STATUS.PENDING_ACCEPTANCE,
      offerValidity: { $ne: null, $lt: now }
    };
    const update = {
      $set: {
        status: APPLICATION_STATUS.REJECTED,
        offerRejectedAt: now,
        updatedAt: now,
        rejectionReason: 'Offer expired'
      },
      $push: {
        statusHistory: {
          status: APPLICATION_STATUS.REJECTED,
          statusName: 'Rejected',
          changedAt: now,
          changedBy: null,
          reason: 'Offer expired'
        }
      }
    };
    try {
      await this.collection.updateMany(query, update);
    } catch (e) {
      // best-effort; ignore errors here
    }
  }

  // Get application statistics for a company (numeric status)
  async getCompanyStats(companyId) {
    const companyObjectId = typeof companyId === 'string' ? new ObjectId(companyId) : companyId;

    const pipeline = [
      { $match: { companyId: companyObjectId } },
      {
        $group: {
          _id: '$status', // numeric code
          count: { $sum: 1 }
        }
      }
    ];

    const stats = await this.collection.aggregate(pipeline).toArray();

    const byCode = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    let total = 0;
    stats.forEach(stat => {
      const key = typeof stat._id === 'number' ? stat._id : normalizeApplicationStatus(stat._id).code;
      byCode[key] = stat.count;
      total += stat.count;
    });

    return { total, byCode };
  }

  // Find applications by status (numeric array)
  async findByStatus(statusArray) {
    const arr = (Array.isArray(statusArray) ? statusArray : [statusArray])
      .map(s => (typeof s === 'number' ? s : normalizeApplicationStatus(s).code));
    const query = { status: { $in: arr } };
    return await this.collection.find(query).toArray();
  }

  // Find stuck applications (no updates in specified time); exclude final states (Accepted/Rejected)
  async findStuckApplications(thresholdDate) {
    const query = {
      updatedAt: { $lt: thresholdDate },
      status: { $nin: [APPLICATION_STATUS.ACCEPTED, APPLICATION_STATUS.REJECTED] }
    };
    return await this.collection.find(query).toArray();
  }

  // Find active applications (not in final states)
  async findActiveApplications() {
    const query = {
      status: { $nin: [APPLICATION_STATUS.ACCEPTED, APPLICATION_STATUS.REJECTED] }
    };
    return await this.collection.find(query).toArray();
  }

  // Get stage statistics for bottleneck analysis
  async getStageStatistics() {
    const pipeline = [
      {
        $group: {
          _id: '$status', // numeric code
          count: { $sum: 1 },
          averageProcessingTime: {
            $avg: {
              $divide: [
                { $subtract: ['$$NOW', '$updatedAt'] },
                1000 * 60 * 60 * 24 // Convert to days
              ]
            }
          }
        }
      },
      {
        $project: {
          stage: '$_id',
          count: 1,
          averageProcessingTime: { $round: ['$averageProcessingTime', 1] },
          _id: 0
        }
      }
    ];

    return await this.collection.aggregate(pipeline).toArray();
  }
}

module.exports = ApplicationModel;
