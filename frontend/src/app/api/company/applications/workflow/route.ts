import { NextRequest, NextResponse } from 'next/server';
import { CandidateApplication, ApplicationWorkflowLog } from '@/types/company';

// Enhanced mock applications data with workflow tracking
let mockApplications: CandidateApplication[] = [
  {
    id: 'app-1',
    jobId: 'job-1',
    candidateId: 'candidate-1',
    candidate: {
      id: 'candidate-1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      education: 'BS Computer Science, Stanford University',
      experience: '2 years internship experience',
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Git', 'SQL']
    },
    status: 'submitted',
    reviewStage: 'initial',
    reviewers: [],
    submittedAt: new Date('2024-01-22T10:30:00Z'),
    lastUpdated: new Date('2024-01-22T10:30:00Z'),
    workflowHistory: [
      {
        id: 'log-1',
        action: 'application_submitted',
        previousStatus: null,
        newStatus: 'submitted',
        performedBy: {
          id: 'candidate-1',
          name: 'Sarah Johnson',
          type: 'candidate'
        },
        timestamp: new Date('2024-01-22T10:30:00Z'),
        notes: 'Application submitted by candidate'
      }
    ]
  },
  {
    id: 'app-2',
    jobId: 'job-1',
    candidateId: 'candidate-2',
    candidate: {
      id: 'candidate-2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 987-6543',
      location: 'Seattle, WA',
      education: 'BS Software Engineering, University of Washington',
      experience: '1 year internship experience',
      skills: ['Java', 'Spring Boot', 'React', 'TypeScript', 'Docker', 'AWS']
    },
    status: 'pending_acceptance',
    reviewStage: 'hr',
    reviewers: [],
    submittedAt: new Date('2024-01-20T09:15:00Z'),
    lastUpdated: new Date('2024-01-21T14:20:00Z'),
    workflowHistory: [
      {
        id: 'log-2',
        action: 'application_submitted',
        previousStatus: null,
        newStatus: 'submitted',
        performedBy: {
          id: 'candidate-2',
          name: 'Michael Chen',
          type: 'candidate'
        },
        timestamp: new Date('2024-01-20T09:15:00Z'),
        notes: 'Application submitted by candidate'
      },
      {
        id: 'log-3',
        action: 'initial_review_completed',
        previousStatus: 'submitted',
        newStatus: 'pending_acceptance',
        performedBy: {
          id: 'hr-1',
          name: 'Lisa Wang',
          type: 'company'
        },
        timestamp: new Date('2024-01-21T14:20:00Z'),
        notes: 'Initial screening completed. Application meets basic requirements.'
      }
    ]
  },
  {
    id: 'app-3',
    jobId: 'job-1',
    candidateId: 'candidate-3',
    candidate: {
      id: 'candidate-3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      phone: '+1 (555) 456-7890',
      location: 'Austin, TX',
      education: 'BS Computer Science, UT Austin',
      experience: 'Fresh graduate',
      skills: ['Python', 'Django', 'JavaScript', 'Vue.js', 'PostgreSQL', 'Linux']
    },
    status: 'reviewing',
    reviewStage: 'technical',
    reviewers: [
      {
        id: 'reviewer-1',
        name: 'Mike Chen',
        role: 'Senior Developer',
        status: 'pending'
      }
    ],
    submittedAt: new Date('2024-01-18T11:20:00Z'),
    lastUpdated: new Date('2024-01-22T16:45:00Z'),
    workflowHistory: [
      {
        id: 'log-4',
        action: 'application_submitted',
        previousStatus: null,
        newStatus: 'submitted',
        performedBy: {
          id: 'candidate-3',
          name: 'Emily Rodriguez',
          type: 'candidate'
        },
        timestamp: new Date('2024-01-18T11:20:00Z'),
        notes: 'Application submitted by candidate'
      },
      {
        id: 'log-5',
        action: 'application_accepted',
        previousStatus: 'submitted',
        newStatus: 'pending_acceptance',
        performedBy: {
          id: 'hr-1',
          name: 'Lisa Wang',
          type: 'company'
        },
        timestamp: new Date('2024-01-19T09:30:00Z'),
        notes: 'Application accepted for review process'
      },
      {
        id: 'log-6',
        action: 'review_started',
        previousStatus: 'pending_acceptance',
        newStatus: 'reviewing',
        performedBy: {
          id: 'hr-1',
          name: 'Lisa Wang',
          type: 'company'
        },
        timestamp: new Date('2024-01-22T16:45:00Z'),
        notes: 'Technical review process initiated'
      }
    ]
  },
  {
    id: 'app-4',
    jobId: 'job-1',
    candidateId: 'candidate-4',
    candidate: {
      id: 'candidate-4',
      name: 'David Kim',
      email: 'david.kim@email.com',
      phone: '+1 (555) 321-0987',
      location: 'Los Angeles, CA',
      education: 'BS Computer Engineering, UCLA',
      experience: '1.5 years internship experience',
      skills: ['C++', 'Python', 'Machine Learning', 'TensorFlow', 'Docker', 'Kubernetes']
    },
    status: 'shortlisted',
    reviewStage: 'final',
    reviewers: [
      {
        id: 'reviewer-1',
        name: 'Mike Chen',
        role: 'Senior Developer',
        status: 'approved',
        rating: 4,
        feedback: 'Strong technical skills and good problem-solving approach'
      }
    ],
    submittedAt: new Date('2024-01-15T14:30:00Z'),
    lastUpdated: new Date('2024-01-23T11:15:00Z'),
    workflowHistory: [
      {
        id: 'log-7',
        action: 'application_submitted',
        previousStatus: null,
        newStatus: 'submitted',
        performedBy: {
          id: 'candidate-4',
          name: 'David Kim',
          type: 'candidate'
        },
        timestamp: new Date('2024-01-15T14:30:00Z'),
        notes: 'Application submitted by candidate'
      },
      {
        id: 'log-8',
        action: 'application_accepted',
        previousStatus: 'submitted',
        newStatus: 'pending_acceptance',
        performedBy: {
          id: 'hr-1',
          name: 'Lisa Wang',
          type: 'company'
        },
        timestamp: new Date('2024-01-16T10:00:00Z'),
        notes: 'Application accepted for review'
      },
      {
        id: 'log-9',
        action: 'review_started',
        previousStatus: 'pending_acceptance',
        newStatus: 'reviewing',
        performedBy: {
          id: 'hr-1',
          name: 'Lisa Wang',
          type: 'company'
        },
        timestamp: new Date('2024-01-17T09:00:00Z'),
        notes: 'Review process started'
      },
      {
        id: 'log-10',
        action: 'candidate_shortlisted',
        previousStatus: 'reviewing',
        newStatus: 'shortlisted',
        performedBy: {
          id: 'reviewer-1',
          name: 'Mike Chen',
          type: 'company'
        },
        timestamp: new Date('2024-01-23T11:15:00Z'),
        notes: 'Candidate shortlisted based on technical review'
      }
    ]
  }
];

