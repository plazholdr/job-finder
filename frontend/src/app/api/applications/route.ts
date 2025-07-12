import { NextRequest, NextResponse } from 'next/server';
import { Application, ApplicationTimelineEvent, InterviewDetails, OfferDetails } from '@/types/company-job';

// Mock storage for applications (in a real app, this would be in a database)
let applications: Application[] = [
  // Sample application with detailed tracking
  {
    id: 'app-1',
    userId: 'mock-user-id',
    jobId: '1',
    personalInformation: 'John Doe, Computer Science student at University of Technology',
    internshipDetails: 'Seeking 3-month summer internship in software development',
    courseInformation: 'Currently in 3rd year of Computer Science, GPA: 3.8/4.0',
    assignmentInformation: 'Completed web development projects using React and Node.js',
    status: 'interview_scheduled',
    submittedAt: new Date('2024-01-20T10:00:00Z'),
    createdAt: new Date('2024-01-20T10:00:00Z'),
    updatedAt: new Date('2024-01-25T14:30:00Z'),
    timeline: [
      {
        id: 'timeline-1',
        applicationId: 'app-1',
        status: 'applied',
        title: 'Application Submitted',
        description: 'Your application has been successfully submitted and is under review.',
        timestamp: new Date('2024-01-20T10:00:00Z'),
        actor: 'system'
      },
      {
        id: 'timeline-2',
        applicationId: 'app-1',
        status: 'reviewed',
        title: 'Application Reviewed',
        description: 'Your application has been reviewed by our hiring team.',
        timestamp: new Date('2024-01-22T09:15:00Z'),
        actor: 'company',
        actorName: 'Sarah Johnson, HR Manager'
      },
      {
        id: 'timeline-3',
        applicationId: 'app-1',
        status: 'interview_scheduled',
        title: 'Interview Scheduled',
        description: 'Congratulations! We would like to schedule an interview with you.',
        timestamp: new Date('2024-01-25T14:30:00Z'),
        actor: 'company',
        actorName: 'Mike Chen, Engineering Manager'
      }
    ],
    interviewDetails: {
      id: 'interview-1',
      applicationId: 'app-1',
      type: 'video',
      scheduledDate: new Date('2024-01-30T15:00:00Z'),
      duration: 60,
      meetingLink: 'https://zoom.us/j/123456789',
      interviewer: {
        name: 'Mike Chen',
        title: 'Engineering Manager',
        email: 'mike.chen@techcorp.com'
      },
      status: 'scheduled',
      notes: 'Technical interview focusing on React and JavaScript fundamentals'
    }
  },
  {
    id: 'app-2',
    userId: 'mock-user-id',
    jobId: '2',
    personalInformation: 'John Doe, Environmental Science student',
    internshipDetails: 'Interested in renewable energy research internship',
    courseInformation: 'Environmental Science major, focus on sustainability',
    assignmentInformation: 'Research project on solar panel efficiency optimization',
    status: 'accepted',
    submittedAt: new Date('2024-01-15T14:00:00Z'),
    createdAt: new Date('2024-01-15T14:00:00Z'),
    updatedAt: new Date('2024-01-28T11:00:00Z'),
    timeline: [
      {
        id: 'timeline-4',
        applicationId: 'app-2',
        status: 'applied',
        title: 'Application Submitted',
        description: 'Your application has been successfully submitted.',
        timestamp: new Date('2024-01-15T14:00:00Z'),
        actor: 'system'
      },
      {
        id: 'timeline-5',
        applicationId: 'app-2',
        status: 'reviewed',
        title: 'Application Reviewed',
        description: 'Your application has been reviewed and shortlisted.',
        timestamp: new Date('2024-01-18T10:30:00Z'),
        actor: 'company',
        actorName: 'Dr. Lisa Park, Research Director'
      },
      {
        id: 'timeline-6',
        applicationId: 'app-2',
        status: 'interview_completed',
        title: 'Interview Completed',
        description: 'Thank you for completing the interview process.',
        timestamp: new Date('2024-01-25T16:00:00Z'),
        actor: 'company',
        actorName: 'Dr. Lisa Park, Research Director'
      },
      {
        id: 'timeline-7',
        applicationId: 'app-2',
        status: 'accepted',
        title: 'Offer Extended',
        description: 'Congratulations! We are pleased to offer you the internship position.',
        timestamp: new Date('2024-01-28T11:00:00Z'),
        actor: 'company',
        actorName: 'Jennifer Adams, HR Director'
      }
    ],
    offerDetails: {
      id: 'offer-1',
      applicationId: 'app-2',
      salary: 22,
      currency: 'USD',
      period: 'hour',
      startDate: new Date('2024-06-01T09:00:00Z'),
      endDate: new Date('2024-08-31T17:00:00Z'),
      benefits: ['Health insurance', 'Flexible working hours', 'Research publication opportunities'],
      conditions: ['Maintain academic standing', 'Complete final project presentation'],
      deadline: new Date('2024-02-05T23:59:59Z'),
      status: 'pending',
      responseRequired: true
    }
  }
];

export async function POST(request: NextRequest) {
  try {
    const {
      jobId,
      personalInformation,
      internshipDetails,
      courseInformation,
      assignmentInformation
    } = await request.json();

    // Validate required fields
    if (!jobId || !personalInformation || !internshipDetails || !courseInformation || !assignmentInformation) {
      return NextResponse.json(
        {
          success: false,
          error: 'All fields are required'
        },
        { status: 400 }
      );
    }

    // Mock user ID (in a real app, this would come from authentication)
    const userId = 'mock-user-id';

    // Check if user has already applied for this job
    const existingApplication = applications.find(
      app => app.userId === userId && app.jobId === jobId
    );

    if (existingApplication) {
      return NextResponse.json(
        {
          success: false,
          error: 'You have already applied for this job'
        },
        { status: 400 }
      );
    }

    // Create new application
    const applicationId = `app-${Date.now()}`;
    const now = new Date();

    const newApplication: Application = {
      id: applicationId,
      userId,
      jobId,
      personalInformation,
      internshipDetails,
      courseInformation,
      assignmentInformation,
      status: 'applied',
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          id: `timeline-${Date.now()}`,
          applicationId,
          status: 'applied',
          title: 'Application Submitted',
          description: 'Your application has been successfully submitted and is under review.',
          timestamp: now,
          actor: 'system'
        }
      ]
    };

    applications.push(newApplication);

    // In a real app, you would also:
    // 1. Send confirmation email to the applicant
    // 2. Notify the company about the new application
    // 3. Generate PDF version of the application (implemented below)
    // 4. Store any uploaded files

    // Generate PDF version of the application
    try {
      // This would typically be done in a background job
      // For now, we'll just add a note that PDF generation is available
      newApplication.pdfGenerated = true;
      newApplication.pdfUrl = `/api/applications/${newApplication.id}/pdf`;
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Don't fail the application submission if PDF generation fails
    }

    return NextResponse.json({
      success: true,
      data: newApplication,
      message: 'Application submitted successfully',
      pdfAvailable: true
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit application'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Mock user ID (in a real app, this would come from authentication)
    const userId = 'mock-user-id';

    // Get all applications for the user
    const userApplications = applications.filter(app => app.userId === userId);

    // Sort by submission date (newest first)
    userApplications.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    return NextResponse.json({
      success: true,
      data: userApplications,
      message: 'Applications fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch applications'
      },
      { status: 500 }
    );
  }
}
