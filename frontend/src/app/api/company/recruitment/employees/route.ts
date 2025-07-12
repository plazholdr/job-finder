import { NextRequest, NextResponse } from 'next/server';

interface EmployeeCandidate {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: Date;
    nationality: string;
  };
  professionalInfo: {
    currentPosition: string;
    experience: number;
    education: string;
    skills: string[];
    certifications: string[];
    expectedSalary: number;
    noticePeriod: number;
  };
  applicationInfo: {
    positionApplied: string;
    applicationDate: Date;
    source: string;
    referredBy?: string;
    coverLetter: string;
    resumeUrl: string;
  };
  recruitmentStatus: 'applied' | 'screening' | 'interview_scheduled' | 'interview_completed' | 'reference_check' | 'offer_pending' | 'offer_accepted' | 'offer_declined' | 'hired' | 'rejected';
  screeningResults?: {
    score: number;
    notes: string;
    screenerName: string;
    screeningDate: Date;
  };
  interviewResults?: Array<{
    round: number;
    type: 'phone' | 'video' | 'in_person' | 'technical';
    interviewerName: string;
    date: Date;
    score: number;
    feedback: string;
    recommendation: 'proceed' | 'reject' | 'hold';
  }>;
  referenceChecks?: Array<{
    referenceName: string;
    relationship: string;
    company: string;
    contactInfo: string;
    feedback: string;
    rating: number;
    verifiedDate: Date;
  }>;
  offerDetails?: {
    position: string;
    salary: number;
    benefits: string[];
    startDate: Date;
    offerDate: Date;
    expiryDate: Date;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
  };
  documents: Array<{
    type: string;
    name: string;
    url: string;
    uploadedDate: Date;
  }>;
  notes: Array<{
    id: string;
    author: string;
    content: string;
    timestamp: Date;
    type: 'general' | 'interview' | 'reference' | 'offer';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Mock employee candidates data
let mockEmployeeCandidates: EmployeeCandidate[] = [
  {
    id: 'emp-candidate-1',
    personalInfo: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, San Francisco, CA 94102',
      dateOfBirth: new Date('1990-05-15'),
      nationality: 'American'
    },
    professionalInfo: {
      currentPosition: 'Senior Software Engineer',
      experience: 5,
      education: 'MS Computer Science, Stanford University',
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes'],
      certifications: ['AWS Solutions Architect', 'Certified Kubernetes Administrator'],
      expectedSalary: 150000,
      noticePeriod: 30
    },
    applicationInfo: {
      positionApplied: 'Lead Software Engineer',
      applicationDate: new Date('2024-01-20T09:00:00Z'),
      source: 'LinkedIn',
      referredBy: 'John Smith',
      coverLetter: 'I am excited to apply for the Lead Software Engineer position...',
      resumeUrl: '/documents/sarah-johnson-resume.pdf'
    },
    recruitmentStatus: 'interview_completed',
    screeningResults: {
      score: 85,
      notes: 'Strong technical background, excellent communication skills',
      screenerName: 'Mike Chen',
      screeningDate: new Date('2024-01-22T14:00:00Z')
    },
    interviewResults: [
      {
        round: 1,
        type: 'video',
        interviewerName: 'Alice Wang',
        date: new Date('2024-01-25T10:00:00Z'),
        score: 88,
        feedback: 'Excellent technical knowledge and problem-solving skills',
        recommendation: 'proceed'
      }
    ],
    documents: [
      {
        type: 'resume',
        name: 'Sarah Johnson - Resume.pdf',
        url: '/documents/sarah-johnson-resume.pdf',
        uploadedDate: new Date('2024-01-20T09:00:00Z')
      },
      {
        type: 'cover_letter',
        name: 'Cover Letter.pdf',
        url: '/documents/sarah-johnson-cover.pdf',
        uploadedDate: new Date('2024-01-20T09:00:00Z')
      }
    ],
    notes: [
      {
        id: 'note-1',
        author: 'Mike Chen',
        content: 'Candidate shows strong leadership potential',
        timestamp: new Date('2024-01-22T14:30:00Z'),
        type: 'general'
      }
    ],
    createdAt: new Date('2024-01-20T09:00:00Z'),
    updatedAt: new Date('2024-01-25T10:30:00Z')
  },
  {
    id: 'emp-candidate-2',
    personalInfo: {
      name: 'Michael Rodriguez',
      email: 'michael.rodriguez@email.com',
      phone: '+1 (555) 987-6543',
      address: '456 Oak Ave, Seattle, WA 98101',
      dateOfBirth: new Date('1988-11-22'),
      nationality: 'American'
    },
    professionalInfo: {
      currentPosition: 'Product Manager',
      experience: 7,
      education: 'MBA, University of Washington',
      skills: ['Product Strategy', 'Agile', 'Data Analysis', 'User Research', 'SQL'],
      certifications: ['Certified Scrum Product Owner', 'Google Analytics'],
      expectedSalary: 140000,
      noticePeriod: 45
    },
    applicationInfo: {
      positionApplied: 'Senior Product Manager',
      applicationDate: new Date('2024-01-18T11:30:00Z'),
      source: 'Company Website',
      coverLetter: 'With 7 years of product management experience...',
      resumeUrl: '/documents/michael-rodriguez-resume.pdf'
    },
    recruitmentStatus: 'reference_check',
    screeningResults: {
      score: 92,
      notes: 'Outstanding product sense and strategic thinking',
      screenerName: 'Lisa Park',
      screeningDate: new Date('2024-01-20T15:00:00Z')
    },
    interviewResults: [
      {
        round: 1,
        type: 'video',
        interviewerName: 'David Kim',
        date: new Date('2024-01-23T14:00:00Z'),
        score: 90,
        feedback: 'Strong product vision and excellent stakeholder management',
        recommendation: 'proceed'
      },
      {
        round: 2,
        type: 'in_person',
        interviewerName: 'Sarah Chen',
        date: new Date('2024-01-26T11:00:00Z'),
        score: 87,
        feedback: 'Great cultural fit, demonstrated leadership abilities',
        recommendation: 'proceed'
      }
    ],
    referenceChecks: [
      {
        referenceName: 'Jennifer Lee',
        relationship: 'Former Manager',
        company: 'TechCorp Inc.',
        contactInfo: 'jennifer.lee@techcorp.com',
        feedback: 'Michael is an exceptional product manager with strong analytical skills',
        rating: 5,
        verifiedDate: new Date('2024-01-28T16:00:00Z')
      }
    ],
    documents: [
      {
        type: 'resume',
        name: 'Michael Rodriguez - Resume.pdf',
        url: '/documents/michael-rodriguez-resume.pdf',
        uploadedDate: new Date('2024-01-18T11:30:00Z')
      }
    ],
    notes: [],
    createdAt: new Date('2024-01-18T11:30:00Z'),
    updatedAt: new Date('2024-01-28T16:00:00Z')
  },
  {
    id: 'emp-candidate-3',
    personalInfo: {
      name: 'Emily Chen',
      email: 'emily.chen@email.com',
      phone: '+1 (555) 456-7890',
      address: '789 Pine St, Austin, TX 78701',
      dateOfBirth: new Date('1992-03-08'),
      nationality: 'American'
    },
    professionalInfo: {
      currentPosition: 'UX Designer',
      experience: 4,
      education: 'BFA Design, Art Institute of Austin',
      skills: ['Figma', 'Sketch', 'Adobe Creative Suite', 'User Research', 'Prototyping'],
      certifications: ['Google UX Design Certificate'],
      expectedSalary: 95000,
      noticePeriod: 14
    },
    applicationInfo: {
      positionApplied: 'Senior UX Designer',
      applicationDate: new Date('2024-01-22T13:15:00Z'),
      source: 'Dribbble',
      coverLetter: 'I am passionate about creating user-centered designs...',
      resumeUrl: '/documents/emily-chen-resume.pdf'
    },
    recruitmentStatus: 'screening',
    documents: [
      {
        type: 'resume',
        name: 'Emily Chen - Resume.pdf',
        url: '/documents/emily-chen-resume.pdf',
        uploadedDate: new Date('2024-01-22T13:15:00Z')
      },
      {
        type: 'portfolio',
        name: 'Design Portfolio.pdf',
        url: '/documents/emily-chen-portfolio.pdf',
        uploadedDate: new Date('2024-01-22T13:15:00Z')
      }
    ],
    notes: [],
    createdAt: new Date('2024-01-22T13:15:00Z'),
    updatedAt: new Date('2024-01-22T13:15:00Z')
  }
];

