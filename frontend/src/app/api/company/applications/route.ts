import { NextRequest, NextResponse } from 'next/server';
import { CandidateApplication } from '@/types/company';
import config from '@/config';

// Prefer server-only BACKEND_URL when available; fallback to public config
const API_BASE_URL = process.env.BACKEND_URL || config.api.baseUrl;

// Mock applications data
const mockApplications: CandidateApplication[] = [
  {
    id: 'app-1',
    jobId: 'job-1',
    candidateId: 'candidate-1',
    coverLetter: 'I am excited to apply for this software engineering internship...',
    resume: '/resumes/john-doe-resume.pdf',
    candidate: {
      id: 'candidate-1',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      education: 'Computer Science, Stanford University',
      experience: '1 year',
      skills: ['JavaScript', 'React', 'Node.js', 'Python']
    },
    status: 'submitted',
    reviewStage: 'initial',
    reviewers: [
      {
        userId: 'user-1',
        name: 'Sarah Johnson',
        role: 'HR Manager',
        status: 'pending',
        rating: undefined,
        feedback: undefined,
        reviewedAt: undefined
      }
    ],
    submittedAt: new Date('2024-01-22T10:30:00Z'),
    lastUpdated: new Date('2024-01-22T10:30:00Z')
  },
  {
    id: 'app-2',
    jobId: 'job-1',
    candidateId: 'candidate-2',
    coverLetter: 'As a passionate developer with experience in modern web technologies...',
    resume: '/resumes/jane-smith-resume.pdf',
    candidate: {
      id: 'candidate-2',
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '+1 (555) 987-6543',
      location: 'Berkeley, CA',
      education: 'Software Engineering, UC Berkeley',
      experience: '6 months',
      skills: ['JavaScript', 'React', 'TypeScript', 'Git']
    },
    status: 'reviewing',
    reviewStage: 'technical',
    reviewers: [
      {
        userId: 'user-1',
        name: 'Sarah Johnson',
        role: 'HR Manager',
        status: 'approved',
        rating: 4,
        feedback: 'Strong technical background and good communication skills.',
        reviewedAt: new Date('2024-01-21T14:20:00Z')
      },
      {
        userId: 'user-2',
        name: 'Mike Chen',
        role: 'Senior Developer',
        status: 'pending',
        rating: undefined,
        feedback: undefined,
        reviewedAt: undefined
      }
    ],
    submittedAt: new Date('2024-01-20T09:15:00Z'),
    lastUpdated: new Date('2024-01-21T14:20:00Z'),
    reviewedAt: new Date('2024-01-21T14:20:00Z')
  },
  {
    id: 'app-3',
    jobId: 'job-2',
    candidateId: 'candidate-3',
    coverLetter: 'I am passionate about marketing and would love to contribute to your team...',
    resume: '/resumes/alex-wilson-resume.pdf',
    candidate: {
      id: 'candidate-3',
      name: 'Alex Wilson',
      email: 'alex.wilson@email.com',
      phone: '+1 (555) 456-7890',
      location: 'Los Angeles, CA',
      education: 'Marketing, UCLA',
      experience: 'Fresh graduate',
      skills: ['Social Media Marketing', 'Content Creation', 'Analytics', 'Adobe Creative Suite']
    },
    status: 'shortlisted',
    reviewStage: 'hr',
    reviewers: [
      {
        userId: 'user-3',
        name: 'Lisa Brown',
        role: 'Marketing Manager',
        status: 'approved',
        rating: 5,
        feedback: 'Excellent portfolio and creative thinking. Great fit for our team.',
        reviewedAt: new Date('2024-01-19T16:45:00Z')
      }
    ],
    interviews: [
      {
        id: 'interview-1',
        type: 'video',
        scheduledAt: new Date('2024-01-25T14:00:00Z'),
        duration: 60,
        interviewer: {
          id: 'user-3',
          name: 'Lisa Brown',
          title: 'Marketing Manager'
        },
        status: 'scheduled',
        feedback: undefined,
        rating: undefined,
        notes: undefined
      }
    ],
    submittedAt: new Date('2024-01-18T11:20:00Z'),
    lastUpdated: new Date('2024-01-19T16:45:00Z'),
    reviewedAt: new Date('2024-01-19T16:45:00Z')
  },
  {
    id: 'app-4',
    jobId: 'job-1',
    candidateId: 'candidate-4',
    coverLetter: 'With my background in computer science and passion for technology...',
    resume: '/resumes/emily-davis-resume.pdf',
    candidate: {
      id: 'candidate-4',
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      phone: '+1 (555) 321-0987',
      location: 'Palo Alto, CA',
      education: 'Computer Science, MIT',
      experience: '2 years',
      skills: ['Python', 'JavaScript', 'React', 'Machine Learning', 'SQL']
    },
    status: 'interview_scheduled',
    reviewStage: 'final',
    reviewers: [
      {
        userId: 'user-1',
        name: 'Sarah Johnson',
        role: 'HR Manager',
        status: 'approved',
        rating: 4,
        feedback: 'Strong candidate with excellent academic background.',
        reviewedAt: new Date('2024-01-17T10:30:00Z')
      },
      {
        userId: 'user-2',
        name: 'Mike Chen',
        role: 'Senior Developer',
        status: 'approved',
        rating: 5,
        feedback: 'Impressive technical skills and problem-solving ability.',
        reviewedAt: new Date('2024-01-18T15:20:00Z')
      }
    ],
    interviews: [
      {
        id: 'interview-2',
        type: 'technical',
        scheduledAt: new Date('2024-01-24T10:00:00Z'),
        duration: 90,
        interviewer: {
          id: 'user-2',
          name: 'Mike Chen',
          title: 'Senior Developer'
        },
        status: 'scheduled',
        feedback: undefined,
        rating: undefined,
        notes: undefined
      }
    ],
    submittedAt: new Date('2024-01-16T13:45:00Z'),
    lastUpdated: new Date('2024-01-18T15:20:00Z'),
    reviewedAt: new Date('2024-01-18T15:20:00Z')
  },
  {
    id: 'app-5',
    jobId: 'job-2',
    candidateId: 'candidate-5',
    coverLetter: 'I am excited about the opportunity to join your marketing team...',
    resume: '/resumes/david-kim-resume.pdf',
    candidate: {
      id: 'candidate-5',
      name: 'David Kim',
      email: 'david.kim@email.com',
      phone: '+1 (555) 654-3210',
      location: 'San Diego, CA',
      education: 'Business Administration, UCSD',
      experience: '1 year',
      skills: ['Digital Marketing', 'SEO', 'Google Analytics', 'Content Strategy']
    },
    status: 'offer_extended',
    reviewStage: 'completed',
    reviewers: [
      {
        userId: 'user-3',
        name: 'Lisa Brown',
        role: 'Marketing Manager',
        status: 'approved',
        rating: 4,
        feedback: 'Good understanding of digital marketing principles.',
        reviewedAt: new Date('2024-01-15T12:00:00Z')
      }
    ],
    interviews: [
      {
        id: 'interview-3',
        type: 'video',
        scheduledAt: new Date('2024-01-20T15:00:00Z'),
        duration: 45,
        interviewer: {
          id: 'user-3',
          name: 'Lisa Brown',
          title: 'Marketing Manager'
        },
        status: 'completed',
        feedback: 'Great enthusiasm and relevant experience.',
        rating: 4,
        notes: 'Recommended for hire'
      }
    ],
    submittedAt: new Date('2024-01-14T09:30:00Z'),
    lastUpdated: new Date('2024-01-21T11:15:00Z'),
    reviewedAt: new Date('2024-01-15T12:00:00Z')
  }
];

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'recent';
    const status = searchParams.get('status');
    const jobId = searchParams.get('jobId');

    // Build query parameters for backend
    const queryParams = new URLSearchParams();
    queryParams.append('$limit', limit.toString());

    if (sort === 'recent') {
      queryParams.append('$sort', JSON.stringify({ createdAt: -1 }));
    }

    if (status) {
      queryParams.append('status', status);
    }

    if (jobId) {
      queryParams.append('jobId', jobId);
    }

    // Call backend API to get applications for the company
    console.log('Fetching applications with query:', queryParams.toString());
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Full URL:', `${API_BASE_URL}/applications?${queryParams.toString()}`);

    const response = await fetch(`${API_BASE_URL}/applications?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    const data = await response.json();
    console.log('Backend response for applications:', data);
    console.log('First application sample:', data.data?.[0]);

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to fetch applications' },
        { status: response.status }
      );
    }

    // Transform backend data to match frontend expectations
    const applications = (data.data || data).map((app: any) => ({
      id: app._id,
      jobId: app.jobId,
      jobTitle: app.jobInfo?.title || app.job?.title || 'Unknown Position',
      candidate: {
        id: app.userId,
        name: app.personalInformation?.split(',')[0] || 'Unknown',
        email: app.personalInformation?.split(',')[1]?.trim() || 'Unknown',
        phone: app.personalInformation?.split(',')[2]?.trim() || 'Unknown',
        location: app.personalInformation?.split(',')[3]?.trim() || 'Unknown'
      },
      status: app.status || 'submitted',
      submittedAt: app.createdAt,
      resumeUrl: app.resumeUrl,
      coverLetter: app.coverLetter,
      rating: null,
      feedback: null
    }));

    let filteredApplications = applications;

    // Sort applications
    if (sort === 'recent') {
      filteredApplications.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    } else if (sort === 'name') {
      filteredApplications.sort((a, b) => a.candidate.name.localeCompare(b.candidate.name));
    } else if (sort === 'status') {
      filteredApplications.sort((a, b) => a.status.localeCompare(b.status));
    }

    // Apply limit
    const limitedApplications = filteredApplications.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: limitedApplications,
      pagination: {
        page: 1,
        limit: limit,
        total: filteredApplications.length,
        totalPages: Math.ceil(filteredApplications.length / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    console.error('Error details:', error.message, error.stack);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { applicationId, status, reviewerId, feedback, rating } = await request.json();

    if (!applicationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application ID is required'
        },
        { status: 400 }
      );
    }

    // Find application
    const applicationIndex = mockApplications.findIndex(app => app.id === applicationId);

    if (applicationIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application not found'
        },
        { status: 404 }
      );
    }

    const application = mockApplications[applicationIndex];

    // Update application status
    if (status) {
      application.status = status;
    }

    // Update reviewer feedback
    if (reviewerId && (feedback || rating)) {
      const reviewerIndex = application.reviewers.findIndex(r => r.userId === reviewerId);
      if (reviewerIndex !== -1) {
        application.reviewers[reviewerIndex].status = 'reviewed';
        if (feedback) application.reviewers[reviewerIndex].feedback = feedback;
        if (rating) application.reviewers[reviewerIndex].rating = rating;
        application.reviewers[reviewerIndex].reviewedAt = new Date();
      }
    }

    application.lastUpdated = new Date();
    if (status && ['reviewing', 'shortlisted', 'rejected'].includes(status)) {
      application.reviewedAt = new Date();
    }

    return NextResponse.json({
      success: true,
      data: application,
      message: 'Application updated successfully'
    });

  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
