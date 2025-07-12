import { NextRequest, NextResponse } from 'next/server';

interface CompletingIntern {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    university: string;
    major: string;
    year: string;
  };
  internshipDetails: {
    position: string;
    department: string;
    startDate: Date;
    endDate: Date;
    duration: number;
    mentor: string;
    supervisor: string;
    projects: string[];
  };
  completionStatus: 'active' | 'pre_completion' | 'project_review' | 'performance_evaluation' | 'exit_interview' | 'documentation_finalization' | 'certificate_generation' | 'alumni_network' | 'completed' | 'extended';
  completionProgress: {
    projectReview: {
      completed: boolean;
      completedDate?: Date;
      projects: Array<{
        title: string;
        description: string;
        technologies: string[];
        deliverables: Array<{
          name: string;
          type: 'document' | 'code' | 'presentation' | 'demo';
          url?: string;
          status: 'pending' | 'submitted' | 'reviewed' | 'approved';
          submittedDate?: Date;
          reviewedDate?: Date;
          feedback?: string;
          score?: number;
        }>;
        overallScore?: number;
        feedback?: string;
        reviewedBy?: string;
        reviewedDate?: Date;
      }>;
    };
    performanceEvaluation: {
      completed: boolean;
      completedDate?: Date;
      evaluations: Array<{
        evaluatorName: string;
        evaluatorRole: string;
        evaluationDate: Date;
        categories: Array<{
          category: string;
          score: number;
          maxScore: number;
          feedback: string;
        }>;
        overallScore: number;
        strengths: string[];
        areasForImprovement: string[];
        recommendations: string;
        futureOpportunities?: string;
      }>;
      selfEvaluation?: {
        completedDate: Date;
        learnings: string[];
        achievements: string[];
        challenges: string[];
        feedback: string;
        careerGoals: string[];
      };
    };
    exitInterview: {
      completed: boolean;
      scheduledDate?: Date;
      completedDate?: Date;
      interviewer: string;
      feedback: {
        overallExperience: number;
        mentorshipQuality: number;
        projectRelevance: number;
        learningOpportunities: number;
        workEnvironment: number;
        recommendToOthers: boolean;
        suggestions: string;
        highlights: string[];
        improvements: string[];
      };
      futureInterest: {
        fullTimePosition: boolean;
        futureInternship: boolean;
        referrals: boolean;
        stayInTouch: boolean;
      };
    };
    documentationFinalization: {
      completed: boolean;
      completedDate?: Date;
      documents: Array<{
        name: string;
        type: 'timesheet' | 'expense_report' | 'equipment_return' | 'access_revocation' | 'final_report' | 'knowledge_transfer';
        status: 'pending' | 'submitted' | 'approved' | 'completed';
        submittedDate?: Date;
        approvedDate?: Date;
        notes?: string;
      }>;
      equipmentReturned: boolean;
      accessRevoked: boolean;
      finalPaymentProcessed: boolean;
    };
    certificateGeneration: {
      completed: boolean;
      generatedDate?: Date;
      certificate: {
        type: 'completion' | 'excellence' | 'outstanding_performance';
        templateUsed: string;
        signedBy: string[];
        deliveryMethod: 'email' | 'physical' | 'both';
        deliveredDate?: Date;
        customizations?: string[];
      };
      recommendations: Array<{
        type: 'linkedin' | 'letter' | 'reference';
        requestedBy: string;
        providedBy: string;
        status: 'requested' | 'drafted' | 'approved' | 'delivered';
        content?: string;
        deliveredDate?: Date;
      }>;
    };
    alumniNetwork: {
      completed: boolean;
      enrolledDate?: Date;
      alumniProfile: {
        created: boolean;
        profileUrl?: string;
        permissions: {
          contactInfo: boolean;
          careerUpdates: boolean;
          mentorship: boolean;
          events: boolean;
        };
      };
      networking: {
        introductions: string[];
        events: string[];
        mentorshipOpportunities: string[];
      };
      futureEngagement: {
        ambassadorProgram: boolean;
        mentorshipProgram: boolean;
        recruitmentEvents: boolean;
        guestSpeaking: boolean;
      };
    };
  };
  documents: Array<{
    type: string;
    name: string;
    url: string;
    uploadedDate: Date;
    status: 'pending' | 'approved' | 'completed';
  }>;
  notes: Array<{
    id: string;
    author: string;
    content: string;
    timestamp: Date;
    type: 'general' | 'project' | 'performance' | 'exit' | 'documentation' | 'alumni';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Mock completing interns data
let mockCompletingInterns: CompletingIntern[] = [
  {
    id: 'completing-intern-1',
    personalInfo: {
      name: 'Alex Thompson',
      email: 'alex.thompson@university.edu',
      phone: '+1 (555) 234-5678',
      university: 'UC Berkeley',
      major: 'Computer Science',
      year: 'Junior'
    },
    internshipDetails: {
      position: 'Software Engineering Intern',
      department: 'Engineering',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
      duration: 3,
      mentor: 'Sarah Chen',
      supervisor: 'Mike Johnson',
      projects: ['E-commerce Platform', 'Mobile App Development', 'API Integration']
    },
    completionStatus: 'project_review',
    completionProgress: {
      projectReview: {
        completed: false,
        projects: [
          {
            title: 'E-commerce Platform Enhancement',
            description: 'Improved the checkout process and added new payment methods',
            technologies: ['React', 'Node.js', 'MongoDB', 'Stripe API'],
            deliverables: [
              {
                name: 'Frontend Implementation',
                type: 'code',
                url: '/projects/alex-frontend.zip',
                status: 'submitted',
                submittedDate: new Date('2024-08-25'),
                score: 88
              },
              {
                name: 'API Documentation',
                type: 'document',
                url: '/projects/alex-api-docs.pdf',
                status: 'reviewed',
                reviewedDate: new Date('2024-08-26'),
                feedback: 'Comprehensive documentation with good examples',
                score: 92
              },
              {
                name: 'Project Presentation',
                type: 'presentation',
                status: 'pending'
              }
            ],
            overallScore: 90,
            feedback: 'Excellent work on the e-commerce platform. Shows strong technical skills and attention to detail.',
            reviewedBy: 'Sarah Chen',
            reviewedDate: new Date('2024-08-26')
          }
        ]
      },
      performanceEvaluation: {
        completed: false,
        evaluations: []
      },
      exitInterview: {
        completed: false,
        interviewer: '',
        feedback: {
          overallExperience: 0,
          mentorshipQuality: 0,
          projectRelevance: 0,
          learningOpportunities: 0,
          workEnvironment: 0,
          recommendToOthers: false,
          suggestions: '',
          highlights: [],
          improvements: []
        },
        futureInterest: {
          fullTimePosition: false,
          futureInternship: false,
          referrals: false,
          stayInTouch: false
        }
      },
      documentationFinalization: {
        completed: false,
        documents: [],
        equipmentReturned: false,
        accessRevoked: false,
        finalPaymentProcessed: false
      },
      certificateGeneration: {
        completed: false,
        certificate: {
          type: 'completion',
          templateUsed: '',
          signedBy: [],
          deliveryMethod: 'email'
        },
        recommendations: []
      },
      alumniNetwork: {
        completed: false,
        alumniProfile: {
          created: false,
          permissions: {
            contactInfo: false,
            careerUpdates: false,
            mentorship: false,
            events: false
          }
        },
        networking: {
          introductions: [],
          events: [],
          mentorshipOpportunities: []
        },
        futureEngagement: {
          ambassadorProgram: false,
          mentorshipProgram: false,
          recruitmentEvents: false,
          guestSpeaking: false
        }
      }
    },
    documents: [
      {
        type: 'project_deliverable',
        name: 'Final Project Report.pdf',
        url: '/documents/alex-final-report.pdf',
        uploadedDate: new Date('2024-08-25'),
        status: 'pending'
      }
    ],
    notes: [
      {
        id: 'note-1',
        author: 'Sarah Chen',
        content: 'Alex has shown exceptional growth throughout the internship',
        timestamp: new Date('2024-08-26'),
        type: 'project'
      }
    ],
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-08-26')
  },
  {
    id: 'completing-intern-2',
    personalInfo: {
      name: 'Maria Garcia',
      email: 'maria.garcia@stanford.edu',
      phone: '+1 (555) 345-6789',
      university: 'Stanford University',
      major: 'Data Science',
      year: 'Sophomore'
    },
    internshipDetails: {
      position: 'Data Science Intern',
      department: 'Analytics',
      startDate: new Date('2024-06-15'),
      endDate: new Date('2024-10-15'),
      duration: 4,
      mentor: 'Dr. Lisa Wang',
      supervisor: 'David Kim',
      projects: ['Customer Analytics Dashboard', 'Predictive Modeling', 'Data Pipeline Optimization']
    },
    completionStatus: 'performance_evaluation',
    completionProgress: {
      projectReview: {
        completed: true,
        completedDate: new Date('2024-10-10'),
        projects: [
          {
            title: 'Customer Analytics Dashboard',
            description: 'Built comprehensive analytics dashboard for customer behavior analysis',
            technologies: ['Python', 'Tableau', 'SQL', 'AWS'],
            deliverables: [
              {
                name: 'Dashboard Implementation',
                type: 'demo',
                url: '/projects/maria-dashboard-demo.mp4',
                status: 'approved',
                submittedDate: new Date('2024-10-08'),
                reviewedDate: new Date('2024-10-09'),
                feedback: 'Outstanding visualization and insights',
                score: 95
              },
              {
                name: 'Technical Documentation',
                type: 'document',
                url: '/projects/maria-tech-docs.pdf',
                status: 'approved',
                submittedDate: new Date('2024-10-08'),
                reviewedDate: new Date('2024-10-09'),
                score: 90
              }
            ],
            overallScore: 93,
            feedback: 'Exceptional work on the analytics dashboard. Demonstrates strong analytical and technical skills.',
            reviewedBy: 'Dr. Lisa Wang',
            reviewedDate: new Date('2024-10-09')
          }
        ]
      },
      performanceEvaluation: {
        completed: false,
        evaluations: [
          {
            evaluatorName: 'Dr. Lisa Wang',
            evaluatorRole: 'Mentor',
            evaluationDate: new Date('2024-10-12'),
            categories: [
              {
                category: 'Technical Skills',
                score: 9,
                maxScore: 10,
                feedback: 'Excellent programming and analytical abilities'
              },
              {
                category: 'Communication',
                score: 8,
                maxScore: 10,
                feedback: 'Clear and effective communication of complex concepts'
              },
              {
                category: 'Initiative',
                score: 9,
                maxScore: 10,
                feedback: 'Proactive in identifying and solving problems'
              },
              {
                category: 'Teamwork',
                score: 8,
                maxScore: 10,
                feedback: 'Collaborative and supportive team member'
              }
            ],
            overallScore: 85,
            strengths: [
              'Strong analytical thinking',
              'Quick learner',
              'Attention to detail',
              'Creative problem solving'
            ],
            areasForImprovement: [
              'Public speaking confidence',
              'Project management skills'
            ],
            recommendations: 'Maria would be an excellent candidate for a full-time data science role. Consider offering her a position upon graduation.',
            futureOpportunities: 'Full-time Data Scientist position, Graduate program sponsorship'
          }
        ],
        selfEvaluation: {
          completedDate: new Date('2024-10-11'),
          learnings: [
            'Advanced data visualization techniques',
            'Machine learning model deployment',
            'Working with large datasets',
            'Business stakeholder communication'
          ],
          achievements: [
            'Built production-ready analytics dashboard',
            'Improved data processing efficiency by 40%',
            'Presented findings to executive team',
            'Mentored new intern'
          ],
          challenges: [
            'Learning new technologies quickly',
            'Balancing multiple projects',
            'Understanding business context'
          ],
          feedback: 'This internship exceeded my expectations. The mentorship was excellent and I learned more than I could have imagined.',
          careerGoals: [
            'Become a senior data scientist',
            'Lead data science projects',
            'Pursue advanced degree in ML',
            'Work on AI ethics initiatives'
          ]
        }
      },
      exitInterview: {
        completed: false,
        interviewer: '',
        feedback: {
          overallExperience: 0,
          mentorshipQuality: 0,
          projectRelevance: 0,
          learningOpportunities: 0,
          workEnvironment: 0,
          recommendToOthers: false,
          suggestions: '',
          highlights: [],
          improvements: []
        },
        futureInterest: {
          fullTimePosition: false,
          futureInternship: false,
          referrals: false,
          stayInTouch: false
        }
      },
      documentationFinalization: {
        completed: false,
        documents: [],
        equipmentReturned: false,
        accessRevoked: false,
        finalPaymentProcessed: false
      },
      certificateGeneration: {
        completed: false,
        certificate: {
          type: 'excellence',
          templateUsed: '',
          signedBy: [],
          deliveryMethod: 'both'
        },
        recommendations: []
      },
      alumniNetwork: {
        completed: false,
        alumniProfile: {
          created: false,
          permissions: {
            contactInfo: false,
            careerUpdates: false,
            mentorship: false,
            events: false
          }
        },
        networking: {
          introductions: [],
          events: [],
          mentorshipOpportunities: []
        },
        futureEngagement: {
          ambassadorProgram: false,
          mentorshipProgram: false,
          recruitmentEvents: false,
          guestSpeaking: false
        }
      }
    },
    documents: [],
    notes: [],
    createdAt: new Date('2024-06-15'),
    updatedAt: new Date('2024-10-12')
  }
];

// GET completing interns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const university = searchParams.get('university');

    let filteredInterns = [...mockCompletingInterns];

    // Apply filters
    if (status && status !== 'all') {
      filteredInterns = filteredInterns.filter(intern => intern.completionStatus === status);
    }

    if (department) {
      filteredInterns = filteredInterns.filter(intern => 
        intern.internshipDetails.department.toLowerCase().includes(department.toLowerCase())
      );
    }

    if (university) {
      filteredInterns = filteredInterns.filter(intern => 
        intern.personalInfo.university.toLowerCase().includes(university.toLowerCase())
      );
    }

    // Sort by end date (most recent first)
    filteredInterns.sort((a, b) => 
      new Date(b.internshipDetails.endDate).getTime() - new Date(a.internshipDetails.endDate).getTime()
    );

    return NextResponse.json({
      success: true,
      data: filteredInterns
    });

  } catch (error) {
    console.error('Error fetching completing interns:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST create new completing intern
export async function POST(request: NextRequest) {
  try {
    const internData = await request.json();

    // Validate required fields
    const requiredFields = ['personalInfo', 'internshipDetails'];
    for (const field of requiredFields) {
      if (!internData[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `${field} is required`
          },
          { status: 400 }
        );
      }
    }

    // Create new completing intern
    const newIntern: CompletingIntern = {
      id: `completing-intern-${Date.now()}`,
      personalInfo: internData.personalInfo,
      internshipDetails: internData.internshipDetails,
      completionStatus: 'active',
      completionProgress: {
        projectReview: { completed: false, projects: [] },
        performanceEvaluation: { completed: false, evaluations: [] },
        exitInterview: {
          completed: false,
          interviewer: '',
          feedback: {
            overallExperience: 0,
            mentorshipQuality: 0,
            projectRelevance: 0,
            learningOpportunities: 0,
            workEnvironment: 0,
            recommendToOthers: false,
            suggestions: '',
            highlights: [],
            improvements: []
          },
          futureInterest: {
            fullTimePosition: false,
            futureInternship: false,
            referrals: false,
            stayInTouch: false
          }
        },
        documentationFinalization: {
          completed: false,
          documents: [],
          equipmentReturned: false,
          accessRevoked: false,
          finalPaymentProcessed: false
        },
        certificateGeneration: {
          completed: false,
          certificate: {
            type: 'completion',
            templateUsed: '',
            signedBy: [],
            deliveryMethod: 'email'
          },
          recommendations: []
        },
        alumniNetwork: {
          completed: false,
          alumniProfile: {
            created: false,
            permissions: {
              contactInfo: false,
              careerUpdates: false,
              mentorship: false,
              events: false
            }
          },
          networking: {
            introductions: [],
            events: [],
            mentorshipOpportunities: []
          },
          futureEngagement: {
            ambassadorProgram: false,
            mentorshipProgram: false,
            recruitmentEvents: false,
            guestSpeaking: false
          }
        }
      },
      documents: internData.documents || [],
      notes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockCompletingInterns.push(newIntern);

    return NextResponse.json({
      success: true,
      data: newIntern,
      message: 'Completing intern created successfully'
    });

  } catch (error) {
    console.error('Error creating completing intern:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
