import { NextRequest, NextResponse } from 'next/server';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  category: 'setup' | 'verification' | 'configuration' | 'training' | 'launch';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  isRequired: boolean;
  estimatedDuration: string;
  dependencies: string[]; // IDs of steps that must be completed first
  assignedTo?: string;
  dueDate?: Date;
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
  resources: Array<{
    type: 'document' | 'video' | 'link' | 'contact';
    title: string;
    url?: string;
    description?: string;
  }>;
}

interface CompanyOnboarding {
  id: string;
  companyId: string;
  companyName: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  currentStep: string;
  progress: number; // 0-100

  // Onboarding Steps
  steps: OnboardingStep[];

  // Company Setup Information
  setupInfo: {
    accountManager: {
      name: string;
      email: string;
      phone: string;
    };
    technicalContact: {
      name: string;
      email: string;
      phone: string;
    };
    billingContact: {
      name: string;
      email: string;
      phone: string;
    };
    preferredCommunication: 'email' | 'phone' | 'slack' | 'teams';
    timezone: string;
    businessHours: {
      start: string;
      end: string;
      days: string[];
    };
  };

  // Platform Configuration
  platformConfig: {
    customBranding: {
      logo?: string;
      primaryColor?: string;
      secondaryColor?: string;
      companyDescription?: string;
    };
    integrations: Array<{
      type: string;
      name: string;
      status: 'pending' | 'configured' | 'active';
      configuredAt?: Date;
    }>;
    userRoles: Array<{
      roleName: string;
      permissions: string[];
      userCount: number;
    }>;
  };

  // Training & Support
  training: {
    sessionsCompleted: number;
    totalSessions: number;
    nextSessionDate?: Date;
    trainers: string[];
    materials: Array<{
      title: string;
      type: 'video' | 'document' | 'webinar';
      completed: boolean;
      completedAt?: Date;
    }>;
  };

  // Timeline
  timeline: Array<{
    id: string;
    timestamp: Date;
    event: string;
    description: string;
    performedBy: string;
    category: 'milestone' | 'task' | 'issue' | 'note';
  }>;

