import { NextRequest, NextResponse } from 'next/server';

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'in_app' | 'webhook';
  trigger: 'application_received' | 'application_reviewed' | 'interview_scheduled' | 'interview_completed' | 
           'offer_extended' | 'offer_accepted' | 'offer_declined' | 'application_rejected' | 
           'application_on_hold' | 'application_resumed' | 'reminder' | 'escalation';
  recipient: 'candidate' | 'hiring_manager' | 'interviewer' | 'hr_team' | 'admin' | 'custom';
  subject: string;
  bodyTemplate: string;
  isActive: boolean;
  isDefault: boolean;
  variables: string[]; // Available template variables
  conditions?: Array<{
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  }>;
  delay?: number; // Minutes to delay sending
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
}

interface NotificationQueue {
  id: string;
  templateId: string;
  type: 'email' | 'sms' | 'in_app' | 'webhook';
  recipient: {
    id: string;
    email?: string;
    phone?: string;
    name: string;
    type: 'candidate' | 'employee';
  };
  subject: string;
  body: string;
  data: Record<string, any>; // Context data for the notification
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  scheduledAt: Date;
  sentAt?: Date;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  applicationId?: string;
  jobId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NotificationSettings {
  id: string;
  userId: string;
  userType: 'candidate' | 'company';
  emailNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
  notificationTypes: {
    application_updates: boolean;
    interview_reminders: boolean;
    offer_updates: boolean;
    general_updates: boolean;
    marketing: boolean;
  };
  frequency: 'immediate' | 'daily_digest' | 'weekly_digest';
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string;
    timezone: string;
  };
  updatedAt: Date;
}

// Mock notification templates
let mockNotificationTemplates: NotificationTemplate[] = [
  {
    id: 'template-1',
    name: 'Application Received Confirmation',
    type: 'email',
    trigger: 'application_received',
    recipient: 'candidate',
    subject: 'Application Received - {{jobTitle}} at {{companyName}}',
    bodyTemplate: `Dear {{candidateName}},

Thank you for your application for the {{jobTitle}} position at {{companyName}}.

We have successfully received your application and our team will review it carefully. You can expect to hear from us within {{reviewTimeframe}} business days.

Application Details:
- Position: {{jobTitle}}
- Application ID: {{applicationId}}
- Submitted: {{submittedDate}}

You can track your application status at: {{applicationTrackingUrl}}

Best regards,
{{companyName}} Hiring Team`,
    isActive: true,
    isDefault: true,
    variables: ['candidateName', 'jobTitle', 'companyName', 'applicationId', 'submittedDate', 'reviewTimeframe', 'applicationTrackingUrl'],
    priority: 'medium',
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z')
  },
  {
    id: 'template-2',
    name: 'Interview Scheduled Notification',
    type: 'email',
    trigger: 'interview_scheduled',
    recipient: 'candidate',
    subject: 'Interview Scheduled - {{jobTitle}} at {{companyName}}',
    bodyTemplate: `Dear {{candidateName}},

Great news! We would like to invite you for an interview for the {{jobTitle}} position.

Interview Details:
- Date: {{interviewDate}}
- Time: {{interviewTime}}
- Duration: {{interviewDuration}} minutes
- Type: {{interviewType}}
{{#if meetingLink}}
- Meeting Link: {{meetingLink}}
{{/if}}
{{#if location}}
- Location: {{location}}
{{/if}}
- Interviewer: {{interviewerName}}

{{#if agenda}}
Interview Agenda:
{{agenda}}
{{/if}}

Please confirm your attendance by replying to this email or clicking: {{confirmationLink}}

If you need to reschedule, please contact us at least 24 hours in advance.

Best regards,
{{companyName}} Hiring Team`,
    isActive: true,
    isDefault: true,
    variables: ['candidateName', 'jobTitle', 'companyName', 'interviewDate', 'interviewTime', 'interviewDuration', 'interviewType', 'meetingLink', 'location', 'interviewerName', 'agenda', 'confirmationLink'],
    priority: 'high',
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z')
  },
  {
    id: 'template-3',
    name: 'Application Rejected',
    type: 'email',
    trigger: 'application_rejected',
    recipient: 'candidate',
    subject: 'Update on Your Application - {{jobTitle}} at {{companyName}}',
    bodyTemplate: `Dear {{candidateName}},

Thank you for your interest in the {{jobTitle}} position at {{companyName}} and for taking the time to apply.

After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs.

{{#if feedback}}
Feedback:
{{feedback}}
{{/if}}

{{#if futureOpportunities}}
We were impressed with your background and encourage you to apply for future opportunities that match your skills and experience. We will keep your information on file for future consideration.
{{/if}}

Thank you again for your interest in {{companyName}}.

Best regards,
{{companyName}} Hiring Team`,
    isActive: true,
    isDefault: true,
    variables: ['candidateName', 'jobTitle', 'companyName', 'feedback', 'futureOpportunities'],
    priority: 'medium',
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z')
  },
  {
    id: 'template-4',
    name: 'Offer Extended',
    type: 'email',
    trigger: 'offer_extended',
    recipient: 'candidate',
    subject: 'Job Offer - {{jobTitle}} at {{companyName}}',
    bodyTemplate: `Dear {{candidateName}},

Congratulations! We are pleased to extend an offer for the {{jobTitle}} position at {{companyName}}.

Offer Details:
- Position: {{jobTitle}}
- Start Date: {{startDate}}
- End Date: {{endDate}}
- Compensation: {{salary}} {{currency}} per {{period}}
{{#if benefits}}
- Benefits: {{benefits}}
{{/if}}

This offer is valid until {{offerExpiry}}. Please review the attached offer letter for complete terms and conditions.

To accept this offer, please:
1. Review the offer letter carefully
2. Sign and return the offer letter
3. Complete any required pre-employment requirements

We are excited about the possibility of you joining our team!

Best regards,
{{companyName}} Hiring Team`,
    isActive: true,
    isDefault: true,
    variables: ['candidateName', 'jobTitle', 'companyName', 'startDate', 'endDate', 'salary', 'currency', 'period', 'benefits', 'offerExpiry'],
    priority: 'high',
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z')
  },
  {
    id: 'template-5',
    name: 'Application On Hold',
    type: 'email',
    trigger: 'application_on_hold',
    recipient: 'candidate',
    subject: 'Update on Your Application - {{jobTitle}} at {{companyName}}',
    bodyTemplate: `Dear {{candidateName}},

Thank you for your continued interest in the {{jobTitle}} position at {{companyName}}.

We wanted to update you on the status of your application. We are currently reviewing some internal processes and your application is temporarily on hold.

{{#if candidateMessage}}
{{candidateMessage}}
{{/if}}

We expect to resume the review process by {{expectedResumeDate}} and will contact you with an update at that time.

We appreciate your patience and understanding.

Best regards,
{{companyName}} Hiring Team`,
    isActive: true,
    isDefault: true,
    variables: ['candidateName', 'jobTitle', 'companyName', 'candidateMessage', 'expectedResumeDate'],
    priority: 'medium',
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z')
  }
];

