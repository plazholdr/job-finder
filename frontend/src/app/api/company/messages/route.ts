import { NextRequest, NextResponse } from 'next/server';
import { Message } from '@/types/company';

// Mock messages data
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
export async function GET(request: NextRequest) {
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

    const threadMessages = mockMessages
      .filter(message => message.threadId === threadId)
      .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());

    return NextResponse.json({
      success: true,
      data: threadMessages
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// CREATE new message
export async function POST(request: NextRequest) {
  try {
    const { threadId, content, senderId, senderType } = await request.json();

    // Validate required fields
    if (!threadId || !content || !senderId || !senderType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Thread ID, content, sender ID, and sender type are required'
        },
        { status: 400 }
      );
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message content cannot be empty'
        },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message content cannot exceed 2000 characters'
        },
        { status: 400 }
      );
    }

    // Create new message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      threadId,
      senderId,
      senderType,
      content: content.trim(),
      sentAt: new Date(),
      readAt: undefined
    };

    mockMessages.push(newMessage);

    return NextResponse.json({
      success: true,
      data: newMessage,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// UPDATE message (mark as read, edit content, etc.)
export async function PUT(request: NextRequest) {
  try {
    const { messageId, readAt, content } = await request.json();

    if (!messageId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message ID is required'
        },
        { status: 400 }
      );
    }

    const messageIndex = mockMessages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message not found'
        },
        { status: 404 }
      );
    }

    // Update message
    if (readAt !== undefined) {
      mockMessages[messageIndex].readAt = readAt ? new Date(readAt) : undefined;
    }

    if (content !== undefined) {
      if (content.trim().length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Message content cannot be empty'
          },
          { status: 400 }
        );
      }
      mockMessages[messageIndex].content = content.trim();
    }

    return NextResponse.json({
      success: true,
      data: mockMessages[messageIndex],
      message: 'Message updated successfully'
    });

  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// DELETE message
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message ID is required'
        },
        { status: 400 }
      );
    }

    const messageIndex = mockMessages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message not found'
        },
        { status: 404 }
      );
    }

    // Remove the message
    mockMessages.splice(messageIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
