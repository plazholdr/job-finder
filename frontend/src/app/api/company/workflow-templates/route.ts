import { NextRequest, NextResponse } from 'next/server';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'review' | 'interview' | 'assessment' | 'approval' | 'notification' | 'custom';
  order: number;
  isRequired: boolean;
  estimatedDuration: number; // in hours
  assignedRoles: string[];
  conditions?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
    value: any;
  }[];
  actions?: {
    type: 'send_email' | 'update_status' | 'assign_reviewer' | 'schedule_interview' | 'create_task';
    parameters: Record<string, any>;
  }[];
  automationRules?: {
    trigger: 'time_based' | 'status_change' | 'manual';
    conditions: any[];
    actions: any[];
  }[];
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'internship' | 'full_time' | 'contract' | 'custom';
  isDefault: boolean;
  isActive: boolean;
  steps: WorkflowStep[];
  settings: {
    allowParallelSteps: boolean;
    autoAdvance: boolean;
    requireApproval: boolean;
    notificationSettings: {
      emailEnabled: boolean;
      smsEnabled: boolean;
      inAppEnabled: boolean;
    };
  };
  metadata: {
    totalSteps: number;
    estimatedDuration: number;
    successRate?: number;
    usageCount: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
}

// Mock workflow templates data
let mockTemplates: WorkflowTemplate[] = [
  {
    id: 'template-1',
    name: 'Standard Internship Workflow',
    description: 'Standard workflow for internship applications with screening, interview, and offer stages',
    category: 'internship',
    isDefault: true,
    isActive: true,
    steps: [
      {
        id: 'step-1',
        name: 'Initial Screening',
        description: 'Review application and resume for basic qualifications',
        type: 'review',
        order: 1,
        isRequired: true,
        estimatedDuration: 2,
        assignedRoles: ['recruiter', 'hr_manager'],
        actions: [
          {
            type: 'update_status',
            parameters: { status: 'screening' }
          },
          {
            type: 'send_email',
            parameters: { template: 'application_received' }
          }
        ]
      },
      {
        id: 'step-2',
        name: 'Technical Assessment',
        description: 'Evaluate technical skills through coding challenge or portfolio review',
        type: 'assessment',
        order: 2,
        isRequired: true,
        estimatedDuration: 24,
        assignedRoles: ['technical_lead', 'senior_developer'],
        conditions: [
          {
            field: 'previous_step_status',
            operator: 'equals',
            value: 'passed'
          }
        ]
      },
      {
        id: 'step-3',
        name: 'HR Interview',
        description: 'Behavioral interview with HR team',
        type: 'interview',
        order: 3,
        isRequired: true,
        estimatedDuration: 1,
        assignedRoles: ['hr_manager'],
        actions: [
          {
            type: 'schedule_interview',
            parameters: { duration: 60, type: 'video' }
          }
        ]
      },
      {
        id: 'step-4',
        name: 'Technical Interview',
        description: 'Technical interview with engineering team',
        type: 'interview',
        order: 4,
        isRequired: true,
        estimatedDuration: 1.5,
        assignedRoles: ['technical_lead', 'team_lead']
      },
      {
        id: 'step-5',
        name: 'Final Approval',
        description: 'Final decision and offer preparation',
        type: 'approval',
        order: 5,
        isRequired: true,
        estimatedDuration: 4,
        assignedRoles: ['hiring_manager', 'department_head'],
        actions: [
          {
            type: 'create_task',
            parameters: { task: 'prepare_offer_letter' }
          }
        ]
      }
    ],
    settings: {
      allowParallelSteps: false,
      autoAdvance: false,
      requireApproval: true,
      notificationSettings: {
        emailEnabled: true,
        smsEnabled: false,
        inAppEnabled: true
      }
    },
    metadata: {
      totalSteps: 5,
      estimatedDuration: 32.5,
      successRate: 78.5,
      usageCount: 156
    },
    createdBy: 'admin-user',
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z'),
    lastUsed: new Date('2024-01-22T10:15:00Z')
  },
  {
    id: 'template-2',
    name: 'Fast Track Internship',
    description: 'Accelerated workflow for high-priority or pre-screened candidates',
    category: 'internship',
    isDefault: false,
    isActive: true,
    steps: [
      {
        id: 'step-1',
        name: 'Quick Review',
        description: 'Rapid assessment of qualifications',
        type: 'review',
        order: 1,
        isRequired: true,
        estimatedDuration: 1,
        assignedRoles: ['recruiter']
      },
      {
        id: 'step-2',
        name: 'Combined Interview',
        description: 'Single interview covering both technical and behavioral aspects',
        type: 'interview',
        order: 2,
        isRequired: true,
        estimatedDuration: 2,
        assignedRoles: ['hiring_manager', 'technical_lead']
      },
      {
        id: 'step-3',
        name: 'Immediate Decision',
        description: 'Quick decision and offer preparation',
        type: 'approval',
        order: 3,
        isRequired: true,
        estimatedDuration: 2,
        assignedRoles: ['hiring_manager']
      }
    ],
    settings: {
      allowParallelSteps: true,
      autoAdvance: true,
      requireApproval: false,
      notificationSettings: {
        emailEnabled: true,
        smsEnabled: true,
        inAppEnabled: true
      }
    },
    metadata: {
      totalSteps: 3,
      estimatedDuration: 5,
      successRate: 85.2,
      usageCount: 42
    },
    createdBy: 'admin-user',
    createdAt: new Date('2024-01-15T11:00:00Z'),
    updatedAt: new Date('2024-01-18T16:45:00Z'),
    lastUsed: new Date('2024-01-21T14:20:00Z')
  }
];

