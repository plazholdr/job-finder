import { NextRequest, NextResponse } from 'next/server';

interface ScoringCriteria {
  id: string;
  name: string;
  category: 'technical' | 'education' | 'experience' | 'soft_skills' | 'cultural_fit' | 'other';
  weight: number; // 1-10
  maxScore: number;
  description: string;
  evaluationMethod: 'automatic' | 'manual' | 'hybrid';
  scoringRubric: Array<{
    score: number;
    description: string;
    indicators: string[];
  }>;
}

interface ApplicationScore {
  id: string;
  applicationId: string;
  jobId: string;
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  rank?: number;
  categoryScores: Array<{
    category: string;
    score: number;
    maxScore: number;
    percentage: number;
  }>;
  criteriaScores: Array<{
    criteriaId: string;
    name: string;
    score: number;
    maxScore: number;
    notes?: string;
    evaluatedBy?: string;
    evaluatedAt?: Date;
  }>;
  overallRating: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  scoredBy: string;
  scoredAt: Date;
  lastUpdated: Date;
}

interface ScoringTemplate {
  id: string;
  name: string;
  jobType: string;
  department: string;
  criteria: ScoringCriteria[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Mock scoring templates
let mockScoringTemplates: ScoringTemplate[] = [
  {
    id: 'template-1',
    name: 'Software Engineering Intern Scoring',
    jobType: 'internship',
    department: 'Engineering',
    criteria: [
      {
        id: 'criteria-1',
        name: 'Technical Skills',
        category: 'technical',
        weight: 10,
        maxScore: 100,
        description: 'Programming languages, frameworks, and technical knowledge',
        evaluationMethod: 'hybrid',
        scoringRubric: [
          {
            score: 90,
            description: 'Exceptional technical skills',
            indicators: ['Multiple programming languages', 'Advanced frameworks', 'Open source contributions']
          },
          {
            score: 70,
            description: 'Strong technical foundation',
            indicators: ['Solid programming skills', 'Framework experience', 'Personal projects']
          },
          {
            score: 50,
            description: 'Basic technical knowledge',
            indicators: ['Basic programming', 'Academic projects', 'Learning mindset']
          },
          {
            score: 30,
            description: 'Limited technical experience',
            indicators: ['Minimal programming', 'Course work only']
          }
        ]
      },
      {
        id: 'criteria-2',
        name: 'Educational Background',
        category: 'education',
        weight: 8,
        maxScore: 100,
        description: 'Academic performance and relevant coursework',
        evaluationMethod: 'automatic',
        scoringRubric: [
          {
            score: 95,
            description: 'Outstanding academic record',
            indicators: ['GPA > 3.8', 'Relevant major', 'Academic honors']
          },
          {
            score: 80,
            description: 'Strong academic performance',
            indicators: ['GPA > 3.5', 'Relevant coursework', 'Good standing']
          },
          {
            score: 65,
            description: 'Satisfactory academic record',
            indicators: ['GPA > 3.0', 'Some relevant courses']
          },
          {
            score: 40,
            description: 'Below average academic performance',
            indicators: ['GPA < 3.0', 'Limited relevant coursework']
          }
        ]
      },
      {
        id: 'criteria-3',
        name: 'Relevant Experience',
        category: 'experience',
        weight: 9,
        maxScore: 100,
        description: 'Internships, projects, and work experience',
        evaluationMethod: 'manual',
        scoringRubric: [
          {
            score: 90,
            description: 'Extensive relevant experience',
            indicators: ['Multiple internships', 'Industry experience', 'Leadership roles']
          },
          {
            score: 70,
            description: 'Good relevant experience',
            indicators: ['Previous internship', 'Relevant projects', 'Part-time work']
          },
          {
            score: 50,
            description: 'Some relevant experience',
            indicators: ['Academic projects', 'Volunteer work', 'Side projects']
          },
          {
            score: 30,
            description: 'Limited experience',
            indicators: ['Course projects only', 'No work experience']
          }
        ]
      },
      {
        id: 'criteria-4',
        name: 'Communication Skills',
        category: 'soft_skills',
        weight: 7,
        maxScore: 100,
        description: 'Written and verbal communication abilities',
        evaluationMethod: 'manual',
        scoringRubric: [
          {
            score: 90,
            description: 'Excellent communication',
            indicators: ['Clear writing', 'Confident speaking', 'Active listening']
          },
          {
            score: 70,
            description: 'Good communication',
            indicators: ['Decent writing', 'Comfortable speaking', 'Responsive']
          },
          {
            score: 50,
            description: 'Average communication',
            indicators: ['Basic writing', 'Some speaking ability']
          },
          {
            score: 30,
            description: 'Poor communication',
            indicators: ['Unclear writing', 'Difficulty expressing ideas']
          }
        ]
      },
      {
        id: 'criteria-5',
        name: 'Cultural Fit',
        category: 'cultural_fit',
        weight: 6,
        maxScore: 100,
        description: 'Alignment with company values and culture',
        evaluationMethod: 'manual',
        scoringRubric: [
          {
            score: 90,
            description: 'Excellent cultural fit',
            indicators: ['Strong value alignment', 'Team player', 'Growth mindset']
          },
          {
            score: 70,
            description: 'Good cultural fit',
            indicators: ['Some value alignment', 'Collaborative', 'Adaptable']
          },
          {
            score: 50,
            description: 'Moderate cultural fit',
            indicators: ['Basic alignment', 'Willing to learn']
          },
          {
            score: 30,
            description: 'Poor cultural fit',
            indicators: ['Value misalignment', 'Rigid mindset']
          }
        ]
      }
    ],
    isDefault: true,
    isActive: true,
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z')
  }
];

// Mock application scores
let mockApplicationScores: ApplicationScore[] = [
  {
    id: 'score-1',
    applicationId: 'app-1',
    jobId: 'job-1',
    totalScore: 385,
    maxPossibleScore: 500,
    percentage: 77,
    rank: 1,
    categoryScores: [
      { category: 'technical', score: 85, maxScore: 100, percentage: 85 },
      { category: 'education', score: 80, maxScore: 100, percentage: 80 },
      { category: 'experience', score: 70, maxScore: 100, percentage: 70 },
      { category: 'soft_skills', score: 75, maxScore: 100, percentage: 75 },
      { category: 'cultural_fit', score: 75, maxScore: 100, percentage: 75 }
    ],
    criteriaScores: [
      {
        criteriaId: 'criteria-1',
        name: 'Technical Skills',
        score: 85,
        maxScore: 100,
        notes: 'Strong programming skills in JavaScript and Python. Good understanding of React.',
        evaluatedBy: 'tech-lead-1',
        evaluatedAt: new Date('2024-01-21T10:00:00Z')
      },
      {
        criteriaId: 'criteria-2',
        name: 'Educational Background',
        score: 80,
        maxScore: 100,
        notes: 'Computer Science major with 3.7 GPA. Relevant coursework completed.',
        evaluatedBy: 'system',
        evaluatedAt: new Date('2024-01-20T15:00:00Z')
      }
    ],
    overallRating: 'good',
    strengths: ['Strong technical foundation', 'Good academic performance', 'Relevant project experience'],
    weaknesses: ['Limited industry experience', 'Could improve communication skills'],
    recommendations: ['Consider for technical interview', 'Assess communication during interview'],
    scoredBy: 'hiring-manager-1',
    scoredAt: new Date('2024-01-21T14:00:00Z'),
    lastUpdated: new Date('2024-01-21T14:00:00Z')
  }
];

// GET scoring data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    const jobId = searchParams.get('jobId');
    const type = searchParams.get('type') || 'scores';

    if (type === 'templates') {
      // Get scoring templates
      let templates = [...mockScoringTemplates];
      
      if (jobId) {
        // Filter templates by job type or department if needed
        // For now, return all templates
      }
      
      return NextResponse.json({
        success: true,
        data: templates
      });
    }

    if (applicationId) {
      // Get score for specific application
      const score = mockApplicationScores.find(s => s.applicationId === applicationId);
      
      if (!score) {
        return NextResponse.json(
          {
            success: false,
            error: 'Application score not found'
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: score
      });
    }

    if (jobId) {
      // Get all scores for a job with ranking
      const jobScores = mockApplicationScores
        .filter(s => s.jobId === jobId)
        .sort((a, b) => b.percentage - a.percentage)
        .map((score, index) => ({
          ...score,
          rank: index + 1
        }));
      
      return NextResponse.json({
        success: true,
        data: jobScores,
        metadata: {
          total: jobScores.length,
          averageScore: jobScores.reduce((sum, s) => sum + s.percentage, 0) / jobScores.length
        }
      });
    }

    // Get all scores
    return NextResponse.json({
      success: true,
      data: mockApplicationScores
    });

  } catch (error) {
    console.error('Error fetching scoring data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST create or update application score
export async function POST(request: NextRequest) {
  try {
    const scoreData = await request.json();

    // Validate required fields
    const requiredFields = ['applicationId', 'jobId', 'criteriaScores'];
    for (const field of requiredFields) {
      if (!scoreData[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `${field} is required`
          },
          { status: 400 }
        );
      }
    }

    // Find existing score or create new one
    const existingIndex = mockApplicationScores.findIndex(s => s.applicationId === scoreData.applicationId);
    
    // Calculate scores
    const calculatedScore = calculateApplicationScore(scoreData);
    
    if (existingIndex >= 0) {
      // Update existing score
      mockApplicationScores[existingIndex] = {
        ...mockApplicationScores[existingIndex],
        ...calculatedScore,
        lastUpdated: new Date()
      };
      
      return NextResponse.json({
        success: true,
        data: mockApplicationScores[existingIndex],
        message: 'Application score updated successfully'
      });
    } else {
      // Create new score
      const newScore: ApplicationScore = {
        id: `score-${Date.now()}`,
        ...calculatedScore,
        scoredBy: scoreData.scoredBy || 'current-user',
        scoredAt: new Date(),
        lastUpdated: new Date()
      };
      
      mockApplicationScores.push(newScore);
      
      return NextResponse.json({
        success: true,
        data: newScore,
        message: 'Application score created successfully'
      });
    }

  } catch (error) {
    console.error('Error creating/updating score:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate application score
function calculateApplicationScore(scoreData: any): Partial<ApplicationScore> {
  const { applicationId, jobId, criteriaScores } = scoreData;
  
  // Get scoring template for the job
  const template = mockScoringTemplates.find(t => t.isActive && t.isDefault);
  
  if (!template) {
    throw new Error('No scoring template found');
  }

  let totalScore = 0;
  let maxPossibleScore = 0;
  const categoryScores: Record<string, { score: number; maxScore: number }> = {};
  
  // Calculate scores for each criteria
  const processedCriteriaScores = criteriaScores.map((cs: any) => {
    const criteria = template.criteria.find(c => c.id === cs.criteriaId);
    if (!criteria) return cs;
    
    const weightedScore = (cs.score / cs.maxScore) * criteria.maxScore * (criteria.weight / 10);
    const weightedMaxScore = criteria.maxScore * (criteria.weight / 10);
    
    totalScore += weightedScore;
    maxPossibleScore += weightedMaxScore;
    
    // Accumulate category scores
    if (!categoryScores[criteria.category]) {
      categoryScores[criteria.category] = { score: 0, maxScore: 0 };
    }
    categoryScores[criteria.category].score += weightedScore;
    categoryScores[criteria.category].maxScore += weightedMaxScore;
    
    return {
      ...cs,
      weightedScore,
      weightedMaxScore
    };
  });

  const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
  
  // Determine overall rating
  let overallRating: ApplicationScore['overallRating'];
  if (percentage >= 90) overallRating = 'excellent';
  else if (percentage >= 80) overallRating = 'good';
  else if (percentage >= 70) overallRating = 'average';
  else if (percentage >= 60) overallRating = 'below_average';
  else overallRating = 'poor';

  // Generate category scores array
  const categoryScoresArray = Object.entries(categoryScores).map(([category, scores]) => ({
    category,
    score: Math.round(scores.score),
    maxScore: Math.round(scores.maxScore),
    percentage: Math.round((scores.score / scores.maxScore) * 100)
  }));

  // Generate strengths and weaknesses
  const strengths = categoryScoresArray
    .filter(cs => cs.percentage >= 80)
    .map(cs => `Strong ${cs.category.replace('_', ' ')}`);
  
  const weaknesses = categoryScoresArray
    .filter(cs => cs.percentage < 60)
    .map(cs => `Needs improvement in ${cs.category.replace('_', ' ')}`);

  // Generate recommendations
  const recommendations = [];
  if (percentage >= 80) {
    recommendations.push('Strong candidate - recommend for interview');
  } else if (percentage >= 70) {
    recommendations.push('Good candidate - consider for interview');
  } else if (percentage >= 60) {
    recommendations.push('Average candidate - review carefully');
  } else {
    recommendations.push('Below threshold - consider rejection');
  }

  return {
    applicationId,
    jobId,
    totalScore: Math.round(totalScore),
    maxPossibleScore: Math.round(maxPossibleScore),
    percentage,
    categoryScores: categoryScoresArray,
    criteriaScores: processedCriteriaScores,
    overallRating,
    strengths,
    weaknesses,
    recommendations
  };
}
