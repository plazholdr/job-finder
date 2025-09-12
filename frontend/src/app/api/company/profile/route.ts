import { NextRequest, NextResponse } from 'next/server';
import { CompanyProfile } from '@/types/company';

// Mock company profile data
let mockCompanyProfile: CompanyProfile = {
  id: 'company-1',
  name: 'TechCorp Solutions',
  description: 'A leading technology company focused on innovative software solutions and digital transformation. We help businesses leverage cutting-edge technology to achieve their goals.',
  industry: 'Technology',
  size: 'medium',
  founded: 2018,
  headquarters: 'San Francisco, CA, USA',
  website: 'https://www.techcorp.com',
  logo: '/logos/techcorp-logo.png',
  coverImage: '/images/techcorp-cover.jpg',
  
  // Contact Information
  email: 'contact@techcorp.com',
  phone: '+1 (555) 123-4567',
  address: {
    street: '123 Tech Street',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    zipCode: '94105'
  },
  
  // Company Details
  mission: 'To empower businesses through innovative technology solutions that drive growth and efficiency.',
  vision: 'To be the leading technology partner for businesses worldwide, creating a more connected and efficient future.',
  values: [
    'Innovation',
    'Integrity',
    'Collaboration',
    'Excellence',
    'Customer Focus'
  ],
  culture: 'We foster a collaborative, inclusive environment where creativity thrives and every team member can make a meaningful impact.',
  benefits: [
    'Competitive salary and equity',
    'Comprehensive health insurance',
    'Flexible work arrangements',
    'Professional development opportunities',
    'Unlimited PTO',
    'Modern office with great amenities',
    'Team building events and activities'
  ],
  
  // Point of Contact
  primaryContact: {
    name: 'John Smith',
    title: 'HR Manager',
    email: 'john.smith@techcorp.com',
    phone: '+1 (555) 123-4568'
  },
  
  // Social Media
  socialMedia: {
    linkedin: 'https://linkedin.com/company/techcorp',
    twitter: 'https://twitter.com/techcorp',
    facebook: 'https://facebook.com/techcorp',
    instagram: 'https://instagram.com/techcorp'
  },
  
  // Verification and Status
  isVerified: true,
  status: 'active',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-22')
};

export async function GET(request: NextRequest) {
  try {
    // In a real application, you would:
    // 1. Verify the user's authentication token
    // 2. Get the company ID from the token
    // 3. Query the database for the company profile
    // 4. Return the profile data

    return NextResponse.json({
      success: true,
      data: mockCompanyProfile
    });

  } catch (error) {
    console.error('Error fetching company profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updatedData: Partial<CompanyProfile> = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'description', 'industry', 'email', 'phone', 'headquarters'];
    for (const field of requiredFields) {
      if (!updatedData[field as keyof CompanyProfile]) {
        return NextResponse.json(
          {
            success: false,
            error: `${field} is required`
          },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (updatedData.email && !emailRegex.test(updatedData.email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format'
        },
        { status: 400 }
      );
    }

    // Validate website URL format
    if (updatedData.website) {
      try {
        new URL(updatedData.website);
      } catch {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid website URL format'
          },
          { status: 400 }
        );
      }
    }

    // Validate founded year
    if (updatedData.founded) {
      const currentYear = new Date().getFullYear();
      if (updatedData.founded < 1800 || updatedData.founded > currentYear) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid founded year'
          },
          { status: 400 }
        );
      }
    }

    // Update the mock profile data
    mockCompanyProfile = {
      ...mockCompanyProfile,
      ...updatedData,
      updatedAt: new Date()
    };

    // In a real application, you would:
    // 1. Verify the user's authentication token
    // 2. Get the company ID from the token
    // 3. Validate the user has permission to update this company
    // 4. Update the database with the new profile data
    // 5. Return the updated profile

    return NextResponse.json({
      success: true,
      data: mockCompanyProfile,
      message: 'Company profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating company profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Get company profile by ID (for public viewing)
export async function POST(request: NextRequest) {
  try {
    const { companyId } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company ID is required'
        },
        { status: 400 }
      );
    }

    // In a real application, you would query the database for the company
    if (companyId === mockCompanyProfile.id) {
      // Return public profile data (without sensitive information)
      const publicProfile = {
        id: mockCompanyProfile.id,
        name: mockCompanyProfile.name,
        description: mockCompanyProfile.description,
        industry: mockCompanyProfile.industry,
        size: mockCompanyProfile.size,
        founded: mockCompanyProfile.founded,
        headquarters: mockCompanyProfile.headquarters,
        website: mockCompanyProfile.website,
        logo: mockCompanyProfile.logo,
        coverImage: mockCompanyProfile.coverImage,
        mission: mockCompanyProfile.mission,
        vision: mockCompanyProfile.vision,
        values: mockCompanyProfile.values,
        culture: mockCompanyProfile.culture,
        benefits: mockCompanyProfile.benefits,
        socialMedia: mockCompanyProfile.socialMedia,
        isVerified: mockCompanyProfile.isVerified,
        status: mockCompanyProfile.status
      };

      return NextResponse.json({
        success: true,
        data: publicProfile
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Company not found'
      },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error fetching public company profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
