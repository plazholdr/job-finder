import { NextRequest, NextResponse } from 'next/server';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'ats' | 'hris' | 'calendar' | 'communication' | 'assessment' | 'background_check' | 'analytics' | 'other';
  provider: string;
  logoUrl: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  isEnabled: boolean;
  isPremium: boolean;
  configuration: {
    apiKey?: string;
    webhookUrl?: string;
    syncFrequency?: 'real_time' | 'hourly' | 'daily' | 'weekly';
    dataMapping?: Record<string, string>;
    customFields?: Array<{
      name: string;
      type: string;
      required: boolean;
    }>;
  };
  features: string[];
  permissions: string[];
  lastSync?: Date;
  syncStatus?: 'success' | 'failed' | 'in_progress';
  errorMessage?: string;
  usage: {
    apiCalls: number;
    dataTransferred: number; // in MB
    lastUsed: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Mock integrations data
let mockIntegrations: Integration[] = [
  {
    id: 'integration-1',
    name: 'Greenhouse ATS',
    description: 'Sync job postings and candidate data with Greenhouse ATS',
    category: 'ats',
    provider: 'Greenhouse',
    logoUrl: '/logos/greenhouse.png',
    status: 'connected',
    isEnabled: true,
    isPremium: true,
    configuration: {
      apiKey: 'gh_***************',
      webhookUrl: 'https://api.company.com/webhooks/greenhouse',
      syncFrequency: 'real_time',
      dataMapping: {
        'candidate_name': 'full_name',
        'candidate_email': 'email_address',
        'job_title': 'position_title'
      }
    },
    features: [
      'Job posting sync',
      'Candidate data sync',
      'Interview scheduling',
      'Offer management',
      'Real-time webhooks'
    ],
    permissions: [
      'read_jobs',
      'write_jobs',
      'read_candidates',
      'write_candidates',
      'read_interviews',
      'write_interviews'
    ],
    lastSync: new Date('2024-01-22T14:30:00Z'),
    syncStatus: 'success',
    usage: {
      apiCalls: 1250,
      dataTransferred: 45.2,
      lastUsed: new Date('2024-01-22T14:30:00Z')
    },
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-22T14:30:00Z')
  },
  {
    id: 'integration-2',
    name: 'BambooHR',
    description: 'Sync employee data and onboarding workflows with BambooHR',
    category: 'hris',
    provider: 'BambooHR',
    logoUrl: '/logos/bamboohr.png',
    status: 'connected',
    isEnabled: true,
    isPremium: false,
    configuration: {
      apiKey: 'bhr_***************',
      syncFrequency: 'daily',
      dataMapping: {
        'employee_id': 'emp_id',
        'start_date': 'hire_date',
        'department': 'dept_name'
      }
    },
    features: [
      'Employee data sync',
      'Onboarding workflows',
      'Time off management',
      'Performance reviews'
    ],
    permissions: [
      'read_employees',
      'write_employees',
      'read_time_off',
      'read_performance'
    ],
    lastSync: new Date('2024-01-22T08:00:00Z'),
    syncStatus: 'success',
    usage: {
      apiCalls: 450,
      dataTransferred: 12.8,
      lastUsed: new Date('2024-01-22T08:00:00Z')
    },
    createdAt: new Date('2024-01-12T11:00:00Z'),
    updatedAt: new Date('2024-01-22T08:00:00Z')
  },
  {
    id: 'integration-3',
    name: 'Google Calendar',
    description: 'Sync interview schedules and company events with Google Calendar',
    category: 'calendar',
    provider: 'Google',
    logoUrl: '/logos/google-calendar.png',
    status: 'connected',
    isEnabled: true,
    isPremium: false,
    configuration: {
      syncFrequency: 'real_time',
      dataMapping: {
        'interview_title': 'event_title',
        'interview_time': 'event_start',
        'interviewer': 'organizer'
      }
    },
    features: [
      'Interview scheduling',
      'Calendar sync',
      'Meeting reminders',
      'Availability checking'
    ],
    permissions: [
      'read_calendar',
      'write_calendar',
      'read_events',
      'write_events'
    ],
    lastSync: new Date('2024-01-22T15:45:00Z'),
    syncStatus: 'success',
    usage: {
      apiCalls: 890,
      dataTransferred: 5.2,
      lastUsed: new Date('2024-01-22T15:45:00Z')
    },
    createdAt: new Date('2024-01-08T14:00:00Z'),
    updatedAt: new Date('2024-01-22T15:45:00Z')
  },
  {
    id: 'integration-4',
    name: 'Slack',
    description: 'Send notifications and updates to Slack channels',
    category: 'communication',
    provider: 'Slack',
    logoUrl: '/logos/slack.png',
    status: 'error',
    isEnabled: false,
    isPremium: false,
    configuration: {
      webhookUrl: 'https://hooks.slack.com/services/***',
      syncFrequency: 'real_time'
    },
    features: [
      'Notification delivery',
      'Channel updates',
      'Direct messages',
      'Bot integration'
    ],
    permissions: [
      'send_messages',
      'read_channels',
      'manage_bot'
    ],
    lastSync: new Date('2024-01-21T10:20:00Z'),
    syncStatus: 'failed',
    errorMessage: 'Invalid webhook URL. Please check your configuration.',
    usage: {
      apiCalls: 125,
      dataTransferred: 0.8,
      lastUsed: new Date('2024-01-21T10:20:00Z')
    },
    createdAt: new Date('2024-01-15T16:30:00Z'),
    updatedAt: new Date('2024-01-21T10:20:00Z')
  }
];

// Available integrations catalog
const availableIntegrations = [
  {
    id: 'workday',
    name: 'Workday',
    description: 'Enterprise HR and finance management system',
    category: 'hris',
    provider: 'Workday',
    logoUrl: '/logos/workday.png',
    isPremium: true,
    features: ['Employee management', 'Payroll integration', 'Benefits administration', 'Talent management']
  },
  {
    id: 'lever',
    name: 'Lever',
    description: 'Modern ATS and recruiting platform',
    category: 'ats',
    provider: 'Lever',
    logoUrl: '/logos/lever.png',
    isPremium: true,
    features: ['Candidate tracking', 'Interview coordination', 'Offer management', 'Analytics']
  },
  {
    id: 'codility',
    name: 'Codility',
    description: 'Technical assessment and coding challenges',
    category: 'assessment',
    provider: 'Codility',
    logoUrl: '/logos/codility.png',
    isPremium: true,
    features: ['Coding assessments', 'Technical interviews', 'Skill evaluation', 'Anti-cheating']
  }
];

// GET integrations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const includeAvailable = searchParams.get('includeAvailable') === 'true';

    let filteredIntegrations = [...mockIntegrations];

    // Filter by category
    if (category && category !== 'all') {
      filteredIntegrations = filteredIntegrations.filter(integration => integration.category === category);
    }

    // Filter by status
    if (status && status !== 'all') {
      filteredIntegrations = filteredIntegrations.filter(integration => integration.status === status);
    }

    // Sort by status (connected first) and then by name
    filteredIntegrations.sort((a, b) => {
      if (a.status === 'connected' && b.status !== 'connected') return -1;
      if (a.status !== 'connected' && b.status === 'connected') return 1;
      return a.name.localeCompare(b.name);
    });

    const response: any = {
      success: true,
      data: filteredIntegrations,
      metadata: {
        total: filteredIntegrations.length,
        connected: filteredIntegrations.filter(i => i.status === 'connected').length,
        categories: ['ats', 'hris', 'calendar', 'communication', 'assessment', 'background_check', 'analytics', 'other']
      }
    };

    if (includeAvailable) {
      response.available = availableIntegrations;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST create new integration
export async function POST(request: NextRequest) {
  try {
    const integrationData = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'provider', 'category'];
    for (const field of requiredFields) {
      if (!integrationData[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `${field} is required`
          },
          { status: 400 }
        );
      }
    }

    // Validate category
    const validCategories = ['ats', 'hris', 'calendar', 'communication', 'assessment', 'background_check', 'analytics', 'other'];
    if (!validCategories.includes(integrationData.category)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid category'
        },
        { status: 400 }
      );
    }

    // Create new integration
    const newIntegration: Integration = {
      id: `integration-${Date.now()}`,
      name: integrationData.name,
      description: integrationData.description || '',
      category: integrationData.category,
      provider: integrationData.provider,
      logoUrl: integrationData.logoUrl || '/logos/default.png',
      status: 'pending',
      isEnabled: false,
      isPremium: integrationData.isPremium || false,
      configuration: integrationData.configuration || {},
      features: integrationData.features || [],
      permissions: integrationData.permissions || [],
      usage: {
        apiCalls: 0,
        dataTransferred: 0,
        lastUsed: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockIntegrations.push(newIntegration);

    // In a real application, you would:
    // 1. Validate API credentials
    // 2. Test connection
    // 3. Set up webhooks
    // 4. Initialize data sync

    return NextResponse.json({
      success: true,
      data: newIntegration,
      message: 'Integration created successfully'
    });

  } catch (error) {
    console.error('Error creating integration:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
