const logger = require('../logger');
const { getDB } = require('../db');
const UserModel = require('../models/user.model');

class AdminService {
  constructor(app) {
    this.app = app;
  // Ensure a valid UserModel instance backed by the active DB
  this.userModel = new UserModel(getDB());
  }

  // User Management
  async getAllUsers(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 50, role, status, search } = { ...filters, ...pagination };
      const skip = (page - 1) * limit;

      let query = {};

      // Apply filters
      if (role && role !== 'all') {
        query.role = role;
      }

      if (status && status !== 'all') {
        if (status === 'active') {
          query.isActive = true;
        } else if (status === 'inactive') {
          query.isActive = false;
        } else if (status === 'verified') {
          query.emailVerified = true;
        } else if (status === 'unverified') {
          query.emailVerified = false;
        }
      }

      // Search functionality
      if (search && search.trim()) {
        const searchRegex = { $regex: search.trim(), $options: 'i' };
        query.$or = [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { 'company.name': searchRegex },
          { 'profile.phone': searchRegex }
        ];
      }

      const users = await this.userModel.collection
        .find(query)
        .project({
          password: 0,
          emailVerificationToken: 0,
          emailVerificationExpires: 0,
          passwordResetToken: 0,
          passwordResetExpires: 0,
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const total = await this.userModel.collection.countDocuments(query);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error fetching users for admin', { error: error.message });
      throw error;
    }
  }

  async updateUserStatus(userId, status, adminId, reason = null) {
    try {
      const updateData = {
        isActive: status === 'active',
        updatedAt: new Date()
      };

      // Log admin action
      const adminAction = {
        adminId,
        action: 'user_status_update',
        targetUserId: userId,
        details: { status, reason },
        timestamp: new Date()
      };

      await this.userModel.collection.updateOne(
        { _id: this.userModel.toObjectId(userId) },
        {
          $set: updateData,
          $push: { 'adminActions': adminAction }
        }
      );

      logger.info(`User status updated by admin`, {
        userId,
        status,
        adminId,
        reason
      });

      return { success: true, message: 'User status updated successfully' };
    } catch (error) {
      logger.error('Error updating user status', { error: error.message, userId, status });
      throw error;
    }
  }

  async deleteUser(userId, adminId, reason = null) {
    try {
      // Soft delete - mark as deleted instead of removing
      const updateData = {
        isActive: false,
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: adminId,
        deletionReason: reason,
        updatedAt: new Date()
      };

      await this.userModel.collection.updateOne(
        { _id: this.userModel.toObjectId(userId) },
        { $set: updateData }
      );

      logger.info(`User deleted by admin`, { userId, adminId, reason });
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      logger.error('Error deleting user', { error: error.message, userId });
      throw error;
    }
  }

  // Company Verification Management
  async getPendingCompanyVerifications() {
    try {
      const companies = await this.userModel.collection
        .find({
          role: 'company',
          // support either code or legacy string for pending
          $or: [
            { 'company.verificationStatusCode': { $in: [null, 0] } },
            { 'company.verificationStatus': 'pending' }
          ]
        })
        .project({
          password: 0,
          emailVerificationToken: 0,
          emailVerificationExpires: 0,
          passwordResetToken: 0,
          passwordResetExpires: 0,
        })
        .sort({ createdAt: -1 })
        .toArray();

      return companies;
    } catch (error) {
      logger.error('Error fetching pending company verifications', { error: error.message });
      throw error;
    }
  }

  async getCompaniesByStatus(status = 'all') {
    try {
      const s = typeof status === 'string' ? status.toLowerCase() : 'all';
      const query = { role: 'company' };
      if (s !== 'all') {
        if (s === 'pending') {
          query.$or = [
            { 'company.verificationStatusCode': { $in: [null, 0] } },
            { 'company.verificationStatus': 'pending' }
          ];
        } else if (s === 'verified' || s === 'approved') {
          query.$or = [
            { 'company.verificationStatusCode': 1 },
            { 'company.verificationStatus': 'verified' }
          ];
        } else if (s === 'rejected') {
          query.$or = [
            { 'company.verificationStatusCode': 2 },
            { 'company.verificationStatus': 'rejected' }
          ];
        } else if (s === 'suspended') {
          query.$or = [
            { 'company.verificationStatusCode': 3 },
            { 'company.verificationStatus': 'suspended' }
          ];
        }
      }

      const companies = await this.userModel.collection
        .find(query)
        .project({
          password: 0,
          emailVerificationToken: 0,
          emailVerificationExpires: 0,
          passwordResetToken: 0,
          passwordResetExpires: 0,
        })
        .sort({ createdAt: -1 })
        .toArray();

      return companies;
    } catch (error) {
      logger.error('Error fetching companies by status', { error: error.message, status });
      throw error;
    }
  }

