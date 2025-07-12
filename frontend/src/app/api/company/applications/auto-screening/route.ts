import { NextRequest, NextResponse } from 'next/server';

interface ScreeningCriteria {
  id: string;
  name: string;
  type: 'education' | 'experience' | 'skills' | 'location' | 'gpa' | 'language' | 'custom';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in';
  value: any;
  weight: number; // 1-10 importance weight
  isRequired: boolean;
  description: string;
}

interface ScreeningRule {
  id: string;
  jobId: string;
  name: string;
  description: string;
  isActive: boolean;
  criteria: ScreeningCriteria[];
  passingScore: number; // Minimum score to pass screening
  autoReject: boolean; // Automatically reject if fails
  autoAdvance: boolean; // Automatically advance if passes
  createdAt: Date;
  updatedAt: Date;
}

interface ScreeningResult {
  id: string;
  applicationId: string;
  ruleId: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  criteriaResults: Array<{
    criteriaId: string;
    name: string;
    passed: boolean;
    score: number;
    maxScore: number;
    actualValue: any;
    expectedValue: any;
    notes?: string;
  }>;
  recommendation: 'auto_accept' | 'auto_reject' | 'manual_review';
  processedAt: Date;
  notes?: string;
}

// Mock screening rules
let mockScreeningRules: ScreeningRule[] = [
  {
    id: 'rule-1',
    jobId: 'job-1',
    name: 'Software Engineering Intern Screening',
    description: 'Automated screening for software engineering intern positions',
    isActive: true,
    criteria: [
      {
        id: 'criteria-1',
        name: 'Education Level',
        type: 'education',
        operator: 'in',
        value: ['bachelor', 'master', 'phd'],
        weight: 8,
        isRequired: true,
        description: 'Must have at least bachelor degree'
      },
      {
        id: 'criteria-2',
        name: 'Programming Skills',
        type: 'skills',
        operator: 'contains',
        value: ['JavaScript', 'Python', 'Java', 'React', 'Node.js'],
        weight: 9,
        isRequired: true,
        description: 'Must have programming experience'
      },
      {
        id: 'criteria-3',
        name: 'GPA Requirement',
        type: 'gpa',
        operator: 'greater_than',
        value: 3.0,
        weight: 6,
        isRequired: false,
        description: 'Preferred GPA above 3.0'
      },
      {
        id: 'criteria-4',
        name: 'Experience Level',
        type: 'experience',
        operator: 'greater_than',
        value: 0,
        weight: 5,
        isRequired: false,
        description: 'Any relevant experience is a plus'
      },
      {
        id: 'criteria-5',
        name: 'Location Preference',
        type: 'location',
        operator: 'in',
        value: ['San Francisco', 'Remote', 'Hybrid'],
        weight: 3,
        isRequired: false,
        description: 'Location compatibility'
      }
    ],
    passingScore: 70, // 70% to pass
    autoReject: false,
    autoAdvance: true,
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z')
  }
];

// Mock screening results
let mockScreeningResults: ScreeningResult[] = [];

