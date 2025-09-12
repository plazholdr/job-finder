const { ObjectId } = require('mongodb');

class RequestModel {
  constructor(db) {
    this.collection = db.collection('requests');
    this.createIndexes();
  }

  async createIndexes() {
    try {
      // Create indexes for better query performance
      await this.collection.createIndex({ userId: 1 });
      await this.collection.createIndex({ companyId: 1 });
      await this.collection.createIndex({ internshipId: 1 });
      await this.collection.createIndex({ status: 1 });
      await this.collection.createIndex({ type: 1 });
      await this.collection.createIndex({ dateCreated: -1 });
      console.log('Request indexes created successfully');
    } catch (error) {
      console.error('Error creating request indexes:', error);
    }
  }

  async create(requestData) {
    const {
      userId,
      companyId,
      internshipId,
      completionRemark,
      type, // 'complete_in_advance' or 'terminate'
      status = 'pending'
    } = requestData;

    // Validate required fields
    if (!userId || !companyId || !internshipId || !type) {
      throw new Error('User ID, Company ID, Internship ID, and Type are required');
    }

    if (!['complete_in_advance', 'terminate'].includes(type)) {
      throw new Error('Type must be either "complete_in_advance" or "terminate"');
    }

    // Convert string IDs to ObjectIds
    let userObjectId, companyObjectId, internshipObjectId;
    
    try {
      userObjectId = new ObjectId(userId);
      companyObjectId = new ObjectId(companyId);
      internshipObjectId = new ObjectId(internshipId);
    } catch (error) {
      throw new Error('Invalid ID format provided');
    }

    // Create request document
    const requestDoc = {
      userId: userObjectId,
      companyId: companyObjectId,
      internshipId: internshipObjectId,
      completionRemark: completionRemark || '',
      type: type,
      status: status,
      dateCreated: new Date(),
      updatedAt: new Date(),
      
      // Additional tracking
      processedAt: null,
      processedBy: null,
      response: null
    };

    console.log('💾 Inserting request document into database...');
    console.log('📄 Document to insert:', JSON.stringify(requestDoc, null, 2));
    console.log('🗄️ Collection name:', this.collection.collectionName);
    console.log('🔗 Database connection status:', this.collection.s ? 'Connected' : 'Not connected');

    const result = await this.collection.insertOne(requestDoc);
    console.log('✅ Request inserted successfully with ID:', result.insertedId);

    return { ...requestDoc, _id: result.insertedId };
  }

  async findById(id) {
    try {
      const objectId = new ObjectId(id);
      return await this.collection.findOne({ _id: objectId });
    } catch (error) {
      throw new Error('Invalid request ID format');
    }
  }

  async findByUserId(userId) {
    try {
      const userObjectId = new ObjectId(userId);
      return await this.collection.find({ userId: userObjectId }).sort({ dateCreated: -1 }).toArray();
    } catch (error) {
      throw new Error('Invalid user ID format');
    }
  }

  async findByCompanyId(companyId) {
    try {
      const companyObjectId = new ObjectId(companyId);
      return await this.collection.find({ companyId: companyObjectId }).sort({ dateCreated: -1 }).toArray();
    } catch (error) {
      throw new Error('Invalid company ID format');
    }
  }

  async findByInternshipId(internshipId) {
    try {
      const internshipObjectId = new ObjectId(internshipId);
      return await this.collection.find({ internshipId: internshipObjectId }).sort({ dateCreated: -1 }).toArray();
    } catch (error) {
      throw new Error('Invalid internship ID format');
    }
  }

  async updateStatus(id, status, processedBy = null, response = null) {
    try {
      const objectId = new ObjectId(id);
      const updateData = {
        status: status,
        updatedAt: new Date()
      };

      if (processedBy) {
        updateData.processedBy = new ObjectId(processedBy);
        updateData.processedAt = new Date();
      }

      if (response) {
        updateData.response = response;
      }

      const result = await this.collection.updateOne(
        { _id: objectId },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        throw new Error('Request not found');
      }

      return result;
    } catch (error) {
      throw new Error('Invalid request ID format or update failed');
    }
  }

  async find(query = {}) {
    const {
      userId,
      companyId,
      internshipId,
      status,
      type,
      limit = 50,
      skip = 0,
      sortBy = 'dateCreated',
      sortOrder = -1
    } = query;

    const filter = {};

    if (userId) {
      filter.userId = new ObjectId(userId);
    }

    if (companyId) {
      filter.companyId = new ObjectId(companyId);
    }

    if (internshipId) {
      filter.internshipId = new ObjectId(internshipId);
    }

    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
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
        throw new Error('Request not found');
      }

      return result;
    } catch (error) {
      throw new Error('Invalid request ID format or deletion failed');
    }
  }

  async getStats(companyId = null, userId = null) {
    const matchStage = {};
    
    if (companyId) {
      matchStage.companyId = new ObjectId(companyId);
    }
    
    if (userId) {
      matchStage.userId = new ObjectId(userId);
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ];

    const result = await this.collection.aggregate(pipeline).toArray();
    
    // Convert to object format
    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0
    };

    result.forEach(item => {
      stats[item._id] = item.count;
      stats.total += item.count;
    });

    return stats;
  }
}

module.exports = RequestModel;
