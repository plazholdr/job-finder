import { NextRequest, NextResponse } from 'next/server';

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

// Mock storage for hiring processes (in a real app, this would be in a database)
let hiringProcesses: HiringProcess[] = [
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

export async function GET(request: NextRequest) {
  try {
    // Mock user ID (in a real app, this would come from authentication)
    const userId = 'mock-user-id';

    // Get hiring processes for the user
    const userHiringProcesses = hiringProcesses.filter(
      process => process.userId === userId
    );

    return NextResponse.json({
      success: true,
      data: userHiringProcesses,
      message: 'Hiring processes fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching hiring processes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch hiring processes'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { applicationId, offerDetails } = await request.json();
    
    // Mock user ID (in a real app, this would come from authentication)
    const userId = 'mock-user-id';

    // Create new hiring process when offer is accepted
    const newHiringProcess: HiringProcess = {
      id: `hiring-${Date.now()}`,
      applicationId,
      userId,
      status: 'offer_accepted',
      startDate: new Date(offerDetails.startDate),
      endDate: new Date(offerDetails.endDate),
      department: 'Engineering', // This would come from job details
      supervisor: {
        id: 'supervisor-default',
        name: 'TBD',
        title: 'Department Manager',
        email: 'manager@company.com'
      },
      onboardingSteps: [
        {
          id: 'step-1',
          title: 'Welcome & Orientation',
          description: 'Complete company orientation and meet your team',
          status: 'pending',
          estimatedDuration: '4 hours',
          assignedTo: 'HR Team'
        },
        {
          id: 'step-2',
          title: 'Documentation & Paperwork',
          description: 'Submit required documents and complete employment forms',
          status: 'pending',
          documents: ['I-9 Form', 'Tax Forms', 'Emergency Contact', 'Direct Deposit'],
          estimatedDuration: '2 hours',
          assignedTo: 'HR Team'
        },
        {
          id: 'step-3',
          title: 'IT Setup & Access',
          description: 'Receive equipment and set up accounts',
          status: 'pending',
          estimatedDuration: '3 hours',
          assignedTo: 'IT Department'
        },
        {
          id: 'step-4',
          title: 'Department Introduction',
          description: 'Meet your team and understand your role',
          status: 'pending',
          estimatedDuration: '2 hours',
          assignedTo: 'Department Manager'
        },
        {
          id: 'step-5',
          title: 'Training Program',
          description: 'Complete required training modules',
          status: 'pending',
          estimatedDuration: '16 hours',
          assignedTo: 'Training Team'
        }
      ]
    };

    hiringProcesses.push(newHiringProcess);

    return NextResponse.json({
      success: true,
      data: newHiringProcess,
      message: 'Hiring process created successfully'
    });
  } catch (error) {
    console.error('Error creating hiring process:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create hiring process'
      },
      { status: 500 }
    );
  }
}
