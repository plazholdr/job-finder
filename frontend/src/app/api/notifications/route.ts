import { NextRequest, NextResponse } from 'next/server';

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  category: 'general' | 'application' | 'interview' | 'offer' | 'system';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
  actionText?: string;
  data?: any;
}

// Mock storage for notifications (in a real app, this would be in a database)
let notifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'mock-user-id',
    type: 'application_status',
    title: 'Application Update: Software Engineering Intern',
    message: 'Your application status has been updated to "Under Review"',
    category: 'application',
    priority: 'normal',
    isRead: false,
    createdAt: '2024-01-20T14:30:00Z',
    actionUrl: '/applications/app-1',
    actionText: 'View Application',
    data: {
      applicationId: 'app-1',
      jobTitle: 'Software Engineering Intern',
      companyName: 'TechCorp Inc',
      status: 'under_review'
    }
  },
  {
    id: 'notif-2',
    userId: 'mock-user-id',
    type: 'interview_scheduled',
    title: 'Interview Scheduled: Data Science Intern',
    message: 'Your interview is scheduled for January 25, 2024 at 2:00 PM',
    category: 'interview',
    priority: 'high',
    isRead: false,
    createdAt: '2024-01-20T13:15:00Z',
    actionUrl: '/interviews/int-1',
    actionText: 'View Interview Details',
    data: {
      interviewId: 'int-1',
      jobTitle: 'Data Science Intern',
      companyName: 'DataFlow Ltd',
      scheduledDate: '2024-01-25T14:00:00Z',
      type: 'video'
    }
  },
  {
    id: 'notif-3',
    userId: 'mock-user-id',
    type: 'offer_received',
    title: 'Job Offer: Frontend Developer Intern',
    message: 'Congratulations! You have received a job offer from InnovateTech',
    category: 'offer',
    priority: 'urgent',
    isRead: true,
    createdAt: '2024-01-20T10:45:00Z',
    actionUrl: '/offers/offer-1',
    actionText: 'View Offer',
    expiresAt: '2024-01-27T23:59:59Z',
    data: {
      offerId: 'offer-1',
      jobTitle: 'Frontend Developer Intern',
      companyName: 'InnovateTech',
      salary: '$30/hour',
      startDate: '2024-02-01'
    }
  },
  {
    id: 'notif-4',
    userId: 'mock-user-id',
    type: 'system',
    title: 'Profile Completion Reminder',
    message: 'Complete your profile to increase your chances of getting hired',
    category: 'system',
    priority: 'low',
    isRead: true,
    createdAt: '2024-01-19T16:20:00Z',
    actionUrl: '/profile',
    actionText: 'Complete Profile'
  },
  {
    id: 'notif-5',
    userId: 'mock-user-id',
    type: 'application_status',
    title: 'Application Update: Marketing Intern',
    message: 'Your application has been submitted successfully',
    category: 'application',
    priority: 'normal',
    isRead: true,
    createdAt: '2024-01-19T11:30:00Z',
    actionUrl: '/applications/app-2',
    actionText: 'View Application',
    data: {
      applicationId: 'app-2',
      jobTitle: 'Marketing Intern',
      companyName: 'Creative Agency',
      status: 'submitted'
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const isRead = searchParams.get('isRead');
    const priority = searchParams.get('priority');

    // Mock user ID (in a real app, this would come from authentication)
    const userId = 'mock-user-id';

    let filteredNotifications = notifications.filter(n => n.userId === userId);

    // Apply filters
    if (category && category !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.category === category);
    }

    if (isRead && isRead !== 'all') {
      const readFilter = isRead === 'true';
      filteredNotifications = filteredNotifications.filter(n => n.isRead === readFilter);
    }

    if (priority && priority !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.priority === priority);
    }

    // Remove expired notifications
    const now = new Date();
    filteredNotifications = filteredNotifications.filter(n =>
      !n.expiresAt || new Date(n.expiresAt) > now
    );

    // Sort by creation date (newest first)
    filteredNotifications.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Calculate unread count
    const unreadCount = notifications.filter(n => n.userId === userId && !n.isRead).length;

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total: filteredNotifications.length,
          pages: Math.ceil(filteredNotifications.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch notifications'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { notificationIds, action } = await request.json();

    // Mock user ID (in a real app, this would come from authentication)
    const userId = 'mock-user-id';

    if (action === 'mark_read') {
      notifications = notifications.map(notification => {
        if (notification.userId === userId && notificationIds.includes(notification.id)) {
          return { ...notification, read: true };
        }
        return notification;
      });
    } else if (action === 'mark_all_read') {
      notifications = notifications.map(notification => {
        if (notification.userId === userId) {
          return { ...notification, read: true };
        }
        return notification;
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications updated successfully'
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update notifications'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { notificationIds } = await request.json();

    // Mock user ID (in a real app, this would come from authentication)
    const userId = 'mock-user-id';

    notifications = notifications.filter(notification =>
      !(notification.userId === userId && notificationIds.includes(notification.id))
    );

    return NextResponse.json({
      success: true,
      message: 'Notifications deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete notifications'
      },
      { status: 500 }
    );
  }
}

// Helper function to create notifications (used by other parts of the system)
export function createNotification(notification: Omit<Notification, 'id' | 'timestamp'>) {
  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date()
  };

  notifications.push(newNotification);
  return newNotification;
}
