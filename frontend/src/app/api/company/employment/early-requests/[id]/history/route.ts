import { NextRequest, NextResponse } from 'next/server';

interface HistoryEntry {
  id: string;
  type: 'status_change' | 'remark_added' | 'document_uploaded' | 'notification_sent' | 'workflow_step' | 'admin_action';
  timestamp: Date;
  actor: {
    id: string;
    name: string;
    role: 'employee' | 'supervisor' | 'admin' | 'hr' | 'system';
  };
  description: string;
  details?: {
    previousValue?: string;
    newValue?: string;
    notes?: string;
    metadata?: Record<string, any>;
  };
  visibility: 'public' | 'internal' | 'admin_only';
}

interface RequestTracking {
  requestId: string;
  currentStatus: string;
  createdAt: Date;
  lastUpdated: Date;
  totalDuration: number; // in hours
  statusDurations: Record<string, number>; // time spent in each status
  history: HistoryEntry[];
  milestones: Array<{
    id: string;
    name: string;
    description: string;
    targetDate?: Date;
    completedDate?: Date;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'skipped';
    assignedTo?: string;
  }>;
  metrics: {
    responseTime: number; // hours from submission to first review
    processingTime: number; // hours from submission to decision
    escalations: number;
    reopenCount: number;
  };
  notifications: Array<{
    id: string;
    type: 'email' | 'system' | 'sms';
    recipient: string;
    subject: string;
    sentAt: Date;
    readAt?: Date;
    status: 'sent' | 'delivered' | 'read' | 'failed';
  }>;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    uploadedBy: string;
    uploadedAt: Date;
    version: number;
    size: number;
    url: string;
  }>;
  comments: Array<{
    id: string;
    authorId: string;
    authorName: string;
    authorRole: string;
    content: string;
    createdAt: Date;
    editedAt?: Date;
    visibility: 'public' | 'internal' | 'admin_only';
    attachments?: string[];
  }>;
}

// Mock tracking data
const mockRequestTracking: Record<string, RequestTracking> = {
  'early-req-1': {
    requestId: 'early-req-1',
    currentStatus: 'pending',
    createdAt: new Date('2024-03-15T09:00:00Z'),
    lastUpdated: new Date('2024-03-15T09:00:00Z'),
    totalDuration: 0,
    statusDurations: {
      'pending': 0
    },
    history: [
      {
        id: 'hist-1',
        type: 'status_change',
        timestamp: new Date('2024-03-15T09:00:00Z'),
        actor: {
          id: 'emp-001',
          name: 'John Smith',
          role: 'employee'
        },
        description: 'Early completion request submitted',
        details: {
          newValue: 'pending',
          notes: 'Request for early completion due to full-time offer'
        },
        visibility: 'public'
      },
      {
        id: 'hist-2',
        type: 'notification_sent',
        timestamp: new Date('2024-03-15T09:01:00Z'),
        actor: {
          id: 'system',
          name: 'System',
          role: 'system'
        },
        description: 'Notification sent to supervisor',
        details: {
          metadata: {
            recipient: 'Jane Doe',
            type: 'email',
            subject: 'New early completion request requires review'
          }
        },
        visibility: 'internal'
      }
    ],
    milestones: [
      {
        id: 'milestone-1',
        name: 'Initial Submission',
        description: 'Employee submits early completion request',
        completedDate: new Date('2024-03-15T09:00:00Z'),
        status: 'completed'
      },
      {
        id: 'milestone-2',
        name: 'Supervisor Review',
        description: 'Direct supervisor reviews the request',
        targetDate: new Date('2024-03-17T17:00:00Z'),
        status: 'pending',
        assignedTo: 'Jane Doe'
      },
      {
        id: 'milestone-3',
        name: 'Admin Decision',
        description: 'Company admin makes final decision',
        targetDate: new Date('2024-03-20T17:00:00Z'),
        status: 'pending',
        assignedTo: 'Company Admin'
      },
      {
        id: 'milestone-4',
        name: 'Status Update',
        description: 'Employment status updated accordingly',
        status: 'pending'
      }
    ],
    metrics: {
      responseTime: 0,
      processingTime: 0,
      escalations: 0,
      reopenCount: 0
    },
    notifications: [
      {
        id: 'notif-1',
        type: 'email',
        recipient: 'jane.doe@company.com',
        subject: 'New early completion request requires review',
        sentAt: new Date('2024-03-15T09:01:00Z'),
        status: 'sent'
      },
      {
        id: 'notif-2',
        type: 'system',
        recipient: 'admin@company.com',
        subject: 'Early completion request submitted',
        sentAt: new Date('2024-03-15T09:01:00Z'),
        status: 'sent'
      }
    ],
    documents: [
      {
        id: 'doc-1',
        name: 'offer_letter.pdf',
        type: 'application/pdf',
        uploadedBy: 'John Smith',
        uploadedAt: new Date('2024-03-15T09:00:00Z'),
        version: 1,
        size: 245760,
        url: '/documents/early-req-1/offer_letter.pdf'
      }
    ],
    comments: [
      {
        id: 'comment-1',
        authorId: 'emp-001',
        authorName: 'John Smith',
        authorRole: 'employee',
        content: 'I have received a full-time offer and would like to complete my internship early to start the new position.',
        createdAt: new Date('2024-03-15T09:00:00Z'),
        visibility: 'public'
      }
    ]
  }
};

