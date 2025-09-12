import { NextRequest, NextResponse } from 'next/server';

// Mock storage for liked jobs (should be the same as in like route)
let likedJobs: { id: string; userId: string; jobId: string; createdAt: Date }[] = [];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    
    // Mock user ID (in a real app, this would come from authentication)
    const userId = 'mock-user-id';

    // Check if the job is liked by the user
    const isLiked = likedJobs.some(
      like => like.userId === userId && like.jobId === jobId
    );

    return NextResponse.json({
      success: true,
      data: { isLiked },
      message: 'Job like status fetched successfully'
    });
  } catch (error) {
    console.error('Error checking job like status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check job like status'
      },
      { status: 500 }
    );
  }
}
