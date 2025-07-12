import { NextRequest, NextResponse } from 'next/server';
import { JobPosting } from '@/types/company';

// Mock job postings data (imported from the main jobs route)
// In a real app, this would be in a shared database
let mockJobs: JobPosting[] = [
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
  }
];

// GET single job by ID
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

    return NextResponse.json({
      success: true,
      data: job
    });

  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// UPDATE job (full update)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    const updatedData: Partial<JobPosting> = await request.json();

    const jobIndex = mockJobs.findIndex(j => j.id === jobId);
    
    if (jobIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job not found'
        },
        { status: 404 }
      );
    }

    // Validate required fields
    const requiredFields = ['title', 'description', 'department', 'type', 'level'];
    for (const field of requiredFields) {
      if (updatedData[field as keyof JobPosting] === undefined || 
          updatedData[field as keyof JobPosting] === '') {
        return NextResponse.json(
          {
            success: false,
            error: `${field} is required`
          },
          { status: 400 }
        );
      }
    }

    // Update the job
    mockJobs[jobIndex] = {
      ...mockJobs[jobIndex],
      ...updatedData,
      updatedAt: new Date(),
      publishedAt: updatedData.status === 'published' && mockJobs[jobIndex].status !== 'published' 
        ? new Date() 
        : mockJobs[jobIndex].publishedAt
    };

    return NextResponse.json({
      success: true,
      data: mockJobs[jobIndex],
      message: 'Job updated successfully'
    });

  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// PATCH job (partial update, e.g., status change)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    const updates: Partial<JobPosting> = await request.json();

    const jobIndex = mockJobs.findIndex(j => j.id === jobId);
    
    if (jobIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job not found'
        },
        { status: 404 }
      );
    }

    // Apply partial updates
    mockJobs[jobIndex] = {
      ...mockJobs[jobIndex],
      ...updates,
      updatedAt: new Date()
    };

    // Update publishedAt if status changed to published
    if (updates.status === 'published' && mockJobs[jobIndex].status !== 'published') {
      mockJobs[jobIndex].publishedAt = new Date();
    }

    return NextResponse.json({
      success: true,
      data: mockJobs[jobIndex],
      message: 'Job updated successfully'
    });

  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// DELETE job
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    
    const jobIndex = mockJobs.findIndex(j => j.id === jobId);
    
    if (jobIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job not found'
        },
        { status: 404 }
      );
    }

    // Check if job has applications
    const job = mockJobs[jobIndex];
    if (job.applicationsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete job with existing applications. Please close the job instead.'
        },
        { status: 400 }
      );
    }

    // Remove the job
    mockJobs.splice(jobIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
