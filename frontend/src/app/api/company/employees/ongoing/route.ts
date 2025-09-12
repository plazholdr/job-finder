import { NextRequest, NextResponse } from 'next/server';

interface OngoingEmployee {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    employeeId: string;
    department: string;
    position: string;
    manager: string;
    startDate: Date;
    location: string;
  };
  employmentDetails: {
    employmentType: 'full-time' | 'part-time' | 'contract' | 'temporary';
    workArrangement: 'on-site' | 'remote' | 'hybrid';
    salary: number;
    benefits: string[];
    reportingStructure: {
      directManager: string;
      skipLevelManager: string;
      teamMembers: string[];
      directReports: string[];
    };
  };
  performanceStatus: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement' | 'unsatisfactory' | 'under_review';
  ongoingManagement: {
    performanceTracking: {
      currentPeriod: string;
      lastReviewDate: Date;
      nextReviewDate: Date;
      overallRating: number;
      goals: Array<{
        id: string;
        title: string;
        description: string;
        category: 'performance' | 'development' | 'project' | 'skill';
        priority: 'high' | 'medium' | 'low';
        status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
        targetDate: Date;
        progress: number;
        metrics: string[];
        feedback: string;
      }>;
      keyMetrics: Array<{
        metric: string;
        value: number;
        target: number;
        trend: 'up' | 'down' | 'stable';
        period: string;
      }>;
    };
    careerDevelopment: {
      careerPath: string;
      currentLevel: string;
      nextLevel: string;
      skillGaps: string[];
      developmentPlan: Array<{
        skill: string;
        currentLevel: number;
        targetLevel: number;
        timeline: string;
        resources: string[];
        mentor?: string;
      }>;
      trainingCompleted: Array<{
        course: string;
        completedDate: Date;
        score?: number;
        certification?: string;
      }>;
      trainingScheduled: Array<{
        course: string;
        scheduledDate: Date;
        duration: string;
        provider: string;
        cost?: number;
      }>;
    };
  };
  documents: Array<{
    type: string;
    name: string;
    url: string;
    uploadedDate: Date;
    category: 'performance' | 'development' | 'project' | 'personal';
  }>;
  notes: Array<{
    id: string;
    author: string;
    content: string;
    timestamp: Date;
    type: 'performance' | 'development' | 'project' | 'general' | 'confidential';
    confidential: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Mock ongoing employees data
let mockOngoingEmployees: OngoingEmployee[] = [
  {
    id: 'ongoing-emp-1',
    personalInfo: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 123-4567',
      employeeId: 'EMP001',
      department: 'Engineering',
      position: 'Senior Software Engineer',
      manager: 'Mike Chen',
      startDate: new Date('2022-03-15'),
      location: 'San Francisco, CA'
    },
    employmentDetails: {
      employmentType: 'full-time',
      workArrangement: 'hybrid',
      salary: 150000,
      benefits: ['Health Insurance', '401k', 'Stock Options', 'Flexible PTO', 'Learning Budget'],
      reportingStructure: {
        directManager: 'Mike Chen',
        skipLevelManager: 'Jennifer Lee',
        teamMembers: ['Alex Wang', 'Maria Garcia', 'David Kim'],
        directReports: ['Junior Developer 1', 'Junior Developer 2']
      }
    },
    performanceStatus: 'excellent',
    ongoingManagement: {
      performanceTracking: {
        currentPeriod: 'Q4 2024',
        lastReviewDate: new Date('2024-07-15'),
        nextReviewDate: new Date('2025-01-15'),
        overallRating: 4.8,
        goals: [
          {
            id: 'goal-1',
            title: 'Lead Architecture Redesign',
            description: 'Lead the redesign of the core platform architecture',
            category: 'project',
            priority: 'high',
            status: 'in_progress',
            targetDate: new Date('2024-12-31'),
            progress: 75,
            metrics: ['Code Quality', 'Performance Improvement', 'Team Collaboration'],
            feedback: 'Excellent progress on architecture design'
          },
          {
            id: 'goal-2',
            title: 'Mentor Junior Developers',
            description: 'Provide mentorship to 2 junior developers',
            category: 'development',
            priority: 'medium',
            status: 'completed',
            targetDate: new Date('2024-10-31'),
            progress: 100,
            metrics: ['Mentee Progress', 'Knowledge Transfer'],
            feedback: 'Outstanding mentorship skills demonstrated'
          }
        ],
        keyMetrics: [
          {
            metric: 'Code Quality Score',
            value: 95,
            target: 90,
            trend: 'up',
            period: 'Q4 2024'
          },
          {
            metric: 'Sprint Velocity',
            value: 42,
            target: 40,
            trend: 'up',
            period: 'Q4 2024'
          },
          {
            metric: 'Bug Resolution Time',
            value: 2.1,
            target: 3.0,
            trend: 'down',
            period: 'Q4 2024'
          }
        ]
      },
      careerDevelopment: {
        careerPath: 'Technical Leadership Track',
        currentLevel: 'Senior Software Engineer',
        nextLevel: 'Staff Software Engineer',
        skillGaps: ['System Design at Scale', 'Team Leadership'],
        developmentPlan: [
          {
            skill: 'System Design',
            currentLevel: 7,
            targetLevel: 9,
            timeline: '6 months',
            resources: ['System Design Course', 'Architecture Books', 'Conference Talks'],
            mentor: 'Jennifer Lee'
          },
          {
            skill: 'Team Leadership',
            currentLevel: 6,
            targetLevel: 8,
            timeline: '12 months',
            resources: ['Leadership Training', 'Management Books', 'Executive Coaching'],
            mentor: 'Mike Chen'
          }
        ],
        trainingCompleted: [
          {
            course: 'Advanced React Patterns',
            completedDate: new Date('2024-08-15'),
            score: 95,
            certification: 'React Expert'
          },
          {
            course: 'AWS Solutions Architect',
            completedDate: new Date('2024-06-20'),
            score: 88,
            certification: 'AWS Certified Solutions Architect'
          }
        ],
        trainingScheduled: [
          {
            course: 'System Design Masterclass',
            scheduledDate: new Date('2024-11-15'),
            duration: '3 days',
            provider: 'Tech Academy',
            cost: 2500
          }
        ]
      }
    },
    documents: [
      {
        type: 'performance_review',
        name: 'Q3 2024 Performance Review.pdf',
        url: '/documents/sarah-q3-review.pdf',
        uploadedDate: new Date('2024-07-15'),
        category: 'performance'
      }
    ],
    notes: [
      {
        id: 'note-1',
        author: 'Mike Chen',
        content: 'Sarah has shown exceptional leadership in the architecture project',
        timestamp: new Date('2024-10-15'),
        type: 'performance',
        confidential: false
      }
    ],
    createdAt: new Date('2022-03-15'),
    updatedAt: new Date('2024-10-15')
  },
  {
    id: 'ongoing-emp-2',
    personalInfo: {
      name: 'Michael Rodriguez',
      email: 'michael.rodriguez@company.com',
      phone: '+1 (555) 987-6543',
      employeeId: 'EMP002',
      department: 'Product',
      position: 'Product Manager',
      manager: 'Lisa Wang',
      startDate: new Date('2021-08-01'),
      location: 'Seattle, WA'
    },
    employmentDetails: {
      employmentType: 'full-time',
      workArrangement: 'remote',
      salary: 140000,
      benefits: ['Health Insurance', '401k', 'Stock Options', 'Home Office Stipend', 'Learning Budget'],
      reportingStructure: {
        directManager: 'Lisa Wang',
        skipLevelManager: 'David Kim',
        teamMembers: ['Product Team A', 'Product Team B'],
        directReports: ['Associate Product Manager']
      }
    },
    performanceStatus: 'good',
    ongoingManagement: {
      performanceTracking: {
        currentPeriod: 'Q4 2024',
        lastReviewDate: new Date('2024-07-01'),
        nextReviewDate: new Date('2025-01-01'),
        overallRating: 4.2,
        goals: [
          {
            id: 'goal-3',
            title: 'Launch Mobile App Feature',
            description: 'Successfully launch the new mobile app feature',
            category: 'project',
            priority: 'high',
            status: 'in_progress',
            targetDate: new Date('2024-11-30'),
            progress: 60,
            metrics: ['User Adoption', 'Feature Usage', 'Customer Satisfaction'],
            feedback: 'Good progress on feature development'
          }
        ],
        keyMetrics: [
          {
            metric: 'Feature Adoption Rate',
            value: 78,
            target: 80,
            trend: 'up',
            period: 'Q4 2024'
          },
          {
            metric: 'Customer Satisfaction',
            value: 4.3,
            target: 4.5,
            trend: 'stable',
            period: 'Q4 2024'
          }
        ]
      },
      careerDevelopment: {
        careerPath: 'Product Management Track',
        currentLevel: 'Product Manager',
        nextLevel: 'Senior Product Manager',
        skillGaps: ['Data Analysis', 'Strategic Planning'],
        developmentPlan: [
          {
            skill: 'Data Analysis',
            currentLevel: 6,
            targetLevel: 8,
            timeline: '9 months',
            resources: ['SQL Course', 'Analytics Training', 'Data Science Bootcamp']
          }
        ],
        trainingCompleted: [
          {
            course: 'Product Strategy Fundamentals',
            completedDate: new Date('2024-05-10'),
            score: 87
          }
        ],
        trainingScheduled: [
          {
            course: 'Advanced Product Analytics',
            scheduledDate: new Date('2024-12-01'),
            duration: '2 days',
            provider: 'Product School',
            cost: 1800
          }
        ]
      }
    },
    documents: [],
    notes: [],
    createdAt: new Date('2021-08-01'),
    updatedAt: new Date('2024-10-10')
  }
];

