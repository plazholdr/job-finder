import { NextRequest, NextResponse } from 'next/server';

interface HoldReason {
  id: string;
  category: 'budget_approval' | 'position_review' | 'team_capacity' | 'candidate_availability' | 'reference_check' | 'background_check' | 'other';
  title: string;
  description: string;
  isStandard: boolean;
  isActive: boolean;
  defaultDuration: number; // days
  requiresApproval: boolean;
  autoReminder: boolean;
  reminderInterval: number; // days
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ApplicationHold {
  id: string;
  applicationId: string;
  jobId: string;
  candidateId: string;
  holdReasons: Array<{
    reasonId: string;
    title: string;
    category: string;
    customNotes?: string;
  }>;
  stage: 'screening' | 'review' | 'interview' | 'final_decision';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  placedBy: {
    id: string;
    name: string;
    role: string;
  };
  placedAt: Date;
  expectedResumeDate?: Date;
  actualResumeDate?: Date;
  maxHoldDuration: number; // days
  autoResumeEnabled: boolean;
  status: 'active' | 'resumed' | 'expired' | 'cancelled';
  notes: {
    internal: string;
    candidate?: string; // Optional message to candidate
  };
  reminders: Array<{
    id: string;
    scheduledAt: Date;
    sentAt?: Date;
    type: 'review' | 'resume' | 'expire';
    recipientId: string;
    message: string;
  }>;
  candidateNotified: boolean;
  candidateNotificationSentAt?: Date;
  followUpRequired: boolean;
  followUpNotes?: string;
  escalationRequired: boolean;
  escalatedTo?: string;
  escalatedAt?: Date;
  lastReviewedAt?: Date;
  lastReviewedBy?: string;
}

// Mock hold reasons
let mockHoldReasons: HoldReason[] = [
  {
    id: 'hold-reason-1',
    category: 'budget_approval',
    title: 'Pending Budget Approval',
    description: 'Waiting for budget approval from finance team',
    isStandard: true,
    isActive: true,
    defaultDuration: 14,
    requiresApproval: true,
    autoReminder: true,
    reminderInterval: 7,
    usageCount: 23,
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z')
  },
  {
    id: 'hold-reason-2',
    category: 'position_review',
    title: 'Position Requirements Under Review',
    description: 'Job requirements are being reviewed and may be updated',
    isStandard: true,
    isActive: true,
    defaultDuration: 10,
    requiresApproval: false,
    autoReminder: true,
    reminderInterval: 5,
    usageCount: 15,
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z')
  },
  {
    id: 'hold-reason-3',
    category: 'team_capacity',
    title: 'Team Capacity Constraints',
    description: 'Current team does not have capacity for onboarding',
    isStandard: true,
    isActive: true,
    defaultDuration: 21,
    requiresApproval: false,
    autoReminder: true,
    reminderInterval: 7,
    usageCount: 8,
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z')
  },
  {
    id: 'hold-reason-4',
    category: 'candidate_availability',
    title: 'Candidate Availability Issues',
    description: 'Candidate has requested to delay the process',
    isStandard: true,
    isActive: true,
    defaultDuration: 30,
    requiresApproval: false,
    autoReminder: true,
    reminderInterval: 14,
    usageCount: 12,
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z')
  },
  {
    id: 'hold-reason-5',
    category: 'reference_check',
    title: 'Pending Reference Verification',
    description: 'Waiting for reference checks to be completed',
    isStandard: true,
    isActive: true,
    defaultDuration: 7,
    requiresApproval: false,
    autoReminder: true,
    reminderInterval: 3,
    usageCount: 34,
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z')
  },
  {
    id: 'hold-reason-6',
    category: 'background_check',
    title: 'Background Check in Progress',
    description: 'Background verification is currently being processed',
    isStandard: true,
    isActive: true,
    defaultDuration: 10,
    requiresApproval: false,
    autoReminder: true,
    reminderInterval: 5,
    usageCount: 45,
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z')
  },
  {
    id: 'hold-reason-7',
    category: 'other',
    title: 'Awaiting Additional Information',
    description: 'Waiting for additional information from candidate or team',
    isStandard: true,
    isActive: true,
    defaultDuration: 7,
    requiresApproval: false,
    autoReminder: true,
    reminderInterval: 3,
    usageCount: 19,
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z')
  }
];

// Mock application holds
let mockApplicationHolds: ApplicationHold[] = [
  {
    id: 'hold-1',
    applicationId: 'app-2',
    jobId: 'job-1',
    candidateId: 'candidate-2',
    holdReasons: [
      {
        reasonId: 'hold-reason-1',
        title: 'Pending Budget Approval',
        category: 'budget_approval',
        customNotes: 'Waiting for Q2 budget approval from finance team'
      }
    ],
    stage: 'final_decision',
    priority: 'high',
    placedBy: {
      id: 'user-1',
      name: 'Sarah Johnson',
      role: 'Hiring Manager'
    },
    placedAt: new Date('2024-01-20T10:00:00Z'),
    expectedResumeDate: new Date('2024-02-03T10:00:00Z'),
    maxHoldDuration: 30,
    autoResumeEnabled: false,
    status: 'active',
    notes: {
      internal: 'Strong candidate but need budget approval before making offer. Finance team reviewing Q2 budget.',
      candidate: 'We are currently reviewing some internal processes and will update you soon on next steps.'
    },
    reminders: [
      {
        id: 'reminder-1',
        scheduledAt: new Date('2024-01-27T09:00:00Z'),
        type: 'review',
        recipientId: 'user-1',
        message: 'Review hold status for candidate application'
      }
    ],
    candidateNotified: true,
    candidateNotificationSentAt: new Date('2024-01-20T11:00:00Z'),
    followUpRequired: true,
    followUpNotes: 'Follow up with finance team on budget approval timeline',
    escalationRequired: false,
    lastReviewedAt: new Date('2024-01-22T14:00:00Z'),
    lastReviewedBy: 'user-1'
  }
];

// GET hold data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'reasons';
    const applicationId = searchParams.get('applicationId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    if (type === 'reasons') {
      // Get hold reasons
      let reasons = [...mockHoldReasons];
      
      if (category && category !== 'all') {
        reasons = reasons.filter(reason => reason.category === category);
      }
      
      // Sort by usage count (most used first)
      reasons.sort((a, b) => b.usageCount - a.usageCount);
      
      return NextResponse.json({
        success: true,
        data: reasons,
        metadata: {
          total: reasons.length,
          categories: ['budget_approval', 'position_review', 'team_capacity', 'candidate_availability', 'reference_check', 'background_check', 'other']
        }
      });
    }

