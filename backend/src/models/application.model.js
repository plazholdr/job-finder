const { ObjectId } = require('mongodb');

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
      await this.collection.createIndex({ status: 1 });
      await this.collection.createIndex({ createdAt: -1 });
      
      // Compound indexes for common queries
      await this.collection.createIndex({ jobId: 1, userId: 1 }, { unique: true }); // Prevent duplicate applications
      await this.collection.createIndex({ companyId: 1, status: 1 });
      await this.collection.createIndex({ userId: 1, status: 1 });
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
      courseInformation: courseInformation || '',
      assignmentInformation: assignmentInformation || '',
      coverLetter: coverLetter || '',
      
      // File attachments
      resumeUrl: resumeUrl || null,
      portfolioUrl: portfolioUrl || null,
      additionalDocuments: additionalDocuments,
      
      // Application status workflow
      status: 'submitted', // submitted, under_review, interview_scheduled, interview_completed, offered, pending_acceptance, accepted, rejected, withdrawn
      
      // Status history for tracking
      statusHistory: [{
        status: 'submitted',
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
      offerLetterUrl: null
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
    if (status) {
      query.status = status;
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
    if (status) {
      query.status = status;
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
    if (status) {
      query.status = status;
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

    const setData = {
      status: newStatus,
      updatedAt: new Date()
    };

    // Add specific timestamp fields based on status
    switch (newStatus) {
      case 'under_review':
        setData.reviewedAt = new Date();
        setData.reviewedBy = changedByObjectId;
        break;
      case 'interview_scheduled':
        setData.interviewScheduledAt = new Date();
        break;
      case 'interview_completed':
        setData.interviewCompletedAt = new Date();
        break;
      case 'offered':
        setData.offeredAt = new Date();
        break;
      case 'pending_acceptance':
        setData.offeredAt = new Date();
        break;
      case 'accepted':
        setData.offerAcceptedAt = new Date();
        break;
      case 'rejected':
        setData.offerRejectedAt = new Date();
        if (reason) setData.rejectionReason = reason;
        break;
    }

    const updateData = {
      $set: setData,
      $push: {
        statusHistory: {
          status: newStatus,
          changedAt: new Date(),
          changedBy: changedByObjectId,
          reason: reason || `Status changed to ${newStatus}`
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

  // Get application statistics for a company
  async getCompanyStats(companyId) {
    const companyObjectId = typeof companyId === 'string' ? new ObjectId(companyId) : companyId;
    
    const pipeline = [
      { $match: { companyId: companyObjectId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ];

    const stats = await this.collection.aggregate(pipeline).toArray();
    
    // Convert to object format
    const result = {
      total: 0,
      submitted: 0,
      under_review: 0,
      interview_scheduled: 0,
      interview_completed: 0,
      offered: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    return result;
  }

  // Find applications by status (for workflow scheduler)
  async findByStatus(statusArray) {
    const query = { status: { $in: statusArray } };
    return await this.collection.find(query).toArray();
  }

  // Find stuck applications (no updates in specified time)
  async findStuckApplications(thresholdDate) {
    const query = {
      updatedAt: { $lt: thresholdDate },
      status: { $nin: ['offer_accepted', 'offer_declined', 'rejected'] }
    };
    return await this.collection.find(query).toArray();
  }

  // Find active applications (not in final states)
  async findActiveApplications() {
    const query = {
      status: { $nin: ['offer_accepted', 'offer_declined', 'rejected'] }
    };
    return await this.collection.find(query).toArray();
  }

  // Get stage statistics for bottleneck analysis
  async getStageStatistics() {
    const pipeline = [
      {
        $group: {
          _id: '$status',
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