// GET request history and tracking
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const requestId = params.id;
    const { searchParams } = new URL(request.url);
    const includeInternal = searchParams.get('includeInternal') === 'true';
    const includeAdminOnly = searchParams.get('includeAdminOnly') === 'true';
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const type = searchParams.get('type');

    const tracking = mockRequestTracking[requestId];
    if (!tracking) {
      return NextResponse.json(
        { success: false, error: 'Request tracking not found' },
        { status: 404 }
      );
    }

    // Filter history based on visibility and parameters
    let filteredHistory = tracking.history.filter(entry => {
      if (entry.visibility === 'admin_only' && !includeAdminOnly) return false;
      if (entry.visibility === 'internal' && !includeInternal) return false;
      return true;
    });

    // Filter by date range
    if (fromDate) {
      const from = new Date(fromDate);
      filteredHistory = filteredHistory.filter(entry => entry.timestamp >= from);
    }
    if (toDate) {
      const to = new Date(toDate);
      filteredHistory = filteredHistory.filter(entry => entry.timestamp <= to);
    }

    // Filter by type
    if (type) {
      filteredHistory = filteredHistory.filter(entry => entry.type === type);
    }

    // Sort by timestamp (newest first)
    filteredHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Calculate current metrics
    const now = new Date();
    const createdAt = new Date(tracking.createdAt);
    const totalHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    // Find first review (non-system action)
    const firstReview = tracking.history.find(entry => 
      entry.actor.role !== 'system' && entry.type !== 'notification_sent'
    );
    const responseTime = firstReview 
      ? (new Date(firstReview.timestamp).getTime() - createdAt.getTime()) / (1000 * 60 * 60)
      : 0;

    // Check for overdue milestones
    const overdueMilestones = tracking.milestones.filter(milestone => 
      milestone.status === 'pending' && 
      milestone.targetDate && 
      new Date(milestone.targetDate) < now
    );

    const enhancedTracking = {
      ...tracking,
      history: filteredHistory,
      metrics: {
        ...tracking.metrics,
        responseTime,
        processingTime: totalHours,
        overdueMilestones: overdueMilestones.length
      },
      summary: {
        totalHistoryEntries: tracking.history.length,
        filteredHistoryEntries: filteredHistory.length,
        totalDurationHours: Math.round(totalHours * 100) / 100,
        averageResponseTime: responseTime,
        completedMilestones: tracking.milestones.filter(m => m.status === 'completed').length,
        pendingMilestones: tracking.milestones.filter(m => m.status === 'pending').length,
        overdueMilestones: overdueMilestones.length
      }
    };

    return NextResponse.json({
      success: true,
      data: enhancedTracking
    });

  } catch (error) {
    console.error('Error fetching request history:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST add history entry (for manual entries, comments, etc.)
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const requestId = params.id;
    const { type, description, details, visibility, actorId, actorName, actorRole } = await request.json();

    // Validate required fields
    if (!type || !description || !actorId || !actorName || !actorRole) {
      return NextResponse.json(
        { success: false, error: 'Type, description, and actor information are required' },
        { status: 400 }
      );
    }

    const tracking = mockRequestTracking[requestId];
    if (!tracking) {
      return NextResponse.json(
        { success: false, error: 'Request tracking not found' },
        { status: 404 }
      );
    }

    // Create new history entry
    const newEntry: HistoryEntry = {
      id: `hist-${Date.now()}`,
      type,
      timestamp: new Date(),
      actor: {
        id: actorId,
        name: actorName,
        role: actorRole
      },
      description,
      details: details || {},
      visibility: visibility || 'internal'
    };

    // Add to history
    tracking.history.push(newEntry);
    tracking.lastUpdated = new Date();

    // Update mock data
    mockRequestTracking[requestId] = tracking;

    return NextResponse.json({
      success: true,
      data: newEntry,
      message: 'History entry added successfully'
    });

  } catch (error) {
    console.error('Error adding history entry:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update milestone status
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const requestId = params.id;
    const { milestoneId, status, notes, completedBy } = await request.json();

    if (!milestoneId || !status) {
      return NextResponse.json(
        { success: false, error: 'Milestone ID and status are required' },
        { status: 400 }
      );
    }

    const tracking = mockRequestTracking[requestId];
    if (!tracking) {
      return NextResponse.json(
        { success: false, error: 'Request tracking not found' },
        { status: 404 }
      );
    }

    // Find and update milestone
    const milestoneIndex = tracking.milestones.findIndex(m => m.id === milestoneId);
    if (milestoneIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Milestone not found' },
        { status: 404 }
      );
    }

    const milestone = tracking.milestones[milestoneIndex];
    const previousStatus = milestone.status;

    // Update milestone
    tracking.milestones[milestoneIndex] = {
      ...milestone,
      status,
      completedDate: status === 'completed' ? new Date() : milestone.completedDate
    };

    // Add history entry for milestone update
    const historyEntry: HistoryEntry = {
      id: `hist-${Date.now()}`,
      type: 'workflow_step',
      timestamp: new Date(),
      actor: {
        id: completedBy || 'system',
        name: completedBy || 'System',
        role: 'admin'
      },
      description: `Milestone "${milestone.name}" status changed from ${previousStatus} to ${status}`,
      details: {
        previousValue: previousStatus,
        newValue: status,
        notes: notes || '',
        metadata: { milestoneId, milestoneName: milestone.name }
      },
      visibility: 'internal'
    };

    tracking.history.push(historyEntry);
    tracking.lastUpdated = new Date();

    // Update mock data
    mockRequestTracking[requestId] = tracking;

    return NextResponse.json({
      success: true,
      data: {
        milestone: tracking.milestones[milestoneIndex],
        historyEntry
      },
      message: 'Milestone updated successfully'
    });

  } catch (error) {
    console.error('Error updating milestone:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
