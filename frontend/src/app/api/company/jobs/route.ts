import { NextRequest, NextResponse } from 'next/server';
import { JobPosting } from '@/types/company';

// Mock job postings data
const mockJobs: JobPosting[] = [
  {
    id: 'job-1',
    companyId: 'company-1',
    title: 'Software Engineering Intern',
    description: 'Join our engineering team to work on cutting-edge web applications.',
    requirements: ['JavaScript', 'React', 'Node.js'],
    responsibilities: ['Develop web applications', 'Write clean code', 'Collaborate with team'],
    type: 'internship',
    level: 'entry',
    department: 'Engineering',
    location: {
      type: 'hybrid',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA'
    },
    salary: {
      min: 25,
      max: 35,
      currency: 'USD',
      period: 'hour'
    },
    applicationDeadline: new Date('2024-12-31'),
    requiredSkills: ['JavaScript', 'React', 'Git'],
    preferredSkills: ['TypeScript', 'Next.js'],
    education: {
      level: 'bachelor',
      field: 'Computer Science'
    },
    experience: {
      min: 0,
      max: 1,
      unit: 'years'
    },
    applicationProcess: {
      steps: ['Application Review', 'Technical Interview', 'Final Interview'],
      documentsRequired: ['Resume', 'Cover Letter', 'Portfolio'],
      interviewProcess: 'Two-round interview process'
    },
    status: 'published',
    applicationsCount: 45,
    viewsCount: 234,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    publishedAt: new Date('2024-01-15')
  },
  {
    id: 'job-2',
    companyId: 'company-1',
    title: 'Marketing Intern',
    description: 'Help us grow our brand and reach new audiences.',
    requirements: ['Marketing knowledge', 'Social media experience'],
    responsibilities: ['Create content', 'Manage social media', 'Analyze metrics'],
    type: 'internship',
    level: 'entry',
    department: 'Marketing',
    location: {
      type: 'remote',
      country: 'USA'
    },
    salary: {
      min: 20,
      max: 25,
      currency: 'USD',
      period: 'hour'
    },
    applicationDeadline: new Date('2024-12-31'),
    requiredSkills: ['Social Media', 'Content Creation'],
    preferredSkills: ['Adobe Creative Suite', 'Analytics'],
    education: {
      level: 'bachelor',
      field: 'Marketing'
    },
    experience: {
      min: 0,
      unit: 'years'
    },
    applicationProcess: {
      steps: ['Application Review', 'Portfolio Review', 'Interview'],
      documentsRequired: ['Resume', 'Portfolio'],
      interviewProcess: 'Single interview with marketing team'
    },
    status: 'published',
    applicationsCount: 28,
    viewsCount: 156,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    publishedAt: new Date('2024-01-10')
  },
  {
    id: 'job-3',
    companyId: 'company-1',
    title: 'Data Science Intern',
    description: 'Work with our data team to analyze user behavior and business metrics.',
    requirements: ['Python', 'Statistics', 'Data Analysis'],
    responsibilities: ['Analyze data', 'Create visualizations', 'Build models'],
    type: 'internship',
    level: 'entry',
    department: 'Data Science',
    location: {
      type: 'on-site',
      city: 'New York',
      state: 'NY',
      country: 'USA'
    },
    salary: {
      min: 30,
      max: 40,
      currency: 'USD',
      period: 'hour'
    },
    applicationDeadline: new Date('2024-12-31'),
    requiredSkills: ['Python', 'SQL', 'Statistics'],
    preferredSkills: ['Machine Learning', 'R', 'Tableau'],
    education: {
      level: 'bachelor',
      field: 'Data Science'
    },
    experience: {
      min: 0,
      max: 1,
      unit: 'years'
    },
    applicationProcess: {
      steps: ['Application Review', 'Technical Assessment', 'Interview'],
      documentsRequired: ['Resume', 'Transcript'],
      interviewProcess: 'Technical assessment followed by interview'
    },
    status: 'draft',
    applicationsCount: 0,
    viewsCount: 0,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'recent';
    const status = searchParams.get('status');

    let filteredJobs = [...mockJobs];

    // Filter by status if provided
    if (status) {
      filteredJobs = filteredJobs.filter(job => job.status === status);
    }

    // Sort jobs
    if (sort === 'recent') {
      filteredJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'applications') {
      filteredJobs.sort((a, b) => b.applicationsCount - a.applicationsCount);
    } else if (sort === 'views') {
      filteredJobs.sort((a, b) => b.viewsCount - a.viewsCount);
    }

    // Apply limit
    const limitedJobs = filteredJobs.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: limitedJobs,
      pagination: {
        page: 1,
        limit: limit,
        total: filteredJobs.length,
        totalPages: Math.ceil(filteredJobs.length / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const jobData = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'description', 'department', 'type', 'level'];
    for (const field of requiredFields) {
      if (!jobData[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `${field} is required`
          },
          { status: 400 }
        );
      }
    }

    // Create new job posting
    const newJob: JobPosting = {
      id: `job-${Date.now()}`,
      companyId: 'company-1', // In real app, get from auth token
      ...jobData,
      applicationsCount: 0,
      viewsCount: 0,
      status: jobData.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: jobData.status === 'published' ? new Date() : undefined
    };

    // Add to mock storage
    mockJobs.push(newJob);

    return NextResponse.json({
      success: true,
      data: newJob,
      message: 'Job posting created successfully'
    });

  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
