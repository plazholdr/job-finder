import { NextRequest, NextResponse } from 'next/server';

// Mock system statistics - in real app, this would come from backend
const mockStats = {
  users: {
    students: 892,
    companies: 156,
    admins: 8,
    total: 1056
  },
  verification: {
    pending: 23,
    verified: 133
  },
  activity: {
    recentRegistrations: 47, // Last 30 days
    activeUsers: 324 // Last 7 days
  }
};

export async function GET(request: NextRequest) {
  try {
    // In a real application, you would:
    // 1. Verify admin authentication
    // 2. Fetch real statistics from database
    // 3. Calculate metrics like active users, recent registrations, etc.

    return NextResponse.json({
      success: true,
      data: mockStats
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch system statistics'
      },
      { status: 500 }
    );
  }
}
