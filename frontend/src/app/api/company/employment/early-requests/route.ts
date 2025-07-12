import { NextRequest, NextResponse } from 'next/server';

interface EarlyRequest {
  id: string;
  requestType: 'early_completion' | 'early_termination';
  employeeInfo: {
    employeeId: string;
    employeeName: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    startDate: Date;
    originalEndDate: Date;
    currentStatus: 'active' | 'notice_period' | 'suspended' | 'terminated' | 'completed';
    supervisor: string;
    internshipId?: string;
    companyId: string;
  };
  jobDetails: {
    jobTitle: string;
    jobDescription: string;
    responsibilities: string[];
    workLocation: string;
    projectsAssigned: string[];
    performanceRating?: number;
    completedTasks?: string[];
  };
  applicationDetails: {
    applicationId: string;
    applicationDate: Date;
    interviewDate?: Date;
    offerDate?: Date;
    acceptanceDate?: Date;
    onboardingDate?: Date;
  };
  onboardingMaterials: {
    documentsProvided: string[];
    trainingCompleted: string[];
    equipmentIssued: string[];
    accessGranted: string[];
    mentorAssigned?: string;
    orientationCompleted: boolean;
  };
  requestInfo: {
    requestDate: Date;
    requestedBy: string;
    requestedByRole: 'employee' | 'supervisor' | 'hr' | 'admin';
    reason: string;
    proposedEndDate: Date;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    additionalNotes?: string;
    supportingDocuments?: string[];
  };
  statusUpdateHistory: Array<{
    id: string;
    status: string;
    updatedBy: string;
    updatedByRole: string;
    updatedDate: Date;
    notes?: string;
    automaticUpdate: boolean;
  }>;
  remarkHistory: Array<{
    id: string;
    remark: string;
    addedBy: string;
    addedByRole: string;
    addedDate: Date;
    type: 'general' | 'performance' | 'disciplinary' | 'achievement' | 'completion' | 'termination';
    visibility: 'internal' | 'employee' | 'public';
  }>;
  requestStatus: 'pending' | 'under_review' | 'approved' | 'rejected' | 'cancelled' | 'processing';
  adminDecision: {
    reviewedBy?: string;
    reviewedDate?: Date;
    decision?: 'approve' | 'reject';
    rejectionRemark?: string;
    adminNotes?: string;
    approvalConditions?: string[];
    effectiveDate?: Date;
  };
  workflowSteps: Array<{
    id: string;
    stepName: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    assignedTo?: string;
    dueDate?: Date;
    completedDate?: Date;
    notes?: string;
    order: number;
  }>;
  employmentStatusUpdates: Array<{
    id: string;
    previousStatus: string;
    newStatus: string;
    updatedBy: string;
    updatedDate: Date;
    reason: string;
    effectiveDate: Date;
  }>;
  notifications: Array<{
    id: string;
    recipientId: string;
    recipientType: 'employee' | 'admin' | 'supervisor' | 'hr';
    message: string;
    sentDate: Date;
    readDate?: Date;
    type: 'status_update' | 'approval_required' | 'decision_made' | 'reminder';
  }>;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedBy: string;
    uploadedDate: Date;
    category: 'request' | 'supporting' | 'approval' | 'completion';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data
let mockEarlyRequests: EarlyRequest[] = [
  {
    id: 'early-req-1',
    requestType: 'early_completion',
    employeeInfo: {
      employeeId: 'emp-001',
      employeeName: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-0123',
      position: 'Software Engineering Intern',
      department: 'Engineering',
      startDate: new Date('2024-01-15'),
      originalEndDate: new Date('2024-06-15'),
      currentStatus: 'active',
      supervisor: 'Jane Doe',
      internshipId: 'intern-001',
      companyId: 'company-1'
    },
    jobDetails: {
      jobTitle: 'Software Engineering Intern',
      jobDescription: 'Full-stack development internship focusing on React and Node.js',
      responsibilities: ['Frontend development', 'API integration', 'Code reviews'],
      workLocation: 'San Francisco, CA',
      projectsAssigned: ['E-commerce Platform', 'Mobile App Backend'],
      performanceRating: 4.2,
      completedTasks: ['User authentication system', 'Payment integration']
    },
    applicationDetails: {
      applicationId: 'app-001',
      applicationDate: new Date('2023-12-01'),
      interviewDate: new Date('2023-12-15'),
      offerDate: new Date('2023-12-20'),
      acceptanceDate: new Date('2023-12-22'),
      onboardingDate: new Date('2024-01-10')
    },
    onboardingMaterials: {
      documentsProvided: ['Employee Handbook', 'IT Policy', 'Safety Guidelines'],
      trainingCompleted: ['Security Training', 'Code Standards', 'Git Workflow'],
      equipmentIssued: ['Laptop', 'Monitor', 'Keyboard', 'Mouse'],
      accessGranted: ['GitHub', 'Slack', 'Jira', 'AWS Console'],
      mentorAssigned: 'Senior Developer Mike Johnson',
      orientationCompleted: true
    },
    requestInfo: {
      requestDate: new Date('2024-03-15'),
      requestedBy: 'emp-001',
      requestedByRole: 'employee',
      reason: 'Received full-time offer from another company',
      proposedEndDate: new Date('2024-04-15'),
      urgency: 'high',
      additionalNotes: 'Would like to complete current projects before leaving',
      supportingDocuments: ['offer_letter.pdf']
    },
    statusUpdateHistory: [
      {
        id: 'status-1',
        status: 'pending',
        updatedBy: 'system',
        updatedByRole: 'system',
        updatedDate: new Date('2024-03-15'),
        notes: 'Request submitted',
        automaticUpdate: true
      }
    ],
    remarkHistory: [
      {
        id: 'remark-1',
        remark: 'Excellent performance throughout internship',
        addedBy: 'Jane Doe',
        addedByRole: 'supervisor',
        addedDate: new Date('2024-03-16'),
        type: 'performance',
        visibility: 'internal'
      }
    ],
    requestStatus: 'pending',
    adminDecision: {},
    workflowSteps: [
      {
        id: 'step-1',
        stepName: 'Initial Review',
        description: 'HR reviews the request for completeness',
        status: 'pending',
        order: 1
      },
      {
        id: 'step-2',
        stepName: 'Supervisor Approval',
        description: 'Direct supervisor reviews and approves',
        status: 'pending',
        order: 2
      },
      {
        id: 'step-3',
        stepName: 'Admin Decision',
        description: 'Company admin makes final decision',
        status: 'pending',
        order: 3
      },
      {
        id: 'step-4',
        stepName: 'Status Update',
        description: 'Update employment status accordingly',
        status: 'pending',
        order: 4
      }
    ],
    employmentStatusUpdates: [],
    notifications: [],
    documents: [],
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15')
  }
];

// GET early requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    let filteredRequests = [...mockEarlyRequests];

