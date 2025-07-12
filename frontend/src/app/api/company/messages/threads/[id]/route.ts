import { NextRequest, NextResponse } from 'next/server';
import { Message } from '@/types/company';

// Mock messages data (same as in the main messages route)
let mockMessages: Message[] = [
  {
    id: 'msg-1',
    threadId: 'thread-1',
    senderId: 'candidate-1',
    senderType: 'candidate',
    content: 'Thank you for considering my application for the Software Engineering Intern position. I\'m very excited about this opportunity and would love to learn more about the role.',
    sentAt: new Date('2024-01-22T10:30:00Z'),
    readAt: new Date('2024-01-22T11:00:00Z')
  },
  {
    id: 'msg-2',
    threadId: 'thread-1',
    senderId: 'company-user-1',
    senderType: 'company',
    content: 'Hi Sarah! Thank you for your interest in our internship program. We were impressed by your application and would like to schedule a technical interview with you. Are you available next week?',
    sentAt: new Date('2024-01-22T14:15:00Z'),
    readAt: new Date('2024-01-22T14:45:00Z')
  },
  {
    id: 'msg-3',
    threadId: 'thread-1',
    senderId: 'candidate-1',
    senderType: 'candidate',
    content: 'That\'s wonderful news! Yes, I\'m available next week. I\'m flexible with timing - Monday through Friday works for me. What time would be most convenient for the team?',
    sentAt: new Date('2024-01-22T15:30:00Z'),
    readAt: new Date('2024-01-22T16:00:00Z')
  },
  {
    id: 'msg-4',
    threadId: 'thread-1',
    senderId: 'company-user-1',
    senderType: 'company',
    content: 'Perfect! How about Tuesday at 2:00 PM PST? The interview will be conducted via video call and should take about 60 minutes. I\'ll send you the meeting link closer to the date.',
    sentAt: new Date('2024-01-23T09:00:00Z'),
    readAt: new Date('2024-01-23T09:30:00Z')
  },
  {
    id: 'msg-5',
    threadId: 'thread-2',
    senderId: 'candidate-2',
    senderType: 'candidate',
    content: 'Hello! I wanted to follow up on my application for the Marketing Intern position. I\'m very passionate about digital marketing and would love to contribute to your team.',
    sentAt: new Date('2024-01-21T16:20:00Z'),
    readAt: undefined
  },
  {
    id: 'msg-6',
    threadId: 'thread-3',
    senderId: 'company-user-2',
    senderType: 'company',
    content: 'Hi Michael! Thank you for your application. We\'d like to invite you for an initial phone screening. When would be a good time for you this week?',
    sentAt: new Date('2024-01-20T11:45:00Z'),
    readAt: new Date('2024-01-20T12:15:00Z')
  },
  {
    id: 'msg-7',
    threadId: 'thread-3',
    senderId: 'candidate-3',
    senderType: 'candidate',
    content: 'Thank you for reaching out! I\'m available for a phone screening. Thursday or Friday afternoon would work best for me. Looking forward to hearing from you.',
    sentAt: new Date('2024-01-20T13:30:00Z'),
    readAt: new Date('2024-01-20T14:00:00Z')
  }
];

// GET messages for a specific thread
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const threadId = params.id;
    
    const threadMessages = mockMessages
      .filter(message => message.threadId === threadId)
      .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());

    return NextResponse.json({
      success: true,
      data: threadMessages
    });

  } catch (error) {
    console.error('Error fetching thread messages:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Mark thread as read
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const threadId = params.id;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'read') {
      // Mark all unread messages in this thread as read
      const currentTime = new Date();
      
      mockMessages = mockMessages.map(message => {
        if (message.threadId === threadId && !message.readAt) {
          return {
            ...message,
            readAt: currentTime
          };
        }
        return message;
      });

      return NextResponse.json({
        success: true,
        message: 'Thread marked as read'
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action'
      },
      { status: 400 }
    );

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
