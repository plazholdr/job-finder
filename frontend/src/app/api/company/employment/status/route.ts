import { NextRequest, NextResponse } from 'next/server';

interface EmploymentStatus {
  id: string;
  employeeId: string;
  employeeName: string;
  email: string;
  position: string;
  department: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
  currentStatus: 'active' | 'notice_period' | 'suspended' | 'terminated' | 'completed' | 'on_leave';
  startDate: Date;
  originalEndDate?: Date;
  actualEndDate?: Date;
  supervisor: string;
  location: string;
  internshipId?: string;
  companyId: string;
  statusHistory: Array<{
    id: string;
    previousStatus: string;
    newStatus: string;
    updatedBy: string;
    updatedByRole: string;
    updatedDate: Date;
    reason: string;
    effectiveDate: Date;
    notes?: string;
    automaticUpdate: boolean;
  }>;
  performanceMetrics: {
    overallRating?: number;
    completedProjects: number;
    attendanceRate: number;
    lastReviewDate?: Date;
    nextReviewDate?: Date;
    goals: Array<{
      id: string;
      description: string;
      status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
      dueDate?: Date;
      completedDate?: Date;
    }>;
  };
  documents: Array<{
    id: string;
    name: string;
    type: 'contract' | 'offer_letter' | 'performance_review' | 'termination_letter' | 'completion_certificate';
    url: string;
    uploadedBy: string;
    uploadedDate: Date;
    expiryDate?: Date;
  }>;
  benefits: Array<{
    id: string;
    name: string;
    type: 'health' | 'dental' | 'vision' | 'retirement' | 'other';
    status: 'active' | 'inactive' | 'pending';
    startDate: Date;
    endDate?: Date;
  }>;
  equipment: Array<{
    id: string;
    item: string;
    serialNumber?: string;
    assignedDate: Date;
    returnedDate?: Date;
    status: 'assigned' | 'returned' | 'lost' | 'damaged';
    condition?: string;
  }>;
  systemAccess: Array<{
    id: string;
    system: string;
    accessLevel: string;
    grantedDate: Date;
    revokedDate?: Date;
    status: 'active' | 'revoked' | 'suspended';
    grantedBy: string;
  }>;
  notifications: Array<{
    id: string;
    message: string;
    type: 'status_change' | 'reminder' | 'action_required' | 'information';
    sentDate: Date;
    readDate?: Date;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Mock employment status data
let mockEmploymentStatuses: EmploymentStatus[] = [
  {
    id: 'emp-status-1',
    employeeId: 'emp-001',
    employeeName: 'John Smith',
    email: 'john.smith@email.com',
    position: 'Software Engineering Intern',
    department: 'Engineering',
    employmentType: 'intern',
    currentStatus: 'active',
    startDate: new Date('2024-01-15'),
    originalEndDate: new Date('2024-06-15'),
    supervisor: 'Jane Doe',
    location: 'San Francisco, CA',
    internshipId: 'intern-001',
    companyId: 'company-1',
    statusHistory: [
      {
        id: 'hist-1',
        previousStatus: 'pending',
        newStatus: 'active',
        updatedBy: 'HR System',
        updatedByRole: 'system',
        updatedDate: new Date('2024-01-15'),
        reason: 'Internship started',
        effectiveDate: new Date('2024-01-15'),
        automaticUpdate: true
      }
    ],
    performanceMetrics: {
      overallRating: 4.2,
      completedProjects: 2,
      attendanceRate: 95.5,
      lastReviewDate: new Date('2024-02-15'),
      nextReviewDate: new Date('2024-05-15'),
      goals: [
        {
          id: 'goal-1',
          description: 'Complete e-commerce platform frontend',
          status: 'completed',
          dueDate: new Date('2024-03-01'),
          completedDate: new Date('2024-02-28')
        },
        {
          id: 'goal-2',
          description: 'Learn React Native for mobile development',
          status: 'in_progress',
          dueDate: new Date('2024-05-01')
        }
      ]
    },
    documents: [
      {
        id: 'doc-1',
        name: 'Internship Agreement',
        type: 'contract',
        url: '/documents/internship-agreement-001.pdf',
        uploadedBy: 'HR Department',
        uploadedDate: new Date('2024-01-10')
      }
    ],
    benefits: [
      {
        id: 'benefit-1',
        name: 'Health Insurance',
        type: 'health',
        status: 'active',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-06-15')
      }
    ],
    equipment: [
      {
        id: 'eq-1',
        item: 'MacBook Pro 16"',
        serialNumber: 'MBP-2024-001',
        assignedDate: new Date('2024-01-15'),
        status: 'assigned'
      },
      {
        id: 'eq-2',
        item: 'External Monitor',
        serialNumber: 'MON-2024-001',
        assignedDate: new Date('2024-01-15'),
        status: 'assigned'
      }
    ],
    systemAccess: [
      {
        id: 'access-1',
        system: 'GitHub',
        accessLevel: 'Developer',
        grantedDate: new Date('2024-01-15'),
        status: 'active',
        grantedBy: 'IT Department'
      },
      {
        id: 'access-2',
        system: 'Slack',
        accessLevel: 'Member',
        grantedDate: new Date('2024-01-15'),
        status: 'active',
        grantedBy: 'IT Department'
      }
    ],
    notifications: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-15')
  }
];

// GET employment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const employmentType = searchParams.get('employmentType');

    let filteredStatuses = [...mockEmploymentStatuses];

    if (employeeId) {
      const employeeStatus = filteredStatuses.find(s => s.employeeId === employeeId);
      if (!employeeStatus) {
        return NextResponse.json(
          { success: false, error: 'Employee not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: employeeStatus
      });
    }

    if (status) {
      filteredStatuses = filteredStatuses.filter(s => s.currentStatus === status);
    }

    if (department) {
      filteredStatuses = filteredStatuses.filter(s => s.department === department);
    }

    if (employmentType) {
      filteredStatuses = filteredStatuses.filter(s => s.employmentType === employmentType);
    }

    // Sort by last updated (newest first)
    filteredStatuses.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json({
      success: true,
      data: filteredStatuses,
      metadata: {
        total: filteredStatuses.length,
        active: filteredStatuses.filter(s => s.currentStatus === 'active').length,
        terminated: filteredStatuses.filter(s => s.currentStatus === 'terminated').length,
        completed: filteredStatuses.filter(s => s.currentStatus === 'completed').length,
        onLeave: filteredStatuses.filter(s => s.currentStatus === 'on_leave').length
      }
    });

  } catch (error) {
    console.error('Error fetching employment status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST update employment status
export async function POST(request: NextRequest) {
  try {
    const { employeeId, newStatus, reason, effectiveDate, updatedBy, notes, automaticUpdate } = await request.json();

    // Validate required fields
    if (!employeeId || !newStatus || !reason) {
      return NextResponse.json(
        { success: false, error: 'Employee ID, new status, and reason are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['active', 'notice_period', 'suspended', 'terminated', 'completed', 'on_leave'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Find employee
    const employeeIndex = mockEmploymentStatuses.findIndex(s => s.employeeId === employeeId);
    if (employeeIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    const employee = mockEmploymentStatuses[employeeIndex];
    const previousStatus = employee.currentStatus;

    // Check if status change is valid
    if (previousStatus === newStatus) {
      return NextResponse.json(
        { success: false, error: 'Employee already has this status' },
        { status: 400 }
      );
    }

    const now = new Date();
    const effective = effectiveDate ? new Date(effectiveDate) : now;

    // Create status history entry
    const statusHistoryEntry = {
      id: `hist-${Date.now()}`,
      previousStatus,
      newStatus,
      updatedBy: updatedBy || 'System',
      updatedByRole: automaticUpdate ? 'system' : 'admin',
      updatedDate: now,
      reason,
      effectiveDate: effective,
      notes: notes || '',
      automaticUpdate: automaticUpdate || false
    };

    // Update employment status
    const updatedEmployee: EmploymentStatus = {
      ...employee,
      currentStatus: newStatus,
      actualEndDate: ['terminated', 'completed'].includes(newStatus) ? effective : undefined,
      statusHistory: [...employee.statusHistory, statusHistoryEntry],
      updatedAt: now
    };

    // Handle status-specific updates
    if (newStatus === 'terminated' || newStatus === 'completed') {
      // Revoke system access
      updatedEmployee.systemAccess = employee.systemAccess.map(access => ({
        ...access,
        status: 'revoked' as const,
        revokedDate: effective
      }));

      // End benefits
      updatedEmployee.benefits = employee.benefits.map(benefit => ({
        ...benefit,
        status: 'inactive' as const,
        endDate: effective
      }));

      // Add notification for equipment return
      const equipmentNotification = {
        id: `notif-${Date.now()}`,
        message: 'Please return all company equipment within 5 business days.',
        type: 'action_required' as const,
        sentDate: now,
        priority: 'high' as const
      };
      updatedEmployee.notifications.push(equipmentNotification);
    }

    // Save updated employee
    mockEmploymentStatuses[employeeIndex] = updatedEmployee;

    // In a real application, you would also:
    // 1. Update related systems (payroll, benefits, etc.)
    // 2. Send notifications to relevant parties
    // 3. Trigger workflows for equipment return, access revocation, etc.
    // 4. Generate necessary documents
    // 5. Update reporting and analytics

    return NextResponse.json({
      success: true,
      data: updatedEmployee,
      message: `Employment status updated to ${newStatus}`
    });

  } catch (error) {
    console.error('Error updating employment status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT bulk status update
export async function PUT(request: NextRequest) {
  try {
    const { employeeIds, newStatus, reason, effectiveDate, updatedBy, notes } = await request.json();

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Employee IDs array is required' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const employeeId of employeeIds) {
      try {
        // Use the POST logic for each employee
        const response = await POST(new NextRequest('http://localhost/api/company/employment/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId,
            newStatus,
            reason,
            effectiveDate,
            updatedBy,
            notes,
            automaticUpdate: false
          })
        }));

        const result = await response.json();
        if (result.success) {
          results.push({ employeeId, success: true, data: result.data });
        } else {
          results.push({ employeeId, success: false, error: result.error });
          errors.push(`${employeeId}: ${result.error}`);
        }
      } catch (error) {
        results.push({ employeeId, success: false, error: 'Unexpected error' });
        errors.push(`${employeeId}: Unexpected error`);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: successCount > 0,
      data: {
        results,
        summary: {
          total: employeeIds.length,
          successful: successCount,
          failed: failureCount,
          errors: errors.slice(0, 10) // Limit to first 10 errors
        }
      },
      message: `Bulk update completed. ${successCount} successful, ${failureCount} failed.`
    });

  } catch (error) {
    console.error('Error performing bulk status update:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
