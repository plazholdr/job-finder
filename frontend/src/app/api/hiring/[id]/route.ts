import { NextRequest, NextResponse } from 'next/server';

// This would typically import from a shared types file
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  dueDate?: Date;
  documents?: string[];
  assignedTo?: string;
  estimatedDuration?: string;
}

interface HiringProcess {
  id: string;
  applicationId: string;
  userId: string;
  status: 'offer_extended' | 'offer_accepted' | 'onboarding' | 'completed';
  startDate: Date;
  endDate?: Date;
  mentor?: {
    id: string;
    name: string;
    title: string;
    email: string;
    phone?: string;
  };
  department: string;
  supervisor: {
    id: string;
    name: string;
    title: string;
    email: string;
  };
  workspace?: {
    location: string;
    desk?: string;
    equipment: string[];
  };
  onboardingSteps: OnboardingStep[];
}

// Mock storage (in a real app, this would be in a database)
const hiringProcesses: HiringProcess[] = [
  {
    id: 'hiring-1',
    applicationId: 'app-2',
    userId: 'mock-user-id',
    status: 'onboarding',
    startDate: new Date('2024-06-01'),
    mentor: {
      id: 'mentor-1',
      name: 'Dr. Lisa Park',
      title: 'Research Director',
      email: 'lisa.park@greenenergy.com',
      phone: '+1 (555) 123-4567'
    },
    department: 'Research & Development',
    supervisor: {
      id: 'supervisor-1',
      name: 'Jennifer Adams',
      title: 'HR Director',
      email: 'jennifer.adams@greenenergy.com'
    },
    workspace: {
      location: 'Building B, Floor 2',
      desk: 'Desk 2B-08',
      equipment: ['Laptop', 'Lab Equipment Access', 'Research Materials']
    },
    onboardingSteps: [
      {
        id: 'step-1',
        title: 'Welcome & Orientation',
        description: 'Complete company orientation and meet your team',
        status: 'completed',
        dueDate: new Date('2024-06-01'),
        estimatedDuration: '4 hours',
        assignedTo: 'HR Team'
      },
      {
        id: 'step-2',
        title: 'Documentation & Paperwork',
        description: 'Submit required documents and complete employment forms',
        status: 'completed',
        documents: ['I-9 Form', 'Tax Forms', 'Emergency Contact', 'Direct Deposit'],
        estimatedDuration: '2 hours',
        assignedTo: 'HR Team'
      },
      {
        id: 'step-3',
        title: 'Lab Safety Training',
        description: 'Complete required safety training for research facilities',
        status: 'in_progress',
        dueDate: new Date('2024-06-03'),
        estimatedDuration: '6 hours',
        assignedTo: 'Safety Department'
      },
      {
        id: 'step-4',
        title: 'Research Team Introduction',
        description: 'Meet your research team and understand current projects',
        status: 'pending',
        dueDate: new Date('2024-06-04'),
        estimatedDuration: '3 hours',
        assignedTo: 'Research Team Lead'
      },
      {
        id: 'step-5',
        title: 'Project Assignment',
        description: 'Receive your first research project assignment',
        status: 'pending',
        dueDate: new Date('2024-06-10'),
        estimatedDuration: '2 hours',
        assignedTo: 'Dr. Lisa Park'
      }
    ]
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;
    
    // Mock user ID (in a real app, this would come from authentication)
    const userId = 'mock-user-id';

    // Find hiring process by application ID
    const hiringProcess = hiringProcesses.find(
      process => process.applicationId === applicationId && process.userId === userId
    );

    if (!hiringProcess) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hiring process not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: hiringProcess,
      message: 'Hiring process fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching hiring process:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch hiring process'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;
    const updates = await request.json();
    
    // Mock user ID (in a real app, this would come from authentication)
    const userId = 'mock-user-id';

    // Find and update hiring process
    const processIndex = hiringProcesses.findIndex(
      process => process.applicationId === applicationId && process.userId === userId
    );

    if (processIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hiring process not found'
        },
        { status: 404 }
      );
    }

    // Update the hiring process
    hiringProcesses[processIndex] = {
      ...hiringProcesses[processIndex],
      ...updates
    };

    return NextResponse.json({
      success: true,
      data: hiringProcesses[processIndex],
      message: 'Hiring process updated successfully'
    });
  } catch (error) {
    console.error('Error updating hiring process:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update hiring process'
      },
      { status: 500 }
    );
  }
}

// Update onboarding step status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;
    const { stepId, status } = await request.json();
    
    // Mock user ID (in a real app, this would come from authentication)
    const userId = 'mock-user-id';

    // Find hiring process
    const processIndex = hiringProcesses.findIndex(
      process => process.applicationId === applicationId && process.userId === userId
    );

    if (processIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hiring process not found'
        },
        { status: 404 }
      );
    }

    // Update specific onboarding step
    const stepIndex = hiringProcesses[processIndex].onboardingSteps.findIndex(
      step => step.id === stepId
    );

    if (stepIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Onboarding step not found'
        },
        { status: 404 }
      );
    }

    hiringProcesses[processIndex].onboardingSteps[stepIndex].status = status;

    // If all steps are completed, update overall status
    const allCompleted = hiringProcesses[processIndex].onboardingSteps.every(
      step => step.status === 'completed' || step.status === 'skipped'
    );

    if (allCompleted) {
      hiringProcesses[processIndex].status = 'completed';
    }

    return NextResponse.json({
      success: true,
      data: hiringProcesses[processIndex],
      message: 'Onboarding step updated successfully'
    });
  } catch (error) {
    console.error('Error updating onboarding step:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update onboarding step'
      },
      { status: 500 }
    );
  }
}