// GET screening rules for a job
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const applicationId = searchParams.get('applicationId');

    if (applicationId) {
      // Get screening result for specific application
      const result = mockScreeningResults.find(r => r.applicationId === applicationId);
      
      if (!result) {
        return NextResponse.json(
          {
            success: false,
            error: 'Screening result not found'
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: result
      });
    }

    if (jobId) {
      // Get screening rules for specific job
      const rules = mockScreeningRules.filter(rule => rule.jobId === jobId);
      
      return NextResponse.json({
        success: true,
        data: rules
      });
    }

    // Get all screening rules
    return NextResponse.json({
      success: true,
      data: mockScreeningRules
    });

  } catch (error) {
    console.error('Error fetching screening data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST run screening for application
export async function POST(request: NextRequest) {
  try {
    const { applicationId, jobId, applicationData } = await request.json();

    // Validate required fields
    if (!applicationId || !jobId || !applicationData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application ID, job ID, and application data are required'
        },
        { status: 400 }
      );
    }

    // Find screening rule for the job
    const screeningRule = mockScreeningRules.find(rule => rule.jobId === jobId && rule.isActive);
    
    if (!screeningRule) {
      return NextResponse.json(
        {
          success: false,
          error: 'No active screening rule found for this job'
        },
        { status: 404 }
      );
    }

    // Run screening
    const screeningResult = await runScreening(applicationId, screeningRule, applicationData);
    
    // Store result
    mockScreeningResults.push(screeningResult);

    return NextResponse.json({
      success: true,
      data: screeningResult,
      message: 'Screening completed successfully'
    });

  } catch (error) {
    console.error('Error running screening:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Helper function to run screening
async function runScreening(
  applicationId: string, 
  rule: ScreeningRule, 
  applicationData: any
): Promise<ScreeningResult> {
  const criteriaResults = [];
  let totalScore = 0;
  let maxScore = 0;
  let requiredCriteriaPassed = true;

  for (const criteria of rule.criteria) {
    const result = evaluateCriteria(criteria, applicationData);
    criteriaResults.push(result);
    
    totalScore += result.score;
    maxScore += result.maxScore;
    
    if (criteria.isRequired && !result.passed) {
      requiredCriteriaPassed = false;
    }
  }

  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const passed = requiredCriteriaPassed && percentage >= rule.passingScore;

  let recommendation: 'auto_accept' | 'auto_reject' | 'manual_review';
  
  if (!requiredCriteriaPassed) {
    recommendation = rule.autoReject ? 'auto_reject' : 'manual_review';
  } else if (passed && percentage >= 90) {
    recommendation = rule.autoAdvance ? 'auto_accept' : 'manual_review';
  } else if (passed) {
    recommendation = 'manual_review';
  } else {
    recommendation = rule.autoReject ? 'auto_reject' : 'manual_review';
  }

  return {
    id: `screening-${Date.now()}`,
    applicationId,
    ruleId: rule.id,
    totalScore,
    maxScore,
    percentage,
    passed,
    criteriaResults,
    recommendation,
    processedAt: new Date(),
    notes: generateScreeningNotes(criteriaResults, passed, percentage)
  };
}

// Helper function to evaluate individual criteria
function evaluateCriteria(criteria: ScreeningCriteria, applicationData: any) {
  const maxScore = criteria.weight;
  let score = 0;
  let passed = false;
  let actualValue: any;
  let notes: string | undefined;

  // Extract actual value from application data
  switch (criteria.type) {
    case 'education':
      actualValue = applicationData.education?.level || 'none';
      break;
    case 'skills':
      actualValue = applicationData.skills || [];
      break;
    case 'gpa':
      actualValue = applicationData.education?.gpa || 0;
      break;
    case 'experience':
      actualValue = applicationData.experience?.years || 0;
      break;
    case 'location':
      actualValue = applicationData.location || '';
      break;
    default:
      actualValue = null;
  }

  // Evaluate based on operator
  switch (criteria.operator) {
    case 'equals':
      passed = actualValue === criteria.value;
      break;
    case 'not_equals':
      passed = actualValue !== criteria.value;
      break;
    case 'greater_than':
      passed = Number(actualValue) > Number(criteria.value);
      break;
    case 'less_than':
      passed = Number(actualValue) < Number(criteria.value);
      break;
    case 'contains':
      if (Array.isArray(actualValue) && Array.isArray(criteria.value)) {
        passed = criteria.value.some(val => 
          actualValue.some(actual => 
            actual.toLowerCase().includes(val.toLowerCase())
          )
        );
      } else if (typeof actualValue === 'string') {
        passed = criteria.value.some((val: string) => 
          actualValue.toLowerCase().includes(val.toLowerCase())
        );
      }
      break;
    case 'in':
      if (Array.isArray(criteria.value)) {
        passed = criteria.value.includes(actualValue);
      }
      break;
    case 'not_in':
      if (Array.isArray(criteria.value)) {
        passed = !criteria.value.includes(actualValue);
      }
      break;
  }

  // Calculate score
  if (passed) {
    score = maxScore;
  } else if (!criteria.isRequired) {
    // Partial credit for non-required criteria
    score = Math.round(maxScore * 0.3);
  }

  return {
    criteriaId: criteria.id,
    name: criteria.name,
    passed,
    score,
    maxScore,
    actualValue,
    expectedValue: criteria.value,
    notes
  };
}

// Helper function to generate screening notes
function generateScreeningNotes(
  criteriaResults: any[], 
  passed: boolean, 
  percentage: number
): string {
  const failedRequired = criteriaResults.filter(r => !r.passed && r.maxScore > 7);
  const passedCriteria = criteriaResults.filter(r => r.passed);
  
  let notes = `Screening completed with ${percentage}% score. `;
  
  if (passed) {
    notes += `Application meets screening requirements. `;
    notes += `Strong areas: ${passedCriteria.map(r => r.name).join(', ')}. `;
  } else {
    notes += `Application does not meet screening requirements. `;
    if (failedRequired.length > 0) {
      notes += `Failed required criteria: ${failedRequired.map(r => r.name).join(', ')}. `;
    }
  }
  
  return notes;
}
