const { getDB } = require('../db');
const NotificationModel = require('../models/notification.model');

class NotificationsService {
  constructor(app) {
    this.app = app;
    this.notificationModel = new NotificationModel(getDB());
  }

  async create(data, params) {
    try {
      const userId = params.user?._id;
      const userRole = params.user?.role;

      if (!userId) {
        throw new Error('Authentication required');
      }

      console.log('Creating notification with data:', data);

      const {
        companyId,
        targetUserId,
        itemId,
        remark
      } = data;

      // Validate required fields
      if (!companyId || !targetUserId || !itemId || !remark) {
        throw new Error('Company ID, Target User ID, Item ID, and Remark are required');
      }

      // Create the notification
      const notificationData = {
        companyId: companyId,
        userId: targetUserId,
        itemId: itemId,
        remark: remark,
        status: 'unread'
      };

      const newNotification = await this.notificationModel.create(notificationData);

      console.log('✅ Notification created successfully with ID:', newNotification._id);

      return {
        success: true,
        data: newNotification,
        message: 'Notification created successfully'
      };

    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error(error.message || 'Failed to create notification');
    }
  }

  async find(params) {
    try {
      const userId = params.user?._id;
      const userRole = params.user?.role;
      const query = params.query || {};

      if (!userId) {
        throw new Error('Authentication required');
      }

      console.log('Finding notifications for user:', userId, 'role:', userRole);

      // Build filter based on user role and permissions
      const filter = {};

      if (userRole === 'student') {
        // Students can only see notifications sent to them
        filter.userId = userId;
      } else if (userRole === 'company') {
        // Companies can only see notifications for their company
        filter.companyId = userId;
      } else if (userRole === 'admin') {
        // Admins can see all notifications
        // No additional filter needed
      } else {
        throw new Error('Access denied');
      }

      // Add additional filters from query
      if (query.status) {
        filter.status = query.status;
      }

      const notifications = await this.notificationModel.find({
        ...filter,
        limit: parseInt(query.limit) || 50,
        skip: parseInt(query.skip) || 0,
        sortBy: query.sortBy || 'dateCreated',
        sortOrder: parseInt(query.sortOrder) || -1
      });

      console.log(`Found ${notifications.length} notifications`);

      return {
        success: true,
        data: notifications,
        total: notifications.length
      };

    } catch (error) {
      console.error('Error finding notifications:', error);
      throw new Error(error.message || 'Failed to fetch notifications');
    }
  }

  async get(id, params) {
    try {
      const userId = params.user?._id;
      const userRole = params.user?.role;

      if (!userId) {
        throw new Error('Authentication required');
      }

      const notification = await this.notificationModel.findById(id);
      if (!notification) {
        const error = new Error('Notification not found');
        error.code = 404;
        throw error;
      }

      // Check access permissions
      if (userRole === 'student' && notification.userId.toString() !== userId.toString()) {
        throw new Error('Access denied: You can only view your own notifications');
      } else if (userRole === 'company' && notification.companyId.toString() !== userId.toString()) {
        throw new Error('Access denied: You can only view notifications for your company');
      }

      return {
        success: true,
        data: notification
      };

    } catch (error) {
      console.error('Error getting notification:', error);
      if (error.code === 404) {
        const notFoundError = new Error('Notification not found');
        notFoundError.code = 404;
        throw notFoundError;
      }
      throw new Error(error.message || 'Failed to get notification');
    }
  }

  async patch(id, data, params) {
    try {
      const userId = params.user?._id;
      const userRole = params.user?.role;

      if (!userId) {
        throw new Error('Authentication required');
      }

      const notification = await this.notificationModel.findById(id);
      if (!notification) {
        const error = new Error('Notification not found');
        error.code = 404;
        throw error;
      }

      // Check access permissions
      if (userRole === 'student' && notification.userId.toString() !== userId.toString()) {
        throw new Error('Access denied: You can only update your own notifications');
      } else if (userRole === 'company' && notification.companyId.toString() !== userId.toString()) {
        throw new Error('Access denied: You can only update notifications for your company');
      }

      // Only allow marking as read
      if (data.status && data.status === 'read') {
        await this.notificationModel.markAsRead(id, userId);
      }

      // Get updated notification
      const updatedNotification = await this.notificationModel.findById(id);

      console.log('✅ Notification updated successfully');

      return {
        success: true,
        data: updatedNotification,
        message: 'Notification updated successfully'
      };

    } catch (error) {
      console.error('Error updating notification:', error);
      if (error.code === 404) {
        const notFoundError = new Error('Notification not found');
        notFoundError.code = 404;
        throw notFoundError;
      }
      throw new Error(error.message || 'Failed to update notification');
    }
  }

  async remove(id, params) {
    try {
      const userId = params.user?._id;
      const userRole = params.user?.role;

      if (!userId) {
        throw new Error('Authentication required');
      }

      const notification = await this.notificationModel.findById(id);
      if (!notification) {
        const error = new Error('Notification not found');
        error.code = 404;
        throw error;
      }

      // Check access permissions
      if (userRole === 'student' && notification.userId.toString() !== userId.toString()) {
        throw new Error('Access denied: You can only delete your own notifications');
      } else if (userRole === 'company' && notification.companyId.toString() !== userId.toString()) {
        throw new Error('Access denied: You can only delete notifications for your company');
      }

      await this.notificationModel.delete(id);

      console.log('✅ Notification deleted successfully');

      return {
        success: true,
        message: 'Notification deleted successfully'
      };

    } catch (error) {
      console.error('Error deleting notification:', error);
      if (error.code === 404) {
        const notFoundError = new Error('Notification not found');
        notFoundError.code = 404;
        throw notFoundError;
      }
      throw new Error(error.message || 'Failed to delete notification');
    }
  }

  async getUnreadCount(params) {
    try {
      const userId = params.user?._id;
      const userRole = params.user?.role;

      if (!userId) {
        throw new Error('Authentication required');
      }

      let count = 0;

      if (userRole === 'student') {
        count = await this.notificationModel.getUnreadCount(null, userId);
      } else if (userRole === 'company') {
        count = await this.notificationModel.getUnreadCount(userId, null);
      } else if (userRole === 'admin') {
        count = await this.notificationModel.getUnreadCount();
      }

      return {
        success: true,
        data: { unreadCount: count }
      };

    } catch (error) {
      console.error('Error getting unread count:', error);
      throw new Error(error.message || 'Failed to get unread count');
    }
  }

  async markAllAsRead(params) {
    try {
      const userId = params.user?._id;
      const userRole = params.user?.role;

      if (!userId) {
        throw new Error('Authentication required');
      }

      // Get all unread notifications for the user
      const filter = { status: 'unread' };
      
      if (userRole === 'student') {
        filter.userId = userId;
      } else if (userRole === 'company') {
        filter.companyId = userId;
      }

      const unreadNotifications = await this.notificationModel.find(filter);
      const notificationIds = unreadNotifications.map(n => n._id.toString());

      if (notificationIds.length > 0) {
        await this.notificationModel.bulkMarkAsRead(notificationIds, userId);
      }

      console.log(`✅ Marked ${notificationIds.length} notifications as read`);

      return {
        success: true,
        data: { markedCount: notificationIds.length },
        message: `Marked ${notificationIds.length} notifications as read`
      };

    } catch (error) {
      console.error('Error marking all as read:', error);
      throw new Error(error.message || 'Failed to mark all notifications as read');
    }
  }
}

module.exports = NotificationsService;
