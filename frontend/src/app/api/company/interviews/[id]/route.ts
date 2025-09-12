import { NextRequest, NextResponse } from 'next/server';
import { Interview } from '@/types/company';

// Mock interviews data (same as in the main route)
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
  }
];

// GET single interview by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const interviewId = params.id;
    
    const interview = mockInterviews.find(int => int.id === interviewId);
    
    if (!interview) {
      return NextResponse.json(
        {
          success: false,
          error: 'Interview not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: interview
    });

  } catch (error) {
    console.error('Error fetching interview:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// UPDATE interview (full update)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const interviewId = params.id;
    const updatedData = await request.json();

    const interviewIndex = mockInterviews.findIndex(int => int.id === interviewId);
    
    if (interviewIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Interview not found'
        },
        { status: 404 }
      );
    }

    // Validate required fields for full update
    const requiredFields = ['type', 'scheduledAt', 'duration'];
    for (const field of requiredFields) {
      if (updatedData[field] === undefined) {
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
    if (updatedData.type === 'video' && !updatedData.meetingLink) {
      return NextResponse.json(
        {
          success: false,
          error: 'Meeting link is required for video interviews'
        },
        { status: 400 }
      );
    }

    if (updatedData.type === 'in_person' && !updatedData.location) {
      return NextResponse.json(
        {
          success: false,
          error: 'Location is required for in-person interviews'
        },
        { status: 400 }
      );
    }

    // Update the interview
    mockInterviews[interviewIndex] = {
      ...mockInterviews[interviewIndex],
      ...updatedData,
      updatedAt: new Date()
    };

    return NextResponse.json({
      success: true,
      data: mockInterviews[interviewIndex],
      message: 'Interview updated successfully'
    });

  } catch (error) {
    console.error('Error updating interview:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// PATCH interview (partial update, e.g., status change)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const interviewId = params.id;
    const updates = await request.json();

    const interviewIndex = mockInterviews.findIndex(int => int.id === interviewId);
    
    if (interviewIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Interview not found'
        },
        { status: 404 }
      );
    }

    // Apply partial updates
    mockInterviews[interviewIndex] = {
      ...mockInterviews[interviewIndex],
      ...updates,
      updatedAt: new Date()
    };

    return NextResponse.json({
      success: true,
      data: mockInterviews[interviewIndex],
      message: 'Interview updated successfully'
    });

  } catch (error) {
    console.error('Error updating interview:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// DELETE interview
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const interviewId = params.id;
    
    const interviewIndex = mockInterviews.findIndex(int => int.id === interviewId);
    
    if (interviewIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Interview not found'
        },
        { status: 404 }
      );
    }

    const interview = mockInterviews[interviewIndex];

    // Check if interview can be deleted (only scheduled interviews)
    if (interview.status !== 'scheduled') {
      return NextResponse.json(
        {
          success: false,
          error: 'Only scheduled interviews can be deleted'
        },
        { status: 400 }
      );
    }

    // Remove the interview
    mockInterviews.splice(interviewIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Interview deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting interview:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
