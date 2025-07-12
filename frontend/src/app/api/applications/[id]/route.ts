import { NextRequest, NextResponse } from 'next/server';
import { Application } from '@/types/company-job';

// Import the applications array from the main route
// In a real app, this would be from a database
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;
    
    // Mock user ID (in a real app, this would come from authentication)
    const userId = 'mock-user-id';

    // Find the application
    const application = applications.find(
      app => app.id === applicationId && app.userId === userId
    );

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application not found'
        },
        { status: 404 }
      );
    }

    // Fetch job details if needed
    let jobDetails = null;
    try {
      const jobResponse = await fetch(`${request.nextUrl.origin}/api/jobs/${application.jobId}`);
      if (jobResponse.ok) {
        const jobData = await jobResponse.json();
        jobDetails = jobData.success ? jobData.data.job : null;
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...application,
        job: jobDetails
      },
      message: 'Application details fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching application details:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch application details'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;
    const { action, ...updateData } = await request.json();
    
    // Mock user ID (in a real app, this would come from authentication)
    const userId = 'mock-user-id';

    // Find the application
    const applicationIndex = applications.findIndex(
      app => app.id === applicationId && app.userId === userId
    );

    if (applicationIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application not found'
        },
        { status: 404 }
      );
    }

    const application = applications[applicationIndex];

    // Handle different actions
    switch (action) {
      case 'withdraw':
        application.status = 'withdrawn';
        application.updatedAt = new Date();
        
        // Add timeline event
        if (!application.timeline) application.timeline = [];
        application.timeline.push({
          id: `timeline-${Date.now()}`,
          applicationId,
          status: 'withdrawn',
          title: 'Application Withdrawn',
          description: 'You have withdrawn your application.',
          timestamp: new Date(),
          actor: 'intern'
        });
        break;

      case 'accept_offer':
        if (application.offerDetails) {
          application.offerDetails.status = 'accepted';
          application.updatedAt = new Date();
          
          // Add timeline event
          if (!application.timeline) application.timeline = [];
          application.timeline.push({
            id: `timeline-${Date.now()}`,
            applicationId,
            status: 'accepted',
            title: 'Offer Accepted',
            description: 'You have accepted the internship offer.',
            timestamp: new Date(),
            actor: 'intern'
          });
        }
        break;

      case 'decline_offer':
        if (application.offerDetails) {
          application.offerDetails.status = 'declined';
          application.status = 'rejected';
          application.updatedAt = new Date();
          
          // Add timeline event
          if (!application.timeline) application.timeline = [];
          application.timeline.push({
            id: `timeline-${Date.now()}`,
            applicationId,
            status: 'rejected',
            title: 'Offer Declined',
            description: 'You have declined the internship offer.',
            timestamp: new Date(),
            actor: 'intern'
          });
        }
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action'
          },
          { status: 400 }
        );
    }

    applications[applicationIndex] = application;

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
        error: 'Failed to update application'
      },
      { status: 500 }
    );
  }
}
