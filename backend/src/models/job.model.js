const { ObjectId } = require('mongodb');
const { JOB_STATUS, JOB_STATUS_LABEL, normalizeJobStatus } = require('../constants/constants');

class JobModel {
  constructor(db) {
    this.collection = db.collection('jobs');
    this.createIndexes();
  }

  async createIndexes() {
    try {
      // Create index on companyId for faster company-specific queries
      await this.collection.createIndex({ companyId: 1 });
      // Create index on status (string) and statusCode (numeric) for filtering
      await this.collection.createIndex({ status: 1 });
      await this.collection.createIndex({ statusCode: 1 });
      // Create index on createdAt for sorting
      await this.collection.createIndex({ createdAt: -1 });
      // Create compound index for company + status queries (both variants)
      await this.collection.createIndex({ companyId: 1, status: 1 });
      await this.collection.createIndex({ companyId: 1, statusCode: 1 });
      // Create text index for search functionality
      await this.collection.createIndex({
        title: 'text',
        description: 'text',
        requirements: 'text',
        'skills.technical': 'text',
        'skills.soft': 'text'
      });
    } catch (error) {
      console.error('Error creating indexes:', error);
    }
  }

  async create(jobData) {
    const { companyId, title, description, requirements, location, remoteWork, project, skills, salary, duration, startDate, endDate, attachments } = jobData;

    // Validate required fields
    if (!companyId) {
      throw new Error('Missing required field: companyId');
    }
    if (!title || title.trim().length === 0) {
      throw new Error('Missing required field: title');
    }
    if (!description || description.trim().length === 0) {
      throw new Error('Missing required field: description');
    }

    // Validate companyId format
    const companyObjectId = typeof companyId === 'string' ? new ObjectId(companyId) : companyId;

    // Create job document
    const jobDoc = {
      companyId: companyObjectId,
      title: title.trim(),
      description: description.trim(),
      requirements: requirements || '',

      // Location information
      location: location || '',
      remoteWork: remoteWork || false,

      // Optional project details
      project: project ? {
        title: project.title?.trim() || '',
        description: project.description?.trim() || '',
        startMonth: project.startMonth || null, // YYYY-MM
        endMonth: project.endMonth || null,     // YYYY-MM
        locations: Array.isArray(project.locations) ? project.locations : [],
        roleDescription: project.roleDescription || '',
        areasOfInterest: Array.isArray(project.areasOfInterest) ? project.areasOfInterest.slice(0, 3) : []
      } : undefined,

      // Skills
      skills: {
        technical: skills?.technical || [],
        soft: skills?.soft || [],
        languages: skills?.languages || [],
        certifications: skills?.certifications || []
      },

      // Salary information
      salary: {
        minimum: salary?.minimum || null,
        maximum: salary?.maximum || null,
        currency: salary?.currency || 'USD',
        negotiable: salary?.negotiable || false,
        type: salary?.type || 'monthly' // hourly, monthly, yearly
      },

      // Duration and dates
      duration: {
        months: duration?.months || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        flexible: duration?.flexible || false
      },

      // File attachments
      attachments: attachments || [],

      // Job status workflow
      status: JOB_STATUS_LABEL[JOB_STATUS.DRAFT], // 'Draft'
      statusCode: JOB_STATUS.DRAFT, // 0..3

      // Status history for tracking
      statusHistory: [{
        status: JOB_STATUS_LABEL[JOB_STATUS.DRAFT],
        changedAt: new Date(),
        changedBy: companyObjectId,
        reason: 'Job created'
      }],

      // Additional metadata
      views: 0,
      applications: 0,
      isActive: true,

      // Expiration & renewal
      expiresAt: null,                 // set when job becomes Active
      expiredAt: null,                 // set when auto-expired
      renewalsCount: 0,                // number of renewals performed
      expiryReminderSentAt: null,      // last time we notified about upcoming expiry

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),

      // Approval workflow
      submittedAt: null,
      approvedAt: null,
      rejectedAt: null,
      rejectionReason: null
    };

