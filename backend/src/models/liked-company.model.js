const { ObjectId } = require('mongodb');

class LikedCompanyModel {
  constructor(db) {
    this.collection = db.collection('likedCompanies');
    this.createIndexes();
  }

  async createIndexes() {
    try {
      // Create indexes for better query performance
      await this.collection.createIndex({ userId: 1 });
      await this.collection.createIndex({ companyId: 1 });
      await this.collection.createIndex({ createdAt: -1 });
      
      // Compound index to prevent duplicate likes and for faster queries
      await this.collection.createIndex({ userId: 1, companyId: 1 }, { unique: true });
      
      console.log('LikedCompany indexes created successfully');
    } catch (error) {
      console.error('Error creating liked company indexes:', error);
    }
  }

  toObjectId(id) {
    if (!id) return id;
    if (typeof id !== 'string') return id;
    // Accept plain strings (e.g., 'dummy1') without converting to ObjectId
    const is24Hex = /^[a-fA-F0-9]{24}$/.test(id);
    return is24Hex ? new ObjectId(id) : id;
  }

  async create(userId, companyId) {
    try {
      // Convert to ObjectIds
      const userObjectId = this.toObjectId(userId);
      const companyObjectId = this.toObjectId(companyId);

      // Validate required fields
      if (!userObjectId || !companyObjectId) {
        throw new Error('User ID and Company ID are required');
      }

      // Create liked company document
      const likedCompanyDoc = {
        userId: userObjectId,
        companyId: companyObjectId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await this.collection.insertOne(likedCompanyDoc);
      return { ...likedCompanyDoc, _id: result.insertedId };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Company already liked by this user');
      }
      throw error;
    }
  }

  async remove(userId, companyId) {
    try {
      const userObjectId = this.toObjectId(userId);
      const companyObjectId = this.toObjectId(companyId);

      const result = await this.collection.deleteOne({
        userId: userObjectId,
        companyId: companyObjectId
      });

      if (result.deletedCount === 0) {
        throw new Error('Liked company not found');
      }

      return { success: true, message: 'Company unliked successfully' };
    } catch (error) {
      throw error;
    }
  }

  async findByUserId(userId, options = {}) {
    try {
      const userObjectId = this.toObjectId(userId);
      const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

      const likedCompanies = await this.collection
        .find({ userId: userObjectId })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();

      return likedCompanies;
    } catch (error) {
      throw error;
    }
  }

  async findByCompanyId(companyId, options = {}) {
    try {
      const companyObjectId = this.toObjectId(companyId);
      const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

      const likes = await this.collection
        .find({ companyId: companyObjectId })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();

      return likes;
    } catch (error) {
      throw error;
    }
  }

  async isLiked(userId, companyId) {
    try {
      const userObjectId = this.toObjectId(userId);
      const companyObjectId = this.toObjectId(companyId);

      const likedCompany = await this.collection.findOne({
        userId: userObjectId,
        companyId: companyObjectId
      });

      return !!likedCompany;
    } catch (error) {
      throw error;
    }
  }

  async getLikedCompaniesWithDetails(userId, options = {}) {
    try {
      const userObjectId = this.toObjectId(userId);
      const { limit = 50, skip = 0 } = options;

      // Aggregate to join with users collection (companies are stored as users with role='company')
      const pipeline = [
        { $match: { userId: userObjectId } },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'companyId',
            foreignField: '_id',
            as: 'company'
          }
        },
        { $unwind: '$company' },
        {
          $project: {
            _id: 1,
            userId: 1,
            companyId: 1,
            createdAt: 1,
            'company._id': 1,
            'company.firstName': 1,
            'company.lastName': 1,
            'company.email': 1,
            'company.company.name': 1,
            'company.company.description': 1,
            'company.company.industry': 1,
            'company.company.logo': 1,
            'company.company.headquarters': 1,
            'company.company.website': 1,
            'company.company.phone': 1,
            'company.createdAt': 1
          }
        }
      ];

      const likedCompanies = await this.collection.aggregate(pipeline).toArray();
      return likedCompanies;
    } catch (error) {
      throw error;
    }
  }

  async count(userId) {
    try {
      const userObjectId = this.toObjectId(userId);
      return await this.collection.countDocuments({ userId: userObjectId });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LikedCompanyModel;
