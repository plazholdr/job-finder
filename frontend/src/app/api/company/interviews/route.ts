import { NextRequest, NextResponse } from 'next/server';
import { Interview } from '@/types/company';

// Mock interviews data
let mockInterviews: Interview[] = [
  {
    id: 'interview-1',
    applicationId: 'app-1',
    jobId: 'job-1',
    jobTitle: 'Software Engineering Intern',
    candidate: {
      id: 'candidate-1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567'
    },
    interviewer: {
      id: 'user-1',
      name: 'Mike Chen',
      title: 'Senior Developer',
      email: 'mike.chen@company.com'
    },
    type: 'video',
    status: 'scheduled',
    scheduledAt: new Date('2024-01-25T14:00:00Z'),
    duration: 60,
    meetingLink: 'https://meet.company.com/interview-abc123',
    agenda: 'Technical discussion, coding challenge, Q&A session',
    notes: 'Focus on React and Node.js experience',
    createdAt: new Date('2024-01-22T10:00:00Z'),
    updatedAt: new Date('2024-01-22T10:00:00Z')
  },
  {
    id: 'interview-2',
    applicationId: 'app-2',
    jobId: 'job-1',
    jobTitle: 'Software Engineering Intern',
    candidate: {
      id: 'candidate-2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 987-6543'
    },
    interviewer: {
      id: 'user-2',
      name: 'Lisa Wang',
      title: 'Engineering Manager',
      email: 'lisa.wang@company.com'
    },
    type: 'in_person',
    status: 'completed',
    scheduledAt: new Date('2024-01-23T10:00:00Z'),
    duration: 90,
    location: 'Conference Room A, 2nd Floor',
    agenda: 'Behavioral interview, technical discussion, team fit assessment',
    notes: 'Excellent problem-solving skills, good cultural fit',
    feedback: 'Strong candidate with great technical skills and communication. Recommended for hire.',
    rating: 5,
    createdAt: new Date('2024-01-20T15:30:00Z'),
    updatedAt: new Date('2024-01-23T11:30:00Z')
  },
  {
    id: 'interview-3',
    applicationId: 'app-3',
    jobId: 'job-1',
    jobTitle: 'Software Engineering Intern',
    candidate: {
      id: 'candidate-3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      phone: '+1 (555) 456-7890'
    },
    interviewer: {
      id: 'user-1',
      name: 'Mike Chen',
      title: 'Senior Developer',
      email: 'mike.chen@company.com'
    },
    type: 'video',
    status: 'in_progress',
    scheduledAt: new Date('2024-01-24T16:00:00Z'),
    duration: 60,
    meetingLink: 'https://meet.company.com/interview-def456',
    agenda: 'Technical screening, coding exercise',
    notes: 'Review Python and Django experience',
    createdAt: new Date('2024-01-21T09:15:00Z'),
    updatedAt: new Date('2024-01-24T16:00:00Z')
  },
  {
    id: 'interview-4',
    applicationId: 'app-4',
    jobId: 'job-2',
    jobTitle: 'Marketing Intern',
    candidate: {
      id: 'candidate-4',
      name: 'David Kim',
      email: 'david.kim@email.com',
      phone: '+1 (555) 321-0987'
    },
    interviewer: {
      id: 'user-3',
      name: 'Sarah Johnson',
      title: 'Marketing Manager',
      email: 'sarah.johnson@company.com'
    },
    type: 'phone',
    status: 'scheduled',
    scheduledAt: new Date('2024-01-26T11:00:00Z'),
    duration: 45,
    agenda: 'Portfolio review, marketing strategy discussion',
    notes: 'Discuss social media marketing experience',
    createdAt: new Date('2024-01-22T14:20:00Z'),
    updatedAt: new Date('2024-01-22T14:20:00Z')
  }
];

// GET all interviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const date = searchParams.get('date');
    const interviewerId = searchParams.get('interviewerId');

    let filteredInterviews = [...mockInterviews];

    // Filter by status
    if (status && status !== 'all') {
      filteredInterviews = filteredInterviews.filter(interview => interview.status === status);
    }

    // Filter by type
    if (type && type !== 'all') {
      filteredInterviews = filteredInterviews.filter(interview => interview.type === type);
    }

    // Filter by interviewer
    if (interviewerId) {
      filteredInterviews = filteredInterviews.filter(interview => interview.interviewer.id === interviewerId);
    }

    // Filter by date
    if (date && date !== 'all') {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      filteredInterviews = filteredInterviews.filter(interview => {
        const interviewDate = new Date(interview.scheduledAt);
        switch (date) {
          case 'today':
            return interviewDate.toDateString() === today.toDateString();
          case 'tomorrow':
            return interviewDate.toDateString() === tomorrow.toDateString();
          case 'this_week':
            return interviewDate >= today && interviewDate <= nextWeek;
          case 'past':
            return interviewDate < today;
          default:
            return true;
        }
      });
    }

    // Sort by scheduled date (upcoming first)
    filteredInterviews.sort((a, b) => 
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
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
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// CREATE new interview
export async function POST(request: NextRequest) {
  try {
    const interviewData = await request.json();

    // Validate required fields
    const requiredFields = ['applicationId', 'type', 'scheduledAt', 'duration', 'interviewerId'];
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

    // Validate interview type specific requirements
    if (interviewData.type === 'video' && !interviewData.meetingLink) {
      return NextResponse.json(
        {
          success: false,
          error: 'Meeting link is required for video interviews'
        },
        { status: 400 }
      );
    }

    if (interviewData.type === 'in_person' && !interviewData.location) {
      return NextResponse.json(
        {
          success: false,
          error: 'Location is required for in-person interviews'
        },
        { status: 400 }
      );
    }

    // Check if scheduled time is in the future
    const scheduledDate = new Date(interviewData.scheduledAt);
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Interview must be scheduled for a future date and time'
        },
        { status: 400 }
      );
    }

    // Mock getting application and interviewer data
    // In real app, fetch from database
    const mockApplication = {
      id: interviewData.applicationId,
      jobId: 'job-1',
      jobTitle: 'Software Engineering Intern',
      candidate: {
        id: 'candidate-1',
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1 (555) 123-4567'
      }
    };

    const mockInterviewer = {
      id: interviewData.interviewerId,
      name: 'Sarah Johnson',
      title: 'Engineering Manager',
      email: 'sarah.johnson@company.com'
    };

    // Create new interview
    const newInterview: Interview = {
      id: `interview-${Date.now()}`,
      applicationId: interviewData.applicationId,
      jobId: mockApplication.jobId,
      jobTitle: mockApplication.jobTitle,
      candidate: mockApplication.candidate,
      interviewer: mockInterviewer,
      type: interviewData.type,
      status: 'scheduled',
      scheduledAt: new Date(interviewData.scheduledAt),
      duration: interviewData.duration,
      meetingLink: interviewData.meetingLink,
      location: interviewData.location,
      agenda: interviewData.agenda,
      notes: interviewData.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockInterviews.push(newInterview);

    return NextResponse.json({
      success: true,
      data: newInterview,
      message: 'Interview scheduled successfully'
    });

  } catch (error) {
    console.error('Error creating interview:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
