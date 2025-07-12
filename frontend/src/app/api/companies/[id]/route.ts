import { NextRequest, NextResponse } from 'next/server';

// Mock data for companies (same as in companies/route.ts)
const mockCompanies = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    description: 'A leading technology company specializing in software development and digital transformation. We provide innovative solutions for businesses across various industries.',
    nature: 'Technology',
    logo: '/api/placeholder/64/64',
    email: 'hr@techcorp.com',
    address: '123 Tech Street, Silicon Valley, CA 94000',
    phoneNumber: '+1-555-0123',
    picEmail: 'john.doe@techcorp.com',
    picMobileNumber: '+1-555-0124',
    website: 'https://techcorp.com',
    // Enhanced fields from ER diagram
    briefDescription: 'Leading technology company specializing in innovative software solutions',
    industry: 'Information Technology',
    size: '500-1000 employees',
    founded: '2015',
    headquarters: 'Silicon Valley, CA',
    mission: 'To empower businesses through innovative technology solutions that drive growth and efficiency.',
    values: ['Innovation', 'Integrity', 'Collaboration', 'Excellence', 'Customer Focus'],
    benefits: ['Health Insurance', 'Flexible Working Hours', 'Professional Development', 'Stock Options', 'Remote Work Options'],
    culture: 'We foster a collaborative and inclusive environment where creativity thrives. Our team values work-life balance and continuous learning.',
    rating: 4.5,
    reviewCount: 127,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Green Energy Inc',
    description: 'Pioneering sustainable energy solutions for a greener future. We focus on renewable energy projects and environmental conservation.',
    nature: 'Energy & Environment',
    logo: '/api/placeholder/64/64',
    email: 'careers@greenenergy.com',
    address: '456 Eco Drive, Portland, OR 97201',
    phoneNumber: '+1-555-0234',
    picEmail: 'sarah.green@greenenergy.com',
    picMobileNumber: '+1-555-0235',
    website: 'https://greenenergy.com',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    name: 'HealthTech Innovations',
    description: 'Revolutionizing healthcare through technology. We develop cutting-edge medical devices and healthcare software solutions.',
    nature: 'Healthcare',
    logo: '/api/placeholder/64/64',
    email: 'jobs@healthtech.com',
    address: '789 Medical Plaza, Boston, MA 02101',
    phoneNumber: '+1-555-0345',
    picEmail: 'dr.smith@healthtech.com',
    picMobileNumber: '+1-555-0346',
    website: 'https://healthtech.com',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: '4',
    name: 'Financial Solutions Group',
    description: 'Providing comprehensive financial services and innovative fintech solutions to help businesses and individuals achieve their financial goals.',
    nature: 'Finance',
    logo: '/api/placeholder/64/64',
    email: 'recruitment@finsol.com',
    address: '321 Wall Street, New York, NY 10005',
    phoneNumber: '+1-555-0456',
    picEmail: 'mike.johnson@finsol.com',
    picMobileNumber: '+1-555-0457',
    website: 'https://finsol.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '5',
    name: 'Creative Design Studio',
    description: 'A full-service creative agency specializing in branding, web design, and digital marketing. We help businesses tell their story through compelling design.',
    nature: 'Creative & Design',
    logo: '/api/placeholder/64/64',
    email: 'hello@creativedesign.com',
    address: '654 Art District, Los Angeles, CA 90028',
    phoneNumber: '+1-555-0567',
    picEmail: 'anna.creative@creativedesign.com',
    picMobileNumber: '+1-555-0568',
    website: 'https://creativedesign.com',
    createdAt: new Date('2023-12-20'),
    updatedAt: new Date('2023-12-20'),
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;

    const company = mockCompanies.find(c => c.id === companyId);

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: company,
      message: 'Company details fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching company details:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch company details'
      },
      { status: 500 }
    );
  }
}
