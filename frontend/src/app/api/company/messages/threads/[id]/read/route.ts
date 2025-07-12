import { NextRequest, NextResponse } from 'next/server';
import { Message, MessageThread } from '@/types/company';

// Mock messages data (same as in other routes)
let mockMessages: Message[] = [
  {
    id: 'msg-1',
    threadId: 'thread-1',
    senderId: 'candidate-1',
    senderType: 'candidate',
    content: 'Thank you for considering my application for the Software Engineering Intern position.',
    sentAt: new Date('2024-01-22T10:30:00Z'),
    readAt: new Date('2024-01-22T11:00:00Z')
  },
  {
    id: 'msg-5',
    threadId: 'thread-2',
    senderId: 'candidate-2',
    senderType: 'candidate',
    content: 'Hello! I wanted to follow up on my application for the Marketing Intern position.',
    sentAt: new Date('2024-01-21T16:20:00Z'),
    readAt: undefined
  }
];

// Mock threads data
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
    lastMessage: undefined,
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
    lastMessage: undefined,
    lastMessageAt: new Date('2024-01-21T16:20:00Z'),
    unreadCount: 1,
    status: 'active',
    createdAt: new Date('2024-01-21T16:20:00Z'),
    updatedAt: new Date('2024-01-21T16:20:00Z')
  }
];

// POST - Mark thread as read
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const threadId = params.id;
    
    // Find the thread
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

    // Mark all unread messages in this thread as read
    const currentTime = new Date();
    let markedCount = 0;
    
    mockMessages = mockMessages.map(message => {
      if (message.threadId === threadId && !message.readAt && message.senderType === 'candidate') {
        markedCount++;
        return {
          ...message,
          readAt: currentTime
        };
      }
      return message;
    });

    // Update thread's unread count
    mockThreads[threadIndex].unreadCount = 0;
    mockThreads[threadIndex].updatedAt = currentTime;

    return NextResponse.json({
      success: true,
      data: {
        threadId,
        markedMessagesCount: markedCount,
        thread: mockThreads[threadIndex]
      },
      message: 'Thread marked as read'
    });

  } catch (error) {
    console.error('Error marking thread as read:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
