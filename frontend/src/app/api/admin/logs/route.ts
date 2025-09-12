import { NextRequest, NextResponse } from 'next/server';

interface AdminLog {
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: string;
  details: any;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

// Mock admin logs data
const mockAdminLogs: AdminLog[] = [
  {
    adminId: 'admin-1',
    adminName: 'Admin User',
    adminEmail: 'admin@jobfinder.com',
    action: 'company_verification',
    details: {
      companyId: 'comp-1',
      status: 'verified',
      notes: 'All documents verified successfully'
    },
    timestamp: '2024-01-20T18:30:00Z',
    ipAddress: '192.168.1.100'
  },
  {
    adminId: 'admin-1',
    adminName: 'Admin User',
    adminEmail: 'admin@jobfinder.com',
    action: 'user_status_update',
    details: {
      userId: 'user-123',
      status: 'inactive',
      reason: 'Violation of terms of service'
    },
    timestamp: '2024-01-20T17:45:00Z',
    ipAddress: '192.168.1.100'
  },
  {
    adminId: 'admin-2',
    adminName: 'Sarah Admin',
    adminEmail: 'sarah.admin@jobfinder.com',
    action: 'company_verification',
    details: {
      companyId: 'comp-2',
      status: 'rejected',
      notes: 'Incomplete documentation provided'
    },
    timestamp: '2024-01-20T16:20:00Z',
    ipAddress: '192.168.1.101'
  },
  {
    adminId: 'admin-1',
    adminName: 'Admin User',
    adminEmail: 'admin@jobfinder.com',
    action: 'user_status_update',
    details: {
      userId: 'user-456',
      status: 'active',
      reason: 'Account restored after verification'
    },
    timestamp: '2024-01-20T15:10:00Z',
    ipAddress: '192.168.1.100'
  },
  {
    adminId: 'admin-2',
    adminName: 'Sarah Admin',
    adminEmail: 'sarah.admin@jobfinder.com',
    action: 'system_settings_update',
    details: {
      setting: 'email_notifications',
      oldValue: false,
      newValue: true
    },
    timestamp: '2024-01-20T14:30:00Z',
    ipAddress: '192.168.1.101'
  },
  {
    adminId: 'admin-1',
    adminName: 'Admin User',
    adminEmail: 'admin@jobfinder.com',
    action: 'company_verification',
    details: {
      companyId: 'comp-3',
      status: 'verified',
      notes: 'Fast-track verification for established company'
    },
    timestamp: '2024-01-20T13:15:00Z',
    ipAddress: '192.168.1.100'
  },
  {
    adminId: 'admin-2',
    adminName: 'Sarah Admin',
    adminEmail: 'sarah.admin@jobfinder.com',
    action: 'user_deletion',
    details: {
      userId: 'user-789',
      reason: 'Spam account detected'
    },
    timestamp: '2024-01-20T12:00:00Z',
    ipAddress: '192.168.1.101'
  },
  {
    adminId: 'admin-1',
    adminName: 'Admin User',
    adminEmail: 'admin@jobfinder.com',
    action: 'bulk_user_update',
    details: {
      affectedUsers: 25,
      action: 'email_verification_reminder',
      reason: 'Monthly cleanup process'
    },
    timestamp: '2024-01-20T10:30:00Z',
    ipAddress: '192.168.1.100'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const adminId = searchParams.get('adminId');

    let filteredLogs = [...mockAdminLogs];

    // Filter by specific admin if requested
    if (adminId) {
      filteredLogs = filteredLogs.filter(log => log.adminId === adminId);
    }

    // Sort by timestamp descending and apply limit
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    filteredLogs = filteredLogs.slice(0, limit);

    // In a real application, you would:
    // 1. Verify admin authentication
    // 2. Fetch admin action logs from database
    // 3. Apply proper filtering and pagination
    // 4. Include additional metadata like IP addresses, user agents

    return NextResponse.json({
      success: true,
      data: filteredLogs
    });
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch admin logs'
      },
      { status: 500 }
    );
  }
}
