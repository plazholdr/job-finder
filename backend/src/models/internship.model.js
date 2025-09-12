const { ObjectId } = require('mongodb');

class InternshipModel {
  constructor(db) {
    this.collection = db.collection('internships');
    this.createIndexes();
  }

  async createIndexes() {
    try {
      // Create indexes for better query performance
      await this.collection.createIndex({ userId: 1 });
      await this.collection.createIndex({ jobId: 1 });
      await this.collection.createIndex({ companyId: 1 });
      await this.collection.createIndex({ applicationId: 1 }, { unique: true }); // One internship per application
      await this.collection.createIndex({ status: 1 });
      await this.collection.createIndex({ startDate: 1 });
      await this.collection.createIndex({ endDate: 1 });
      await this.collection.createIndex({ createdAt: -1 });
      
      // Compound indexes for common queries
      await this.collection.createIndex({ companyId: 1, status: 1 });
      await this.collection.createIndex({ userId: 1, status: 1 });
      await this.collection.createIndex({ status: 1, startDate: 1 });
    } catch (error) {
      console.warn('Failed to create internship indexes:', error.message);
    }
  }

  async create(internshipData) {
    const {
      userId,
      jobId,
      companyId,
      applicationId,
      startDate,
      endDate,
      position,
      department,
      supervisor,
      description,
      requirements,
      stipend,
      location,
      workType, // remote, hybrid, onsite
      duration, // in weeks/months
      status = 'active',
      internshipStatus = 'pending', // pending, active, completed, terminated
      review,
      letterOfOffer,
      onboardingMaterialUrl,
      remarks
    } = internshipData;

    // Validate required fields
    if (!userId || !jobId || !companyId || !applicationId) {
      throw new Error('User ID, Job ID, Company ID, and Application ID are required');
    }

    // Validate ObjectIds
    let userObjectId, jobObjectId, companyObjectId, applicationObjectId;
    try {
      userObjectId = new ObjectId(userId);
      jobObjectId = new ObjectId(jobId);
      companyObjectId = new ObjectId(companyId);
      applicationObjectId = new ObjectId(applicationId);
    } catch (error) {
      throw new Error('Invalid ID format provided');
    }

    // Check if internship already exists for this application
    const existingInternship = await this.collection.findOne({ applicationId: applicationObjectId });
    if (existingInternship) {
      throw new Error('Internship already exists for this application');
    }

    // Create internship document
    const internshipDoc = {
      userId: userObjectId,
      jobId: jobObjectId,
      companyId: companyObjectId,
      applicationId: applicationObjectId,
      
      // Internship details
      position: position || 'Intern',
      department: department || null,
      supervisor: supervisor || null,
      description: description || '',
      requirements: requirements || [],
      
      // Compensation and logistics
      stipend: stipend || null,
      location: location || '',
      workType: workType || 'onsite', // remote, hybrid, onsite
      duration: duration || null,
      
      // Dates
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      
      // Status tracking
      status: status, // active, completed, terminated, paused
      internshipStatus: internshipStatus, // pending, active, completed, terminated

      // Documents and materials
      letterOfOffer: letterOfOffer || null,
      onboardingMaterialUrl: onboardingMaterialUrl || null,

      // Reviews and feedback
      review: review || null,
      remarks: remarks || '',

      // Progress tracking
      progressReports: [],
      evaluations: [],
      
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Additional tracking
      actualStartDate: null,
      actualEndDate: null,
      completionStatus: null, // successful, early_completion, terminated
      finalEvaluation: null,
      certificate: null
    };

    console.log('💾 Inserting internship document into database...');
    console.log('📄 Document to insert:', JSON.stringify(internshipDoc, null, 2));

    const result = await this.collection.insertOne(internshipDoc);
    console.log('✅ Internship inserted successfully with ID:', result.insertedId);

    return { ...internshipDoc, _id: result.insertedId };
  }

  async findById(id) {
    try {
      const objectId = new ObjectId(id);
      return await this.collection.findOne({ _id: objectId });
    } catch (error) {
      throw new Error('Invalid internship ID format');
    }
  }

  async findByUserId(userId) {
    try {
      const userObjectId = new ObjectId(userId);
      return await this.collection.find({ userId: userObjectId }).toArray();
    } catch (error) {
      throw new Error('Invalid user ID format');
    }
  }

  async findByCompanyId(companyId) {
    try {
      const companyObjectId = new ObjectId(companyId);
      return await this.collection.find({ companyId: companyObjectId }).toArray();
    } catch (error) {
      throw new Error('Invalid company ID format');
    }
  }

  async findByApplicationId(applicationId) {
    try {
      const applicationObjectId = new ObjectId(applicationId);
      return await this.collection.findOne({ applicationId: applicationObjectId });
    } catch (error) {
      throw new Error('Invalid application ID format');
    }
  }

  async updateStatus(id, status, updatedBy, reason = '') {
    try {
      const objectId = new ObjectId(id);
      const updatedByObjectId = new ObjectId(updatedBy);
      
      const updateData = {
        status,
        updatedAt: new Date(),
        lastUpdatedBy: updatedByObjectId
      };

      // Add specific date tracking based on status
      if (status === 'completed') {
        updateData.actualEndDate = new Date();
        updateData.completionStatus = 'successful';
      } else if (status === 'terminated') {
        updateData.actualEndDate = new Date();
        updateData.completionStatus = 'terminated';
        updateData.terminationReason = reason;
      }

      const result = await this.collection.updateOne(
        { _id: objectId },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        throw new Error('Internship not found');
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Failed to update internship status: ${error.message}`);
    }
  }

  async updateById(id, updateData) {
    try {
      const objectId = new ObjectId(id);

      // Add updatedAt timestamp
      const finalUpdateData = {
        ...updateData,
        updatedAt: new Date()
      };

      console.log('🔄 Updating internship:', objectId, 'with data:', finalUpdateData);

      const result = await this.collection.updateOne(
        { _id: objectId },
        { $set: finalUpdateData }
      );

      if (result.matchedCount === 0) {
        throw new Error('Internship not found');
      }

      console.log('✅ Internship update result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error updating internship:', error);
      throw new Error('Invalid internship ID format or update failed');
    }
  }

  async addProgressReport(id, reportData) {
    try {
      const objectId = new ObjectId(id);
      
      const progressReport = {
        id: new ObjectId(),
        ...reportData,
        createdAt: new Date()
      };

      const result = await this.collection.updateOne(
        { _id: objectId },
        { 
          $push: { progressReports: progressReport },
          $set: { updatedAt: new Date() }
        }
      );

      if (result.matchedCount === 0) {
        throw new Error('Internship not found');
      }

      return progressReport;
    } catch (error) {
      throw new Error(`Failed to add progress report: ${error.message}`);
    }
  }

  async find(query = {}) {
    const {
      companyId,
      userId,
      status,
      startDate,
      endDate,
      limit = 50,
      skip = 0,
      sortBy = 'createdAt',
      sortOrder = -1
    } = query;

    const filter = {};

    if (companyId) {
      filter.companyId = new ObjectId(companyId);
    }

    if (userId) {
      filter.userId = new ObjectId(userId);
    }

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    const sort = {};
    sort[sortBy] = sortOrder;

    return await this.collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  async delete(id) {
    try {
      const objectId = new ObjectId(id);
      const result = await this.collection.deleteOne({ _id: objectId });
      
      if (result.deletedCount === 0) {
        throw new Error('Internship not found');
      }
      
      return { success: true, message: 'Internship deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete internship: ${error.message}`);
    }
  }
}

module.exports = InternshipModel;