// GET employee candidates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const position = searchParams.get('position');
    const experience = searchParams.get('experience');

    let filteredCandidates = [...mockEmployeeCandidates];

    // Apply filters
    if (status && status !== 'all') {
      filteredCandidates = filteredCandidates.filter(candidate => candidate.recruitmentStatus === status);
    }

    if (position) {
      filteredCandidates = filteredCandidates.filter(candidate => 
        candidate.applicationInfo.positionApplied.toLowerCase().includes(position.toLowerCase())
      );
    }

    if (experience) {
      const expYears = parseInt(experience);
      filteredCandidates = filteredCandidates.filter(candidate => 
        candidate.professionalInfo.experience >= expYears
      );
    }

    // Sort by application date (most recent first)
    filteredCandidates.sort((a, b) => 
      new Date(b.applicationInfo.applicationDate).getTime() - new Date(a.applicationInfo.applicationDate).getTime()
    );

    return NextResponse.json({
      success: true,
      data: filteredCandidates
    });

  } catch (error) {
    console.error('Error fetching employee candidates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST create new employee candidate
export async function POST(request: NextRequest) {
  try {
    const candidateData = await request.json();

    // Validate required fields
    const requiredFields = ['personalInfo', 'professionalInfo', 'applicationInfo'];
    for (const field of requiredFields) {
      if (!candidateData[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `${field} is required`
          },
          { status: 400 }
        );
      }
    }

    // Create new candidate
    const newCandidate: EmployeeCandidate = {
      id: `emp-candidate-${Date.now()}`,
      personalInfo: candidateData.personalInfo,
      professionalInfo: candidateData.professionalInfo,
      applicationInfo: {
        ...candidateData.applicationInfo,
        applicationDate: new Date()
      },
      recruitmentStatus: 'applied',
      documents: candidateData.documents || [],
      notes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockEmployeeCandidates.push(newCandidate);

    return NextResponse.json({
      success: true,
      data: newCandidate,
      message: 'Employee candidate created successfully'
    });

  } catch (error) {
    console.error('Error creating employee candidate:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
