const logger = require('../logger');

class NotificationService {
  constructor(app) {
    this.app = app;
    this.userModel = app.get('userModel');
    this.emailService = app.get('emailService');
  }

  // Create notification
  async createNotification(userId, notification) {
    try {
      const notificationData = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {},
        isRead: false,
        createdAt: new Date(),
        expiresAt: notification.expiresAt || null,
        priority: notification.priority || 'normal', // low, normal, high, urgent
        category: notification.category || 'general', // general, application, interview, offer, system
        actionUrl: notification.actionUrl || null,
        actionText: notification.actionText || null
      };

      // Add notification to user's notifications array
      await this.userModel.collection.updateOne(
        { _id: this.userModel.toObjectId(userId) },
        {
          $push: {
            notifications: {
              $each: [notificationData],
              $position: 0, // Add to beginning of array
              $slice: 100 // Keep only latest 100 notifications
            }
          },
          $inc: { unreadNotificationCount: 1 }
        }
      );

      // Emit real-time notification if socket.io is available
      if (this.app.io) {
        this.app.io.to(`user-${userId}`).emit('notification', notificationData);
      }

      logger.info('Notification created', { userId, type: notification.type, title: notification.title });
      return notificationData;
    } catch (error) {
      logger.error('Error creating notification', { error: error.message, userId });
      throw error;
    }
  }

  // Get user notifications
  async getUserNotifications(userId, filters = {}) {
    try {
      const { page = 1, limit = 20, category, isRead, priority } = filters;
      const skip = (page - 1) * limit;

      const user = await this.userModel.collection.findOne(
        { _id: this.userModel.toObjectId(userId) },
        { projection: { notifications: 1, unreadNotificationCount: 1 } }
      );

      if (!user) {
        throw new Error('User not found');
      }

      let notifications = user.notifications || [];

      // Apply filters
      if (category) {
        notifications = notifications.filter(n => n.category === category);
      }
      if (typeof isRead === 'boolean') {
        notifications = notifications.filter(n => n.isRead === isRead);
      }
      if (priority) {
        notifications = notifications.filter(n => n.priority === priority);
      }

      // Remove expired notifications
      const now = new Date();
      notifications = notifications.filter(n => !n.expiresAt || new Date(n.expiresAt) > now);

      // Apply pagination
      const total = notifications.length;
      const paginatedNotifications = notifications.slice(skip, skip + limit);

      return {
        notifications: paginatedNotifications,
        unreadCount: user.unreadNotificationCount || 0,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error fetching user notifications', { error: error.message, userId });
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(userId, notificationId) {
    try {
      const result = await this.userModel.collection.updateOne(
        {
          _id: this.userModel.toObjectId(userId),
          'notifications.id': notificationId,
          'notifications.isRead': false
        },
        {
          $set: { 'notifications.$.isRead': true },
          $inc: { unreadNotificationCount: -1 }
        }
      );

      if (result.modifiedCount > 0) {
        logger.info('Notification marked as read', { userId, notificationId });
        return { success: true };
      } else {
        return { success: false, message: 'Notification not found or already read' };
      }
    } catch (error) {
      logger.error('Error marking notification as read', { error: error.message, userId, notificationId });
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      await this.userModel.collection.updateOne(
        { _id: this.userModel.toObjectId(userId) },
        {
          $set: {
            'notifications.$[].isRead': true,
            unreadNotificationCount: 0
          }
        }
      );

      logger.info('All notifications marked as read', { userId });
      return { success: true };
    } catch (error) {
      logger.error('Error marking all notifications as read', { error: error.message, userId });
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(userId, notificationId) {
    try {
      const user = await this.userModel.collection.findOne(
        { _id: this.userModel.toObjectId(userId) },
        { projection: { notifications: 1 } }
      );

      if (!user) {
        throw new Error('User not found');
      }

      const notification = user.notifications?.find(n => n.id === notificationId);
      const wasUnread = notification && !notification.isRead;

      const updateQuery = {
        $pull: { notifications: { id: notificationId } }
      };

      if (wasUnread) {
        updateQuery.$inc = { unreadNotificationCount: -1 };
      }

      await this.userModel.collection.updateOne(
        { _id: this.userModel.toObjectId(userId) },
        updateQuery
      );

      logger.info('Notification deleted', { userId, notificationId });
      return { success: true };
    } catch (error) {
      logger.error('Error deleting notification', { error: error.message, userId, notificationId });
      throw error;
    }
  }

  // Predefined notification templates
  async sendApplicationStatusNotification(userId, application, newStatus) {
    const statusMessages = {
      'submitted': 'Your application has been submitted successfully',
      'under_review': 'Your application is now under review',
      'interview_scheduled': 'An interview has been scheduled for your application',
      'interview_completed': 'Your interview has been completed',
      'accepted': 'Congratulations! Your application has been accepted',
      'rejected': 'Your application was not selected this time',
      'withdrawn': 'Your application has been withdrawn'
    };

    const statusColors = {
      'submitted': 'blue',
      'under_review': 'yellow',
      'interview_scheduled': 'purple',
      'interview_completed': 'cyan',
      'accepted': 'green',
      'rejected': 'red',
      'withdrawn': 'gray'
    };

    const notification = {
      type: 'application_status',
      title: `Application Update: ${application.jobTitle}`,
      message: statusMessages[newStatus] || 'Your application status has been updated',
      category: 'application',
      priority: ['accepted', 'rejected', 'interview_scheduled'].includes(newStatus) ? 'high' : 'normal',
      data: {
        applicationId: application.id,
        jobId: application.jobId,
        jobTitle: application.jobTitle,
        companyName: application.companyName,
        status: newStatus,
        statusColor: statusColors[newStatus]
      },
      actionUrl: `/applications/${application.id}`,
      actionText: 'View Application'
    };

    return this.createNotification(userId, notification);
  }

  async sendInterviewNotification(userId, interview) {
    const notification = {
      type: 'interview_scheduled',
      title: `Interview Scheduled: ${interview.jobTitle}`,
      message: `Your interview is scheduled for ${new Date(interview.scheduledDate).toLocaleDateString()}`,
      category: 'interview',
      priority: 'high',
      data: {
        interviewId: interview.id,
        jobId: interview.jobId,
        jobTitle: interview.jobTitle,
        companyName: interview.companyName,
        scheduledDate: interview.scheduledDate,
        type: interview.type,
        duration: interview.duration
      },
      actionUrl: `/interviews/${interview.id}`,
      actionText: 'View Interview Details'
    };

    return this.createNotification(userId, notification);
  }

  async sendOfferNotification(userId, offer) {
    const notification = {
      type: 'offer_received',
      title: `Job Offer: ${offer.jobTitle}`,
      message: `You've received a job offer from ${offer.companyName}`,
      category: 'offer',
      priority: 'urgent',
      data: {
        offerId: offer.id,
        jobId: offer.jobId,
        jobTitle: offer.jobTitle,
        companyName: offer.companyName,
        salary: offer.salary,
        startDate: offer.startDate,
        expiresAt: offer.expiresAt
      },
      actionUrl: `/offers/${offer.id}`,
      actionText: 'View Offer',
      expiresAt: offer.expiresAt
    };

    return this.createNotification(userId, notification);
  }

  async sendSystemNotification(userId, title, message, data = {}) {
    const notification = {
      type: 'system',
      title,
      message,
      category: 'system',
      priority: 'normal',
      data
    };

    return this.createNotification(userId, notification);
  }

  // Clean up expired notifications
  async cleanupExpiredNotifications() {
    try {
      const now = new Date();

      await this.userModel.collection.updateMany(
        { 'notifications.expiresAt': { $lt: now } },
        { $pull: { notifications: { expiresAt: { $lt: now } } } }
      );

      logger.info('Expired notifications cleaned up');
    } catch (error) {
      logger.error('Error cleaning up expired notifications', { error: error.message });
    }
  }
}

module.exports = NotificationService;
