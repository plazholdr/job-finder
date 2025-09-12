import { NextRequest, NextResponse } from 'next/server';

interface PendingCompany {
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
    verificationStatus: 'pending';
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
}

// Mock pending companies data
const mockPendingCompanies: PendingCompany[] = [
  {
    _id: 'comp-1',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@techcorp.com',
    role: 'company',
    isActive: true,
    emailVerified: true,
    createdAt: '2024-01-18T09:00:00Z',
    company: {
      name: 'TechCorp Inc',
      description: 'Leading technology solutions provider',
      industry: 'Technology',
      size: '100-500',
      website: 'https://techcorp.com',
      verificationStatus: 'pending',
      verificationDocuments: [
        '/documents/business-license.pdf',
        '/documents/tax-certificate.pdf'
      ],
      businessRegistration: 'BR123456789',
      taxId: 'TX987654321',
      contactPerson: {
        name: 'Jane Smith',
        title: 'HR Director',
        email: 'jane@techcorp.com',
        phone: '+1 (555) 123-4567'
      }
    }
  },
  {
    _id: 'comp-2',
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert@innovatetech.com',
    role: 'company',
    isActive: true,
    emailVerified: false,
    createdAt: '2024-01-19T14:30:00Z',
    company: {
      name: 'InnovateTech Solutions',
      description: 'Innovative software development company',
      industry: 'Software Development',
      size: '50-100',
      website: 'https://innovatetech.com',
      verificationStatus: 'pending',
      verificationDocuments: [
        '/documents/business-registration.pdf'
      ],
      businessRegistration: 'BR555666777',
      contactPerson: {
        name: 'Robert Johnson',
        title: 'CEO',
        email: 'robert@innovatetech.com',
        phone: '+1 (555) 987-6543'
      }
    }
  },
  {
    _id: 'comp-3',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria@dataanalytics.com',
    role: 'company',
    isActive: true,
    emailVerified: true,
    createdAt: '2024-01-20T11:15:00Z',
    company: {
      name: 'Data Analytics Pro',
      description: 'Professional data analytics and consulting services',
      industry: 'Data Analytics',
      size: '10-50',
      website: 'https://dataanalytics.com',
      verificationStatus: 'pending',
      verificationDocuments: [
        '/documents/business-license.pdf',
        '/documents/insurance-certificate.pdf',
        '/documents/tax-id.pdf'
      ],
      businessRegistration: 'BR888999000',
      taxId: 'TX111222333',
      contactPerson: {
        name: 'Maria Garcia',
        title: 'Founder & CEO',
        email: 'maria@dataanalytics.com',
        phone: '+1 (555) 456-7890'
      }
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    // In a real application, you would:
    // 1. Verify admin authentication
    // 2. Fetch pending companies from database
    // 3. Include verification documents and details

    return NextResponse.json({
      success: true,
      data: mockPendingCompanies
    });
  } catch (error) {
    console.error('Error fetching pending companies:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch pending companies'
      },
      { status: 500 }
    );
  }
}
