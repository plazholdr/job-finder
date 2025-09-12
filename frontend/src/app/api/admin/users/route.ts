import { NextRequest, NextResponse } from 'next/server';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'company' | 'admin';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  company?: {
    name: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
  };
}

// Mock users data - in real app, this would come from backend
const mockUsers: User[] = [
  {
    _id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'student',
    isActive: true,
    emailVerified: true,
    createdAt: '2024-01-15T10:00:00Z',
    lastLoginAt: '2024-01-20T14:30:00Z'
  },
  {
    _id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@techcorp.com',
    role: 'company',
    isActive: true,
    emailVerified: false,
    createdAt: '2024-01-18T09:00:00Z',
    company: {
      name: 'TechCorp Inc',
      verificationStatus: 'pending'
    }
  },
  {
    _id: '3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike@university.edu',
    role: 'student',
    isActive: false,
    emailVerified: true,
    createdAt: '2024-01-10T16:00:00Z',
    lastLoginAt: '2024-01-19T11:00:00Z'
  },
  {
    _id: '4',
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah@dataflow.com',
    role: 'company',
    isActive: true,
    emailVerified: true,
    createdAt: '2024-01-12T08:30:00Z',
    lastLoginAt: '2024-01-20T16:45:00Z',
    company: {
      name: 'DataFlow Ltd',
      verificationStatus: 'verified'
    }
  },
  {
    _id: '5',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@jobfinder.com',
    role: 'admin',
    isActive: true,
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-01-20T18:00:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    let filteredUsers = [...mockUsers];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.company?.name && user.company.name.toLowerCase().includes(searchLower))
      );
    }

    // Apply role filter
    if (role && role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    // Apply status filter
    if (status && status !== 'all') {
      if (status === 'active') {
        filteredUsers = filteredUsers.filter(user => user.isActive);
      } else if (status === 'inactive') {
        filteredUsers = filteredUsers.filter(user => !user.isActive);
      } else if (status === 'verified') {
        filteredUsers = filteredUsers.filter(user => user.emailVerified);
      } else if (status === 'unverified') {
        filteredUsers = filteredUsers.filter(user => !user.emailVerified);
      }
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: {
        users: paginatedUsers,
        pagination: {
          page,
          limit,
          total: filteredUsers.length,
          pages: Math.ceil(filteredUsers.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users'
      },
      { status: 500 }
    );
  }
}
