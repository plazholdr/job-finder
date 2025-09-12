import { NextRequest, NextResponse } from 'next/server';

// Mock storage for liked jobs (in a real app, this would be in a database)
let likedJobs: { id: string; userId: string; jobId: string; createdAt: Date }[] = [];

export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json();
    
    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job ID is required'
        },
        { status: 400 }
      );
    }

    // Mock user ID (in a real app, this would come from authentication)
    const userId = 'mock-user-id';

    // Check if already liked
    const existingLike = likedJobs.find(
      like => like.userId === userId && like.jobId === jobId
    );

    if (existingLike) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job already liked'
        },
        { status: 400 }
      );
    }

    // Add to liked jobs
    const newLike = {
      id: `like-${Date.now()}`,
      userId,
      jobId,
      createdAt: new Date()
    };

    likedJobs.push(newLike);

    return NextResponse.json({
      success: true,
      data: newLike,
      message: 'Job liked successfully'
    });
  } catch (error) {
    console.error('Error liking job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to like job'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { jobId } = await request.json();
    
    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job ID is required'
        },
        { status: 400 }
      );
    }

    // Mock user ID (in a real app, this would come from authentication)
    const userId = 'mock-user-id';

    // Find and remove the like
    const likeIndex = likedJobs.findIndex(
      like => like.userId === userId && like.jobId === jobId
    );

    if (likeIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job not found in liked list'
        },
        { status: 404 }
      );
    }

    likedJobs.splice(likeIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Job unliked successfully'
    });
  } catch (error) {
    console.error('Error unliking job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to unlike job'
      },
      { status: 500 }
    );
  }
}

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
