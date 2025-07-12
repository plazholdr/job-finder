import { NextRequest, NextResponse } from 'next/server';

interface EarlyCompletionRequest {
  id: string;
  requestInfo: {
    requestType: 'early_completion' | 'early_termination';
    requestDate: Date;
    requestedBy: string;
    requestedByRole: 'employee' | 'manager' | 'hr' | 'admin';
    urgency: 'low' | 'medium' | 'high' | 'critical';
    reason: string;
    proposedDate: Date;
    currentEndDate: Date;
    daysDifference: number;
  };
  employeeInfo: {
    name: string;
    email: string;
    phone: string;
    employeeId: string;
    department: string;
    position: string;
    manager: string;
    startDate: Date;
    currentStatus: 'active' | 'on_leave' | 'notice_period' | 'suspended';
    employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
    location: string;
  };
  jobDetails: {
    jobTitle: string;
    jobDescription: string;
    responsibilities: string[];
    requirements: string[];
    department: string;
    reportingManager: string;
    workLocation: string;
    contractType: string;
    salaryRange: string;
  };
  applicationDetails: {
    applicationId: string;
    applicationDate: Date;
    applicationStatus: string;
    interviewStages: Array<{
      stage: string;
      date: Date;
      interviewer: string;
      result: string;
      feedback: string;
    }>;
    offerDetails: {
      offerDate: Date;
      startDate: Date;
      salary: number;
      benefits: string[];
      acceptanceDate: Date;
    };
  };
  onboardingMaterials: {
    documentsProvided: Array<{
      document: string;
      providedDate: Date;
      status: 'pending' | 'completed' | 'verified';
    }>;
    trainingCompleted: Array<{
      training: string;
      completedDate: Date;
      score?: number;
      certificate?: string;
    }>;
    equipmentAssigned: Array<{
      item: string;
      serialNumber: string;
      assignedDate: Date;
      condition: string;
    }>;
    accessGranted: Array<{
      system: string;
      accessLevel: string;
      grantedDate: Date;
      status: 'active' | 'suspended' | 'revoked';
    }>;
  };
  statusUpdateHistory: Array<{
    date: Date;
    previousStatus: string;
    newStatus: string;
    updatedBy: string;
    reason: string;
    notes?: string;
  }>;
  remarkHistory: Array<{
    id: string;
    date: Date;
    author: string;
    type: 'general' | 'performance' | 'disciplinary' | 'achievement' | 'concern';
    remark: string;
    confidential: boolean;
    attachments?: string[];
  }>;
  requestStatus: 'pending' | 'under_review' | 'approved' | 'rejected' | 'withdrawn';
  reviewInfo: {
    reviewedBy?: string;
    reviewedDate?: Date;
    decision?: 'approve' | 'reject';
    rejectionReason?: string;
    adminNotes?: string;
    followUpRequired?: boolean;
    followUpDate?: Date;
  };
  documents: Array<{
    type: string;
    name: string;
    url: string;
    uploadedDate: Date;
    category: 'request' | 'supporting' | 'approval' | 'rejection';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data - in a real app, this would be in a database
let mockEarlyCompletionRequests: EarlyCompletionRequest[] = [
  {
    id: 'early-req-1',
    requestInfo: {
      requestType: 'early_completion',
      requestDate: new Date('2024-10-15'),
      requestedBy: 'Sarah Johnson',
      requestedByRole: 'employee',
      urgency: 'medium',
      reason: 'Family emergency requires immediate relocation to another state. Need to complete internship early to handle family matters.',
      proposedDate: new Date('2024-11-15'),
      currentEndDate: new Date('2024-12-31'),
      daysDifference: 46
    },
    employeeInfo: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@university.edu',
      phone: '+1 (555) 123-4567',
      employeeId: 'INT001',
      department: 'Engineering',
      position: 'Software Engineering Intern',
      manager: 'Mike Chen',
      startDate: new Date('2024-06-01'),
      currentStatus: 'active',
      employmentType: 'intern',
      location: 'San Francisco, CA'
    },
    jobDetails: {
      jobTitle: 'Software Engineering Intern',
      jobDescription: 'Work on full-stack development projects, contribute to product features, and learn from senior engineers.',
      responsibilities: [
        'Develop and maintain web applications',
        'Participate in code reviews',
        'Collaborate with cross-functional teams',
        'Write unit tests and documentation',
        'Attend daily standups and sprint planning'
      ],
      requirements: [
        'Computer Science or related field',
        'Knowledge of JavaScript, React, Node.js',
        'Understanding of software development lifecycle',
        'Strong problem-solving skills',
        'Excellent communication skills'
      ],
      department: 'Engineering',
      reportingManager: 'Mike Chen',
      workLocation: 'San Francisco, CA',
      contractType: 'Internship',
      salaryRange: '$25-30/hour'
    },
    applicationDetails: {
      applicationId: 'APP-2024-001',
      applicationDate: new Date('2024-03-15'),
      applicationStatus: 'Hired',
      interviewStages: [
        {
          stage: 'Phone Screening',
          date: new Date('2024-04-01'),
          interviewer: 'HR Team',
          result: 'passed',
          feedback: 'Strong technical background and communication skills'
        },
        {
          stage: 'Technical Interview',
          date: new Date('2024-04-10'),
          interviewer: 'Mike Chen',
          result: 'passed',
          feedback: 'Excellent coding skills and problem-solving approach'
        },
        {
          stage: 'Final Interview',
          date: new Date('2024-04-20'),
          interviewer: 'Engineering Director',
          result: 'passed',
          feedback: 'Great cultural fit and enthusiasm for learning'
        }
      ],
      offerDetails: {
        offerDate: new Date('2024-04-25'),
        startDate: new Date('2024-06-01'),
        salary: 28,
        benefits: ['Health Insurance', 'Learning Budget', 'Flexible Hours', 'Mentorship Program'],
        acceptanceDate: new Date('2024-05-01')
      }
    },
    onboardingMaterials: {
      documentsProvided: [
        {
          document: 'Employee Handbook',
          providedDate: new Date('2024-05-25'),
          status: 'completed'
        },
        {
          document: 'IT Security Training',
          providedDate: new Date('2024-05-25'),
          status: 'completed'
        },
        {
          document: 'Code of Conduct',
          providedDate: new Date('2024-05-25'),
          status: 'completed'
        }
      ],
      trainingCompleted: [
        {
          training: 'Company Orientation',
          completedDate: new Date('2024-06-03'),
          score: 95,
          certificate: 'CERT-001'
        },
        {
          training: 'Engineering Onboarding',
          completedDate: new Date('2024-06-05'),
          score: 88,
          certificate: 'CERT-002'
        }
      ],
      equipmentAssigned: [
        {
          item: 'MacBook Pro 16"',
          serialNumber: 'MBP-2024-001',
          assignedDate: new Date('2024-06-01'),
          condition: 'excellent'
        },
        {
          item: 'External Monitor',
          serialNumber: 'MON-2024-001',
          assignedDate: new Date('2024-06-01'),
          condition: 'good'
        }
      ],
      accessGranted: [
        {
          system: 'GitHub',
          accessLevel: 'Developer',
          grantedDate: new Date('2024-06-01'),
          status: 'active'
        },
        {
          system: 'Slack',
          accessLevel: 'Member',
          grantedDate: new Date('2024-06-01'),
          status: 'active'
        },
        {
          system: 'Jira',
          accessLevel: 'User',
          grantedDate: new Date('2024-06-01'),
          status: 'active'
        }
      ]
    },
    statusUpdateHistory: [
      {
        date: new Date('2024-06-01'),
        previousStatus: 'pending',
        newStatus: 'active',
        updatedBy: 'HR System',
        reason: 'Internship started'
      }
    ],
    remarkHistory: [
      {
        id: 'remark-1',
        date: new Date('2024-08-15'),
        author: 'Mike Chen',
        type: 'performance',
        remark: 'Sarah has shown excellent progress in her first two months. She quickly adapted to our tech stack and has been contributing meaningfully to the team.',
        confidential: false
      },
      {
        id: 'remark-2',
        date: new Date('2024-09-30'),
        author: 'Mike Chen',
        type: 'achievement',
        remark: 'Successfully completed the user authentication feature ahead of schedule. Received positive feedback from the product team.',
        confidential: false
      }
    ],
    requestStatus: 'pending',
    reviewInfo: {},
    documents: [
      {
        type: 'request_letter',
        name: 'Early Completion Request.pdf',
        url: '/documents/sarah-early-completion.pdf',
        uploadedDate: new Date('2024-10-15'),
        category: 'request'
      }
    ],
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-10-15')
  },
  {
    id: 'early-req-2',
    requestInfo: {
      requestType: 'early_termination',
      requestDate: new Date('2024-10-20'),
      requestedBy: 'Lisa Wang',
      requestedByRole: 'manager',
      urgency: 'high',
      reason: 'Performance issues and failure to meet project deadlines despite multiple warnings and support attempts.',
      proposedDate: new Date('2024-11-01'),
      currentEndDate: new Date('2024-12-15'),
      daysDifference: 44
    },
    employeeInfo: {
      name: 'Alex Rodriguez',
      email: 'alex.rodriguez@university.edu',
      phone: '+1 (555) 987-6543',
      employeeId: 'INT002',
      department: 'Marketing',
      position: 'Marketing Intern',
      manager: 'Lisa Wang',
      startDate: new Date('2024-07-01'),
      currentStatus: 'active',
      employmentType: 'intern',
      location: 'New York, NY'
    },
    jobDetails: {
      jobTitle: 'Marketing Intern',
      jobDescription: 'Support marketing campaigns, content creation, and market research activities.',
      responsibilities: [
        'Create social media content',
        'Assist with campaign planning',
        'Conduct market research',
        'Support event coordination',
        'Analyze marketing metrics'
      ],
      requirements: [
        'Marketing, Communications, or related field',
        'Knowledge of social media platforms',
        'Basic understanding of marketing principles',
        'Creative thinking and writing skills',
        'Proficiency in Microsoft Office'
      ],
      department: 'Marketing',
      reportingManager: 'Lisa Wang',
      workLocation: 'New York, NY',
      contractType: 'Internship',
      salaryRange: '$20-25/hour'
    },
    applicationDetails: {
      applicationId: 'APP-2024-002',
      applicationDate: new Date('2024-04-01'),
      applicationStatus: 'Hired',
      interviewStages: [
        {
          stage: 'Phone Screening',
          date: new Date('2024-04-15'),
          interviewer: 'HR Team',
          result: 'passed',
          feedback: 'Enthusiastic and creative approach to marketing'
        },
        {
          stage: 'Portfolio Review',
          date: new Date('2024-04-25'),
          interviewer: 'Lisa Wang',
          result: 'passed',
          feedback: 'Good portfolio with diverse marketing projects'
        }
      ],
      offerDetails: {
        offerDate: new Date('2024-05-01'),
        startDate: new Date('2024-07-01'),
        salary: 22,
        benefits: ['Health Insurance', 'Learning Budget', 'Flexible Hours'],
        acceptanceDate: new Date('2024-05-10')
      }
    },
    onboardingMaterials: {
      documentsProvided: [
        {
          document: 'Employee Handbook',
          providedDate: new Date('2024-06-25'),
          status: 'completed'
        },
        {
          document: 'Marketing Guidelines',
          providedDate: new Date('2024-06-25'),
          status: 'completed'
        }
      ],
      trainingCompleted: [
        {
          training: 'Company Orientation',
          completedDate: new Date('2024-07-03'),
          score: 78
        }
      ],
      equipmentAssigned: [
        {
          item: 'MacBook Air',
          serialNumber: 'MBA-2024-002',
          assignedDate: new Date('2024-07-01'),
          condition: 'good'
        }
      ],
      accessGranted: [
        {
          system: 'Slack',
          accessLevel: 'Member',
          grantedDate: new Date('2024-07-01'),
          status: 'active'
        },
        {
          system: 'Canva',
          accessLevel: 'User',
          grantedDate: new Date('2024-07-01'),
          status: 'active'
        }
      ]
    },
    statusUpdateHistory: [
      {
        date: new Date('2024-07-01'),
        previousStatus: 'pending',
        newStatus: 'active',
        updatedBy: 'HR System',
        reason: 'Internship started'
      }
    ],
    remarkHistory: [
      {
        id: 'remark-3',
        date: new Date('2024-08-15'),
        author: 'Lisa Wang',
        type: 'concern',
        remark: 'Alex has been struggling to meet deadlines and requires frequent reminders about task completion.',
        confidential: true
      },
      {
        id: 'remark-4',
        date: new Date('2024-09-15'),
        author: 'Lisa Wang',
        type: 'disciplinary',
        remark: 'Formal warning issued for missed deadlines and incomplete deliverables. Performance improvement plan initiated.',
        confidential: true
      },
      {
        id: 'remark-5',
        date: new Date('2024-10-10'),
        author: 'Lisa Wang',
        type: 'performance',
        remark: 'Despite additional support and clear expectations, performance has not improved. Considering early termination.',
        confidential: true
      }
    ],
    requestStatus: 'under_review',
    reviewInfo: {},
    documents: [
      {
        type: 'performance_documentation',
        name: 'Performance Issues Documentation.pdf',
        url: '/documents/alex-performance-issues.pdf',
        uploadedDate: new Date('2024-10-20'),
        category: 'supporting'
      }
    ],
    createdAt: new Date('2024-10-20'),
    updatedAt: new Date('2024-10-20')
  }
];

// PATCH - Make decision on early completion request
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { decision, notes } = await request.json();

