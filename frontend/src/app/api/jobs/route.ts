import { NextRequest, NextResponse } from 'next/server';

// Mock data for jobs
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
    id: '3',
    companyId: '3',
    company: {
      id: '3',
      name: 'HealthTech Innovations',
      logo: '/api/placeholder/64/64',
    },
    logo: '/api/placeholder/64/64',
    name: 'HealthTech Innovations',
    title: 'Medical Device Engineering Intern',
    briefDescription: 'Work on next-generation medical devices and healthcare technology. Gain hands-on experience in biomedical engineering and FDA compliance processes.',
    postedDate: new Date('2024-01-05'),
    deadline: new Date('2024-02-05'),
    location: 'Boston, MA',
    salaryRange: '$22-28/hour',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: '4',
    companyId: '4',
    company: {
      id: '4',
      name: 'Financial Solutions Group',
      logo: '/api/placeholder/64/64',
    },
    logo: '/api/placeholder/64/64',
    name: 'Financial Solutions Group',
    title: 'Fintech Development Intern',
    briefDescription: 'Develop innovative financial technology solutions and work with blockchain, AI, and data analytics. Perfect for students interested in finance and technology.',
    postedDate: new Date('2024-01-01'),
    deadline: new Date('2024-02-01'),
    location: 'New York, NY',
    salaryRange: '$25-30/hour',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '5',
    companyId: '5',
    company: {
      id: '5',
      name: 'Creative Design Studio',
      logo: '/api/placeholder/64/64',
    },
    logo: '/api/placeholder/64/64',
    name: 'Creative Design Studio',
    title: 'UX/UI Design Intern',
    briefDescription: 'Create beautiful and functional user experiences for web and mobile applications. Work with our design team on client projects and internal tools.',
    postedDate: new Date('2023-12-20'),
    deadline: new Date('2024-01-20'),
    location: 'Los Angeles, CA',
    salaryRange: '$19-24/hour',
    createdAt: new Date('2023-12-20'),
    updatedAt: new Date('2023-12-20'),
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const postedWithin = searchParams.get('postedWithin');
    const deadline = searchParams.get('deadline');

    let filteredJobs = [...mockJobs];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredJobs = filteredJobs.filter(job =>
        job.title.toLowerCase().includes(searchLower) ||
        job.briefDescription.toLowerCase().includes(searchLower) ||
        job.company?.name.toLowerCase().includes(searchLower) ||
        job.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply location filter
    if (location) {
      const locationList = location.split(',');
      filteredJobs = filteredJobs.filter(job =>
        locationList.some(loc => job.location.toLowerCase().includes(loc.toLowerCase()))
      );
    }

    // Apply posted within filter
    if (postedWithin && postedWithin !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (postedWithin) {
        case 'day':
          cutoffDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filteredJobs = filteredJobs.filter(job => 
        new Date(job.postedDate) >= cutoffDate
      );
    }

    // Apply deadline filter
    if (deadline && deadline !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (deadline) {
        case 'week':
          cutoffDate.setDate(now.getDate() + 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() + 1);
          break;
      }
      
      filteredJobs = filteredJobs.filter(job => 
        new Date(job.deadline) <= cutoffDate
      );
    }

    // Sort by posted date (newest first)
    filteredJobs.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());

    return NextResponse.json({
      success: true,
      data: filteredJobs,
      message: 'Jobs fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch jobs'
      },
      { status: 500 }
    );
  }
}
