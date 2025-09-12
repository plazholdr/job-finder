import { NextRequest, NextResponse } from 'next/server';

interface AutomationMetrics {
  totalRules: number;
  activeRules: number;
  totalExecutions: number;
  successRate: number;
  timeSaved: number; // in hours
  recentExecutions: Array<{
    id: string;
    ruleName: string;
    status: 'success' | 'failed' | 'pending';
    executedAt: Date;
    applicationId?: string;
    error?: string;
  }>;
}

// Mock recent executions data
const mockRecentExecutions = [
  {
    id: 'exec-1',
    ruleName: 'Auto-acknowledge Applications',
    status: 'success' as const,
    executedAt: new Date('2024-01-22T10:30:00Z'),
    applicationId: 'app-1'
  },
  {
    id: 'exec-2',
    ruleName: 'Assign Technical Reviewers',
    status: 'success' as const,
    executedAt: new Date('2024-01-22T09:15:00Z'),
    applicationId: 'app-2'
  },
  {
    id: 'exec-3',
    ruleName: 'Auto-reject Low Scores',
    status: 'success' as const,
    executedAt: new Date('2024-01-21T16:45:00Z'),
    applicationId: 'app-3'
  },
  {
    id: 'exec-4',
    ruleName: 'Schedule Follow-up Interviews',
    status: 'success' as const,
    executedAt: new Date('2024-01-21T14:20:00Z'),
    applicationId: 'app-4'
  },
  {
    id: 'exec-5',
    ruleName: 'Auto-acknowledge Applications',
    status: 'success' as const,
    executedAt: new Date('2024-01-21T11:30:00Z'),
    applicationId: 'app-5'
  },
  {
    id: 'exec-6',
    ruleName: 'Offer Expiration Reminder',
    status: 'failed' as const,
    executedAt: new Date('2024-01-20T18:00:00Z'),
    applicationId: 'app-6',
    error: 'Email delivery failed'
  },
  {
    id: 'exec-7',
    ruleName: 'Assign Technical Reviewers',
    status: 'success' as const,
    executedAt: new Date('2024-01-20T15:45:00Z'),
    applicationId: 'app-7'
  },
  {
    id: 'exec-8',
    ruleName: 'Auto-acknowledge Applications',
    status: 'success' as const,
    executedAt: new Date('2024-01-20T13:20:00Z'),
    applicationId: 'app-8'
  },
  {
    id: 'exec-9',
    ruleName: 'Schedule Follow-up Interviews',
    status: 'pending' as const,
    executedAt: new Date('2024-01-20T10:15:00Z'),
    applicationId: 'app-9'
  },
  {
    id: 'exec-10',
    ruleName: 'Auto-reject Low Scores',
    status: 'success' as const,
    executedAt: new Date('2024-01-19T16:30:00Z'),
    applicationId: 'app-10'
  },
  {
    id: 'exec-11',
    ruleName: 'Assign Technical Reviewers',
    status: 'success' as const,
    executedAt: new Date('2024-01-19T14:45:00Z'),
    applicationId: 'app-11'
  },
  {
    id: 'exec-12',
    ruleName: 'Auto-acknowledge Applications',
    status: 'success' as const,
    executedAt: new Date('2024-01-19T11:20:00Z'),
    applicationId: 'app-12'
  },
  {
    id: 'exec-13',
    ruleName: 'Offer Expiration Reminder',
    status: 'success' as const,
    executedAt: new Date('2024-01-18T17:30:00Z'),
    applicationId: 'app-13'
  },
  {
    id: 'exec-14',
    ruleName: 'Auto-acknowledge Applications',
    status: 'success' as const,
    executedAt: new Date('2024-01-18T12:15:00Z'),
    applicationId: 'app-14'
  },
  {
    id: 'exec-15',
    ruleName: 'Schedule Follow-up Interviews',
    status: 'failed' as const,
    executedAt: new Date('2024-01-17T15:45:00Z'),
    applicationId: 'app-15',
    error: 'Calendar integration error'
  }
];

// GET automation metrics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Calculate metrics based on mock data
    const totalExecutions = mockRecentExecutions.length;
    const successfulExecutions = mockRecentExecutions.filter(exec => exec.status === 'success').length;
    const failedExecutions = mockRecentExecutions.filter(exec => exec.status === 'failed').length;
    const pendingExecutions = mockRecentExecutions.filter(exec => exec.status === 'pending').length;

    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

    // Calculate time saved (estimated based on automation efficiency)
    const timeSavedPerExecution = 0.25; // 15 minutes per execution
    const timeSaved = Math.round(successfulExecutions * timeSavedPerExecution);

    // Filter recent executions based on time range
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const filteredExecutions = mockRecentExecutions
      .filter(exec => new Date(exec.executedAt) >= cutoffDate)
      .sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime())
      .slice(0, limit);

    const metrics: AutomationMetrics = {
      totalRules: 5, // Based on mock rules data
      activeRules: 4, // Based on mock rules data (4 active, 1 inactive)
      totalExecutions: filteredExecutions.length,
      successRate,
      timeSaved,
      recentExecutions: filteredExecutions
    };

    return NextResponse.json({
      success: true,
      data: metrics,
      metadata: {
        timeRange,
        generatedAt: new Date().toISOString(),
        breakdown: {
          successful: successfulExecutions,
          failed: failedExecutions,
          pending: pendingExecutions
        }
      }
    });

  } catch (error) {
    console.error('Error fetching automation metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
