import { NextRequest, NextResponse } from 'next/server';

// Mock storage for liked companies (should be the same as in like route)
let likedCompanies: { id: string; userId: string; companyId: string; createdAt: Date }[] = [];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;
    
    // Mock user ID (in a real app, this would come from authentication)
    const userId = 'mock-user-id';

    // Check if the company is liked by the user
    const isLiked = likedCompanies.some(
      like => like.userId === userId && like.companyId === companyId
    );

    return NextResponse.json({
      success: true,
      data: { isLiked },
      message: 'Company like status fetched successfully'
    });
  } catch (error) {
    console.error('Error checking company like status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check company like status'
      },
      { status: 500 }
    );
  }
}
