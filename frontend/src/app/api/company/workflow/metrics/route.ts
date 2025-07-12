import { NextRequest, NextResponse } from 'next/server';

interface WorkflowMetrics {
  totalApplications: number;
  pendingScreening: number;
  pendingReview: number;
  onHold: number;
  rejected: number;
  averageProcessingTime: number;
  screeningPassRate: number;
  interviewConversionRate: number;
  offerAcceptanceRate: number;
  timeToHire: number;
  applicationsByStage: Record<string, number>;
  applicationsByStatus: Record<string, number>;
  applicationsByPriority: Record<string, number>;
  trendsData: {
    period: string;
    applications: number;
    screeningPassed: number;
    interviews: number;
    offers: number;
    hires: number;
  }[];
  topRejectionReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  topHoldReasons: Array<{
    reason: string;
    count: number;
    averageDuration: number;
  }>;
  automationMetrics: {
    autoScreeningUsage: number;
    autoScoringUsage: number;
    notificationsSent: number;
    workflowEfficiency: number;
  };
}

// Mock data for demonstration
const mockApplicationsData = [
  { id: 'app-1', status: 'submitted', stage: 'screening', submittedAt: new Date('2024-01-15'), processedAt: new Date('2024-01-18'), screeningPassed: true, interviewScheduled: true, offerExtended: false },
  { id: 'app-2', status: 'reviewing', stage: 'review', submittedAt: new Date('2024-01-16'), processedAt: new Date('2024-01-19'), screeningPassed: true, interviewScheduled: false, offerExtended: false },
  { id: 'app-3', status: 'rejected', stage: 'screening', submittedAt: new Date('2024-01-17'), processedAt: new Date('2024-01-18'), screeningPassed: false, interviewScheduled: false, offerExtended: false },
  { id: 'app-4', status: 'interview_scheduled', stage: 'interview', submittedAt: new Date('2024-01-18'), processedAt: new Date('2024-01-22'), screeningPassed: true, interviewScheduled: true, offerExtended: false },
  { id: 'app-5', status: 'offer_extended', stage: 'final_decision', submittedAt: new Date('2024-01-19'), processedAt: new Date('2024-01-25'), screeningPassed: true, interviewScheduled: true, offerExtended: true },
  { id: 'app-6', status: 'on_hold', stage: 'review', submittedAt: new Date('2024-01-20'), processedAt: null, screeningPassed: true, interviewScheduled: false, offerExtended: false },
  { id: 'app-7', status: 'rejected', stage: 'interview', submittedAt: new Date('2024-01-21'), processedAt: new Date('2024-01-24'), screeningPassed: true, interviewScheduled: true, offerExtended: false },
  { id: 'app-8', status: 'offer_accepted', stage: 'final_decision', submittedAt: new Date('2024-01-22'), processedAt: new Date('2024-01-28'), screeningPassed: true, interviewScheduled: true, offerExtended: true },
];

const mockRejectionReasons = [
  { reason: 'Technical Skills Gap', count: 15, percentage: 35 },
  { reason: 'Insufficient Experience', count: 12, percentage: 28 },
  { reason: 'Educational Requirements Not Met', count: 8, percentage: 19 },
  { reason: 'Cultural Fit Concerns', count: 5, percentage: 12 },
  { reason: 'Position Already Filled', count: 3, percentage: 7 }
];

