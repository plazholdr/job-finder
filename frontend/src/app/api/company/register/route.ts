import { NextRequest, NextResponse } from 'next/server';
import { CompanyRegistration, CompanyProfile, CompanyUser } from '@/types/company';

// Mock storage for companies (in a real app, this would be in a database)
let companies: CompanyProfile[] = [];
let companyUsers: CompanyUser[] = [];

export async function POST(request: NextRequest) {
  try {
    const registrationData: CompanyRegistration = await request.json();

    // Validate required fields
    const requiredFields = [
      'companyName',
      'industry',
      'businessEmail',
      'businessPhone',
      'headquarters',
      'contactPerson.firstName',
      'contactPerson.lastName',
      'contactPerson.title',
      'contactPerson.email'
    ];

    for (const field of requiredFields) {
      const value = field.includes('.') 
        ? registrationData[field.split('.')[0] as keyof CompanyRegistration]?.[field.split('.')[1] as any]
        : registrationData[field as keyof CompanyRegistration];
      
      if (!value || (typeof value === 'string' && !value.trim())) {
        return NextResponse.json(
          {
            success: false,
            error: `${field.replace('.', ' ')} is required`
          },
          { status: 400 }
        );
      }
    }

    // Check if company already exists
    const existingCompany = companies.find(
      company => company.email.toLowerCase() === registrationData.businessEmail.toLowerCase()
    );

    if (existingCompany) {
      return NextResponse.json(
        {
          success: false,
          error: 'A company with this email address already exists'
        },
        { status: 409 }
      );
    }

    // Create company profile
    const companyId = `company-${Date.now()}`;
    const newCompany: CompanyProfile = {
      id: companyId,
      name: registrationData.companyName,
      description: registrationData.description,
      industry: registrationData.industry,
      size: registrationData.companySize,
      founded: registrationData.foundedYear,
      headquarters: registrationData.headquarters,
      website: registrationData.website,
      email: registrationData.businessEmail,
      phone: registrationData.businessPhone,
      address: {
        street: '',
        city: registrationData.headquarters.split(',')[0]?.trim() || '',
        state: registrationData.headquarters.split(',')[1]?.trim() || '',
        country: registrationData.headquarters.split(',')[2]?.trim() || '',
        zipCode: ''
      },
      mission: '',
      vision: '',
      values: [],
      culture: '',
      benefits: [],
      primaryContact: {
        name: `${registrationData.contactPerson.firstName} ${registrationData.contactPerson.lastName}`,
        title: registrationData.contactPerson.title,
        email: registrationData.contactPerson.email,
        phone: registrationData.contactPerson.phone || ''
      },
      socialMedia: {},
      isVerified: false,
      status: 'pending', // Requires admin approval
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create company admin user
    const userId = `user-${Date.now()}`;
    const newUser: CompanyUser = {
      id: userId,
      companyId: companyId,
      email: registrationData.contactPerson.email,
      firstName: registrationData.contactPerson.firstName,
      lastName: registrationData.contactPerson.lastName,
      title: registrationData.contactPerson.title,
      department: 'Administration',
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
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store in mock database
    companies.push(newCompany);
    companyUsers.push(newUser);

    // In a real application, you would:
    // 1. Send verification email
    // 2. Create user authentication record
    // 3. Set up company workspace
    // 4. Send welcome email with next steps

    return NextResponse.json({
      success: true,
      data: {
        company: newCompany,
        user: newUser
      },
      message: 'Company registration successful. Please check your email for verification instructions.'
    });

  } catch (error) {
    console.error('Company registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error. Please try again later.'
      },
      { status: 500 }
    );
  }
}

// Get company registration status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email parameter is required'
        },
        { status: 400 }
      );
    }

    const company = companies.find(
      company => company.email.toLowerCase() === email.toLowerCase()
    );

    if (!company) {
      return NextResponse.json({
        success: true,
        data: {
          exists: false,
          status: null
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        exists: true,
        status: company.status,
        isVerified: company.isVerified,
        companyName: company.name
      }
    });

  } catch (error) {
    console.error('Error checking registration status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
