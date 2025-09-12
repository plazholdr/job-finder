import { NextRequest, NextResponse } from 'next/server';
import { JobOffer } from '@/types/company';

// Mock job offers data
let mockOffers: JobOffer[] = [
  {
    id: 'offer-1',
    applicationId: 'app-1',
    jobId: 'job-1',
    jobTitle: 'Software Engineering Intern',
    candidate: {
      id: 'candidate-1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567'
    },
    salary: {
      amount: 25,
      currency: 'USD',
      period: 'hour'
    },
    startDate: new Date('2024-02-15'),
    endDate: new Date('2024-05-15'),
    benefits: [
      'Health Insurance',
      'Flexible Working Hours',
      'Learning & Development Budget',
      'Free Lunch'
    ],
    terms: 'This internship position is for a duration of 3 months with the possibility of extension based on performance. The intern will work 40 hours per week and report to the Engineering Manager. All company policies and procedures apply.',
    status: 'sent',
    expiresAt: new Date('2024-02-01'),
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-22'),
    sentAt: new Date('2024-01-22'),
    createdBy: {
      id: 'user-1',
      name: 'Mike Chen',
      title: 'Engineering Manager'
    },
    approvedBy: {
      id: 'user-2',
      name: 'Lisa Wang',
      title: 'HR Director'
    },
    notes: 'Excellent candidate with strong technical skills. Recommended by the entire interview panel.'
  },
  {
    id: 'offer-2',
    applicationId: 'app-2',
    jobId: 'job-2',
    jobTitle: 'Marketing Intern',
    candidate: {
      id: 'candidate-2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 987-6543'
    },
    salary: {
      amount: 20,
      currency: 'USD',
      period: 'hour'
    },
    startDate: new Date('2024-02-20'),
    endDate: new Date('2024-05-20'),
    benefits: [
      'Health Insurance',
      'Professional Development',
      'Mentorship Program'
    ],
    terms: 'This marketing internship is a 3-month program focused on digital marketing and content creation. The intern will work closely with the marketing team on various campaigns and projects.',
    status: 'pending_approval',
    expiresAt: new Date('2024-02-05'),
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21'),
    createdBy: {
      id: 'user-3',
      name: 'Sarah Johnson',
      title: 'Marketing Manager'
    },
    notes: 'Strong portfolio and creative thinking. Good fit for our content marketing initiatives.'
  },
  {
    id: 'offer-3',
    applicationId: 'app-3',
    jobId: 'job-1',
    jobTitle: 'Software Engineering Intern',
    candidate: {
      id: 'candidate-3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      phone: '+1 (555) 456-7890'
    },
    salary: {
      amount: 28,
      currency: 'USD',
      period: 'hour'
    },
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-06-01'),
    benefits: [
      'Health Insurance',
      'Flexible Working Hours',
      'Learning & Development Budget',
      'Stock Options'
    ],
    terms: 'This is a senior-level internship position with additional responsibilities and mentorship opportunities. The intern will work on critical projects and have the opportunity to present to senior leadership.',
    status: 'accepted',
    expiresAt: new Date('2024-01-30'),
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-25'),
    sentAt: new Date('2024-01-20'),
    acceptedAt: new Date('2024-01-25'),
    createdBy: {
      id: 'user-1',
      name: 'Mike Chen',
      title: 'Engineering Manager'
    },
    approvedBy: {
      id: 'user-2',
      name: 'Lisa Wang',
      title: 'HR Director'
    },
    notes: 'Top candidate with exceptional skills. Fast-tracked through the approval process.'
  }
];

// GET all offers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const jobId = searchParams.get('jobId');
    const candidateId = searchParams.get('candidateId');

    let filteredOffers = [...mockOffers];

    // Filter by status
    if (status && status !== 'all') {
      filteredOffers = filteredOffers.filter(offer => offer.status === status);
    }

    // Filter by job ID
    if (jobId) {
      filteredOffers = filteredOffers.filter(offer => offer.jobId === jobId);
    }

    // Filter by candidate ID
    if (candidateId) {
      filteredOffers = filteredOffers.filter(offer => offer.candidate.id === candidateId);
    }

    // Sort by creation date (newest first)
    filteredOffers.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: filteredOffers
    });

  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// CREATE new offer
export async function POST(request: NextRequest) {
  try {
    const offerData = await request.json();

    // Validate required fields
    const requiredFields = ['applicationId', 'jobTitle', 'salary', 'startDate', 'endDate', 'terms', 'expiresAt'];
    for (const field of requiredFields) {
      if (!offerData[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `${field} is required`
          },
          { status: 400 }
        );
      }
    }

    // Validate salary
    if (!offerData.salary.amount || offerData.salary.amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid salary amount is required'
        },
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(offerData.startDate);
    const endDate = new Date(offerData.endDate);
    const expiresAt = new Date(offerData.expiresAt);
    const now = new Date();

    if (startDate <= now) {
      return NextResponse.json(
        {
          success: false,
          error: 'Start date must be in the future'
        },
        { status: 400 }
      );
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'End date must be after start date'
        },
        { status: 400 }
      );
    }

    if (expiresAt <= now) {
      return NextResponse.json(
        {
          success: false,
          error: 'Expiration date must be in the future'
        },
        { status: 400 }
      );
    }

    // Mock candidate data (in real app, fetch from database)
    const mockCandidate = {
      id: 'candidate-1',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567'
    };

    const mockCreatedBy = {
      id: 'current-user',
      name: 'Current User',
      title: 'Manager'
    };

    // Create new offer
    const newOffer: JobOffer = {
      id: `offer-${Date.now()}`,
      applicationId: offerData.applicationId,
      jobId: 'job-1', // In real app, get from application
      jobTitle: offerData.jobTitle,
      candidate: mockCandidate,
      salary: {
        amount: parseFloat(offerData.salary.amount),
        currency: offerData.salary.currency,
        period: offerData.salary.period
      },
      startDate: new Date(offerData.startDate),
      endDate: new Date(offerData.endDate),
      benefits: offerData.benefits || [],
      terms: offerData.terms,
      status: offerData.status || 'draft',
      expiresAt: new Date(offerData.expiresAt),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: mockCreatedBy,
      notes: offerData.notes
    };

    mockOffers.push(newOffer);

    return NextResponse.json({
      success: true,
      data: newOffer,
      message: 'Offer created successfully'
    });

  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
