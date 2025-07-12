import { NextRequest, NextResponse } from 'next/server';
import { CompanyUser } from '@/types/company';

// Mock storage for company users (in a real app, this would be in a database)
// For demo purposes, we'll create some mock users
const mockCompanyUsers: (CompanyUser & { password: string })[] = [
  {
    id: 'user-1',
    companyId: 'company-1',
    email: 'admin@techcorp.com',
    firstName: 'John',
    lastName: 'Smith',
    title: 'HR Manager',
    department: 'Human Resources',
    role: 'admin',
    permissions: {
      canCreateJobs: true,
      canReviewApplications: true,
      canScheduleInterviews: true,
      canMakeOffers: true,
      canManageUsers: true,
      canViewAnalytics: true
    },
    status: 'active',
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    password: 'password123' // In real app, this would be hashed
  },
  {
    id: 'user-2',
    companyId: 'company-2',
    email: 'hr@innovatetech.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    title: 'Talent Acquisition Manager',
    department: 'Human Resources',
    role: 'hr',
    permissions: {
      canCreateJobs: true,
      canReviewApplications: true,
      canScheduleInterviews: true,
      canMakeOffers: false,
      canManageUsers: false,
      canViewAnalytics: true
    },
    status: 'active',
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    password: 'password123'
  }
];

// Mock function to generate JWT token (in real app, use proper JWT library)
function generateToken(user: CompanyUser): string {
  const payload = {
    userId: user.id,
    companyId: user.companyId,
    email: user.email,
    role: user.role,
    iat: Date.now()
  };
  
  // In a real application, you would use a proper JWT library like jsonwebtoken
  // and sign with a secret key
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and password are required'
        },
        { status: 400 }
      );
    }

    // Find user by email
    const user = mockCompanyUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password'
        },
        { status: 401 }
      );
    }

    // Check password (in real app, compare with hashed password)
    if (user.password !== password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password'
        },
        { status: 401 }
      );
    }

    // Check if user account is active
    if (user.status !== 'active') {
      return NextResponse.json(
        {
          success: false,
          error: 'Your account is not active. Please contact your administrator.'
        },
        { status: 403 }
      );
    }

    // Update last login
    user.lastLogin = new Date();

    // Generate token
    const token = generateToken(user);

    // Remove password from user object before sending
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token: token
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error. Please try again later.'
      },
      { status: 500 }
    );
  }
}

// Verify token endpoint
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: 'No token provided'
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    try {
      // Decode token (in real app, verify JWT signature)
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Find user
      const user = mockCompanyUsers.find(u => u.id === payload.userId);
      
      if (!user || user.status !== 'active') {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid token'
          },
          { status: 401 }
        );
      }

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;

      return NextResponse.json({
        success: true,
        data: {
          user: userWithoutPassword,
          valid: true
        }
      });

    } catch (decodeError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid token'
        },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
