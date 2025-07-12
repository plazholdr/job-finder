"use client";

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  Briefcase, 
  Star, 
  Calendar, 
  MessageSquare,
  TrendingUp,
  Award,
  Clock,
  ChevronDown,
  Settings,
  MarkAsRead
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'application_update' | 'job_alert' | 'interview' | 'recommendation' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  priority: 'low' | 'medium' | 'high';
  metadata?: {
    jobTitle?: string;
    companyName?: string;
    applicationId?: string;
  };
}

interface NotificationSystemProps {
  user: any;
}

const notificationIcons = {
  application_update: Briefcase,
  job_alert: Star,
  interview: Calendar,
  recommendation: TrendingUp,
  system: MessageSquare
};

const priorityColors = {
  low: 'border-l-gray-400',
  medium: 'border-l-blue-400',
  high: 'border-l-red-400'
};

export default function NotificationSystem({ user }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'application_update' | 'job_alert'>('all');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Mock notifications data
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'application_update',
        title: 'Application Status Update',
        message: 'Your application for Senior Frontend Developer at TechCorp has been reviewed and moved to the interview stage.',
        timestamp: '2024-01-20T10:30:00Z',
        read: false,
        actionUrl: '/applications',
        actionText: 'View Application',
        priority: 'high',
        metadata: {
          jobTitle: 'Senior Frontend Developer',
          companyName: 'TechCorp',
          applicationId: '1'
        }
      },
      {
        id: '2',
        type: 'interview',
        title: 'Interview Scheduled',
        message: 'Your technical interview for Full Stack Engineer at StartupXYZ is scheduled for January 25th at 2:00 PM.',
        timestamp: '2024-01-19T14:15:00Z',
        read: false,
        actionUrl: '/applications',
        actionText: 'View Details',
        priority: 'high',
        metadata: {
          jobTitle: 'Full Stack Engineer',
          companyName: 'StartupXYZ'
        }
      },
      {
        id: '3',
        type: 'job_alert',
        title: 'New Job Match',
        message: '5 new React Developer positions match your preferences and skills.',
        timestamp: '2024-01-19T09:00:00Z',
        read: true,
        actionUrl: '/pages/student-dashboard',
        actionText: 'View Jobs',
        priority: 'medium'
      },
      {
        id: '4',
        type: 'recommendation',
        title: 'New Recommendations',
        message: 'We found 3 new job recommendations based on your updated profile.',
        timestamp: '2024-01-18T16:45:00Z',
        read: true,
        actionUrl: '/pages/student-dashboard',
        actionText: 'View Recommendations',
        priority: 'medium'
      },
      {
        id: '5',
        type: 'application_update',
        title: 'Application Received',
        message: 'Your application for React Developer at WebSolutions has been successfully submitted.',
        timestamp: '2024-01-18T11:20:00Z',
        read: true,
        actionUrl: '/applications',
        actionText: 'View Application',
        priority: 'low',
        metadata: {
          jobTitle: 'React Developer',
          companyName: 'WebSolutions'
        }
      },
      {
        id: '6',
        type: 'system',
        title: 'Profile Completion',
        message: 'Complete your profile to get better job recommendations. You\'re 80% done!',
        timestamp: '2024-01-17T08:00:00Z',
        read: true,
        actionUrl: '/profile',
        actionText: 'Complete Profile',
        priority: 'medium'
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return time.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">{unreadCount} unread</span>
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex gap-2 overflow-x-auto">
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'application_update', label: 'Applications' },
                { key: 'job_alert', label: 'Job Alerts' }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as any)}
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                    filter === filterOption.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No notifications to show</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => {
                  const Icon = notificationIcons[notification.type];
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 border-l-4 ${priorityColors[notification.priority]} ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          notification.type === 'application_update' ? 'bg-green-100 text-green-600' :
                          notification.type === 'interview' ? 'bg-purple-100 text-purple-600' :
                          notification.type === 'job_alert' ? 'bg-blue-100 text-blue-600' :
                          notification.type === 'recommendation' ? 'bg-orange-100 text-orange-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs text-gray-500">
                                  {getTimeAgo(notification.timestamp)}
                                </span>
                                {notification.actionUrl && (
                                  <a
                                    href={notification.actionUrl}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                    onClick={() => {
                                      markAsRead(notification.id);
                                      setIsOpen(false);
                                    }}
                                  >
                                    {notification.actionText}
                                  </a>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 ml-2">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                  title="Mark as read"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1 text-gray-400 hover:text-red-600 rounded"
                                title="Delete notification"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              {[
                { key: 'application_updates', label: 'Application status updates' },
                { key: 'interview_reminders', label: 'Interview reminders' },
                { key: 'job_alerts', label: 'New job alerts' },
                { key: 'recommendations', label: 'Job recommendations' }
              ].map((setting) => (
                <label key={setting.key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{setting.label}</span>
                </label>
              ))}
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Push Notifications</h4>
              {[
                { key: 'urgent_updates', label: 'Urgent application updates' },
                { key: 'interview_alerts', label: 'Interview alerts' },
                { key: 'daily_digest', label: 'Daily job digest' }
              ].map((setting) => (
                <label key={setting.key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    defaultChecked={setting.key !== 'daily_digest'}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{setting.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
