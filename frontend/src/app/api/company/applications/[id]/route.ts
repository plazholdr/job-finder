import { NextRequest, NextResponse } from 'next/server';
import { CandidateApplication } from '@/types/company';

// Mock applications data (same as in the main route)
const mockApplications: CandidateApplication[] = [
  {
    id: 'app-1',
    jobId: 'job-1',
    candidateId: 'candidate-1',
    coverLetter: 'I am excited to apply for this software engineering internship. With my strong background in computer science and hands-on experience with modern web technologies, I believe I would be a valuable addition to your team. During my previous internships, I have worked on full-stack applications using React, Node.js, and various databases. I am particularly interested in your company\'s mission and would love to contribute to your innovative projects.',
    resume: '/resumes/john-doe-resume.pdf',
    candidate: {
      id: 'candidate-1',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      education: 'BS Computer Science, Stanford University',
      experience: '2 years internship experience',
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Git', 'SQL'],
      resumeUrl: '/resumes/john-doe-resume.pdf',
      portfolioUrl: 'https://johndoe.dev'
    },
    status: 'submitted',
    reviewStage: 'initial',
    reviewers: [
      {
        id: 'reviewer-1',
        name: 'Sarah Johnson',
        role: 'HR Manager',
        status: 'pending'
      }
    ],
    submittedAt: new Date('2024-01-22T10:30:00Z'),
    lastUpdated: new Date('2024-01-22T10:30:00Z'),
    additionalDocuments: []
  },
  {
    id: 'app-2',
    jobId: 'job-1',
    candidateId: 'candidate-2',
    coverLetter: 'As a passionate developer with experience in modern web technologies, I am writing to express my strong interest in the Software Engineering Intern position. My academic background in software engineering, combined with practical experience in modern development frameworks, makes me well-suited for this role. I have experience building scalable web applications and working with cloud technologies.',
    resume: '/resumes/jane-smith-resume.pdf',
    candidate: {
      id: 'candidate-2',
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '+1 (555) 987-6543',
      location: 'Berkeley, CA',
      education: 'BS Software Engineering, UC Berkeley',
      experience: '1 year internship experience',
      skills: ['JavaScript', 'React', 'TypeScript', 'Git', 'Docker', 'AWS'],
      resumeUrl: '/resumes/jane-smith-resume.pdf'
    },
    status: 'shortlisted',
    reviewStage: 'technical',
    reviewers: [
      {
        id: 'reviewer-1',
        name: 'Sarah Johnson',
        role: 'HR Manager',
        status: 'approved',
        rating: 4,
        feedback: 'Strong technical background and good communication skills. Recommended for interview.',
        reviewedAt: new Date('2024-01-21T14:20:00Z')
      },
      {
        id: 'reviewer-2',
        name: 'Mike Chen',
        role: 'Senior Developer',
        status: 'pending'
      }
    ],
    submittedAt: new Date('2024-01-20T09:15:00Z'),
    lastUpdated: new Date('2024-01-21T14:20:00Z'),
    reviewedAt: new Date('2024-01-21T14:20:00Z'),
    additionalDocuments: ['portfolio.pdf']
  },
  {
    id: 'app-3',
    jobId: 'job-1',
    candidateId: 'candidate-3',
    coverLetter: 'As a recent computer science graduate with a passion for software development, I am thrilled to apply for the Software Engineering Intern position. Throughout my studies, I have gained experience in various programming languages and frameworks, with a particular focus on web development and database management. I am eager to apply my knowledge in a real-world setting and contribute to meaningful projects.',
    resume: '/resumes/alex-wilson-resume.pdf',
    candidate: {
      id: 'candidate-3',
      name: 'Alex Wilson',
      email: 'alex.wilson@email.com',
      phone: '+1 (555) 456-7890',
      location: 'Austin, TX',
      education: 'BS Computer Science, UT Austin',
      experience: 'Fresh graduate',
      skills: ['Python', 'Django', 'JavaScript', 'Vue.js', 'PostgreSQL', 'Linux'],
      resumeUrl: '/resumes/alex-wilson-resume.pdf'
    },
    status: 'interview_scheduled',
    reviewStage: 'hr',
    reviewers: [
      {
        id: 'reviewer-1',
        name: 'Sarah Johnson',
        role: 'HR Manager',
        status: 'approved',
        rating: 5,
        feedback: 'Excellent academic record and strong problem-solving skills. Scheduled for technical interview.',
        reviewedAt: new Date('2024-01-20T16:45:00Z')
      },
      {
        id: 'reviewer-2',
        name: 'Lisa Wang',
        role: 'Senior Developer',
        status: 'approved',
        rating: 4,
        feedback: 'Good technical foundation. Looking forward to the interview.',
        reviewedAt: new Date('2024-01-22T10:30:00Z')
      }
    ],
    interviews: [
      {
        id: 'interview-1',
        type: 'technical',
        scheduledAt: new Date('2024-01-25T14:00:00Z'),
        duration: 60,
        interviewer: {
          id: 'user-3',
          name: 'Lisa Wang',
          title: 'Senior Developer'
        },
        status: 'scheduled'
      }
    ],
    submittedAt: new Date('2024-01-18T11:20:00Z'),
    lastUpdated: new Date('2024-01-22T10:30:00Z'),
    reviewedAt: new Date('2024-01-20T16:45:00Z'),
    additionalDocuments: []
  }
];

// GET single application by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;
    
    const application = mockApplications.find(app => app.id === applicationId);
    
    if (!application) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// UPDATE single application
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;
    const { status, reviewerId, feedback, rating } = await request.json();

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
      application.status = status as any;
      application.lastUpdated = new Date();

      // Set reviewedAt if this is the first review
      if (!application.reviewedAt && status !== 'submitted') {
        application.reviewedAt = new Date();
      }
    }

    // Add or update reviewer information if provided
    if (reviewerId) {
      const existingReviewerIndex = application.reviewers.findIndex(r => r.id === reviewerId);
      
      if (existingReviewerIndex >= 0) {
        // Update existing reviewer
        application.reviewers[existingReviewerIndex] = {
          ...application.reviewers[existingReviewerIndex],
          status: status === 'rejected' ? 'rejected' : 'approved',
          reviewedAt: new Date(),
          feedback: feedback || application.reviewers[existingReviewerIndex].feedback,
          rating: rating || application.reviewers[existingReviewerIndex].rating
        };
      } else {
        // Add new reviewer
        application.reviewers.push({
          id: reviewerId,
          name: 'Current User', // In real app, get from user data
          role: 'Reviewer',
          status: status === 'rejected' ? 'rejected' : 'approved',
          reviewedAt: new Date(),
          feedback,
          rating
        });
      }
    }

    mockApplications[applicationIndex] = application;

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

// DELETE application (if needed)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;
    
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

    // Remove the application
    mockApplications.splice(applicationIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