// GET ongoing employees
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const manager = searchParams.get('manager');

    let filteredEmployees = [...mockOngoingEmployees];

    // Apply filters
    if (status && status !== 'all') {
      filteredEmployees = filteredEmployees.filter(employee => employee.performanceStatus === status);
    }

    if (department) {
      filteredEmployees = filteredEmployees.filter(employee => 
        employee.personalInfo.department.toLowerCase().includes(department.toLowerCase())
      );
    }

    if (manager) {
      filteredEmployees = filteredEmployees.filter(employee => 
        employee.personalInfo.manager.toLowerCase().includes(manager.toLowerCase())
      );
    }

    // Sort by performance rating (highest first)
    filteredEmployees.sort((a, b) => 
      b.ongoingManagement.performanceTracking.overallRating - a.ongoingManagement.performanceTracking.overallRating
    );

    return NextResponse.json({
      success: true,
      data: filteredEmployees
    });

  } catch (error) {
    console.error('Error fetching ongoing employees:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST create new ongoing employee
export async function POST(request: NextRequest) {
  try {
    const employeeData = await request.json();

    // Validate required fields
    const requiredFields = ['personalInfo', 'employmentDetails'];
    for (const field of requiredFields) {
      if (!employeeData[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `${field} is required`
          },
          { status: 400 }
        );
      }
    }

    // Create new ongoing employee
    const newEmployee: OngoingEmployee = {
      id: `ongoing-emp-${Date.now()}`,
      personalInfo: employeeData.personalInfo,
      employmentDetails: employeeData.employmentDetails,
      performanceStatus: 'satisfactory',
      ongoingManagement: {
        performanceTracking: {
          currentPeriod: 'Q4 2024',
          lastReviewDate: new Date(),
          nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          overallRating: 3.0,
          goals: [],
          keyMetrics: []
        },
        careerDevelopment: {
          careerPath: '',
          currentLevel: employeeData.personalInfo.position,
          nextLevel: '',
          skillGaps: [],
          developmentPlan: [],
          trainingCompleted: [],
          trainingScheduled: []
        }
      },
      documents: employeeData.documents || [],
      notes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockOngoingEmployees.push(newEmployee);

    return NextResponse.json({
      success: true,
      data: newEmployee,
      message: 'Ongoing employee created successfully'
    });

  } catch (error) {
    console.error('Error creating ongoing employee:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