// GET applications for workflow management
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const includeHistory = searchParams.get('includeHistory') === 'true';

    let filteredApplications = [...mockApplications];

    // Filter by status if provided
    if (status && status !== 'all') {
      filteredApplications = filteredApplications.filter(app => app.status === status);
    }

    // Sort by last updated (most recent first)
    filteredApplications.sort((a, b) => 
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );

    // Include workflow history if requested
    if (!includeHistory) {
      filteredApplications = filteredApplications.map(app => ({
        ...app,
        workflowHistory: undefined
      }));
    }

    return NextResponse.json({
      success: true,
      data: filteredApplications
    });

  } catch (error) {
    console.error('Error fetching workflow applications:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST workflow action
export async function POST(request: NextRequest) {
  try {
    const { applicationId, action, newStatus, notes, performedBy } = await request.json();

    // Validate required fields
    if (!applicationId || !action || !newStatus) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application ID, action, and new status are required'
        },
        { status: 400 }
      );
    }

    const applicationIndex = mockApplications.findIndex(app => app.id === applicationId);
    
    if (applicationIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application not found'
        },
        { status: 404 }
      );
    }

    const application = mockApplications[applicationIndex];
    const previousStatus = application.status;

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      'submitted': ['pending_acceptance', 'rejected', 'on_hold'],
      'pending_acceptance': ['reviewing', 'rejected'],
      'reviewing': ['shortlisted', 'rejected', 'on_hold'],
      'shortlisted': ['interview_scheduled', 'rejected'],
      'interview_scheduled': ['interview_completed', 'rejected', 'interview_scheduled'],
      'interview_completed': ['offer_extended', 'rejected', 'interview_scheduled'],
      'offer_extended': ['offer_accepted', 'offer_declined', 'offer_extended'],
      'on_hold': ['reviewing', 'rejected'],
      'rejected': [], // Final state
      'offer_accepted': [], // Final state
      'offer_declined': [] // Final state
    };

    if (!validTransitions[previousStatus]?.includes(newStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status transition from ${previousStatus} to ${newStatus}`
        },
        { status: 400 }
      );
    }

    // Create workflow log entry
    const workflowLogEntry: ApplicationWorkflowLog = {
      id: `log-${Date.now()}`,
      action,
      previousStatus,
      newStatus,
      performedBy: {
        id: performedBy || 'current-user',
        name: 'Current User', // In real app, get from user data
        type: 'company'
      },
      timestamp: new Date(),
      notes: notes || undefined
    };

    // Update application
    mockApplications[applicationIndex] = {
      ...application,
      status: newStatus as any,
      lastUpdated: new Date(),
      workflowHistory: [
        ...(application.workflowHistory || []),
        workflowLogEntry
      ]
    };

    // Send notifications based on action (in real app)
    const notificationActions = [
      'application_accepted',
      'application_rejected', 
      'interview_scheduled',
      'offer_extended',
      'offer_accepted',
      'offer_declined'
    ];

    if (notificationActions.includes(action)) {
      // In real app, send email/SMS notification to candidate
      console.log(`Notification sent for action: ${action}`);
    }

    return NextResponse.json({
      success: true,
      data: mockApplications[applicationIndex],
      message: 'Workflow action completed successfully'
    });

  } catch (error) {
    console.error('Error processing workflow action:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
