import { NextRequest, NextResponse } from 'next/server';

interface ProgramCandidate {
  id: string;
  universityId: string;
  programId: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    avatar?: string;
  };
  academicInfo: {
    year: string;
    gpa: number;
    expectedGraduation: Date;
    major: string;
    specialization?: string;
  };
  internshipPreferences: {
    startDate: Date;
    endDate: Date;
    duration: number; // in months
    preferredLocations: string[];
    salaryRange: {
      min: number;
      max: number;
      currency: string;
    };
    workType: 'remote' | 'on-site' | 'hybrid';
    availability: 'full-time' | 'part-time';
  };
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  status: 'available' | 'interviewing' | 'hired' | 'unavailable';
  profileCompleteness: number;
  lastActive: Date;
  createdAt: Date;
}

// Mock candidates data
const mockCandidates: ProgramCandidate[] = [
  {
    id: 'candidate-1',
    universityId: 'univ-1',
    programId: 'prog-1',
    personalInfo: {
      name: 'Alex Chen',
      email: 'alex.chen@berkeley.edu',
      phone: '+1 (555) 123-4567',
      location: 'Berkeley, CA',
      avatar: '/api/placeholder/40/40'
    },
    academicInfo: {
      year: 'Junior',
      gpa: 3.8,
      expectedGraduation: new Date('2025-05-15'),
      major: 'Computer Science',
      specialization: 'Machine Learning'
    },
    internshipPreferences: {
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
      duration: 3,
      preferredLocations: ['San Francisco, CA', 'Palo Alto, CA', 'Remote'],
      salaryRange: { min: 25, max: 35, currency: 'USD' },
      workType: 'hybrid',
      availability: 'full-time'
    },
    skills: ['Python', 'JavaScript', 'React', 'Machine Learning', 'SQL'],
    experience: [
      {
        title: 'Software Engineering Intern',
        company: 'Tech Startup',
        duration: '3 months',
        description: 'Developed web applications using React and Node.js'
      }
    ],
    projects: [
      {
        name: 'AI Chatbot',
        description: 'Built an intelligent chatbot using natural language processing',
        technologies: ['Python', 'TensorFlow', 'Flask'],
        url: 'https://github.com/alexchen/ai-chatbot'
      }
    ],
    status: 'available',
    profileCompleteness: 95,
    lastActive: new Date('2024-01-15'),
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'candidate-2',
    universityId: 'univ-1',
    programId: 'prog-1',
    personalInfo: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@berkeley.edu',
      phone: '+1 (555) 234-5678',
      location: 'Oakland, CA',
      avatar: '/api/placeholder/40/40'
    },
    academicInfo: {
      year: 'Senior',
      gpa: 3.9,
      expectedGraduation: new Date('2024-12-15'),
      major: 'Computer Science',
      specialization: 'Software Engineering'
    },
    internshipPreferences: {
      startDate: new Date('2024-05-15'),
      endDate: new Date('2024-08-15'),
      duration: 3,
      preferredLocations: ['San Francisco, CA', 'Berkeley, CA'],
      salaryRange: { min: 30, max: 40, currency: 'USD' },
      workType: 'on-site',
      availability: 'full-time'
    },
    skills: ['Java', 'Python', 'Spring Boot', 'Docker', 'AWS'],
    experience: [
      {
        title: 'Backend Developer Intern',
        company: 'Enterprise Corp',
        duration: '4 months',
        description: 'Built scalable backend services using Java and Spring Boot'
      }
    ],
    projects: [
      {
        name: 'Microservices Platform',
        description: 'Designed and implemented a microservices architecture',
        technologies: ['Java', 'Spring Boot', 'Docker', 'Kubernetes'],
        url: 'https://github.com/sarahj/microservices'
      }
    ],
    status: 'available',
    profileCompleteness: 90,
    lastActive: new Date('2024-01-14'),
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'candidate-3',
    universityId: 'univ-1',
    programId: 'prog-2',
    personalInfo: {
      name: 'Michael Rodriguez',
      email: 'michael.rodriguez@berkeley.edu',
      phone: '+1 (555) 345-6789',
      location: 'San Francisco, CA',
      avatar: '/api/placeholder/40/40'
    },
    academicInfo: {
      year: 'Graduate Student',
      gpa: 3.7,
      expectedGraduation: new Date('2025-05-15'),
      major: 'Data Science',
      specialization: 'Deep Learning'
    },
    internshipPreferences: {
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-09-01'),
      duration: 3,
      preferredLocations: ['San Francisco, CA', 'Remote'],
      salaryRange: { min: 35, max: 50, currency: 'USD' },
      workType: 'remote',
      availability: 'full-time'
    },
    skills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'R', 'Tableau'],
    experience: [
      {
        title: 'Data Analyst',
        company: 'Analytics Firm',
        duration: '6 months',
        description: 'Analyzed large datasets and built predictive models'
      }
    ],
    projects: [
      {
        name: 'Stock Price Predictor',
        description: 'Built a deep learning model to predict stock prices',
        technologies: ['Python', 'TensorFlow', 'Pandas', 'NumPy'],
        url: 'https://github.com/mrodriguez/stock-predictor'
      }
    ],
    status: 'available',
    profileCompleteness: 88,
    lastActive: new Date('2024-01-16'),
    createdAt: new Date('2024-01-02')
  },
  {
    id: 'candidate-4',
    universityId: 'univ-2',
    programId: 'prog-4',
    personalInfo: {
      name: 'Emily Zhang',
      email: 'emily.zhang@stanford.edu',
      phone: '+1 (555) 456-7890',
      location: 'Palo Alto, CA',
      avatar: '/api/placeholder/40/40'
    },
    academicInfo: {
      year: 'Sophomore',
      gpa: 3.9,
      expectedGraduation: new Date('2026-06-15'),
      major: 'Computer Science',
      specialization: 'Human-Computer Interaction'
    },
    internshipPreferences: {
      startDate: new Date('2024-06-15'),
      endDate: new Date('2024-09-15'),
      duration: 3,
      preferredLocations: ['Palo Alto, CA', 'Mountain View, CA'],
      salaryRange: { min: 28, max: 38, currency: 'USD' },
      workType: 'hybrid',
      availability: 'full-time'
    },
    skills: ['JavaScript', 'React', 'Node.js', 'UI/UX Design', 'Figma'],
    experience: [],
    projects: [
      {
        name: 'Social Media App',
        description: 'Designed and developed a social media application',
        technologies: ['React', 'Node.js', 'MongoDB', 'Figma'],
        url: 'https://github.com/emilyzhang/social-app'
      }
    ],
    status: 'available',
    profileCompleteness: 85,
    lastActive: new Date('2024-01-17'),
    createdAt: new Date('2024-01-03')
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; programId: string } }
) {
  try {
    const { id: universityId, programId } = params;
    const { searchParams } = new URL(request.url);
    
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const location = searchParams.get('location');
    const minSalary = searchParams.get('minSalary');
    const maxSalary = searchParams.get('maxSalary');
    const workType = searchParams.get('workType');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Filter candidates by university and program
    let filteredCandidates = mockCandidates.filter(
      candidate => candidate.universityId === universityId && candidate.programId === programId
    );

    // Apply filters
    if (startDate) {
      filteredCandidates = filteredCandidates.filter(candidate =>
        new Date(candidate.internshipPreferences.startDate) >= new Date(startDate)
      );
    }

    if (endDate) {
      filteredCandidates = filteredCandidates.filter(candidate =>
        new Date(candidate.internshipPreferences.endDate) <= new Date(endDate)
      );
    }

    if (location) {
      filteredCandidates = filteredCandidates.filter(candidate =>
        candidate.internshipPreferences.preferredLocations.some(loc =>
          loc.toLowerCase().includes(location.toLowerCase())
        )
      );
    }

    if (minSalary) {
      filteredCandidates = filteredCandidates.filter(candidate =>
        candidate.internshipPreferences.salaryRange.min >= parseInt(minSalary)
      );
    }

    if (maxSalary) {
      filteredCandidates = filteredCandidates.filter(candidate =>
        candidate.internshipPreferences.salaryRange.max <= parseInt(maxSalary)
      );
    }

    if (workType && workType !== 'all') {
      filteredCandidates = filteredCandidates.filter(candidate =>
        candidate.internshipPreferences.workType === workType
      );
    }

    if (status && status !== 'all') {
      filteredCandidates = filteredCandidates.filter(candidate =>
        candidate.status === status
      );
    }

    // Apply sorting
    filteredCandidates.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortBy === 'name') {
        aValue = a.personalInfo.name.toLowerCase();
        bValue = b.personalInfo.name.toLowerCase();
      } else if (sortBy === 'gpa') {
        aValue = a.academicInfo.gpa;
        bValue = b.academicInfo.gpa;
      } else if (sortBy === 'lastActive') {
        aValue = new Date(a.lastActive).getTime();
        bValue = new Date(b.lastActive).getTime();
      } else {
        aValue = a[sortBy as keyof ProgramCandidate];
        bValue = b[sortBy as keyof ProgramCandidate];
      }

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    return NextResponse.json({
      success: true,
      data: filteredCandidates,
      total: filteredCandidates.length
    });

  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
