import { NextRequest, NextResponse } from 'next/server';

interface NotificationLog {
  id: string;
  templateId: string;
  templateName: string;
  recipient: {
    id: string;
    name: string;
    email: string;
    type: 'candidate' | 'company';
  };
  type: 'email' | 'sms' | 'in_app';
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  sentAt: Date;
  deliveredAt?: Date;
  applicationId?: string;
  error?: string;
  metadata?: {
    subject?: string;
    messageId?: string;
    provider?: string;
  };
}

// Mock notification logs data
let mockLogs: NotificationLog[] = [
  {
    id: 'log-1',
    templateId: 'template-1',
    templateName: 'Application Received Confirmation',
    recipient: {
      id: 'candidate-1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      type: 'candidate'
    },
    type: 'email',
    status: 'delivered',
    sentAt: new Date('2024-01-22T10:30:00Z'),
    deliveredAt: new Date('2024-01-22T10:31:15Z'),
    applicationId: 'app-1',
    metadata: {
      subject: 'Application Received - Software Engineer Intern at TechCorp',
      messageId: 'msg-12345',
      provider: 'sendgrid'
    }
  },
  {
    id: 'log-2',
    templateId: 'template-2',
    templateName: 'Application Accepted Notification',
    recipient: {
      id: 'candidate-2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      type: 'candidate'
    },
    type: 'email',
    status: 'delivered',
    sentAt: new Date('2024-01-21T14:20:00Z'),
    deliveredAt: new Date('2024-01-21T14:21:30Z'),
    applicationId: 'app-2',
    metadata: {
      subject: 'Great News! Your Application Has Been Accepted - Frontend Developer Intern',
      messageId: 'msg-12346',
      provider: 'sendgrid'
    }
  },
  {
    id: 'log-3',
    templateId: 'template-3',
    templateName: 'Interview Scheduled Notification',
    recipient: {
      id: 'candidate-3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      type: 'candidate'
    },
    type: 'email',
    status: 'delivered',
    sentAt: new Date('2024-01-20T16:45:00Z'),
    deliveredAt: new Date('2024-01-20T16:46:22Z'),
    applicationId: 'app-3',
    metadata: {
      subject: 'Interview Scheduled - Backend Developer Intern at TechCorp',
      messageId: 'msg-12347',
      provider: 'sendgrid'
    }
  },
  {
    id: 'log-4',
    templateId: 'template-4',
    templateName: 'Job Offer Extended',
    recipient: {
      id: 'candidate-4',
      name: 'David Kim',
      email: 'david.kim@email.com',
      type: 'candidate'
    },
    type: 'email',
    status: 'delivered',
    sentAt: new Date('2024-01-19T11:15:00Z'),
    deliveredAt: new Date('2024-01-19T11:16:45Z'),
    applicationId: 'app-4',
    metadata: {
      subject: 'Job Offer - ML Engineer Intern at TechCorp',
      messageId: 'msg-12348',
      provider: 'sendgrid'
    }
  },
  {
    id: 'log-5',
    templateId: 'template-5',
    templateName: 'Application Rejected - Thank You',
    recipient: {
      id: 'candidate-5',
      name: 'Jessica Wang',
      email: 'jessica.wang@email.com',
      type: 'candidate'
    },
    type: 'email',
    status: 'delivered',
    sentAt: new Date('2024-01-18T09:30:00Z'),
    deliveredAt: new Date('2024-01-18T09:31:12Z'),
    applicationId: 'app-5',
    metadata: {
      subject: 'Update on Your Application - Data Analyst Intern at TechCorp',
      messageId: 'msg-12349',
      provider: 'sendgrid'
    }
  },
  {
    id: 'log-6',
    templateId: 'template-1',
    templateName: 'Application Received Confirmation',
    recipient: {
      id: 'candidate-6',
      name: 'Alex Thompson',
      email: 'alex.thompson@email.com',
      type: 'candidate'
    },
    type: 'email',
    status: 'failed',
    sentAt: new Date('2024-01-17T15:20:00Z'),
    applicationId: 'app-6',
    error: 'Invalid email address',
    metadata: {
      subject: 'Application Received - UX Designer Intern at TechCorp',
      provider: 'sendgrid'
    }
  },
  {
    id: 'log-7',
    templateId: 'template-3',
    templateName: 'Interview Scheduled Notification',
    recipient: {
      id: 'candidate-7',
      name: 'Maria Garcia',
      email: 'maria.garcia@email.com',
      type: 'candidate'
    },
    type: 'email',
    status: 'pending',
    sentAt: new Date('2024-01-23T08:00:00Z'),
    applicationId: 'app-7',
    metadata: {
      subject: 'Interview Scheduled - Product Manager Intern at TechCorp',
      provider: 'sendgrid'
    }
  },
  {
    id: 'log-8',
    templateId: 'template-2',
    templateName: 'Application Accepted Notification',
    recipient: {
      id: 'candidate-8',
      name: 'James Wilson',
      email: 'james.wilson@email.com',
      type: 'candidate'
    },
    type: 'sms',
    status: 'delivered',
    sentAt: new Date('2024-01-16T12:30:00Z'),
    deliveredAt: new Date('2024-01-16T12:30:45Z'),
    applicationId: 'app-8',
    metadata: {
      provider: 'twilio'
    }
  }
];

