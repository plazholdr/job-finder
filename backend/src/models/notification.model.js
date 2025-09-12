const { ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

class NotificationModel {
  constructor(db) {
    this.collection = db.collection('notifications');
    this.createIndexes();
  }

  async createIndexes() {
    try {
      // Create indexes for better query performance
      await this.collection.createIndex({ companyId: 1 });
      await this.collection.createIndex({ userId: 1 });
      await this.collection.createIndex({ notificationId: 1 }, { unique: true });
      await this.collection.createIndex({ itemId: 1 });
      await this.collection.createIndex({ status: 1 });
      await this.collection.createIndex({ dateCreated: -1 });
      console.log('Notification indexes created successfully');
    } catch (error) {
      console.error('Error creating notification indexes:', error);
    }
  }

  async create(notificationData) {
    const {
      companyId,
      userId,
      itemId, // The request ID in this case
      remark,
      status = 'unread'
    } = notificationData;

    // Validate required fields
    if (!companyId || !userId || !itemId || !remark) {
      throw new Error('Company ID, User ID, Item ID, and Remark are required');
    }

    // Convert string IDs to ObjectIds
    let companyObjectId, userObjectId, itemObjectId;
    
    try {
      companyObjectId = new ObjectId(companyId);
      userObjectId = new ObjectId(userId);
      itemObjectId = new ObjectId(itemId);
    } catch (error) {
      throw new Error('Invalid ID format provided');
    }

    // Generate unique notification ID
    const notificationId = uuidv4();

    // Create notification document
    const notificationDoc = {
      companyId: companyObjectId,
      userId: userObjectId,
      notificationId: notificationId,
      itemId: itemObjectId,
      remark: remark,
      status: status,
      dateCreated: new Date(),
      updatedAt: new Date(),
      
      // Additional tracking
      readAt: null,
      readBy: null
    };

    console.log('💾 Inserting notification document into database...');
    console.log('📄 Document to insert:', JSON.stringify(notificationDoc, null, 2));
    console.log('🗄️ Collection name:', this.collection.collectionName);

    const result = await this.collection.insertOne(notificationDoc);
    console.log('✅ Notification inserted successfully with ID:', result.insertedId);

    return { ...notificationDoc, _id: result.insertedId };
  }

  async findById(id) {
    try {
      const objectId = new ObjectId(id);
      return await this.collection.findOne({ _id: objectId });
    } catch (error) {
      throw new Error('Invalid notification ID format');
    }
  }

  async findByNotificationId(notificationId) {
    return await this.collection.findOne({ notificationId: notificationId });
  }

  async findByCompanyId(companyId) {
    try {
      const companyObjectId = new ObjectId(companyId);
      return await this.collection.find({ companyId: companyObjectId }).sort({ dateCreated: -1 }).toArray();
    } catch (error) {
      throw new Error('Invalid company ID format');
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

  async markAsRead(id, readBy = null) {
    try {
      const objectId = new ObjectId(id);
      const updateData = {
        status: 'read',
        readAt: new Date(),
        updatedAt: new Date()
      };

      if (readBy) {
        updateData.readBy = new ObjectId(readBy);
      }

      const result = await this.collection.updateOne(
        { _id: objectId },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        throw new Error('Notification not found');
      }

      return result;
    } catch (error) {
      throw new Error('Invalid notification ID format or update failed');
    }
  }

  async markAsReadByNotificationId(notificationId, readBy = null) {
    const updateData = {
      status: 'read',
      readAt: new Date(),
      updatedAt: new Date()
    };

    if (readBy) {
      updateData.readBy = new ObjectId(readBy);
    }

    const result = await this.collection.updateOne(
      { notificationId: notificationId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      throw new Error('Notification not found');
    }

    return result;
  }

  async find(query = {}) {
    const {
      companyId,
      userId,
      status,
      limit = 50,
      skip = 0,
      sortBy = 'dateCreated',
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
        throw new Error('Notification not found');
      }

      return result;
    } catch (error) {
      throw new Error('Invalid notification ID format or deletion failed');
    }
  }

  async getUnreadCount(companyId = null, userId = null) {
    const filter = { status: 'unread' };
    
    if (companyId) {
      filter.companyId = new ObjectId(companyId);
    }
    
    if (userId) {
      filter.userId = new ObjectId(userId);
    }

    return await this.collection.countDocuments(filter);
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
      unread: 0,
      read: 0,
      total: 0
    };

    result.forEach(item => {
      stats[item._id] = item.count;
      stats.total += item.count;
    });

    return stats;
  }

  async bulkMarkAsRead(ids, readBy = null) {
    try {
      const objectIds = ids.map(id => new ObjectId(id));
      const updateData = {
        status: 'read',
        readAt: new Date(),
        updatedAt: new Date()
      };

      if (readBy) {
        updateData.readBy = new ObjectId(readBy);
      }

      const result = await this.collection.updateMany(
        { _id: { $in: objectIds } },
        { $set: updateData }
      );

      return result;
    } catch (error) {
      throw new Error('Invalid notification IDs or bulk update failed');
    }
  }
}

module.exports = NotificationModel;
