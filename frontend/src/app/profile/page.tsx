"use client";

import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { withAuth } from '@/contexts/auth-context';

function MyProfile() {
  const { user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (user) {
      // Redirect to user's own profile
      router.push(`/profile/${user._id}`);
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your profile...</p>
      </div>
    </div>
  );
}

export default withAuth(MyProfile);
