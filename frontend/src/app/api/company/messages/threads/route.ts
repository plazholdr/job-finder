import { NextRequest, NextResponse } from 'next/server';
import { MessageThread } from '@/types/company';

// Mock message threads data
let mockThreads: MessageThread[] = [
  {
    id: 'thread-1',
    applicationId: 'app-1',
    jobId: 'job-1',
    jobTitle: 'Software Engineering Intern',
    candidate: {
      id: 'candidate-1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567'
    },
    lastMessage: {
      id: 'msg-4',
      threadId: 'thread-1',
      senderId: 'company-user-1',
      senderType: 'company',
      content: 'Perfect! How about Tuesday at 2:00 PM PST? The interview will be conducted via video call and should take about 60 minutes. I\'ll send you the meeting link closer to the date.',
      sentAt: new Date('2024-01-23T09:00:00Z'),
      readAt: new Date('2024-01-23T09:30:00Z')
    },
    lastMessageAt: new Date('2024-01-23T09:00:00Z'),
    unreadCount: 0,
    status: 'active',
    createdAt: new Date('2024-01-22T10:30:00Z'),
    updatedAt: new Date('2024-01-23T09:00:00Z')
  },
  {
    id: 'thread-2',
    applicationId: 'app-2',
    jobId: 'job-2',
    jobTitle: 'Marketing Intern',
    candidate: {
      id: 'candidate-2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 987-6543'
    },
    lastMessage: {
      id: 'msg-5',
      threadId: 'thread-2',
      senderId: 'candidate-2',
      senderType: 'candidate',
      content: 'Hello! I wanted to follow up on my application for the Marketing Intern position. I\'m very passionate about digital marketing and would love to contribute to your team.',
      sentAt: new Date('2024-01-21T16:20:00Z'),
      readAt: undefined
    },
    lastMessageAt: new Date('2024-01-21T16:20:00Z'),
    unreadCount: 1,
    status: 'active',
    createdAt: new Date('2024-01-21T16:20:00Z'),
    updatedAt: new Date('2024-01-21T16:20:00Z')
  },
  {
    id: 'thread-3',
    applicationId: 'app-3',
    jobId: 'job-1',
    jobTitle: 'Software Engineering Intern',
    candidate: {
      id: 'candidate-3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      phone: '+1 (555) 456-7890'
    },
    lastMessage: {
      id: 'msg-7',
      threadId: 'thread-3',
      senderId: 'candidate-3',
      senderType: 'candidate',
      content: 'Thank you for reaching out! I\'m available for a phone screening. Thursday or Friday afternoon would work best for me. Looking forward to hearing from you.',
      sentAt: new Date('2024-01-20T13:30:00Z'),
      readAt: new Date('2024-01-20T14:00:00Z')
    },
    lastMessageAt: new Date('2024-01-20T13:30:00Z'),
    unreadCount: 0,
    status: 'active',
    createdAt: new Date('2024-01-20T11:45:00Z'),
    updatedAt: new Date('2024-01-20T13:30:00Z')
  },
  {
    id: 'thread-4',
    applicationId: 'app-4',
    jobId: 'job-3',
    jobTitle: 'Data Science Intern',
    candidate: {
      id: 'candidate-4',
      name: 'David Kim',
      email: 'david.kim@email.com',
      phone: '+1 (555) 321-0987'
    },
    lastMessage: {
      id: 'msg-8',
      threadId: 'thread-4',
      senderId: 'company-user-3',
      senderType: 'company',
      content: 'Hi David! We\'ve reviewed your application and are impressed with your background in data science. We\'d like to schedule a technical interview to discuss your experience with machine learning projects.',
      sentAt: new Date('2024-01-19T14:30:00Z'),
      readAt: undefined
    },
    lastMessageAt: new Date('2024-01-19T14:30:00Z'),
    unreadCount: 0,
    status: 'active',
    createdAt: new Date('2024-01-19T14:30:00Z'),
    updatedAt: new Date('2024-01-19T14:30:00Z')
  }
];

// GET all message threads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const jobId = searchParams.get('jobId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    let filteredThreads = [...mockThreads];

    // Filter by status
    if (status && status !== 'all') {
      filteredThreads = filteredThreads.filter(thread => thread.status === status);
    }

    // Filter by job ID
    if (jobId) {
      filteredThreads = filteredThreads.filter(thread => thread.jobId === jobId);
    }

    // Filter unread only
    if (unreadOnly) {
      filteredThreads = filteredThreads.filter(thread => thread.unreadCount > 0);
    }

    // Sort by last message date (most recent first)
    filteredThreads.sort((a, b) => 
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: filteredThreads
    });

  } catch (error) {
    console.error('Error fetching message threads:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// CREATE new message thread
export async function POST(request: NextRequest) {
  try {
    const { applicationId, jobId, jobTitle, candidateId } = await request.json();

    // Validate required fields
    if (!applicationId || !jobId || !jobTitle || !candidateId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application ID, job ID, job title, and candidate ID are required'
        },
        { status: 400 }
      );
    }

    // Check if thread already exists for this application
    const existingThread = mockThreads.find(thread => thread.applicationId === applicationId);
    if (existingThread) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message thread already exists for this application'
        },
        { status: 400 }
      );
    }

    // Mock candidate data (in real app, fetch from database)
    const mockCandidate = {
      id: candidateId,
      name: 'New Candidate',
      email: 'candidate@email.com',
      phone: '+1 (555) 000-0000'
    };

    // Create new thread
    const newThread: MessageThread = {
      id: `thread-${Date.now()}`,
      applicationId,
      jobId,
      jobTitle,
      candidate: mockCandidate,
      lastMessage: undefined,
      lastMessageAt: new Date(),
      unreadCount: 0,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockThreads.push(newThread);

    return NextResponse.json({
      success: true,
      data: newThread,
      message: 'Message thread created successfully'
    });

  } catch (error) {
    console.error('Error creating message thread:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// UPDATE thread status or properties
export async function PUT(request: NextRequest) {
  try {
    const { threadId, status, unreadCount } = await request.json();

    if (!threadId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Thread ID is required'
        },
        { status: 400 }
      );
    }

    const threadIndex = mockThreads.findIndex(thread => thread.id === threadId);
    
    if (threadIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Thread not found'
        },
        { status: 404 }
      );
    }

    // Update thread properties
    if (status !== undefined) {
      mockThreads[threadIndex].status = status;
    }

    if (unreadCount !== undefined) {
      mockThreads[threadIndex].unreadCount = unreadCount;
    }

    mockThreads[threadIndex].updatedAt = new Date();

    return NextResponse.json({
      success: true,
      data: mockThreads[threadIndex],
      message: 'Thread updated successfully'
    });

  } catch (error) {
    console.error('Error updating thread:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// DELETE thread
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');

    if (!threadId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Thread ID is required'
        },
        { status: 400 }
      );
    }

    const threadIndex = mockThreads.findIndex(thread => thread.id === threadId);
    
    if (threadIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Thread not found'
        },
        { status: 404 }
      );
    }

    // Remove the thread
    mockThreads.splice(threadIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Thread deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting thread:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
