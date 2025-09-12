import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Backend URL configuration
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

    // Get current user from auth token (if any)
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '') ||
                     request.cookies.get('authToken')?.value;

    let currentUser = null;
    if (authToken) {
      try {
        // Get current user info
        const currentUserResponse = await fetch(`${backendUrl}/users/me`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
        if (currentUserResponse.ok) {
          currentUser = await currentUserResponse.json();
        }
      } catch (error) {
        // Continue without current user info
      }
    }

    // Fetch the requested user profile
    const response = await fetch(`${backendUrl}/users/${userId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      throw new Error('Failed to fetch user profile');
    }

    const user = await response.json();
    
    // Apply privacy filtering
    const filteredUser = applyPrivacyFilter(user, currentUser);
    
    return NextResponse.json(filteredUser);
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

function applyPrivacyFilter(user: any, currentUser: any) {
  const isOwnProfile = currentUser && currentUser._id === user._id;
  const privacy = user.privacy || {};
  
  // If it's the user's own profile, return everything
  if (isOwnProfile) {
    return user;
  }
  
  // Apply privacy settings
  if (privacy.profileVisibility === 'private') {
    return {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profile: {
        avatar: user.profile?.avatar
      },
      privacy: { profileVisibility: 'private' }
    };
  }
  
  if (privacy.profileVisibility === 'restricted' && !currentUser) {
    return {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profile: {
        avatar: user.profile?.avatar
      },
      privacy: { profileVisibility: 'restricted' }
    };
  }
  
  // Filter contact information based on privacy settings
  const filteredUser = { ...user };
  
  if (!privacy.showEmail) {
    delete filteredUser.email;
  }
  
  if (!privacy.showPhone && filteredUser.profile) {
    delete filteredUser.profile.phone;
  }
  
  if (!privacy.showLocation && filteredUser.profile) {
    delete filteredUser.profile.location;
  }
  
  // For company profiles, also filter company contact info
  if (filteredUser.company) {
    if (!privacy.showPhone) {
      delete filteredUser.company.phone;
    }
    if (!privacy.showLocation) {
      delete filteredUser.company.location;
    }
  }
  
  return filteredUser;
}