// Mock notification queue
let mockNotificationQueue: NotificationQueue[] = [];

// Mock notification settings
let mockNotificationSettings: NotificationSettings[] = [
  {
    id: 'settings-1',
    userId: 'candidate-1',
    userType: 'candidate',
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true,
    notificationTypes: {
      application_updates: true,
      interview_reminders: true,
      offer_updates: true,
      general_updates: true,
      marketing: false
    },
    frequency: 'immediate',
    quietHours: {
      enabled: true,
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'America/New_York'
    },
    updatedAt: new Date('2024-01-20T14:30:00Z')
  }
];

// GET notification data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'templates';
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (type === 'templates') {
      const trigger = searchParams.get('trigger');
      const recipient = searchParams.get('recipient');
      
      let templates = [...mockNotificationTemplates];
      
      if (trigger) {
        templates = templates.filter(t => t.trigger === trigger);
      }
      
      if (recipient) {
        templates = templates.filter(t => t.recipient === recipient);
      }
      
      return NextResponse.json({
        success: true,
        data: templates
      });
    }

    if (type === 'queue') {
      let queue = [...mockNotificationQueue];
      
      if (status) {
        queue = queue.filter(n => n.status === status);
      }
      
      // Sort by priority and scheduled time
      queue.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
      });
      
      return NextResponse.json({
        success: true,
        data: queue,
        metadata: {
          total: queue.length,
          pending: queue.filter(n => n.status === 'pending').length,
          sent: queue.filter(n => n.status === 'sent').length,
          failed: queue.filter(n => n.status === 'failed').length
        }
      });
    }

    if (type === 'settings') {
      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            error: 'User ID is required for settings'
          },
          { status: 400 }
        );
      }
      
      const settings = mockNotificationSettings.find(s => s.userId === userId);
      
      if (!settings) {
        return NextResponse.json(
          {
            success: false,
            error: 'Notification settings not found'
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: settings
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid type parameter'
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error fetching notification data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST send notification or create template
export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();

    if (action === 'send') {
      // Send immediate notification
      const notification = await createNotification(data);
      
      // In a real application, you would send the notification here
      // For now, we'll just add it to the queue and mark as sent
      notification.status = 'sent';
      notification.sentAt = new Date();
      
      mockNotificationQueue.push(notification);
      
      return NextResponse.json({
        success: true,
        data: notification,
        message: 'Notification sent successfully'
      });
    }

    if (action === 'queue') {
      // Queue notification for later sending
      const notification = await createNotification(data);
      mockNotificationQueue.push(notification);
      
      return NextResponse.json({
        success: true,
        data: notification,
        message: 'Notification queued successfully'
      });
    }

    if (action === 'trigger') {
      // Trigger workflow-based notification
      const notifications = await triggerWorkflowNotification(data);
      
      return NextResponse.json({
        success: true,
        data: notifications,
        message: `${notifications.length} notification(s) triggered`
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action'
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error processing notification:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Helper function to create notification
async function createNotification(data: any): Promise<NotificationQueue> {
  const template = mockNotificationTemplates.find(t => t.id === data.templateId);
  
  if (!template) {
    throw new Error('Template not found');
  }

  // Process template variables
  const processedSubject = processTemplate(template.subject, data.variables || {});
  const processedBody = processTemplate(template.bodyTemplate, data.variables || {});

  const notification: NotificationQueue = {
    id: `notification-${Date.now()}`,
    templateId: template.id,
    type: template.type,
    recipient: data.recipient,
    subject: processedSubject,
    body: processedBody,
    data: data.variables || {},
    status: 'pending',
    scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : new Date(),
    retryCount: 0,
    maxRetries: 3,
    priority: data.priority || template.priority,
    applicationId: data.applicationId,
    jobId: data.jobId,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return notification;
}

// Helper function to trigger workflow notifications
async function triggerWorkflowNotification(data: any): Promise<NotificationQueue[]> {
  const { trigger, applicationData, jobData, candidateData } = data;
  
  // Find templates for this trigger
  const templates = mockNotificationTemplates.filter(t => 
    t.trigger === trigger && t.isActive
  );
  
  const notifications: NotificationQueue[] = [];
  
  for (const template of templates) {
    // Check conditions if any
    if (template.conditions && !evaluateConditions(template.conditions, data)) {
      continue;
    }
    
    // Determine recipient
    let recipient;
    if (template.recipient === 'candidate' && candidateData) {
      recipient = {
        id: candidateData.id,
        email: candidateData.email,
        name: candidateData.name,
        type: 'candidate' as const
      };
    } else if (template.recipient === 'hiring_manager' && jobData?.hiringManager) {
      recipient = {
        id: jobData.hiringManager.id,
        email: jobData.hiringManager.email,
        name: jobData.hiringManager.name,
        type: 'employee' as const
      };
    }
    
    if (!recipient) continue;
    
    // Prepare template variables
    const variables = {
      candidateName: candidateData?.name || '',
      jobTitle: jobData?.title || '',
      companyName: jobData?.company?.name || 'Our Company',
      applicationId: applicationData?.id || '',
      submittedDate: applicationData?.submittedAt ? new Date(applicationData.submittedAt).toLocaleDateString() : '',
      ...data.customVariables
    };
    
    const notification = await createNotification({
      templateId: template.id,
      recipient,
      variables,
      applicationId: applicationData?.id,
      jobId: jobData?.id,
      scheduledAt: template.delay ? new Date(Date.now() + template.delay * 60 * 1000) : undefined
    });
    
    notifications.push(notification);
  }
  
  // Add to queue
  mockNotificationQueue.push(...notifications);
  
  return notifications;
}

// Helper function to process template variables
function processTemplate(template: string, variables: Record<string, any>): string {
  let processed = template;
  
  // Replace simple variables {{variable}}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processed = processed.replace(regex, String(value || ''));
  });
  
  // Handle conditional blocks {{#if variable}}...{{/if}}
  processed = processed.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, variable, content) => {
    return variables[variable] ? content : '';
  });
  
  return processed;
}

// Helper function to evaluate conditions
function evaluateConditions(conditions: any[], data: any): boolean {
  return conditions.every(condition => {
    const value = data[condition.field];
    
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'contains':
        return String(value).includes(String(condition.value));
      case 'greater_than':
        return Number(value) > Number(condition.value);
      case 'less_than':
        return Number(value) < Number(condition.value);
      default:
        return true;
    }
  });
}
