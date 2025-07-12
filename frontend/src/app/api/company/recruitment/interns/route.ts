import { NextRequest, NextResponse } from 'next/server';

interface InternCandidate {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: Date;
    nationality: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  academicInfo: {
    university: string;
    degree: string;
    major: string;
    year: string;
    gpa: number;
    expectedGraduation: Date;
    academicProjects: Array<{
      title: string;
      description: string;
      technologies: string[];
    }>;
  };
  internshipInfo: {
    positionApplied: string;
    preferredStartDate: Date;
    duration: number;
    availability: 'full-time' | 'part-time';
    workLocation: 'remote' | 'on-site' | 'hybrid';
    applicationDate: Date;
    source: string;
    referredBy?: string;
    coverLetter: string;
    resumeUrl: string;
  };
  recruitmentStatus: 'applied' | 'initial_screening' | 'academic_verification' | 'technical_assessment' | 'interview_scheduled' | 'interview_completed' | 'final_review' | 'offer_pending' | 'offer_accepted' | 'offer_declined' | 'onboarding' | 'active' | 'completed' | 'terminated' | 'rejected';
  screeningResults?: {
    score: number;
    notes: string;
    screenerName: string;
    screeningDate: Date;
    academicVerified: boolean;
  };
  technicalAssessment?: {
    testName: string;
    score: number;
    completedDate: Date;
    timeSpent: number;
    feedback: string;
  };
  interviewResults?: Array<{
    round: number;
    type: 'phone' | 'video' | 'in_person' | 'technical' | 'behavioral';
    interviewerName: string;
    date: Date;
    score: number;
    feedback: string;
    recommendation: 'proceed' | 'reject' | 'hold';
  }>;
  offerDetails?: {
    position: string;
    stipend: number;
    duration: number;
    startDate: Date;
    endDate: Date;
    mentorAssigned?: string;
    department: string;
    offerDate: Date;
    expiryDate: Date;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
  };
  onboardingInfo?: {
    startDate: Date;
    mentor: string;
    buddy: string;
    orientation: {
      completed: boolean;
      date?: Date;
    };
    equipmentAssigned: string[];
    accessGranted: string[];
  };
  documents: Array<{
    type: string;
    name: string;
    url: string;
    uploadedDate: Date;
    required: boolean;
  }>;
  notes: Array<{
    id: string;
    author: string;
    content: string;
    timestamp: Date;
    type: 'general' | 'academic' | 'interview' | 'offer' | 'onboarding';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Mock intern candidates data
let mockInternCandidates: InternCandidate[] = [
  {
    id: 'intern-candidate-1',
    personalInfo: {
      name: 'Alex Thompson',
      email: 'alex.thompson@university.edu',
      phone: '+1 (555) 234-5678',
      address: '456 College Ave, Berkeley, CA 94720',
      dateOfBirth: new Date('2002-08-15'),
      nationality: 'American',
      emergencyContact: {
        name: 'Mary Thompson',
        relationship: 'Mother',
        phone: '+1 (555) 234-5679'
      }
    },
    academicInfo: {
      university: 'UC Berkeley',
      degree: 'Bachelor of Science',
      major: 'Computer Science',
      year: 'Junior',
      gpa: 3.7,
      expectedGraduation: new Date('2025-05-15'),
      academicProjects: [
        {
          title: 'E-commerce Web Application',
          description: 'Built a full-stack e-commerce platform using React and Node.js',
          technologies: ['React', 'Node.js', 'MongoDB', 'Express']
        },
        {
          title: 'Machine Learning Image Classifier',
          description: 'Developed an image classification model using TensorFlow',
          technologies: ['Python', 'TensorFlow', 'OpenCV', 'Jupyter']
        }
      ]
    },
    internshipInfo: {
      positionApplied: 'Software Engineering Intern',
      preferredStartDate: new Date('2024-06-01'),
      duration: 3,
      availability: 'full-time',
      workLocation: 'hybrid',
      applicationDate: new Date('2024-01-15T10:30:00Z'),
      source: 'University Career Fair',
      coverLetter: 'I am excited to apply for the Software Engineering Internship...',
      resumeUrl: '/documents/alex-thompson-resume.pdf'
    },
    recruitmentStatus: 'technical_assessment',
    screeningResults: {
      score: 88,
      notes: 'Strong academic background, good communication skills',
      screenerName: 'Jennifer Lee',
      screeningDate: new Date('2024-01-18T14:00:00Z'),
      academicVerified: true
    },
    technicalAssessment: {
      testName: 'Software Engineering Assessment',
      score: 85,
      completedDate: new Date('2024-01-22T16:00:00Z'),
      timeSpent: 120,
      feedback: 'Good problem-solving skills, clean code structure'
    },
    documents: [
      {
        type: 'resume',
        name: 'Alex Thompson - Resume.pdf',
        url: '/documents/alex-thompson-resume.pdf',
        uploadedDate: new Date('2024-01-15T10:30:00Z'),
        required: true
      },
      {
        type: 'transcript',
        name: 'Official Transcript.pdf',
        url: '/documents/alex-thompson-transcript.pdf',
        uploadedDate: new Date('2024-01-16T09:00:00Z'),
        required: true
      },
      {
        type: 'cover_letter',
        name: 'Cover Letter.pdf',
        url: '/documents/alex-thompson-cover.pdf',
        uploadedDate: new Date('2024-01-15T10:30:00Z'),
        required: false
      }
    ],
    notes: [
      {
        id: 'note-1',
        author: 'Jennifer Lee',
        content: 'Impressive academic projects, shows initiative',
        timestamp: new Date('2024-01-18T14:30:00Z'),
        type: 'academic'
      }
    ],
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-22T16:00:00Z')
  },
  {
    id: 'intern-candidate-2',
    personalInfo: {
      name: 'Maria Garcia',
      email: 'maria.garcia@stanford.edu',
      phone: '+1 (555) 345-6789',
      address: '789 Campus Dr, Stanford, CA 94305',
      dateOfBirth: new Date('2003-03-22'),
      nationality: 'American',
      emergencyContact: {
        name: 'Carlos Garcia',
        relationship: 'Father',
        phone: '+1 (555) 345-6790'
      }
    },
    academicInfo: {
      university: 'Stanford University',
      degree: 'Bachelor of Science',
      major: 'Data Science',
      year: 'Sophomore',
      gpa: 3.9,
      expectedGraduation: new Date('2026-06-15'),
      academicProjects: [
        {
          title: 'Social Media Sentiment Analysis',
          description: 'Analyzed sentiment patterns in social media data using NLP',
          technologies: ['Python', 'NLTK', 'Pandas', 'Scikit-learn']
        }
      ]
    },
    internshipInfo: {
      positionApplied: 'Data Science Intern',
      preferredStartDate: new Date('2024-06-15'),
      duration: 4,
      availability: 'full-time',
      workLocation: 'on-site',
      applicationDate: new Date('2024-01-20T11:15:00Z'),
      source: 'LinkedIn',
      coverLetter: 'As a passionate data science student...',
      resumeUrl: '/documents/maria-garcia-resume.pdf'
    },
    recruitmentStatus: 'offer_accepted',
    screeningResults: {
      score: 95,
      notes: 'Exceptional academic performance, strong analytical skills',
      screenerName: 'David Kim',
      screeningDate: new Date('2024-01-23T15:00:00Z'),
      academicVerified: true
    },
    technicalAssessment: {
      testName: 'Data Science Assessment',
      score: 92,
      completedDate: new Date('2024-01-26T14:30:00Z'),
      timeSpent: 90,
      feedback: 'Excellent statistical knowledge and programming skills'
    },
    interviewResults: [
      {
        round: 1,
        type: 'video',
        interviewerName: 'Sarah Chen',
        date: new Date('2024-01-29T10:00:00Z'),
        score: 90,
        feedback: 'Strong technical knowledge and enthusiasm for data science',
        recommendation: 'proceed'
      }
    ],
    offerDetails: {
      position: 'Data Science Intern',
      stipend: 6000,
      duration: 4,
      startDate: new Date('2024-06-15'),
      endDate: new Date('2024-10-15'),
      mentorAssigned: 'Dr. Lisa Wang',
      department: 'Data Analytics',
      offerDate: new Date('2024-02-01T09:00:00Z'),
      expiryDate: new Date('2024-02-15T17:00:00Z'),
      status: 'accepted'
    },
    documents: [
      {
        type: 'resume',
        name: 'Maria Garcia - Resume.pdf',
        url: '/documents/maria-garcia-resume.pdf',
        uploadedDate: new Date('2024-01-20T11:15:00Z'),
        required: true
      },
      {
        type: 'transcript',
        name: 'Official Transcript.pdf',
        url: '/documents/maria-garcia-transcript.pdf',
        uploadedDate: new Date('2024-01-21T08:30:00Z'),
        required: true
      }
    ],
    notes: [],
    createdAt: new Date('2024-01-20T11:15:00Z'),
    updatedAt: new Date('2024-02-01T09:00:00Z')
  },
  {
    id: 'intern-candidate-3',
    personalInfo: {
      name: 'James Wilson',
      email: 'james.wilson@mit.edu',
      phone: '+1 (555) 456-7890',
      address: '321 Tech St, Cambridge, MA 02139',
      dateOfBirth: new Date('2001-11-08'),
      nationality: 'American',
      emergencyContact: {
        name: 'Susan Wilson',
        relationship: 'Mother',
        phone: '+1 (555) 456-7891'
      }
    },
    academicInfo: {
      university: 'MIT',
      degree: 'Bachelor of Science',
      major: 'Electrical Engineering',
      year: 'Senior',
      gpa: 3.8,
      expectedGraduation: new Date('2024-05-15'),
      academicProjects: [
        {
          title: 'IoT Smart Home System',
          description: 'Designed and implemented a complete IoT home automation system',
          technologies: ['Arduino', 'Raspberry Pi', 'Python', 'MQTT']
        }
      ]
    },
    internshipInfo: {
      positionApplied: 'Hardware Engineering Intern',
      preferredStartDate: new Date('2024-06-01'),
      duration: 3,
      availability: 'full-time',
      workLocation: 'on-site',
      applicationDate: new Date('2024-01-25T14:20:00Z'),
      source: 'Company Website',
      coverLetter: 'I am interested in applying my hardware engineering skills...',
      resumeUrl: '/documents/james-wilson-resume.pdf'
    },
    recruitmentStatus: 'applied',
    documents: [
      {
        type: 'resume',
        name: 'James Wilson - Resume.pdf',
        url: '/documents/james-wilson-resume.pdf',
        uploadedDate: new Date('2024-01-25T14:20:00Z'),
        required: true
      }
    ],
    notes: [],
    createdAt: new Date('2024-01-25T14:20:00Z'),
    updatedAt: new Date('2024-01-25T14:20:00Z')
  }
];

// GET intern candidates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const university = searchParams.get('university');
    const major = searchParams.get('major');

    let filteredCandidates = [...mockInternCandidates];

    // Apply filters
    if (status && status !== 'all') {
      filteredCandidates = filteredCandidates.filter(candidate => candidate.recruitmentStatus === status);
    }

    if (university) {
      filteredCandidates = filteredCandidates.filter(candidate => 
        candidate.academicInfo.university.toLowerCase().includes(university.toLowerCase())
      );
    }

    if (major) {
      filteredCandidates = filteredCandidates.filter(candidate => 
        candidate.academicInfo.major.toLowerCase().includes(major.toLowerCase())
      );
    }

    // Sort by application date (most recent first)
    filteredCandidates.sort((a, b) => 
      new Date(b.internshipInfo.applicationDate).getTime() - new Date(a.internshipInfo.applicationDate).getTime()
    );

    return NextResponse.json({
      success: true,
      data: filteredCandidates
    });

  } catch (error) {
    console.error('Error fetching intern candidates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST create new intern candidate
export async function POST(request: NextRequest) {
  try {
    const candidateData = await request.json();

    // Validate required fields
    const requiredFields = ['personalInfo', 'academicInfo', 'internshipInfo'];
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

    // Create new intern candidate
    const newCandidate: InternCandidate = {
      id: `intern-candidate-${Date.now()}`,
      personalInfo: candidateData.personalInfo,
      academicInfo: candidateData.academicInfo,
      internshipInfo: {
        ...candidateData.internshipInfo,
        applicationDate: new Date()
      },
      recruitmentStatus: 'applied',
      documents: candidateData.documents || [],
      notes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockInternCandidates.push(newCandidate);

    return NextResponse.json({
      success: true,
      data: newCandidate,
      message: 'Intern candidate created successfully'
    });

  } catch (error) {
    console.error('Error creating intern candidate:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
