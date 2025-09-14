const { ObjectId } = require('mongodb');

class LikedJobModel {
  constructor(db) {
    this.collection = db.collection('likedJobs');
    this.createIndexes();
  }

  async createIndexes() {
    try {
      // Create indexes for better query performance
      await this.collection.createIndex({ userId: 1 });
      await this.collection.createIndex({ jobId: 1 });
      await this.collection.createIndex({ createdAt: -1 });
      
      // Compound index to prevent duplicate likes and for faster queries
      await this.collection.createIndex({ userId: 1, jobId: 1 }, { unique: true });
      
      console.log('LikedJob indexes created successfully');
    } catch (error) {
      console.error('Error creating liked job indexes:', error);
    }
  }

  toObjectId(id) {
    return typeof id === 'string' ? new ObjectId(id) : id;
  }

  async create(userId, jobId) {
    try {
      // Convert to ObjectIds
      const userObjectId = this.toObjectId(userId);
      const jobObjectId = this.toObjectId(jobId);

      // Validate required fields
      if (!userObjectId || !jobObjectId) {
        throw new Error('User ID and Job ID are required');
      }

      // Create liked job document
      const likedJobDoc = {
        userId: userObjectId,
        jobId: jobObjectId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await this.collection.insertOne(likedJobDoc);
      return { ...likedJobDoc, _id: result.insertedId };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Job already liked by this user');
      }
      throw error;
    }
  }

  async remove(userId, jobId) {
    try {
      const userObjectId = this.toObjectId(userId);
      const jobObjectId = this.toObjectId(jobId);

      const result = await this.collection.deleteOne({
        userId: userObjectId,
        jobId: jobObjectId
      });

      if (result.deletedCount === 0) {
        throw new Error('Liked job not found');
      }

      return { success: true, message: 'Job unliked successfully' };
    } catch (error) {
      throw error;
    }
  }

  async findByUserId(userId, options = {}) {
    try {
      const userObjectId = this.toObjectId(userId);
      const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

      const likedJobs = await this.collection
        .find({ userId: userObjectId })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();

      return likedJobs;
    } catch (error) {
      throw error;
    }
  }

  async findByJobId(jobId, options = {}) {
    try {
      const jobObjectId = this.toObjectId(jobId);
      const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

      const likes = await this.collection
        .find({ jobId: jobObjectId })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();

      return likes;
    } catch (error) {
      throw error;
    }
  }

  async isLiked(userId, jobId) {
    try {
      const userObjectId = this.toObjectId(userId);
      const jobObjectId = this.toObjectId(jobId);

      const likedJob = await this.collection.findOne({
        userId: userObjectId,
        jobId: jobObjectId
      });

      return !!likedJob;
    } catch (error) {
      throw error;
    }
  }

  async getLikedJobsWithDetails(userId, options = {}) {
    try {
      const userObjectId = this.toObjectId(userId);
      const { limit = 50, skip = 0 } = options;

      // Aggregate to join with jobs collection
      const pipeline = [
        { $match: { userId: userObjectId } },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'jobs',
            localField: 'jobId',
            foreignField: '_id',
            as: 'job'
          }
        },
        { $unwind: '$job' },
        {
          $lookup: {
            from: 'users',
            localField: 'job.companyId',
            foreignField: '_id',
            as: 'company'
          }
        },
        { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            userId: 1,
            jobId: 1,
            createdAt: 1,
            'job._id': 1,
            'job.title': 1,
            'job.description': 1,
            'job.location': 1,
            'job.salary': 1,
            'job.status': 1,
            'job.createdAt': 1,
            'job.duration': 1,
            'company.company.name': 1,
            'company.company.logo': 1
          }
        }
      ];

      const likedJobsWithDetails = await this.collection.aggregate(pipeline).toArray();
      return likedJobsWithDetails;
    } catch (error) {
      throw error;
    }
  }

  async countByUserId(userId) {
    try {
      const userObjectId = this.toObjectId(userId);
      return await this.collection.countDocuments({ userId: userObjectId });
    } catch (error) {
      throw error;
    }
  }

  async countByJobId(jobId) {
    try {
      const jobObjectId = this.toObjectId(jobId);
      return await this.collection.countDocuments({ jobId: jobObjectId });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LikedJobModel;
