"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { withAuth } from '@/contexts/auth-context';
import StudentProfileEdit from '@/components/profile/StudentProfileEdit';
import CompanyProfileEdit from '@/components/profile/CompanyProfileEdit';
import { User, Building2, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function EditProfile() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async (profileData: any) => {
    try {
      setSaving(true);
      setSaveError(null);
      
      await updateUser(profileData);
      
      // Redirect back to profile
      router.push(`/profile/${user?._id}`);
    } catch (error: any) {
      setSaveError(error.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/profile/${user._id}`}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-2">
                {user.role === 'company' ? (
                  <Building2 className="h-6 w-6 text-blue-600" />
                ) : (
                  <User className="h-6 w-6 text-blue-600" />
                )}
                <h1 className="text-2xl font-bold text-gray-900">
                  Edit {user.role === 'company' ? 'Company' : 'Profile'}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Error */}
      {saveError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{saveError}</p>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.role === 'student' ? (
          <StudentProfileEdit 
            user={user}
            onSave={handleSave}
            saving={saving}
          />
        ) : user.role === 'company' ? (
          <CompanyProfileEdit 
            user={user}
            onSave={handleSave}
            saving={saving}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Profile editing not available for this role</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(EditProfile);