const mockHoldReasons = [
  { reason: 'Budget Approval Pending', count: 8, averageDuration: 14 },
  { reason: 'Reference Check in Progress', count: 6, averageDuration: 7 },
  { reason: 'Team Capacity Constraints', count: 4, averageDuration: 21 },
  { reason: 'Candidate Availability Issues', count: 3, averageDuration: 30 }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const jobId = searchParams.get('jobId');
    const department = searchParams.get('department');

    // Calculate metrics
    const metrics = calculateWorkflowMetrics(mockApplicationsData, parseInt(period));

    return NextResponse.json({
      success: true,
      data: metrics,
      metadata: {
        period: `${period} days`,
        calculatedAt: new Date(),
        jobId,
        department
      }
    });

  } catch (error) {
    console.error('Error calculating workflow metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

function calculateWorkflowMetrics(applications: any[], periodDays: number): WorkflowMetrics {
  const now = new Date();
  const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
  
  // Filter applications within the period
  const periodApplications = applications.filter(app => 
    new Date(app.submittedAt) >= periodStart
  );

  const totalApplications = periodApplications.length;
  
  // Count by status
  const statusCounts = periodApplications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count by stage
  const stageCounts = periodApplications.reduce((acc, app) => {
    acc[app.stage] = (acc[app.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate processing times
  const processedApplications = periodApplications.filter(app => app.processedAt);
  const averageProcessingTime = processedApplications.length > 0
    ? processedApplications.reduce((sum, app) => {
        const processingTime = (new Date(app.processedAt).getTime() - new Date(app.submittedAt).getTime()) / (1000 * 60 * 60 * 24);
        return sum + processingTime;
      }, 0) / processedApplications.length
    : 0;

  // Calculate conversion rates
  const screeningPassed = periodApplications.filter(app => app.screeningPassed).length;
  const screeningPassRate = totalApplications > 0 ? (screeningPassed / totalApplications) * 100 : 0;

  const interviewsScheduled = periodApplications.filter(app => app.interviewScheduled).length;
  const interviewConversionRate = screeningPassed > 0 ? (interviewsScheduled / screeningPassed) * 100 : 0;

  const offersExtended = periodApplications.filter(app => app.offerExtended).length;
  const offerAcceptanceRate = offersExtended > 0 
    ? (periodApplications.filter(app => app.status === 'offer_accepted').length / offersExtended) * 100 
    : 0;

  // Calculate time to hire
  const hiredApplications = periodApplications.filter(app => app.status === 'offer_accepted');
  const timeToHire = hiredApplications.length > 0
    ? hiredApplications.reduce((sum, app) => {
        const hireTime = (new Date(app.processedAt).getTime() - new Date(app.submittedAt).getTime()) / (1000 * 60 * 60 * 24);
        return sum + hireTime;
      }, 0) / hiredApplications.length
    : 0;

  // Generate trends data (weekly breakdown)
  const trendsData = generateTrendsData(periodApplications, periodDays);

  // Priority distribution (mock data)
  const priorityCounts = {
    urgent: Math.floor(totalApplications * 0.1),
    high: Math.floor(totalApplications * 0.3),
    medium: Math.floor(totalApplications * 0.5),
    low: Math.floor(totalApplications * 0.1)
  };

  // Automation metrics (mock data)
  const automationMetrics = {
    autoScreeningUsage: 85, // percentage
    autoScoringUsage: 70,
    notificationsSent: totalApplications * 3, // average 3 notifications per application
    workflowEfficiency: 78 // percentage
  };

  return {
    totalApplications,
    pendingScreening: statusCounts['submitted'] || 0,
    pendingReview: statusCounts['reviewing'] || 0,
    onHold: statusCounts['on_hold'] || 0,
    rejected: statusCounts['rejected'] || 0,
    averageProcessingTime: Math.round(averageProcessingTime * 10) / 10,
    screeningPassRate: Math.round(screeningPassRate * 10) / 10,
    interviewConversionRate: Math.round(interviewConversionRate * 10) / 10,
    offerAcceptanceRate: Math.round(offerAcceptanceRate * 10) / 10,
    timeToHire: Math.round(timeToHire * 10) / 10,
    applicationsByStage: stageCounts,
    applicationsByStatus: statusCounts,
    applicationsByPriority: priorityCounts,
    trendsData,
    topRejectionReasons: mockRejectionReasons,
    topHoldReasons: mockHoldReasons,
    automationMetrics
  };
}

function generateTrendsData(applications: any[], periodDays: number) {
  const trends = [];
  const now = new Date();
  const weeksToShow = Math.min(Math.ceil(periodDays / 7), 8); // Max 8 weeks

  for (let i = weeksToShow - 1; i >= 0; i--) {
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weekApplications = applications.filter(app => {
      const submittedDate = new Date(app.submittedAt);
      return submittedDate >= weekStart && submittedDate < weekEnd;
    });

    trends.push({
      period: `Week ${weeksToShow - i}`,
      applications: weekApplications.length,
      screeningPassed: weekApplications.filter(app => app.screeningPassed).length,
      interviews: weekApplications.filter(app => app.interviewScheduled).length,
      offers: weekApplications.filter(app => app.offerExtended).length,
      hires: weekApplications.filter(app => app.status === 'offer_accepted').length
    });
  }

  return trends;
}

// POST endpoint for updating metrics configuration
export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();

    if (action === 'refresh') {
      // Trigger metrics recalculation
      const metrics = calculateWorkflowMetrics(mockApplicationsData, data.period || 30);
      
      return NextResponse.json({
        success: true,
        data: metrics,
        message: 'Metrics refreshed successfully'
      });
    }

    if (action === 'export') {
      // Generate export data
      const metrics = calculateWorkflowMetrics(mockApplicationsData, data.period || 30);
      
      return NextResponse.json({
        success: true,
        data: {
          exportUrl: '/api/company/workflow/metrics/export',
          format: data.format || 'csv',
          metrics
        },
        message: 'Export prepared successfully'
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action'
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error processing metrics request:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