  // Metadata
  startedAt: Date;
  expectedCompletionDate: Date;
  actualCompletionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Mock onboarding data
let mockOnboardings: CompanyOnboarding[] = [
  {
    id: 'onboarding-1',
    companyId: 'company-1',
    companyName: 'TechCorp Solutions',
    status: 'in_progress',
    currentStep: 'step-3',
    progress: 45,
    steps: [
      {
        id: 'step-1',
        title: 'Account Setup & Verification',
        description: 'Complete account setup and email verification',
        category: 'setup',
        status: 'completed',
        isRequired: true,
        estimatedDuration: '30 minutes',
        dependencies: [],
        completedAt: new Date('2024-01-20T10:00:00Z'),
        completedBy: 'System',
        resources: [
          {
            type: 'document',
            title: 'Account Setup Guide',
            url: '/docs/account-setup.pdf',
            description: 'Step-by-step guide for account setup'
          }
        ]
      },
      {
        id: 'step-2',
        title: 'Document Verification',
        description: 'Upload and verify required business documents',
        category: 'verification',
        status: 'completed',
        isRequired: true,
        estimatedDuration: '1 hour',
        dependencies: ['step-1'],
        completedAt: new Date('2024-01-21T14:30:00Z'),
        completedBy: 'Admin User',
        resources: [
          {
            type: 'document',
            title: 'Required Documents Checklist',
            url: '/docs/documents-checklist.pdf'
          }
        ]
      },
      {
        id: 'step-3',
        title: 'Platform Configuration',
        description: 'Configure platform settings and branding',
        category: 'configuration',
        status: 'in_progress',
        isRequired: true,
        estimatedDuration: '2 hours',
        dependencies: ['step-2'],
        assignedTo: 'Technical Team',
        dueDate: new Date('2024-01-25T17:00:00Z'),
        resources: [
          {
            type: 'video',
            title: 'Platform Configuration Tutorial',
            url: '/videos/platform-config.mp4'
          },
          {
            type: 'contact',
            title: 'Technical Support',
            description: 'Contact our technical team for assistance'
          }
        ]
      },
      {
        id: 'step-4',
        title: 'User Management Setup',
        description: 'Create user roles and invite team members',
        category: 'configuration',
        status: 'pending',
        isRequired: true,
        estimatedDuration: '1 hour',
        dependencies: ['step-3'],
        resources: [
          {
            type: 'document',
            title: 'User Management Guide',
            url: '/docs/user-management.pdf'
          }
        ]
      },
      {
        id: 'step-5',
        title: 'Integration Setup',
        description: 'Configure third-party integrations',
        category: 'configuration',
        status: 'pending',
        isRequired: false,
        estimatedDuration: '3 hours',
        dependencies: ['step-4'],
        resources: [
          {
            type: 'document',
            title: 'Integration Guide',
            url: '/docs/integrations.pdf'
          }
        ]
      },
      {
        id: 'step-6',
        title: 'Training Session',
        description: 'Attend platform training session',
        category: 'training',
        status: 'pending',
        isRequired: true,
        estimatedDuration: '2 hours',
        dependencies: ['step-4'],
        resources: [
          {
            type: 'link',
            title: 'Schedule Training Session',
            url: '/training/schedule'
          }
        ]
      },
      {
        id: 'step-7',
        title: 'Go Live',
        description: 'Launch your company profile and start recruiting',
        category: 'launch',
        status: 'pending',
        isRequired: true,
        estimatedDuration: '30 minutes',
        dependencies: ['step-6'],
        resources: [
          {
            type: 'document',
            title: 'Go Live Checklist',
            url: '/docs/go-live.pdf'
          }
        ]
      }
    ],
    setupInfo: {
      accountManager: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@platform.com',
        phone: '+1-555-0123'
      },
      technicalContact: {
        name: 'Mike Chen',
        email: 'mike.chen@techcorp.com',
        phone: '+1-555-0124'
      },
      billingContact: {
        name: 'Lisa Wang',
        email: 'lisa.wang@techcorp.com',
        phone: '+1-555-0125'
      },
      preferredCommunication: 'email',
      timezone: 'America/Los_Angeles',
      businessHours: {
        start: '09:00',
        end: '17:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      }
    },
    platformConfig: {
      customBranding: {
        logo: '/logos/techcorp-logo.png',
        primaryColor: '#2563eb',
        secondaryColor: '#64748b',
        companyDescription: 'Leading technology solutions provider'
      },
      integrations: [
        {
          type: 'ATS',
          name: 'Greenhouse',
          status: 'pending'
        },
        {
          type: 'HRIS',
          name: 'BambooHR',
          status: 'pending'
        }
      ],
      userRoles: [
        {
          roleName: 'Admin',
          permissions: ['all'],
          userCount: 1
        },
        {
          roleName: 'HR Manager',
          permissions: ['manage_jobs', 'review_applications'],
          userCount: 2
        }
      ]
    },
    training: {
      sessionsCompleted: 0,
      totalSessions: 3,
      nextSessionDate: new Date('2024-01-26T14:00:00Z'),
      trainers: ['Sarah Johnson', 'Technical Team'],
      materials: [
        {
          title: 'Platform Overview',
          type: 'video',
          completed: false
        },
        {
          title: 'Best Practices Guide',
          type: 'document',
          completed: false
        }
      ]
    },
    timeline: [
      {
        id: 'timeline-1',
        timestamp: new Date('2024-01-20T10:00:00Z'),
        event: 'onboarding_started',
        description: 'Company onboarding process initiated',
        performedBy: 'System',
        category: 'milestone'
      },
      {
        id: 'timeline-2',
        timestamp: new Date('2024-01-20T10:30:00Z'),
        event: 'account_verified',
        description: 'Company account verified successfully',
        performedBy: 'System',
        category: 'task'
      },
      {
        id: 'timeline-3',
        timestamp: new Date('2024-01-21T14:30:00Z'),
        event: 'documents_verified',
        description: 'All required documents verified',
        performedBy: 'Admin User',
        category: 'task'
      }
    ],
    startedAt: new Date('2024-01-20T10:00:00Z'),
    expectedCompletionDate: new Date('2024-01-30T17:00:00Z'),
    createdAt: new Date('2024-01-20T10:00:00Z'),
    updatedAt: new Date('2024-01-22T15:00:00Z')
  }
];

// GET onboarding status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');

