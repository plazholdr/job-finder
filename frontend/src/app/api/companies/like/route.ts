import { NextRequest, NextResponse } from 'next/server';

// Mock storage for liked companies (in a real app, this would be in a database)
let likedCompanies: { id: string; userId: string; companyId: string; createdAt: Date }[] = [];

export async function POST(request: NextRequest) {
  try {
    const { companyId } = await request.json();
    
    if (!companyId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company ID is required'
        },
        { status: 400 }
      );
    }

    // Mock user ID (in a real app, this would come from authentication)
    const userId = 'mock-user-id';

    // Check if already liked
    const existingLike = likedCompanies.find(
      like => like.userId === userId && like.companyId === companyId
    );

    if (existingLike) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company already liked'
        },
        { status: 400 }
      );
    }

    // Add to liked companies
    const newLike = {
      id: `like-${Date.now()}`,
      userId,
      companyId,
      createdAt: new Date()
    };

    likedCompanies.push(newLike);

    return NextResponse.json({
      success: true,
      data: newLike,
      message: 'Company liked successfully'
    });
  } catch (error) {
    console.error('Error liking company:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to like company'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { companyId } = await request.json();
    
    if (!companyId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company ID is required'
        },
        { status: 400 }
      );
    }

    // Mock user ID (in a real app, this would come from authentication)
    const userId = 'mock-user-id';

    // Find and remove the like
    const likeIndex = likedCompanies.findIndex(
      like => like.userId === userId && like.companyId === companyId
    );

    if (likeIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company not found in liked list'
        },
        { status: 404 }
      );
    }

    likedCompanies.splice(likeIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Company unliked successfully'
    });
  } catch (error) {
    console.error('Error unliking company:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to unlike company'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Mock user ID (in a real app, this would come from authentication)
    const userId = 'mock-user-id';

    // Get all liked companies for the user
    const userLikedCompanies = likedCompanies.filter(like => like.userId === userId);

    return NextResponse.json({
      success: true,
      data: userLikedCompanies,
      message: 'Liked companies fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching liked companies:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch liked companies'
      },
      { status: 500 }
    );
  }
}