    // Validate decision
    if (!decision || !['approve', 'reject'].includes(decision)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid decision (approve/reject) is required'
        },
        { status: 400 }
      );
    }

    // Find the request
    const requestIndex = mockEarlyCompletionRequests.findIndex(req => req.id === id);
    if (requestIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request not found'
        },
        { status: 404 }
      );
    }

    const request_obj = mockEarlyCompletionRequests[requestIndex];

    // Check if request can be decided upon
    if (!['pending', 'under_review'].includes(request_obj.requestStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request has already been processed'
        },
        { status: 400 }
      );
    }

    // Update request with decision
    const updatedRequest = {
      ...request_obj,
      requestStatus: decision === 'approve' ? 'approved' : 'rejected' as 'approved' | 'rejected',
      reviewInfo: {
        ...request_obj.reviewInfo,
        reviewedBy: 'Company Admin', // In real app, get from auth
        reviewedDate: new Date(),
        decision: decision as 'approve' | 'reject',
        rejectionReason: decision === 'reject' ? notes : undefined,
        adminNotes: notes
      },
      updatedAt: new Date()
    };

    // Add status update to history
    updatedRequest.statusUpdateHistory.push({
      date: new Date(),
      previousStatus: request_obj.requestStatus,
      newStatus: updatedRequest.requestStatus,
      updatedBy: 'Company Admin',
      reason: `Request ${decision}d by admin`,
      notes: notes
    });

    // Update employment status if approved
    if (decision === 'approve') {
      // In a real application, this would update the employee's status in the database
      // and trigger necessary workflows (equipment return, access revocation, etc.)
      
      if (request_obj.requestInfo.requestType === 'early_completion') {
        // Mark as completed early
        updatedRequest.employeeInfo.currentStatus = 'notice_period';
      } else if (request_obj.requestInfo.requestType === 'early_termination') {
        // Mark as terminated
        updatedRequest.employeeInfo.currentStatus = 'suspended';
      }
    }

    // Update the request in our mock data
    mockEarlyCompletionRequests[requestIndex] = updatedRequest;

    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: `Request ${decision}d successfully`
    });

  } catch (error) {
    console.error('Error processing decision:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