  async verifyCompany(companyId, adminId, status, notes = null) {
    try {
      const normalized = typeof status === 'string' ? status.toLowerCase() : status;
      // Map synonyms and codes
      let statusName;
      if (typeof normalized === 'number') {
        statusName = normalized === 1 ? 'verified' : normalized === 2 ? 'rejected' : normalized === 3 ? 'suspended' : 'pending';
      } else {
        statusName = ['approved', 'verify', 'verified'].includes(normalized) ? 'verified'
          : ['reject', 'rejected'].includes(normalized) ? 'rejected'
          : ['suspend', 'suspended'].includes(normalized) ? 'suspended'
          : 'pending';
      }
      const statusCode = statusName === 'verified' ? 1 : statusName === 'rejected' ? 2 : statusName === 'suspended' ? 3 : 0;

      const updateData = {
        'company.verificationStatus': statusName,
        'company.verificationStatusCode': statusCode,
        'company.verificationNotes': notes,
  'company.verifiedAt': statusName === 'verified' ? new Date() : null,
  'company.verifiedBy': statusName === 'verified' ? adminId : null,
        updatedAt: new Date()
      };

      // Log admin action
      const adminAction = {
        adminId,
        action: 'company_verification',
        targetUserId: companyId,
        details: { status, notes },
        timestamp: new Date()
      };

      await this.userModel.collection.updateOne(
        { _id: this.userModel.toObjectId(companyId) },
        {
          $set: updateData,
          $push: { 'adminActions': adminAction }
        }
      );

      logger.info(`Company verification updated`, {
        companyId,
        status: statusName,
        statusCode,
        adminId,
        notes
      });

      return { success: true, message: 'Company verification updated successfully' };
    } catch (error) {
      logger.error('Error updating company verification', { error: error.message, companyId, status });
      throw error;
    }
  }

  // System Analytics
  async getSystemStats() {
    try {
      const stats = await Promise.all([
        // User counts by role
        this.userModel.collection.countDocuments({ role: 'student', isActive: true }),
        this.userModel.collection.countDocuments({ role: 'company', isActive: true }),
        this.userModel.collection.countDocuments({ role: 'admin', isActive: true }),

        // Verification stats
        this.userModel.collection.countDocuments({
          role: 'company',
          'company.verificationStatus': 'pending'
        }),
        this.userModel.collection.countDocuments({
          role: 'company',
          'company.verificationStatus': 'verified'
        }),

        // Recent registrations (last 30 days)
        this.userModel.collection.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }),

        // Active users (logged in last 7 days)
        this.userModel.collection.countDocuments({
          lastLoginAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        })
      ]);

      return {
        users: {
          students: stats[0],
          companies: stats[1],
          admins: stats[2],
          total: stats[0] + stats[1] + stats[2]
        },
        verification: {
          pending: stats[3],
          verified: stats[4]
        },
        activity: {
          recentRegistrations: stats[5],
          activeUsers: stats[6]
        }
      };
    } catch (error) {
      logger.error('Error fetching system stats', { error: error.message });
      throw error;
    }
  }

  // Admin Action Logging
  async logAdminAction(adminId, action, details = {}) {
    try {
      const logEntry = {
        adminId,
        action,
        details,
        timestamp: new Date(),
        ipAddress: details.ipAddress || null,
        userAgent: details.userAgent || null
      };

      // Store in admin user's actions log
      await this.userModel.collection.updateOne(
        { _id: this.userModel.toObjectId(adminId) },
        { $push: { 'admin.actionsLog': logEntry } }
      );

      logger.info('Admin action logged', { adminId, action, details });
    } catch (error) {
      logger.error('Error logging admin action', { error: error.message, adminId, action });
    }
  }

  async getAdminActionLogs(adminId = null, limit = 100) {
    try {
      let query = { role: 'admin' };
      if (adminId) {
        query._id = this.userModel.toObjectId(adminId);
      }

      const admins = await this.userModel.collection
        .find(query)
        .project({ 'admin.actionsLog': 1, firstName: 1, lastName: 1, email: 1 })
        .toArray();

      // Flatten and sort all action logs
      const allLogs = [];
      admins.forEach(admin => {
        if (admin.admin && admin.admin.actionsLog) {
          admin.admin.actionsLog.forEach(log => {
            allLogs.push({
              ...log,
              adminName: `${admin.firstName} ${admin.lastName}`,
              adminEmail: admin.email
            });
          });
        }
      });

      // Sort by timestamp descending and limit
      allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return allLogs.slice(0, limit);
    } catch (error) {
      logger.error('Error fetching admin action logs', { error: error.message });
      throw error;
    }
  }
}

module.exports = AdminService;
