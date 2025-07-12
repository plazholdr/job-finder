import { NextRequest, NextResponse } from 'next/server';

interface Offer {
  id: string;
  companyId: string;
  candidateId: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  position: string;
  department: string;
  companyName: string;
  candidateName: string;
  
  salary: {
    amount: number;
    currency: string;
    period: 'hour' | 'month' | 'year';
    paySchedule: string;
  };
  
  employment: {
    type: 'internship' | 'full-time' | 'part-time' | 'contract';
    startDate: string;
    endDate?: string;
    duration?: number;
    workLocation: 'remote' | 'hybrid' | 'on-site';
    hoursPerWeek: number;
  };
  
  benefits: string[];
  perks: string[];
  
  terms: {
    probationPeriod?: string;
    noticePeriod?: string;
    confidentialityAgreement: boolean;
    nonCompeteClause: boolean;
  };
  
  expiresAt: string;
  responseDeadline: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired' | 'negotiating';
  sentAt: string;
  respondedAt?: string;
  
  message: string;
  attachments: string[];
  
  contactPerson: {
    name: string;
    title: string;
    email: string;
    phone?: string;
  };
  
  negotiations: Array<{
    id: string;
    from: 'company' | 'candidate';
    message: string;
    proposedChanges: any;
    timestamp: string;
    status: 'pending' | 'accepted' | 'rejected';
  }>;
  
  createdAt: string;
  updatedAt: string;
}

// Mock offers data
const mockOffers: Offer[] = [
  {
    id: 'offer-1',
    companyId: 'company-1',
    candidateId: 'candidate-1',
    applicationId: 'app-1',
    jobId: 'job-1',
    jobTitle: 'Software Engineering Intern',
    position: 'Software Engineering Intern',
    department: 'Engineering',
    companyName: 'TechCorp Inc',
    candidateName: 'John Doe',
    
    salary: {
      amount: 30,
      currency: 'USD',
      period: 'hour',
      paySchedule: 'bi-weekly'
    },
    
    employment: {
      type: 'internship',
      startDate: '2024-06-01T00:00:00Z',
      endDate: '2024-08-31T00:00:00Z',
      duration: 3,
      workLocation: 'hybrid',
      hoursPerWeek: 40
    },
    
    benefits: [
      'Health insurance',
      'Dental insurance',
      'Vision insurance',
      'Paid time off'
    ],
    perks: [
      'Free lunch',
      'Gym membership',
      'Learning stipend',
      'Flexible hours'
    ],
    
    terms: {
      probationPeriod: '30 days',
      confidentialityAgreement: true,
      nonCompeteClause: false
    },
    
    expiresAt: '2024-02-05T23:59:59Z',
    responseDeadline: '2024-02-03T23:59:59Z',
    status: 'pending',
    sentAt: '2024-01-20T10:00:00Z',
    
    message: 'We are excited to offer you the Software Engineering Intern position at TechCorp Inc. This is a great opportunity to work with cutting-edge technologies and learn from experienced engineers.',
    attachments: [
      '/documents/offer-letter.pdf',
      '/documents/employee-handbook.pdf'
    ],
    
    contactPerson: {
      name: 'Sarah Johnson',
      title: 'HR Manager',
      email: 'sarah.johnson@techcorp.com',
      phone: '+1 (555) 123-4567'
    },
    
    negotiations: [],
    
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 'offer-2',
    companyId: 'company-2',
    candidateId: 'candidate-2',
    applicationId: 'app-2',
    jobId: 'job-2',
    jobTitle: 'Data Science Intern',
    position: 'Data Science Intern',
    department: 'Data & Analytics',
    companyName: 'DataFlow Ltd',
    candidateName: 'Jane Smith',
    
    salary: {
      amount: 35,
      currency: 'USD',
      period: 'hour',
      paySchedule: 'bi-weekly'
    },
    
    employment: {
      type: 'internship',
      startDate: '2024-06-15T00:00:00Z',
      endDate: '2024-09-15T00:00:00Z',
      duration: 3,
      workLocation: 'remote',
      hoursPerWeek: 40
    },
    
    benefits: [
      'Health insurance',
      'Professional development budget',
      'Equipment allowance'
    ],
    perks: [
      'Flexible schedule',
      'Conference attendance',
      'Mentorship program'
    ],
    
    terms: {
      confidentialityAgreement: true,
      nonCompeteClause: true
    },
    
    expiresAt: '2024-02-10T23:59:59Z',
    responseDeadline: '2024-02-08T23:59:59Z',
    status: 'negotiating',
    sentAt: '2024-01-18T14:30:00Z',
    
    message: 'We would love to have you join our data science team. Your background in machine learning aligns perfectly with our current projects.',
    attachments: [
      '/documents/offer-letter-ds.pdf'
    ],
    
    contactPerson: {
      name: 'Michael Chen',
      title: 'Data Science Manager',
      email: 'michael.chen@dataflow.com',
      phone: '+1 (555) 987-6543'
    },
    
    negotiations: [
      {
        id: 'neg-1',
        from: 'candidate',
        message: 'Thank you for the offer. I would like to discuss the possibility of increasing the hourly rate to $40.',
        proposedChanges: {
          salary: { amount: 40 }
        },
        timestamp: '2024-01-19T16:00:00Z',
        status: 'pending'
      }
    ],
    
    createdAt: '2024-01-18T14:30:00Z',
    updatedAt: '2024-01-19T16:00:00Z'
  }
];

