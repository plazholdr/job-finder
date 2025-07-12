import { NextRequest, NextResponse } from 'next/server';

interface AnalyticsData {
  overview: {
    totalApplications: number;
    totalApplicationsChange: number;
    activeJobs: number;
    activeJobsChange: number;
    averageTimeToHire: number;
    timeToHireChange: number;
    offerAcceptanceRate: number;
    acceptanceRateChange: number;
  };
  pipeline: {
    stages: Array<{
      name: string;
      count: number;
      percentage: number;
      averageTime: number;
      conversionRate: number;
    }>;
  };
  trends: {
    applications: Array<{
      date: string;
      count: number;
    }>;
    hires: Array<{
      date: string;
      count: number;
    }>;
  };
  performance: {
    topJobs: Array<{
      id: string;
      title: string;
      applications: number;
      hires: number;
      conversionRate: number;
    }>;
    timeMetrics: {
      averageTimeByStage: Record<string, number>;
      bottlenecks: Array<{
        stage: string;
        averageTime: number;
        impact: 'high' | 'medium' | 'low';
      }>;
    };
  };
  demographics: {
    byEducation: Record<string, number>;
    byExperience: Record<string, number>;
    byLocation: Record<string, number>;
  };
}

// Mock analytics data generator
function generateAnalyticsData(timeRange: string): AnalyticsData {
  const now = new Date();
  const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;

  // Generate trend data
  const applicationTrends = [];
  const hireTrends = [];
  
  for (let i = daysBack; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    applicationTrends.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 15) + 5 // 5-20 applications per day
    });
    
    hireTrends.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 3) + 1 // 1-4 hires per day
    });
  }

  const totalApplications = applicationTrends.reduce((sum, day) => sum + day.count, 0);
  const totalHires = hireTrends.reduce((sum, day) => sum + day.count, 0);

  return {
    overview: {
      totalApplications,
      totalApplicationsChange: Math.floor(Math.random() * 30) - 10, // -10% to +20%
      activeJobs: 12,
      activeJobsChange: Math.floor(Math.random() * 20) - 5, // -5% to +15%
      averageTimeToHire: 18.5,
      timeToHireChange: Math.floor(Math.random() * 20) - 10, // -10% to +10%
      offerAcceptanceRate: 78.5,
      acceptanceRateChange: Math.floor(Math.random() * 15) - 5 // -5% to +10%
    },
    pipeline: {
      stages: [
        {
          name: 'Applications Submitted',
          count: totalApplications,
          percentage: 100,
          averageTime: 0,
          conversionRate: 0
        },
        {
          name: 'Under Review',
          count: Math.floor(totalApplications * 0.75),
          percentage: 75,
          averageTime: 2.5,
          conversionRate: 75
        },
        {
          name: 'Interview Stage',
          count: Math.floor(totalApplications * 0.35),
          percentage: 35,
          averageTime: 5.2,
          conversionRate: 46.7
        },
        {
          name: 'Final Review',
          count: Math.floor(totalApplications * 0.18),
          percentage: 18,
          averageTime: 3.8,
          conversionRate: 51.4
        },
        {
          name: 'Offer Extended',
          count: Math.floor(totalApplications * 0.12),
          percentage: 12,
          averageTime: 7.2,
          conversionRate: 66.7
        },
        {
          name: 'Hired',
          count: totalHires,
          percentage: (totalHires / totalApplications) * 100,
          averageTime: 2.1,
          conversionRate: 78.5
        }
      ]
    },
    trends: {
      applications: applicationTrends,
      hires: hireTrends
    },
    performance: {
      topJobs: [
        {
          id: 'job-1',
          title: 'Software Engineer Intern',
          applications: Math.floor(totalApplications * 0.25),
          hires: Math.floor(totalHires * 0.3),
          conversionRate: 12.5
        },
        {
          id: 'job-2',
          title: 'Frontend Developer Intern',
          applications: Math.floor(totalApplications * 0.2),
          hires: Math.floor(totalHires * 0.25),
          conversionRate: 11.8
        },
        {
          id: 'job-3',
          title: 'Data Science Intern',
          applications: Math.floor(totalApplications * 0.18),
          hires: Math.floor(totalHires * 0.2),
          conversionRate: 10.2
        },
        {
          id: 'job-4',
          title: 'Product Manager Intern',
          applications: Math.floor(totalApplications * 0.15),
          hires: Math.floor(totalHires * 0.15),
          conversionRate: 9.8
        },
        {
          id: 'job-5',
          title: 'UX Designer Intern',
          applications: Math.floor(totalApplications * 0.12),
          hires: Math.floor(totalHires * 0.1),
          conversionRate: 8.5
        }
      ],
      timeMetrics: {
        averageTimeByStage: {
          'application_review': 2.5,
          'technical_screening': 4.2,
          'interview_process': 5.8,
          'final_decision': 3.1,
          'offer_negotiation': 7.2
        },
        bottlenecks: [
          {
            stage: 'offer_negotiation',
            averageTime: 7.2,
            impact: 'high'
          },
          {
            stage: 'interview_process',
            averageTime: 5.8,
            impact: 'medium'
          },
          {
            stage: 'technical_screening',
            averageTime: 4.2,
            impact: 'medium'
          },
          {
            stage: 'final_decision',
            averageTime: 3.1,
            impact: 'low'
          }
        ]
      }
    },
    demographics: {
      byEducation: {
        'Bachelor\'s Degree': Math.floor(totalApplications * 0.45),
        'Master\'s Degree': Math.floor(totalApplications * 0.25),
        'PhD': Math.floor(totalApplications * 0.08),
        'Associate Degree': Math.floor(totalApplications * 0.12),
        'High School': Math.floor(totalApplications * 0.05),
        'Other': Math.floor(totalApplications * 0.05)
      },
      byExperience: {
        'No Experience': Math.floor(totalApplications * 0.35),
        '< 1 Year': Math.floor(totalApplications * 0.25),
        '1-2 Years': Math.floor(totalApplications * 0.20),
        '2-3 Years': Math.floor(totalApplications * 0.12),
        '3+ Years': Math.floor(totalApplications * 0.08)
      },
      byLocation: {
        'San Francisco, CA': Math.floor(totalApplications * 0.18),
        'New York, NY': Math.floor(totalApplications * 0.15),
        'Seattle, WA': Math.floor(totalApplications * 0.12),
        'Austin, TX': Math.floor(totalApplications * 0.10),
        'Boston, MA': Math.floor(totalApplications * 0.08),
        'Los Angeles, CA': Math.floor(totalApplications * 0.07),
        'Chicago, IL': Math.floor(totalApplications * 0.06),
        'Denver, CO': Math.floor(totalApplications * 0.05),
        'Remote': Math.floor(totalApplications * 0.12),
        'Other': Math.floor(totalApplications * 0.07)
      }
    }
  };
}

// GET analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    // Validate time range
    const validTimeRanges = ['7d', '30d', '90d', '1y'];
    if (!validTimeRanges.includes(timeRange)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid time range. Must be one of: 7d, 30d, 90d, 1y'
        },
        { status: 400 }
      );
    }

    const analyticsData = generateAnalyticsData(timeRange);

    return NextResponse.json({
      success: true,
      data: analyticsData,
      metadata: {
        timeRange,
        generatedAt: new Date().toISOString(),
        dataPoints: analyticsData.trends.applications.length
      }
    });

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
