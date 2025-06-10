"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import StudentProfile from '@/components/profile/StudentProfile';
import CompanyProfile from '@/components/profile/CompanyProfile';
import { User, Building2, ArrowLeft, Settings, Edit } from 'lucide-react';
import Link from 'next/link';

interface ProfileUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'company' | 'admin';
  profile: {
    avatar?: string;
    bio?: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  student?: any;
  company?: any;
  privacy?: {
    profileVisibility: 'public' | 'restricted' | 'private';
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
  };
}

export default function ProfilePage() {
  const params = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = params.userId as string;
  const isOwnProfile = currentUser?._id === userId;

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const userData = await response.json();
      setProfileUser(userData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'This profile does not exist or is not accessible.'}</p>
          <Link
            href={currentUser ? (currentUser.role === 'student' ? '/pages/student-dashboard' : '/pages/company-dashboard') : '/'}
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={currentUser ? (currentUser.role === 'student' ? '/pages/student-dashboard' : '/pages/company-dashboard') : '/'}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-2">
                {profileUser.role === 'company' ? (
                  <Building2 className="h-6 w-6 text-blue-600" />
                ) : (
                  <User className="h-6 w-6 text-blue-600" />
                )}
                <h1 className="text-2xl font-bold text-gray-900">
                  {profileUser.role === 'company' 
                    ? profileUser.company?.name || `${profileUser.firstName} ${profileUser.lastName}`
                    : `${profileUser.firstName} ${profileUser.lastName}`
                  }
                </h1>
              </div>
            </div>
            
            {isOwnProfile && (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile/edit"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {profileUser.role === 'student' ? (
          <StudentProfile 
            user={profileUser} 
            isOwnProfile={isOwnProfile}
            currentUser={currentUser}
          />
        ) : profileUser.role === 'company' ? (
          <CompanyProfile 
            user={profileUser} 
            isOwnProfile={isOwnProfile}
            currentUser={currentUser}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Profile type not supported</p>
          </div>
        )}
      </div>
    </div>
  );
}
