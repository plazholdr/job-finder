import { NextRequest, NextResponse } from 'next/server';

interface Interview {
  id: string;
  companyId: string;
  candidateId: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  candidateName: string;
  type: 'phone' | 'video' | 'in_person';
  scheduledDate: string;
  duration: number;
  location?: string;
  meetingLink?: string;
  interviewer: {
    name: string;
    title: string;
    email: string;
    phone?: string;
  };
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  requirements?: string[];
  agenda?: string[];
  createdAt: string;
  updatedAt: string;
}

// Mock interviews data
const mockInterviews: Interview[] = [
  {
    id: 'interview-1',
    companyId: 'company-1',
    candidateId: 'candidate-1',
    applicationId: 'app-1',
    jobId: 'job-1',
    jobTitle: 'Software Engineering Intern',
    companyName: 'TechCorp Inc',
    candidateName: 'John Doe',
    type: 'video',
    scheduledDate: '2024-01-25T14:00:00Z',
    duration: 60,
    meetingLink: 'https://zoom.us/j/123456789',
    interviewer: {
      name: 'Sarah Johnson',
      title: 'Engineering Manager',
      email: 'sarah.johnson@techcorp.com',
      phone: '+1 (555) 123-4567'
    },
    status: 'scheduled',
    notes: 'Technical interview focusing on JavaScript and React',
    requirements: [
      'Laptop with stable internet connection',
      'Quiet environment',
      'Have your portfolio ready'
    ],
    agenda: [
      'Introduction (5 minutes)',
      'Technical questions (30 minutes)',
      'Coding challenge (20 minutes)',
      'Q&A (5 minutes)'
    ],
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 'interview-2',
    companyId: 'company-2',
    candidateId: 'candidate-2',
    applicationId: 'app-2',
    jobId: 'job-2',
    jobTitle: 'Data Science Intern',
    companyName: 'DataFlow Ltd',
    candidateName: 'Jane Smith',
    type: 'in_person',
    scheduledDate: '2024-01-26T10:30:00Z',
    duration: 90,
    location: '123 Business Ave, Suite 400, San Francisco, CA',
    interviewer: {
      name: 'Michael Chen',
      title: 'Data Science Lead',
      email: 'michael.chen@dataflow.com',
      phone: '+1 (555) 987-6543'
    },
    status: 'confirmed',
    notes: 'Bring portfolio and be prepared to discuss machine learning projects',
    requirements: [
      'Government-issued ID',
      'Portfolio of data science projects',
      'Resume (printed copy)'
    ],
    agenda: [
      'Welcome and introductions (10 minutes)',
      'Portfolio review (30 minutes)',
      'Technical discussion (30 minutes)',
      'Company culture fit (15 minutes)',
      'Next steps (5 minutes)'
    ],
    createdAt: '2024-01-19T15:30:00Z',
    updatedAt: '2024-01-21T09:15:00Z'
  },
  {
    id: 'interview-3',
    companyId: 'company-1',
    candidateId: 'candidate-3',
    applicationId: 'app-3',
    jobId: 'job-3',
    jobTitle: 'UX Design Intern',
    companyName: 'TechCorp Inc',
    candidateName: 'Alex Wilson',
    type: 'phone',
    scheduledDate: '2024-01-24T16:00:00Z',
    duration: 45,
    interviewer: {
      name: 'Lisa Rodriguez',
      title: 'UX Design Director',
      email: 'lisa.rodriguez@techcorp.com',
      phone: '+1 (555) 456-7890'
    },
    status: 'completed',
    notes: 'Great portfolio, strong design thinking skills',
    requirements: [
      'Portfolio ready for screen sharing',
      'Quiet phone environment'
    ],
    agenda: [
      'Introduction (5 minutes)',
      'Portfolio walkthrough (25 minutes)',
      'Design process discussion (10 minutes)',
      'Questions (5 minutes)'
    ],
    createdAt: '2024-01-18T11:20:00Z',
    updatedAt: '2024-01-24T16:45:00Z'
  }
];

// GET - Fetch interviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('userType'); // 'company' or 'candidate'
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');

    let filteredInterviews = [...mockInterviews];

    // Filter by user type and ID
    if (userType === 'company' && userId) {
      filteredInterviews = filteredInterviews.filter(i => i.companyId === userId);
    } else if (userType === 'candidate' && userId) {
      filteredInterviews = filteredInterviews.filter(i => i.candidateId === userId);
    }

    // Apply other filters
    if (status) {
      filteredInterviews = filteredInterviews.filter(i => i.status === status);
    }

    if (type) {
      filteredInterviews = filteredInterviews.filter(i => i.type === type);
    }

    if (startDate) {
      filteredInterviews = filteredInterviews.filter(i => 
        new Date(i.scheduledDate) >= new Date(startDate)
      );
    }

    if (endDate) {
      filteredInterviews = filteredInterviews.filter(i => 
        new Date(i.scheduledDate) <= new Date(endDate)
      );
    }

    // Sort by scheduled date
    filteredInterviews.sort((a, b) => 
      new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );

    return NextResponse.json({
      success: true,
      data: filteredInterviews
    });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch interviews'
      },
      { status: 500 }
    );
  }
}

// POST - Schedule new interview
export async function POST(request: NextRequest) {
  try {
    const interviewData = await request.json();

    // Validate required fields
    const requiredFields = [
      'candidateId', 'applicationId', 'jobId', 'jobTitle', 
      'type', 'scheduledDate', 'interviewer'
    ];

    for (const field of requiredFields) {
      if (!interviewData[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `${field} is required`
          },
          { status: 400 }
        );
      }
    }

    // Create new interview
    const newInterview: Interview = {
      id: `interview-${Date.now()}`,
      companyId: 'company-1', // In real app, get from auth token
      candidateId: interviewData.candidateId,
      applicationId: interviewData.applicationId,
      jobId: interviewData.jobId,
      jobTitle: interviewData.jobTitle,
      companyName: 'TechCorp Inc', // In real app, get from company profile
      candidateName: 'Candidate Name', // In real app, get from candidate profile
      type: interviewData.type,
      scheduledDate: interviewData.scheduledDate,
      duration: interviewData.duration || 60,
      location: interviewData.location,
      meetingLink: interviewData.meetingLink,
      interviewer: interviewData.interviewer,
      status: 'scheduled',
      notes: interviewData.notes,
      requirements: interviewData.requirements || [],
      agenda: interviewData.agenda || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real application, you would:
    // 1. Save to database
    // 2. Send email notifications to candidate and interviewer
    // 3. Create calendar events
    // 4. Send in-app notifications

    mockInterviews.push(newInterview);

    return NextResponse.json({
      success: true,
      data: newInterview,
      message: 'Interview scheduled successfully'
    });
  } catch (error) {
    console.error('Error scheduling interview:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to schedule interview'
      },
      { status: 500 }
    );
  }
}
