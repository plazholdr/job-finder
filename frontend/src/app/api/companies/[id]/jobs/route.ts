import { NextRequest, NextResponse } from 'next/server';

// Mock data for jobs (same as in jobs/route.ts)
const mockJobs = [
  {
    id: '1',
    companyId: '1',
    company: {
      id: '1',
      name: 'TechCorp Solutions',
      logo: '/api/placeholder/64/64',
    },
    logo: '/api/placeholder/64/64',
    name: 'TechCorp Solutions',
    title: 'Software Development Intern',
    briefDescription: 'Join our dynamic development team to work on cutting-edge web applications using React, Node.js, and cloud technologies. Perfect opportunity for computer science students.',
    postedDate: new Date('2024-01-15'),
    deadline: new Date('2024-02-15'),
    location: 'Silicon Valley, CA',
    salaryRange: '$20-25/hour',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    companyId: '2',
    company: {
      id: '2',
      name: 'Green Energy Inc',
      logo: '/api/placeholder/64/64',
    },
    logo: '/api/placeholder/64/64',
    name: 'Green Energy Inc',
    title: 'Environmental Research Intern',
    briefDescription: 'Contribute to groundbreaking research in renewable energy and sustainability. Work with our research team on solar panel efficiency and wind energy optimization.',
    postedDate: new Date('2024-01-10'),
    deadline: new Date('2024-02-10'),
    location: 'Portland, OR',
    salaryRange: '$18-22/hour',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '6',
    companyId: '1',
    company: {
      id: '1',
      name: 'TechCorp Solutions',
      logo: '/api/placeholder/64/64',
    },
    logo: '/api/placeholder/64/64',
    name: 'TechCorp Solutions',
    title: 'Data Science Intern',
    briefDescription: 'Analyze large datasets and build machine learning models to drive business insights. Work with Python, R, and cloud-based analytics platforms.',
    postedDate: new Date('2024-01-12'),
    deadline: new Date('2024-02-12'),
    location: 'Silicon Valley, CA',
    salaryRange: '$23-28/hour',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;
    
    // Filter jobs by company ID
    const companyJobs = mockJobs.filter(job => job.companyId === companyId);
    
    // Sort by posted date (newest first)
    companyJobs.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());

    return NextResponse.json({
      success: true,
      data: companyJobs,
      message: 'Company jobs fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch company jobs'
      },
      { status: 500 }
    );
  }
}