    if (type === 'holds') {
      let holds = [...mockApplicationHolds];
      
      if (applicationId) {
        // Get hold for specific application
        holds = holds.filter(h => h.applicationId === applicationId);
      }
      
      if (status && status !== 'all') {
        holds = holds.filter(h => h.status === status);
      }
      
      // Sort by priority and placed date
      holds.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime();
      });
      
      return NextResponse.json({
        success: true,
        data: holds,
        metadata: {
          total: holds.length,
          active: holds.filter(h => h.status === 'active').length,
          expired: holds.filter(h => h.status === 'expired').length
        }
      });
    }

    if (type === 'analytics') {
      // Get hold analytics
      const analytics = generateHoldAnalytics();
      
      return NextResponse.json({
        success: true,
        data: analytics
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
    console.error('Error fetching hold data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST create application hold
export async function POST(request: NextRequest) {
  try {
    const holdData = await request.json();

    // Validate required fields
    const requiredFields = ['applicationId', 'jobId', 'candidateId', 'holdReasons', 'stage', 'priority'];
    for (const field of requiredFields) {
      if (!holdData[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `${field} is required`
          },
          { status: 400 }
        );
      }
    }

    // Validate hold reasons
    if (!Array.isArray(holdData.holdReasons) || holdData.holdReasons.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one hold reason is required'
        },
        { status: 400 }
      );
    }

    // Check if application is already on hold
    const existingHold = mockApplicationHolds.find(h => 
      h.applicationId === holdData.applicationId && h.status === 'active'
    );
    
    if (existingHold) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application is already on hold'
        },
        { status: 400 }
      );
    }

    // Calculate default duration based on reasons
    const maxDuration = Math.max(
      ...holdData.holdReasons.map((reason: any) => {
        const holdReason = mockHoldReasons.find(r => r.id === reason.reasonId);
        return holdReason?.defaultDuration || 7;
      })
    );

    // Create expected resume date
    const expectedResumeDate = holdData.expectedResumeDate 
      ? new Date(holdData.expectedResumeDate)
      : new Date(Date.now() + maxDuration * 24 * 60 * 60 * 1000);

    // Create new hold
    const newHold: ApplicationHold = {
      id: `hold-${Date.now()}`,
      applicationId: holdData.applicationId,
      jobId: holdData.jobId,
      candidateId: holdData.candidateId,
      holdReasons: holdData.holdReasons,
      stage: holdData.stage,
      priority: holdData.priority,
      placedBy: {
        id: holdData.placedBy?.id || 'current-user',
        name: holdData.placedBy?.name || 'Current User',
        role: holdData.placedBy?.role || 'Hiring Manager'
      },
      placedAt: new Date(),
      expectedResumeDate,
      maxHoldDuration: holdData.maxHoldDuration || maxDuration,
      autoResumeEnabled: holdData.autoResumeEnabled || false,
      status: 'active',
      notes: {
        internal: holdData.notes?.internal || '',
        candidate: holdData.notes?.candidate
      },
      reminders: [],
      candidateNotified: false,
      followUpRequired: holdData.followUpRequired || false,
      followUpNotes: holdData.followUpNotes,
      escalationRequired: false,
      lastReviewedAt: new Date(),
      lastReviewedBy: holdData.placedBy?.id || 'current-user'
    };

    // Create reminders based on hold reasons
    holdData.holdReasons.forEach((reason: any, index: number) => {
      const holdReason = mockHoldReasons.find(r => r.id === reason.reasonId);
      if (holdReason?.autoReminder) {
        const reminderDate = new Date(Date.now() + holdReason.reminderInterval * 24 * 60 * 60 * 1000);
        newHold.reminders.push({
          id: `reminder-${Date.now()}-${index}`,
          scheduledAt: reminderDate,
          type: 'review',
          recipientId: newHold.placedBy.id,
          message: `Review hold status for ${holdReason.title}`
        });
      }
    });

    mockApplicationHolds.push(newHold);

    // Update usage count for hold reasons
    holdData.holdReasons.forEach((reason: any) => {
      const holdReason = mockHoldReasons.find(r => r.id === reason.reasonId);
      if (holdReason) {
        holdReason.usageCount++;
      }
    });

    return NextResponse.json({
      success: true,
      data: newHold,
      message: 'Application placed on hold successfully'
    });

  } catch (error) {
    console.error('Error creating hold:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// PUT update hold (resume, extend, cancel)
export async function PUT(request: NextRequest) {
  try {
    const { holdId, action, ...updateData } = await request.json();

    if (!holdId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hold ID is required'
        },
        { status: 400 }
      );
    }

    const holdIndex = mockApplicationHolds.findIndex(h => h.id === holdId);
    
    if (holdIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hold not found'
        },
        { status: 404 }
      );
    }

    const hold = mockApplicationHolds[holdIndex];

    // Handle different actions
    switch (action) {
      case 'resume':
        hold.status = 'resumed';
        hold.actualResumeDate = new Date();
        break;
      
      case 'extend':
        if (updateData.newExpectedDate) {
          hold.expectedResumeDate = new Date(updateData.newExpectedDate);
        }
        if (updateData.additionalDays) {
          hold.expectedResumeDate = new Date(
            hold.expectedResumeDate!.getTime() + updateData.additionalDays * 24 * 60 * 60 * 1000
          );
        }
        break;
      
      case 'cancel':
        hold.status = 'cancelled';
        break;
      
      case 'escalate':
        hold.escalationRequired = true;
        hold.escalatedTo = updateData.escalatedTo;
        hold.escalatedAt = new Date();
        break;
      
      default:
        // Regular update
        Object.assign(hold, updateData);
    }

    // Update last reviewed info
    hold.lastReviewedAt = new Date();
    hold.lastReviewedBy = updateData.reviewedBy || 'current-user';

    mockApplicationHolds[holdIndex] = hold;

    return NextResponse.json({
      success: true,
      data: hold,
      message: `Hold ${action || 'updated'} successfully`
    });

  } catch (error) {
    console.error('Error updating hold:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Helper function to generate hold analytics
function generateHoldAnalytics() {
  const totalHolds = mockApplicationHolds.length;
  const activeHolds = mockApplicationHolds.filter(h => h.status === 'active').length;
  
  // Hold by category
  const byCategory: Record<string, number> = {};
  const byStage: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  
  mockApplicationHolds.forEach(hold => {
    hold.holdReasons.forEach(reason => {
      byCategory[reason.category] = (byCategory[reason.category] || 0) + 1;
    });
    
    byStage[hold.stage] = (byStage[hold.stage] || 0) + 1;
    byPriority[hold.priority] = (byPriority[hold.priority] || 0) + 1;
  });

  // Average hold duration
  const completedHolds = mockApplicationHolds.filter(h => h.actualResumeDate);
  const avgDuration = completedHolds.length > 0 
    ? completedHolds.reduce((sum, hold) => {
        const duration = (hold.actualResumeDate!.getTime() - hold.placedAt.getTime()) / (1000 * 60 * 60 * 24);
        return sum + duration;
      }, 0) / completedHolds.length
    : 0;

  return {
    totalHolds,
    activeHolds,
    completedHolds: completedHolds.length,
    byCategory,
    byStage,
    byPriority,
    averageHoldDuration: Math.round(avgDuration * 10) / 10,
    candidateNotificationRate: (mockApplicationHolds.filter(h => h.candidateNotified).length / totalHolds) * 100,
    escalationRate: (mockApplicationHolds.filter(h => h.escalationRequired).length / totalHolds) * 100
  };
}
