import { NextRequest, NextResponse } from 'next/server';

interface RejectionReason {
  id: string;
  category: 'qualifications' | 'experience' | 'skills' | 'cultural_fit' | 'position_filled' | 'budget' | 'other';
  title: string;
  description: string;
  isStandard: boolean;
  isActive: boolean;
  emailTemplate?: string;
  feedbackTemplate?: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ApplicationRejection {
  id: string;
  applicationId: string;
  jobId: string;
  candidateId: string;
  rejectionReasons: Array<{
    reasonId: string;
    title: string;
    category: string;
    customNotes?: string;
  }>;
  stage: 'screening' | 'review' | 'interview' | 'final_decision';
  rejectedBy: {
    id: string;
    name: string;
    role: string;
  };
  rejectedAt: Date;
  feedback: {
    internal: string; // Internal notes for team
    candidate: string; // Feedback to share with candidate
    constructive: boolean; // Whether feedback is constructive
    futureOpportunities: boolean; // Keep for future opportunities
  };
  emailSent: boolean;
  emailSentAt?: Date;
  candidateNotified: boolean;
  followUpRequired: boolean;
  followUpNotes?: string;
  appealable: boolean;
  appealDeadline?: Date;
}

// Mock rejection reasons
let mockRejectionReasons: RejectionReason[] = [
  {
    id: 'reason-1',
    category: 'qualifications',
    title: 'Educational Requirements Not Met',
    description: 'Candidate does not meet the minimum educational requirements for this position',
    isStandard: true,
    isActive: true,
    emailTemplate: 'Thank you for your interest in our {{position}} role. After careful review, we found that your educational background does not align with our current requirements.',
    feedbackTemplate: 'We require candidates to have {{requirement}} for this position.',
    usageCount: 45,
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z')
  },
  {
    id: 'reason-2',
    category: 'experience',
    title: 'Insufficient Relevant Experience',
    description: 'Candidate lacks the required level of relevant work experience',
    isStandard: true,
    isActive: true,
    emailTemplate: 'Thank you for applying to our {{position}} role. While your background is impressive, we are looking for candidates with more relevant experience in {{field}}.',
    feedbackTemplate: 'This position requires {{years}} years of experience in {{field}}.',
    usageCount: 67,
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z')
  },
  {
    id: 'reason-3',
    category: 'skills',
    title: 'Technical Skills Gap',
    description: 'Candidate does not possess the required technical skills',
    isStandard: true,
    isActive: true,
    emailTemplate: 'Thank you for your application for the {{position}} role. After reviewing your technical background, we found that your skills do not align with our current technical requirements.',
    feedbackTemplate: 'We are looking for strong proficiency in {{skills}}.',
    usageCount: 89,
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z')
  },
  {
    id: 'reason-4',
    category: 'cultural_fit',
    title: 'Cultural Fit Concerns',
    description: 'Candidate may not be a good fit for our company culture',
    isStandard: true,
    isActive: true,
    emailTemplate: 'Thank you for your interest in joining our team. After careful consideration, we have decided to move forward with other candidates whose experience and approach better align with our current needs.',
    feedbackTemplate: 'We are looking for candidates who demonstrate strong alignment with our company values of {{values}}.',
    usageCount: 23,
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z')
  },
  {
    id: 'reason-5',
    category: 'position_filled',
    title: 'Position Already Filled',
    description: 'The position has been filled by another candidate',
    isStandard: true,
    isActive: true,
    emailTemplate: 'Thank you for your application for the {{position}} role. We have decided to move forward with another candidate for this position.',
    feedbackTemplate: 'The position has been filled. We encourage you to apply for future opportunities.',
    usageCount: 156,
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z')
  },
  {
    id: 'reason-6',
    category: 'budget',
    title: 'Salary Expectations Mismatch',
    description: 'Candidate salary expectations exceed budget constraints',
    isStandard: true,
    isActive: true,
    emailTemplate: 'Thank you for your interest in our {{position}} role. Unfortunately, we are unable to meet your salary expectations for this position.',
    feedbackTemplate: 'The budget for this position is {{budget_range}}.',
    usageCount: 34,
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z')
  },
  {
    id: 'reason-7',
    category: 'other',
    title: 'High Volume of Applications',
    description: 'Due to high volume, we cannot proceed with all qualified candidates',
    isStandard: true,
    isActive: true,
    emailTemplate: 'Thank you for your application for the {{position}} role. We received an overwhelming response and, while your qualifications are impressive, we have decided to move forward with other candidates.',
    feedbackTemplate: 'We received many qualified applications and had to make difficult decisions.',
    usageCount: 78,
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z')
  }
];

// Mock application rejections
let mockApplicationRejections: ApplicationRejection[] = [
  {
    id: 'rejection-1',
    applicationId: 'app-1',
    jobId: 'job-1',
    candidateId: 'candidate-1',
    rejectionReasons: [
      {
        reasonId: 'reason-3',
        title: 'Technical Skills Gap',
        category: 'skills',
        customNotes: 'Specifically lacking experience with React and Node.js'
      }
    ],
    stage: 'review',
    rejectedBy: {
      id: 'user-1',
      name: 'John Smith',
      role: 'Technical Lead'
    },
    rejectedAt: new Date('2024-01-21T14:30:00Z'),
    feedback: {
      internal: 'Candidate has good fundamentals but lacks specific framework experience we need.',
      candidate: 'Thank you for your application. While your programming background is solid, we are looking for candidates with more experience in React and Node.js for this particular role.',
      constructive: true,
      futureOpportunities: true
    },
    emailSent: true,
    emailSentAt: new Date('2024-01-21T15:00:00Z'),
    candidateNotified: true,
    followUpRequired: false,
    appealable: false
  }
];

// GET rejection data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'reasons';
    const applicationId = searchParams.get('applicationId');
    const category = searchParams.get('category');