// GET workflow templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    const isDefault = searchParams.get('isDefault');

    let filteredTemplates = [...mockTemplates];

    // Filter by category
    if (category && category !== 'all') {
      filteredTemplates = filteredTemplates.filter(template => template.category === category);
    }

    // Filter by active status
    if (isActive !== null) {
      const activeFilter = isActive === 'true';
      filteredTemplates = filteredTemplates.filter(template => template.isActive === activeFilter);
    }

    // Filter by default status
    if (isDefault !== null) {
      const defaultFilter = isDefault === 'true';
      filteredTemplates = filteredTemplates.filter(template => template.isDefault === defaultFilter);
    }

    // Sort by usage count and last used
    filteredTemplates.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return b.metadata.usageCount - a.metadata.usageCount;
    });

    return NextResponse.json({
      success: true,
      data: filteredTemplates,
      metadata: {
        total: filteredTemplates.length,
        categories: ['internship', 'full_time', 'contract', 'custom'],
        filters: { category, isActive, isDefault }
      }
    });

  } catch (error) {
    console.error('Error fetching workflow templates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST create new workflow template
export async function POST(request: NextRequest) {
  try {
    const templateData = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'description', 'category', 'steps'];
    for (const field of requiredFields) {
      if (!templateData[field]) {
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
    const validCategories = ['internship', 'full_time', 'contract', 'custom'];
    if (!validCategories.includes(templateData.category)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid category'
        },
        { status: 400 }
      );
    }

    // Validate steps
    if (!Array.isArray(templateData.steps) || templateData.steps.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one step is required'
        },
        { status: 400 }
      );
    }

    // Calculate metadata
    const totalSteps = templateData.steps.length;
    const estimatedDuration = templateData.steps.reduce((total: number, step: any) => 
      total + (step.estimatedDuration || 0), 0
    );

    // Create new template
    const newTemplate: WorkflowTemplate = {
      id: `template-${Date.now()}`,
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      isDefault: templateData.isDefault || false,
      isActive: templateData.isActive !== false, // Default to true
      steps: templateData.steps.map((step: any, index: number) => ({
        ...step,
        id: step.id || `step-${index + 1}`,
        order: step.order || index + 1
      })),
      settings: {
        allowParallelSteps: templateData.settings?.allowParallelSteps || false,
        autoAdvance: templateData.settings?.autoAdvance || false,
        requireApproval: templateData.settings?.requireApproval || true,
        notificationSettings: {
          emailEnabled: templateData.settings?.notificationSettings?.emailEnabled !== false,
          smsEnabled: templateData.settings?.notificationSettings?.smsEnabled || false,
          inAppEnabled: templateData.settings?.notificationSettings?.inAppEnabled !== false
        }
      },
      metadata: {
        totalSteps,
        estimatedDuration,
        usageCount: 0
      },
      createdBy: 'current-user', // In real app, get from auth
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockTemplates.push(newTemplate);

    return NextResponse.json({
      success: true,
      data: newTemplate,
      message: 'Workflow template created successfully'
    });

  } catch (error) {
    console.error('Error creating workflow template:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
