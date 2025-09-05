import { NextRequest, NextResponse } from 'next/server';

// Mock data for dashboard statistics
const mockStats = {
  totalJobs: 12,
  activeJobs: 8,
  totalApplications: 156,
  newApplications: 23,
  interviewsScheduled: 15,
  hiredCandidates: 7
};

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

    // Fetch jobs for the company
    const jobsResponse = await fetch(`${API_BASE_URL}/jobs`, {
      headers: {
        'Authorization': authHeader,
      },
    });

    // Fetch applications for the company
    const applicationsResponse = await fetch(`${API_BASE_URL}/applications`, {
      headers: {
        'Authorization': authHeader,
      },
    });

    let stats = {
      totalJobs: 0,
      activeJobs: 0,
      totalApplications: 0,
      newApplications: 0,
      interviewsScheduled: 0,
      hiredCandidates: 0
    };

    if (jobsResponse.ok) {
      const jobsData = await jobsResponse.json();
      const jobs = jobsData.data || jobsData;

      stats.totalJobs = jobs.length;
      stats.activeJobs = jobs.filter((job: any) => job.status === 'Active').length;
    }

    if (applicationsResponse.ok) {
      const applicationsData = await applicationsResponse.json();
      const applications = applicationsData.data || applicationsData;

      stats.totalApplications = applications.length;

      // Count new applications (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      stats.newApplications = applications.filter((app: any) =>
        new Date(app.createdAt) > sevenDaysAgo
      ).length;

      stats.interviewsScheduled = applications.filter((app: any) =>
        app.status === 'interview_scheduled'
      ).length;

      stats.hiredCandidates = applications.filter((app: any) =>
        app.status === 'accepted'
      ).length;
    }

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