    const result = await this.collection.insertOne(jobDoc);
    return { ...jobDoc, _id: result.insertedId };
  }

  async findById(jobId) {
    const jobObjectId = typeof jobId === 'string' ? new ObjectId(jobId) : jobId;
    return await this.collection.findOne({ _id: jobObjectId });
  }

  async findByCompanyId(companyId, options = {}) {
    const companyObjectId = typeof companyId === 'string' ? new ObjectId(companyId) : companyId;
    const { status, limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

    const query = { companyId: companyObjectId };
    if (status !== undefined && status !== null && status !== '') {
      const norm = normalizeJobStatus(typeof status === 'string' && /^\d+$/.test(status) ? parseInt(status, 10) : status);
      // Match either statusCode or legacy string field
      query.$or = [
        { statusCode: norm.code },
        { status: norm.name }
      ];
    }

    const jobs = await this.collection
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    return jobs;
  }

  async updateById(jobId, updateData, companyId) {
    const jobObjectId = typeof jobId === 'string' ? new ObjectId(jobId) : jobId;
    const companyObjectId = typeof companyId === 'string' ? new ObjectId(companyId) : companyId;

    // Ensure company can only update their own jobs
    const existingJob = await this.findById(jobId);
    if (!existingJob) {
      throw new Error('Job not found');
    }

    if (existingJob.companyId.toString() !== companyObjectId.toString()) {
      throw new Error('Access denied: You can only update your own jobs');
    }

    // Prepare update operations
    let updateOperations = {};

    // Handle special operations like $push, $pull, $inc
    if (updateData.$push) {
      updateOperations.$push = updateData.$push;
      delete updateData.$push;
    }

    if (updateData.$pull) {
      updateOperations.$pull = updateData.$pull;
      delete updateData.$pull;
    }

    if (updateData.$inc) {
      updateOperations.$inc = updateData.$inc;
      delete updateData.$inc;
    }

    // Prepare regular update data
    const updateDoc = { ...updateData };
    updateDoc.updatedAt = new Date();

    // Remove fields that shouldn't be directly updated
    delete updateDoc._id;
    delete updateDoc.companyId;
    delete updateDoc.createdAt;
    delete updateDoc.statusHistory;

    // Add $set operation if there's regular update data
    if (Object.keys(updateDoc).length > 0) {
      updateOperations.$set = updateDoc;
    }

    const result = await this.collection.updateOne(
      { _id: jobObjectId },
      updateOperations
    );

    if (result.matchedCount === 0) {
      throw new Error('Job not found');
    }

    return await this.findById(jobId);
  }

  async updateStatus(jobId, newStatus, companyId, reason = '') {
    const jobObjectId = typeof jobId === 'string' ? new ObjectId(jobId) : jobId;
    const companyObjectId = typeof companyId === 'string' ? new ObjectId(companyId) : companyId;

    // Normalize incoming status (supports number or string)
    const norm = normalizeJobStatus(typeof newStatus === 'string' && /^\d+$/.test(newStatus) ? parseInt(newStatus, 10) : newStatus);
    const nextName = norm.name; // 'Draft' | 'Pending' | 'Active' | 'Rejected'
    const nextCode = norm.code; // 0..3

    const existingJob = await this.findById(jobId);
    if (!existingJob) {
      throw new Error('Job not found');
    }

    if (existingJob.companyId.toString() !== companyObjectId.toString()) {
      throw new Error('Access denied: You can only update your own jobs');
    }

    // Validate status transitions (by name)
    const currentStatus = existingJob.status || JOB_STATUS_LABEL[existingJob.statusCode] || 'Draft';
    const validTransitions = {
      Draft: ['Pending'],
      Pending: ['Active', 'Rejected'],
      Active: ['Closed'],
      Closed: ['Active'],
      Rejected: ['Draft']
    };

    if (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(nextName)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${nextName}`);
    }

    // Prepare status update
    const updateDoc = {
      status: nextName,
      statusCode: nextCode,
      updatedAt: new Date()
    };

    // Add status-specific timestamps
    if (nextName === 'Pending') {
      updateDoc.submittedAt = new Date();
    } else if (nextName === 'Active') {
      const now = new Date();
      updateDoc.approvedAt = now;
      // Set a 30-day expiration window on approval
      updateDoc.expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      updateDoc.expiryReminderSentAt = null;
      updateDoc.renewalsCount = 0;
      updateDoc.expiredAt = null;
      updateDoc.isActive = true;
    } else if (nextName === 'Rejected') {
      updateDoc.rejectedAt = new Date();
      updateDoc.rejectionReason = reason || null;
    } else if (nextName === 'Closed') {
      const now = new Date();
      updateDoc.closedAt = now;
      updateDoc.isActive = false;
    }

    // Add to status history
    const statusHistoryEntry = {
      status: nextName,
      changedAt: new Date(),
      changedBy: companyObjectId,
      reason: reason || `Status changed to ${nextName}`
    };

    const result = await this.collection.updateOne(
      { _id: jobObjectId },
      {
        $set: updateDoc,
        $push: { statusHistory: statusHistoryEntry }
      }
    );

    if (result.matchedCount === 0) {
      throw new Error('Job not found');
    }

    return await this.findById(jobId);
  }

  async renew(jobId, companyId) {
    const jobObjectId = typeof jobId === 'string' ? new ObjectId(jobId) : jobId;
    const companyObjectId = typeof companyId === 'string' ? new ObjectId(companyId) : companyId;

    const existing = await this.findById(jobId);
    if (!existing) throw new Error('Job not found');
    if (existing.companyId.toString() !== companyObjectId.toString()) {
      throw new Error('Access denied: You can only renew your own jobs');
    }
    if ((existing.status || JOB_STATUS_LABEL[existing.statusCode]) !== 'Active') {
      throw new Error('Only active jobs can be renewed');
    }

    const base = existing.expiresAt ? new Date(existing.expiresAt) : (existing.approvedAt ? new Date(existing.approvedAt) : new Date());
    const now = new Date();
    const start = base > now ? base : now;
    const newExpiry = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);

    const result2 = await this.collection.updateOne(
      { _id: jobObjectId },
      {
        $set: { expiresAt: newExpiry, updatedAt: new Date(), expiryReminderSentAt: null },
        $inc: { renewalsCount: 1 },
        $push: { statusHistory: { status: 'Active', changedAt: new Date(), changedBy: companyObjectId, reason: 'Renewed for 30 days' } }
      }
    );

    if (result2.matchedCount === 0) throw new Error('Job not found');
    return await this.findById(jobId);
  }

  async deleteById(jobId, companyId) {
    const jobObjectId = typeof jobId === 'string' ? new ObjectId(jobId) : jobId;
    const companyObjectId = typeof companyId === 'string' ? new ObjectId(companyId) : companyId;

    // Ensure company can only delete their own jobs
    const existingJob = await this.findById(jobId);
    if (!existingJob) {
      throw new Error('Job not found');
    }

    if (existingJob.companyId.toString() !== companyObjectId.toString()) {
      throw new Error('Access denied: You can only delete your own jobs');
    }

    // Only allow deletion of Draft jobs
    if (existingJob.status !== 'Draft') {
      throw new Error('Only draft jobs can be deleted');
    }

    const result = await this.collection.deleteOne({ _id: jobObjectId });
    return result.deletedCount > 0;
  }

  async find(query = {}, options = {}) {
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

    const jobs = await this.collection
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    return jobs;
  }

  async count(query = {}) {
    return await this.collection.countDocuments(query);
  }

  async search(searchTerm, options = {}) {
    const { limit = 50, skip = 0, companyId, status } = options;

    const query = {
      $text: { $search: searchTerm }
    };

    if (companyId) {
      query.companyId = typeof companyId === 'string' ? new ObjectId(companyId) : companyId;
    }

    if (status !== undefined && status !== null && status !== '') {
      const norm = normalizeJobStatus(typeof status === 'string' && /^\d+$/.test(status) ? parseInt(status, 10) : status);
      query.$or = [ { statusCode: norm.code }, { status: norm.name } ];
    }

    const jobs = await this.collection
      .find(query, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .toArray();

    return jobs;
  }
}

module.exports = JobModel;