    let filteredOnboardings = [...mockOnboardings];

    // Filter by company ID
    if (companyId) {
      filteredOnboardings = filteredOnboardings.filter(onboarding => onboarding.companyId === companyId);
    }

    // Filter by status
    if (status && status !== 'all') {
      filteredOnboardings = filteredOnboardings.filter(onboarding => onboarding.status === status);
    }

    // Sort by creation date (newest first)
    filteredOnboardings.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: filteredOnboardings
    });

  } catch (error) {
    console.error('Error fetching onboarding data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST create/update onboarding
export async function POST(request: NextRequest) {
  try {
    const onboardingData = await request.json();

    // Validate required fields
    const requiredFields = ['companyId', 'companyName'];
    for (const field of requiredFields) {
      if (!onboardingData[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `${field} is required`
          },
          { status: 400 }
        );
      }
    }

    // Check if onboarding already exists
    const existingIndex = mockOnboardings.findIndex(o => o.companyId === onboardingData.companyId);

    if (existingIndex >= 0) {
      // Update existing onboarding
      mockOnboardings[existingIndex] = {
        ...mockOnboardings[existingIndex],
        ...onboardingData,
        updatedAt: new Date()
      };

      return NextResponse.json({
        success: true,
        data: mockOnboardings[existingIndex],
        message: 'Onboarding updated successfully'
      });
    } else {
      // Create new onboarding with default steps
      const defaultSteps: OnboardingStep[] = [
        {
          id: 'step-1',
          title: 'Account Setup & Verification',
          description: 'Complete account setup and email verification',
          category: 'setup',
          status: 'pending',
          isRequired: true,
          estimatedDuration: '30 minutes',
          dependencies: [],
          resources: [
            {
              type: 'document',
              title: 'Account Setup Guide',
              url: '/docs/account-setup.pdf',
              description: 'Step-by-step guide for account setup'
            }
          ]
        },
        {
          id: 'step-2',
          title: 'Document Verification',
          description: 'Upload and verify required business documents',
          category: 'verification',
          status: 'pending',
          isRequired: true,
          estimatedDuration: '1 hour',
          dependencies: ['step-1'],
          resources: [
            {
              type: 'document',
              title: 'Required Documents Checklist',
              url: '/docs/documents-checklist.pdf'
            }
          ]
        },
        {
          id: 'step-3',
          title: 'Platform Configuration',
          description: 'Configure platform settings and branding',
          category: 'configuration',
          status: 'pending',
          isRequired: true,
          estimatedDuration: '2 hours',
          dependencies: ['step-2'],
          resources: [
            {
              type: 'video',
              title: 'Platform Configuration Tutorial',
              url: '/videos/platform-config.mp4'
            }
          ]
        }
      ];

      const newOnboarding: CompanyOnboarding = {
        id: `onboarding-${Date.now()}`,
        companyId: onboardingData.companyId,
        companyName: onboardingData.companyName,
        status: 'not_started',
        currentStep: 'step-1',
        progress: 0,
        steps: defaultSteps,
        setupInfo: onboardingData.setupInfo || {
          accountManager: { name: '', email: '', phone: '' },
          technicalContact: { name: '', email: '', phone: '' },
          billingContact: { name: '', email: '', phone: '' },
          preferredCommunication: 'email',
          timezone: 'America/New_York',
          businessHours: {
            start: '09:00',
            end: '17:00',
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
          }
        },
        platformConfig: {
          customBranding: {},
          integrations: [],
          userRoles: []
        },
        training: {
          sessionsCompleted: 0,
          totalSessions: 3,
          trainers: [],
          materials: []
        },
        timeline: [
          {
            id: `timeline-${Date.now()}`,
            timestamp: new Date(),
            event: 'onboarding_created',
            description: 'Company onboarding process created',
            performedBy: 'System',
            category: 'milestone'
          }
        ],
        startedAt: new Date(),
        expectedCompletionDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockOnboardings.push(newOnboarding);

      return NextResponse.json({
        success: true,
        data: newOnboarding,
        message: 'Onboarding process initiated successfully'
      });
    }

  } catch (error) {
    console.error('Error creating/updating onboarding:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
