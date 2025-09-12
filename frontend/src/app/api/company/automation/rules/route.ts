import { NextRequest, NextResponse } from 'next/server';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'status_change' | 'time_based' | 'score_based' | 'manual';
    conditions: Record<string, any>;
  };
  actions: Array<{
    type: 'send_notification' | 'update_status' | 'assign_reviewer' | 'schedule_interview' | 'send_email';
    parameters: Record<string, any>;
  }>;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high';
  executionCount: number;
  lastExecuted?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Mock automation rules data
let mockRules: AutomationRule[] = [
  {
    id: 'rule-1',
    name: 'Auto-acknowledge Applications',
    description: 'Automatically send confirmation email when new applications are submitted',
    trigger: {
      type: 'status_change',
      conditions: {
        fromStatus: null,
        toStatus: 'submitted'
      }
    },
    actions: [
      {
        type: 'send_notification',
        parameters: {
          templateId: 'template-1',
          recipient: 'candidate'
        }
      }
    ],
    isActive: true,
    priority: 'high',
    executionCount: 156,
    lastExecuted: new Date('2024-01-22T10:30:00Z'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-15T12:00:00Z')
  },
  {
    id: 'rule-2',
    name: 'Auto-reject Low Scores',
    description: 'Automatically reject applications with scores below threshold',
    trigger: {
      type: 'score_based',
      conditions: {
        scoreThreshold: 60,
        operator: 'less_than'
      }
    },
    actions: [
      {
        type: 'update_status',
        parameters: {
          newStatus: 'rejected'
        }
      },
      {
        type: 'send_notification',
        parameters: {
          templateId: 'template-5',
          recipient: 'candidate'
        }
      }
    ],
    isActive: true,
    priority: 'medium',
    executionCount: 23,
    lastExecuted: new Date('2024-01-21T14:20:00Z'),
    createdAt: new Date('2024-01-05T00:00:00Z'),
    updatedAt: new Date('2024-01-10T09:00:00Z')
  },
  {
    id: 'rule-3',
    name: 'Schedule Follow-up Interviews',
    description: 'Automatically schedule second interviews for high-scoring candidates',
    trigger: {
      type: 'status_change',
      conditions: {
        fromStatus: 'interview_completed',
        toStatus: 'interview_completed',
        additionalConditions: {
          interviewScore: { min: 85 }
        }
      }
    },
    actions: [
      {
        type: 'schedule_interview',
        parameters: {
          interviewType: 'final',
          autoSchedule: true
        }
      },
      {
        type: 'send_notification',
        parameters: {
          templateId: 'template-3',
          recipient: 'candidate'
        }
      }
    ],
    isActive: true,
    priority: 'high',
    executionCount: 12,
    lastExecuted: new Date('2024-01-20T16:45:00Z'),
    createdAt: new Date('2024-01-08T00:00:00Z'),
    updatedAt: new Date('2024-01-12T14:30:00Z')
  },
  {
    id: 'rule-4',
    name: 'Assign Technical Reviewers',
    description: 'Automatically assign technical reviewers based on job requirements',
    trigger: {
      type: 'status_change',
      conditions: {
        fromStatus: 'pending_acceptance',
        toStatus: 'reviewing'
      }
    },
    actions: [
      {
        type: 'assign_reviewer',
        parameters: {
          reviewerType: 'technical',
          autoAssign: true,
          criteria: 'skills_match'
        }
      }
    ],
    isActive: true,
    priority: 'medium',
    executionCount: 45,
    lastExecuted: new Date('2024-01-19T11:15:00Z'),
    createdAt: new Date('2024-01-03T00:00:00Z'),
    updatedAt: new Date('2024-01-08T16:20:00Z')
  },
  {
    id: 'rule-5',
    name: 'Offer Expiration Reminder',
    description: 'Send reminder emails before job offers expire',
    trigger: {
      type: 'time_based',
      conditions: {
        timeBeforeExpiry: '24h',
        status: 'offer_extended'
      }
    },
    actions: [
      {
        type: 'send_email',
        parameters: {
          templateId: 'offer-reminder',
          recipient: 'candidate',
          subject: 'Reminder: Job Offer Expires Soon'
        }
      }
    ],
    isActive: false,
    priority: 'low',
    executionCount: 8,
    lastExecuted: new Date('2024-01-18T09:30:00Z'),
    createdAt: new Date('2024-01-10T00:00:00Z'),
    updatedAt: new Date('2024-01-15T11:45:00Z')
  }
];

// GET automation rules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const priority = searchParams.get('priority');
    const triggerType = searchParams.get('triggerType');

    let filteredRules = [...mockRules];

    // Apply filters
    if (isActive !== null) {
      const activeFilter = isActive === 'true';
      filteredRules = filteredRules.filter(rule => rule.isActive === activeFilter);
    }

    if (priority && priority !== 'all') {
      filteredRules = filteredRules.filter(rule => rule.priority === priority);
    }

    if (triggerType && triggerType !== 'all') {
      filteredRules = filteredRules.filter(rule => rule.trigger.type === triggerType);
    }

    // Sort by priority (high -> medium -> low) and then by execution count
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    filteredRules.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.executionCount - a.executionCount;
    });

    return NextResponse.json({
      success: true,
      data: filteredRules
    });

  } catch (error) {
    console.error('Error fetching automation rules:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST create new automation rule
export async function POST(request: NextRequest) {
  try {
    const ruleData = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'description', 'trigger', 'actions'];
    for (const field of requiredFields) {
      if (!ruleData[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `${field} is required`
          },
          { status: 400 }
        );
      }
    }

    // Validate trigger type
    const validTriggerTypes = ['status_change', 'time_based', 'score_based', 'manual'];
    if (!validTriggerTypes.includes(ruleData.trigger.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid trigger type'
        },
        { status: 400 }
      );
    }

    // Validate action types
    const validActionTypes = ['send_notification', 'update_status', 'assign_reviewer', 'schedule_interview', 'send_email'];
    for (const action of ruleData.actions) {
      if (!validActionTypes.includes(action.type)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid action type: ${action.type}`
          },
          { status: 400 }
        );
      }
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high'];
    if (ruleData.priority && !validPriorities.includes(ruleData.priority)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid priority value'
        },
        { status: 400 }
      );
    }

    // Create new rule
    const newRule: AutomationRule = {
      id: `rule-${Date.now()}`,
      name: ruleData.name,
      description: ruleData.description,
      trigger: ruleData.trigger,
      actions: ruleData.actions,
      isActive: ruleData.isActive ?? true,
      priority: ruleData.priority || 'medium',
      executionCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockRules.push(newRule);

    return NextResponse.json({
      success: true,
      data: newRule,
      message: 'Automation rule created successfully'
    });

  } catch (error) {
    console.error('Error creating automation rule:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
