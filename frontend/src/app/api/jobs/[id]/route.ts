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
];

// Mock internship data
const mockInternships = [
  {
    id: '1',
    jobId: '1',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-08-31'),
    duration: '3 months',
    profession: 'Software Development',
    jobDescription: 'As a Software Development Intern, you will work closely with our engineering team to develop and maintain web applications. You will gain experience in full-stack development, participate in code reviews, and contribute to real projects that impact our customers.',
    location: 'Silicon Valley, CA',
    cityState: 'Silicon Valley, CA',
    postalCode: '94000',
    quantity: 2,
    maxQuantity: 3,
    picName: 'John Doe - Senior Developer',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    jobId: '2',
    startDate: new Date('2024-06-15'),
    endDate: new Date('2024-09-15'),
    duration: '3 months',
    profession: 'Environmental Research',
    jobDescription: 'Join our research team to work on cutting-edge renewable energy projects. You will assist in data collection, analysis, and contribute to research papers on solar panel efficiency and wind energy optimization.',
    location: 'Portland, OR',
    cityState: 'Portland, OR',
    postalCode: '97201',
    quantity: 1,
    maxQuantity: 2,
    picName: 'Dr. Sarah Green - Research Director',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
];

// Mock project data
const mockProjects = [
  {
    id: '1',
    internshipId: '1',
    title: 'Customer Portal Enhancement',
    description: 'Enhance the existing customer portal with new features including real-time notifications, improved dashboard analytics, and mobile responsiveness. This project involves working with React, Node.js, and MongoDB.',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-08-31'),
    duration: '3 months',
    location: 'Silicon Valley, CA',
    levelMultiple: true,
    roleDescription: 'You will work as a junior developer under the guidance of senior team members. Responsibilities include implementing UI components, writing unit tests, and participating in agile development processes.',
    areaOfInterest1: 'Web Development',
    areaOfInterest2: 'User Experience',
    areaOfInterest3: 'Database Design',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    internshipId: '2',
    title: 'Solar Panel Efficiency Study',
    description: 'Conduct research on improving solar panel efficiency through advanced materials and design optimization. This project involves laboratory work, data analysis, and collaboration with industry partners.',
    startDate: new Date('2024-06-15'),
    endDate: new Date('2024-09-15'),
    duration: '3 months',
    location: 'Portland, OR',
    levelMultiple: false,
    roleDescription: 'You will assist senior researchers in conducting experiments, collecting and analyzing data, and preparing research documentation. This role requires attention to detail and strong analytical skills.',
    areaOfInterest1: 'Renewable Energy',
    areaOfInterest2: 'Materials Science',
    areaOfInterest3: 'Data Analysis',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    
    const job = mockJobs.find(j => j.id === jobId);
    
    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job not found'
        },
        { status: 404 }
      );
    }

    // Find related internship and project data
    const internship = mockInternships.find(i => i.jobId === jobId);
    const project = internship ? mockProjects.find(p => p.internshipId === internship.id) : null;

    return NextResponse.json({
      success: true,
      data: {
        job,
        internship,
        project
      },
      message: 'Job details fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching job details:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch job details'
      },
      { status: 500 }
    );
  }
}
