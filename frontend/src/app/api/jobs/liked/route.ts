import { NextRequest, NextResponse } from 'next/server';

// Mock storage for liked jobs (should be the same as in like route)
let likedJobs: { id: string; userId: string; jobId: string; createdAt: Date }[] = [];

export async function GET(request: NextRequest) {
  try {
    // Mock user ID (in a real app, this would come from authentication)
    const userId = 'mock-user-id';

    // Get all liked jobs for the user
    const userLikedJobs = likedJobs.filter(like => like.userId === userId);

    return NextResponse.json({
      success: true,
      data: userLikedJobs,
      message: 'Liked jobs fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching liked jobs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch liked jobs'
      },
      { status: 500 }
    );
  }
}