// GET - Fetch offers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('userType'); // 'company' or 'candidate'
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const jobId = searchParams.get('jobId');

    let filteredOffers = [...mockOffers];

    // Filter by user type and ID
    if (userType === 'company' && userId) {
      filteredOffers = filteredOffers.filter(o => o.companyId === userId);
    } else if (userType === 'candidate' && userId) {
      filteredOffers = filteredOffers.filter(o => o.candidateId === userId);
    }

    // Apply other filters
    if (status) {
      filteredOffers = filteredOffers.filter(o => o.status === status);
    }

    if (jobId) {
      filteredOffers = filteredOffers.filter(o => o.jobId === jobId);
    }

    if (startDate) {
      filteredOffers = filteredOffers.filter(o => 
        new Date(o.sentAt) >= new Date(startDate)
      );
    }

    if (endDate) {
      filteredOffers = filteredOffers.filter(o => 
        new Date(o.sentAt) <= new Date(endDate)
      );
    }

    // Sort by sent date (newest first)
    filteredOffers.sort((a, b) => 
      new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
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
        error: 'Failed to fetch offers'
      },
      { status: 500 }
    );
  }
}

// POST - Create new offer
export async function POST(request: NextRequest) {
  try {
    const offerData = await request.json();

    // Validate required fields
    const requiredFields = [
      'candidateId', 'applicationId', 'jobId', 'jobTitle', 
      'position', 'salary', 'employment', 'contactPerson'
    ];

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

    // Create new offer
    const newOffer: Offer = {
      id: `offer-${Date.now()}`,
      companyId: 'company-1', // In real app, get from auth token
      candidateId: offerData.candidateId,
      applicationId: offerData.applicationId,
      jobId: offerData.jobId,
      jobTitle: offerData.jobTitle,
      position: offerData.position,
      department: offerData.department || 'General',
      companyName: 'TechCorp Inc', // In real app, get from company profile
      candidateName: 'Candidate Name', // In real app, get from candidate profile
      
      salary: offerData.salary,
      employment: offerData.employment,
      benefits: offerData.benefits || [],
      perks: offerData.perks || [],
      terms: offerData.terms || {
        confidentialityAgreement: false,
        nonCompeteClause: false
      },
      
      expiresAt: offerData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      responseDeadline: offerData.responseDeadline || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      sentAt: new Date().toISOString(),
      
      message: offerData.message || '',
      attachments: offerData.attachments || [],
      contactPerson: offerData.contactPerson,
      negotiations: [],
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real application, you would:
    // 1. Save to database
    // 2. Send email notifications to candidate
    // 3. Create in-app notifications
    // 4. Generate offer letter PDF

    mockOffers.push(newOffer);

    return NextResponse.json({
      success: true,
      data: newOffer,
      message: 'Job offer created successfully'
    });
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create offer'
      },
      { status: 500 }
    );
  }
}
