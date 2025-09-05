import { NextRequest, NextResponse } from 'next/server';

interface Company {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'company';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  company: {
    name: string;
    description?: string;
    industry?: string;
    size?: string;
    website?: string;
    logo?: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    verificationDocuments?: string[];
    businessRegistration?: string;
    taxId?: string;
    contactPerson?: {
      name: string;
      title: string;
      email: string;
      phone: string;
    };
  };
  activeJobsCount?: number;
}

export async function GET(request: NextRequest) {
  try {
    // In a real application, you would:
    // 1. Verify admin authentication
    // 2. Fetch companies from database
    // 3. Include job counts and other statistics
    // 4. Apply pagination and filtering

    // Mock companies data
    const mockCompanies: Company[] = [
      {
        _id: 'company1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@techcorp.com',
        role: 'company',
        isActive: true,
        emailVerified: true,
        createdAt: '2024-01-15T10:00:00Z',
        company: {
          name: 'TechCorp Solutions',
          description: 'Leading technology solutions provider',
          industry: 'Technology',
          size: 'medium',
          website: 'https://techcorp.com',
          verificationStatus: 'verified',
          contactPerson: {
            name: 'John Smith',
            title: 'HR Manager',
            email: 'john@techcorp.com',
            phone: '+1-555-0123'
          }
        },
        activeJobsCount: 5
      },
      {
        _id: 'company2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@innovate.com',
        role: 'company',
        isActive: true,
        emailVerified: true,
        createdAt: '2024-02-01T14:30:00Z',
        company: {
          name: 'Innovate Labs',
          description: 'Innovation and research company',
          industry: 'Research',
          size: 'startup',
          website: 'https://innovatelabs.com',
          verificationStatus: 'pending',
          contactPerson: {
            name: 'Sarah Johnson',
            title: 'CEO',
            email: 'sarah@innovate.com',
            phone: '+1-555-0456'
          }
        },
        activeJobsCount: 2
      },
      {
        _id: 'company3',
        firstName: 'Mike',
        lastName: 'Davis',
        email: 'mike@greentech.com',
        role: 'company',
        isActive: true,
        emailVerified: false,
        createdAt: '2024-02-10T09:15:00Z',
        company: {
          name: 'GreenTech Energy',
          description: 'Sustainable energy solutions',
          industry: 'Energy',
          size: 'large',
          website: 'https://greentech.com',
          verificationStatus: 'rejected',
          contactPerson: {
            name: 'Mike Davis',
            title: 'Recruitment Manager',
            email: 'mike@greentech.com',
            phone: '+1-555-0789'
          }
        },
        activeJobsCount: 0
      },
      {
        _id: 'company4',
        firstName: 'Lisa',
        lastName: 'Chen',
        email: 'lisa@financeplus.com',
        role: 'company',
        isActive: true,
        emailVerified: true,
        createdAt: '2024-02-15T16:45:00Z',
        company: {
          name: 'FinancePlus',
          description: 'Financial services and consulting',
          industry: 'Finance',
          size: 'medium',
          website: 'https://financeplus.com',
          verificationStatus: 'verified',
          contactPerson: {
            name: 'Lisa Chen',
            title: 'HR Director',
            email: 'lisa@financeplus.com',
            phone: '+1-555-0321'
          }
        },
        activeJobsCount: 8
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockCompanies,
      total: mockCompanies.length,
      message: 'Companies fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch companies'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyData = await request.json();

    // In a real application, you would:
    // 1. Verify admin authentication
    // 2. Validate company data
    // 3. Create company in database
    // 4. Send welcome email
    // 5. Log admin action

    console.log('Admin creating new company:', companyData);

    // Mock successful response
    return NextResponse.json({
      success: true,
      message: 'Company created successfully',
      data: {
        id: `company-${Date.now()}`,
        ...companyData
      }
    });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create company'
      },
      { status: 500 }
    );
  }
}
