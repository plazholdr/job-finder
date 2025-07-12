import { NextRequest, NextResponse } from 'next/server';

// Mock data for companies
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const nature = searchParams.get('nature');
    const location = searchParams.get('location');

    let filteredCompanies = [...mockCompanies];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCompanies = filteredCompanies.filter(company =>
        company.name.toLowerCase().includes(searchLower) ||
        company.description.toLowerCase().includes(searchLower) ||
        company.nature.toLowerCase().includes(searchLower)
      );
    }

    // Apply nature filter
    if (nature) {
      const natureList = nature.split(',');
      filteredCompanies = filteredCompanies.filter(company =>
        natureList.includes(company.nature)
      );
    }

    // Apply location filter
    if (location) {
      const locationList = location.split(',');
      filteredCompanies = filteredCompanies.filter(company =>
        locationList.some(loc => company.address.toLowerCase().includes(loc.toLowerCase()))
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredCompanies,
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