    if (requestId) {
      const request = filteredRequests.find(r => r.id === requestId);
      if (!request) {
        return NextResponse.json(
          { success: false, error: 'Request not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: request
      });
    }

    if (employeeId) {
      filteredRequests = filteredRequests.filter(r => r.employeeInfo.employeeId === employeeId);
    }

    if (status) {
      filteredRequests = filteredRequests.filter(r => r.requestStatus === status);
    }

    if (type) {
      filteredRequests = filteredRequests.filter(r => r.requestType === type);
    }

    // Sort by request date (newest first)
    filteredRequests.sort((a, b) => new Date(b.requestInfo.requestDate).getTime() - new Date(a.requestInfo.requestDate).getTime());

    return NextResponse.json({
      success: true,
      data: filteredRequests,
      metadata: {
        total: filteredRequests.length,
        pending: filteredRequests.filter(r => r.requestStatus === 'pending').length,
        approved: filteredRequests.filter(r => r.requestStatus === 'approved').length,
        rejected: filteredRequests.filter(r => r.requestStatus === 'rejected').length
      }
    });

  } catch (error) {
    console.error('Error fetching early requests:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new early request
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();

    // Validate required fields
    const requiredFields = ['requestType', 'employeeInfo', 'requestInfo'];
    for (const field of requiredFields) {
      if (!requestData[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if employee already has pending request
    const existingRequest = mockEarlyRequests.find(r => 
      r.employeeInfo.employeeId === requestData.employeeInfo.employeeId && 
      ['pending', 'under_review', 'processing'].includes(r.requestStatus)
    );

    if (existingRequest) {
      return NextResponse.json(
        { success: false, error: 'Employee already has a pending request' },
        { status: 400 }
      );
    }

    // Create workflow steps
    const workflowSteps = [
      {
        id: `step-${Date.now()}-1`,
        stepName: 'Initial Review',
        description: 'HR reviews the request for completeness',
        status: 'pending' as const,
        order: 1
      },
      {
        id: `step-${Date.now()}-2`,
        stepName: 'Supervisor Approval',
        description: 'Direct supervisor reviews and approves',
        status: 'pending' as const,
        order: 2
      },
      {
        id: `step-${Date.now()}-3`,
        stepName: 'Admin Decision',
        description: 'Company admin makes final decision',
        status: 'pending' as const,
        order: 3
      },
      {
        id: `step-${Date.now()}-4`,
        stepName: 'Status Update',
        description: 'Update employment status accordingly',
        status: 'pending' as const,
        order: 4
      }
    ];

    // Create new request
    const newRequest: EarlyRequest = {
      id: `early-req-${Date.now()}`,
      requestType: requestData.requestType,
      employeeInfo: requestData.employeeInfo,
      jobDetails: requestData.jobDetails || {},
      applicationDetails: requestData.applicationDetails || {},
      onboardingMaterials: requestData.onboardingMaterials || {},
      requestInfo: {
        ...requestData.requestInfo,
        requestDate: new Date()
      },
      statusUpdateHistory: [
        {
          id: `status-${Date.now()}`,
          status: 'pending',
          updatedBy: 'system',
          updatedByRole: 'system',
          updatedDate: new Date(),
          notes: 'Request submitted',
          automaticUpdate: true
        }
      ],
      remarkHistory: [],
      requestStatus: 'pending',
      adminDecision: {},
      workflowSteps,
      employmentStatusUpdates: [],
      notifications: [],
      documents: requestData.documents || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockEarlyRequests.push(newRequest);

    return NextResponse.json({
      success: true,
      data: newRequest,
      message: 'Early request created successfully'
    });

  } catch (error) {
    console.error('Error creating early request:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
