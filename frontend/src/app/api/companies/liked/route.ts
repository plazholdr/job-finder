import { NextRequest, NextResponse } from 'next/server';

// Mock storage for liked companies (in a real app, this would be in a database)
// This should be the same storage as in the like route
let likedCompanies: { id: string; userId: string; companyId: string; createdAt: Date }[] = [];

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