// GET notification logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const templateId = searchParams.get('templateId');
    const applicationId = searchParams.get('applicationId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let filteredLogs = [...mockLogs];

    // Apply filters
    if (status && status !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.status === status);
    }

    if (type && type !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.type === type);
    }

    if (templateId) {
      filteredLogs = filteredLogs.filter(log => log.templateId === templateId);
    }

    if (applicationId) {
      filteredLogs = filteredLogs.filter(log => log.applicationId === applicationId);
    }

    // Sort by sent date (most recent first)
    filteredLogs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

    // Apply pagination
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    // Calculate summary statistics
    const totalLogs = filteredLogs.length;
    const statusCounts = filteredLogs.reduce((acc, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeCounts = filteredLogs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        total: totalLogs,
        limit,
        offset,
        hasMore: offset + limit < totalLogs
      },
      summary: {
        statusCounts,
        typeCounts,
        deliveryRate: statusCounts.delivered ? 
          ((statusCounts.delivered / totalLogs) * 100).toFixed(1) : '0.0'
      }
    });

  } catch (error) {
    console.error('Error fetching notification logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST create new notification log (for testing/manual entries)
export async function POST(request: NextRequest) {
  try {
    const logData = await request.json();

    // Validate required fields
    const requiredFields = ['templateId', 'templateName', 'recipient', 'type', 'status'];
    for (const field of requiredFields) {
      if (!logData[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `${field} is required`
          },
          { status: 400 }
        );
      }
    }

    // Validate enum values
    const validTypes = ['email', 'sms', 'in_app'];
    const validStatuses = ['sent', 'delivered', 'failed', 'pending'];

    if (!validTypes.includes(logData.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid type value'
        },
        { status: 400 }
      );
    }

    if (!validStatuses.includes(logData.status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status value'
        },
        { status: 400 }
      );
    }

    // Create new log entry
    const newLog: NotificationLog = {
      id: `log-${Date.now()}`,
      templateId: logData.templateId,
      templateName: logData.templateName,
      recipient: logData.recipient,
      type: logData.type,
      status: logData.status,
      sentAt: new Date(),
      deliveredAt: logData.status === 'delivered' ? new Date() : undefined,
      applicationId: logData.applicationId,
      error: logData.error,
      metadata: logData.metadata
    };

    mockLogs.unshift(newLog); // Add to beginning for chronological order

    return NextResponse.json({
      success: true,
      data: newLog,
      message: 'Notification log created successfully'
    });

  } catch (error) {
    console.error('Error creating notification log:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