    if (type === 'reasons') {
      // Get rejection reasons
      let reasons = [...mockRejectionReasons];
      
      if (category && category !== 'all') {
        reasons = reasons.filter(reason => reason.category === category);
      }
      
      // Sort by usage count (most used first)
      reasons.sort((a, b) => b.usageCount - a.usageCount);
      
      return NextResponse.json({
        success: true,
        data: reasons,
        metadata: {
          total: reasons.length,
          categories: ['qualifications', 'experience', 'skills', 'cultural_fit', 'position_filled', 'budget', 'other']
        }
      });
    }

    if (type === 'rejections') {
      if (applicationId) {
        // Get rejection for specific application
        const rejection = mockApplicationRejections.find(r => r.applicationId === applicationId);
        
        if (!rejection) {
          return NextResponse.json(
            {
              success: false,
              error: 'Rejection record not found'
            },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: rejection
        });
      }

      // Get all rejections
      return NextResponse.json({
        success: true,
        data: mockApplicationRejections
      });
    }

    if (type === 'analytics') {
      // Get rejection analytics
      const analytics = generateRejectionAnalytics();
      
      return NextResponse.json({
        success: true,
        data: analytics
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid type parameter'
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error fetching rejection data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST create application rejection
export async function POST(request: NextRequest) {
  try {
    const rejectionData = await request.json();

    // Validate required fields
    const requiredFields = ['applicationId', 'jobId', 'candidateId', 'rejectionReasons', 'stage'];
    for (const field of requiredFields) {
      if (!rejectionData[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `${field} is required`
          },
          { status: 400 }
        );
      }
    }

    // Validate rejection reasons
    if (!Array.isArray(rejectionData.rejectionReasons) || rejectionData.rejectionReasons.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one rejection reason is required'
        },
        { status: 400 }
      );
    }

    // Check if rejection already exists
    const existingRejection = mockApplicationRejections.find(r => r.applicationId === rejectionData.applicationId);
    
    if (existingRejection) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application has already been rejected'
        },
        { status: 400 }
      );
    }

    // Create new rejection
    const newRejection: ApplicationRejection = {
      id: `rejection-${Date.now()}`,
      applicationId: rejectionData.applicationId,
      jobId: rejectionData.jobId,
      candidateId: rejectionData.candidateId,
      rejectionReasons: rejectionData.rejectionReasons,
      stage: rejectionData.stage,
      rejectedBy: {
        id: rejectionData.rejectedBy?.id || 'current-user',
        name: rejectionData.rejectedBy?.name || 'Current User',
        role: rejectionData.rejectedBy?.role || 'Hiring Manager'
      },
      rejectedAt: new Date(),
      feedback: {
        internal: rejectionData.feedback?.internal || '',
        candidate: rejectionData.feedback?.candidate || '',
        constructive: rejectionData.feedback?.constructive || false,
        futureOpportunities: rejectionData.feedback?.futureOpportunities || false
      },
      emailSent: false,
      candidateNotified: false,
      followUpRequired: rejectionData.followUpRequired || false,
      followUpNotes: rejectionData.followUpNotes,
      appealable: rejectionData.appealable || false,
      appealDeadline: rejectionData.appealable ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : undefined // 14 days
    };

    mockApplicationRejections.push(newRejection);

    // Update usage count for rejection reasons
    rejectionData.rejectionReasons.forEach((reason: any) => {
      const rejectionReason = mockRejectionReasons.find(r => r.id === reason.reasonId);
      if (rejectionReason) {
        rejectionReason.usageCount++;
      }
    });

    // In a real application, you would:
    // 1. Update application status to 'rejected'
    // 2. Send notification email to candidate
    // 3. Log the rejection in audit trail
    // 4. Update analytics

    return NextResponse.json({
      success: true,
      data: newRejection,
      message: 'Application rejected successfully'
    });

  } catch (error) {
    console.error('Error creating rejection:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// PUT update rejection (e.g., send email, update feedback)
export async function PUT(request: NextRequest) {
  try {
    const { rejectionId, ...updateData } = await request.json();

    if (!rejectionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rejection ID is required'
        },
        { status: 400 }
      );
    }

    const rejectionIndex = mockApplicationRejections.findIndex(r => r.id === rejectionId);
    
    if (rejectionIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rejection not found'
        },
        { status: 404 }
      );
    }

    // Update rejection
    mockApplicationRejections[rejectionIndex] = {
      ...mockApplicationRejections[rejectionIndex],
      ...updateData
    };

    return NextResponse.json({
      success: true,
      data: mockApplicationRejections[rejectionIndex],
      message: 'Rejection updated successfully'
    });

  } catch (error) {
    console.error('Error updating rejection:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Helper function to generate rejection analytics
function generateRejectionAnalytics() {
  const totalRejections = mockApplicationRejections.length;
  
  // Rejection by category
  const byCategory: Record<string, number> = {};
  const byStage: Record<string, number> = {};
  
  mockApplicationRejections.forEach(rejection => {
    rejection.rejectionReasons.forEach(reason => {
      byCategory[reason.category] = (byCategory[reason.category] || 0) + 1;
    });
    
    byStage[rejection.stage] = (byStage[rejection.stage] || 0) + 1;
  });

  // Most common reasons
  const reasonUsage = mockRejectionReasons
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 5)
    .map(reason => ({
      id: reason.id,
      title: reason.title,
      category: reason.category,
      usageCount: reason.usageCount
    }));

  return {
    totalRejections,
    byCategory,
    byStage,
    mostCommonReasons: reasonUsage,
    averageTimeToReject: 3.5, // days
    candidateNotificationRate: (mockApplicationRejections.filter(r => r.candidateNotified).length / totalRejections) * 100,
    constructiveFeedbackRate: (mockApplicationRejections.filter(r => r.feedback.constructive).length / totalRejections) * 100
  };
}
