import { NextRequest, NextResponse } from 'next/server';

// This would normally import from a shared types file
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
  createdAt: Date;
  updatedAt: Date;
}

// Mock data - in real app this would come from database
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
    requestInfo: {
      requestDate: new Date('2024-03-15'),
      requestedBy: 'emp-001',
      requestedByRole: 'employee',
      reason: 'Received full-time offer from another company',
      proposedEndDate: new Date('2024-04-15'),
      urgency: 'high',
      additionalNotes: 'Would like to complete current projects before leaving'
    },
    statusUpdateHistory: [],
    remarkHistory: [],
    requestStatus: 'pending',
    adminDecision: {},
    workflowSteps: [],
    employmentStatusUpdates: [],
    notifications: [],
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15')
  }
];

// POST admin decision on early request
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const requestId = params.id;
    const { decision, rejectionRemark, adminNotes, approvalConditions, effectiveDate, reviewedBy } = await request.json();

    // Validate required fields
    if (!decision || !['approve', 'reject'].includes(decision)) {
      return NextResponse.json(
        { success: false, error: 'Valid decision (approve/reject) is required' },
        { status: 400 }
      );
    }

    if (decision === 'reject' && !rejectionRemark) {
      return NextResponse.json(
        { success: false, error: 'Rejection remark is required when rejecting' },
        { status: 400 }
      );
    }

    // Find the request
    const requestIndex = mockEarlyRequests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    const earlyRequest = mockEarlyRequests[requestIndex];

    // Check if request can be decided upon
    if (!['pending', 'under_review'].includes(earlyRequest.requestStatus)) {
      return NextResponse.json(
        { success: false, error: 'Request has already been processed' },
        { status: 400 }
      );
    }

    const now = new Date();
    const adminDecisionData = {
      reviewedBy: reviewedBy || 'Company Admin',
      reviewedDate: now,
      decision: decision as 'approve' | 'reject',
      rejectionRemark: decision === 'reject' ? rejectionRemark : undefined,
      adminNotes: adminNotes || '',
      approvalConditions: approvalConditions || [],
      effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined
    };

    // Update request status
    const newStatus = decision === 'approve' ? 'approved' : 'rejected';
    
    // Add status update to history
    const statusUpdate = {
      id: `status-${Date.now()}`,
      status: newStatus,
      updatedBy: reviewedBy || 'Company Admin',
      updatedByRole: 'admin',
      updatedDate: now,
      notes: decision === 'approve' ? 'Request approved by admin' : `Request rejected: ${rejectionRemark}`,
      automaticUpdate: false
    };

    // Add admin remark to history
    const adminRemark = {
      id: `remark-${Date.now()}`,
      remark: decision === 'approve' 
        ? `Request approved. ${adminNotes || 'No additional notes.'}`
        : `Request rejected. Reason: ${rejectionRemark}`,
      addedBy: reviewedBy || 'Company Admin',
      addedByRole: 'admin',
      addedDate: now,
      type: decision === 'approve' ? 'completion' : 'termination' as const,
      visibility: 'internal' as const
    };

    // Update workflow steps
    const updatedWorkflowSteps = earlyRequest.workflowSteps.map(step => {
      if (step.stepName === 'Admin Decision') {
        return {
          ...step,
          status: 'completed' as const,
          completedDate: now,
          notes: `Decision: ${decision}. ${adminNotes || ''}`
        };
      }
      return step;
    });

    // If approved, update employment status
    let employmentStatusUpdate = null;
    let newEmploymentStatus = earlyRequest.employeeInfo.currentStatus;

    if (decision === 'approve') {
      if (earlyRequest.requestType === 'early_completion') {
        newEmploymentStatus = 'completed';
      } else if (earlyRequest.requestType === 'early_termination') {
        newEmploymentStatus = 'terminated';
      }

      employmentStatusUpdate = {
        id: `emp-status-${Date.now()}`,
        previousStatus: earlyRequest.employeeInfo.currentStatus,
        newStatus: newEmploymentStatus,
        updatedBy: reviewedBy || 'Company Admin',
        updatedDate: now,
        reason: `${earlyRequest.requestType.replace('_', ' ')} request approved`,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : now
      };

      // Update the next workflow step
      const statusUpdateStepIndex = updatedWorkflowSteps.findIndex(step => step.stepName === 'Status Update');
      if (statusUpdateStepIndex !== -1) {
        updatedWorkflowSteps[statusUpdateStepIndex] = {
          ...updatedWorkflowSteps[statusUpdateStepIndex],
          status: 'in_progress' as const,
          notes: 'Employment status update in progress'
        };
      }
    }

    // Create notifications
    const notifications = [
      {
        id: `notif-${Date.now()}-1`,
        recipientId: earlyRequest.employeeInfo.employeeId,
        recipientType: 'employee' as const,
        message: decision === 'approve' 
          ? `Your ${earlyRequest.requestType.replace('_', ' ')} request has been approved.`
          : `Your ${earlyRequest.requestType.replace('_', ' ')} request has been rejected. Reason: ${rejectionRemark}`,
        sentDate: now,
        type: 'decision_made' as const
      },
      {
        id: `notif-${Date.now()}-2`,
        recipientId: earlyRequest.employeeInfo.supervisor,
        recipientType: 'supervisor' as const,
        message: `${earlyRequest.employeeInfo.employeeName}'s ${earlyRequest.requestType.replace('_', ' ')} request has been ${decision}d.`,
        sentDate: now,
        type: 'status_update' as const
      }
    ];

    // Update the request
    const updatedRequest: EarlyRequest = {
      ...earlyRequest,
      requestStatus: newStatus,
      adminDecision: adminDecisionData,
      statusUpdateHistory: [...earlyRequest.statusUpdateHistory, statusUpdate],
      remarkHistory: [...earlyRequest.remarkHistory, adminRemark],
      workflowSteps: updatedWorkflowSteps,
      employmentStatusUpdates: employmentStatusUpdate 
        ? [...earlyRequest.employmentStatusUpdates, employmentStatusUpdate]
        : earlyRequest.employmentStatusUpdates,
      notifications: [...earlyRequest.notifications, ...notifications],
      employeeInfo: {
        ...earlyRequest.employeeInfo,
        currentStatus: newEmploymentStatus
      },
      updatedAt: now
    };

    // Save the updated request
    mockEarlyRequests[requestIndex] = updatedRequest;

    // In a real application, you would also:
    // 1. Update the employee's status in the main employee database
    // 2. Trigger workflows for equipment return, access revocation, etc.
    // 3. Send email notifications
    // 4. Update related systems (payroll, benefits, etc.)
    // 5. Generate completion/termination documents

    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: `Request ${decision}d successfully`
    });

  } catch (error) {
    console.error('Error processing admin decision:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET request details for admin review
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const requestId = params.id;
    
    const earlyRequest = mockEarlyRequests.find(r => r.id === requestId);
    if (!earlyRequest) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    // Add additional context for admin review
    const reviewContext = {
      canApprove: ['pending', 'under_review'].includes(earlyRequest.requestStatus),
      daysUntilOriginalEnd: Math.ceil(
        (new Date(earlyRequest.employeeInfo.originalEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ),
      daysEarlyRequested: Math.ceil(
        (new Date(earlyRequest.employeeInfo.originalEndDate).getTime() - new Date(earlyRequest.requestInfo.proposedEndDate).getTime()) / (1000 * 60 * 60 * 24)
      ),
      timeInPosition: Math.ceil(
        (Date.now() - new Date(earlyRequest.employeeInfo.startDate).getTime()) / (1000 * 60 * 60 * 24)
      )
    };

    return NextResponse.json({
      success: true,
      data: {
        ...earlyRequest,
        reviewContext
      }
    });

  } catch (error) {
    console.error('Error fetching request for admin review:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
