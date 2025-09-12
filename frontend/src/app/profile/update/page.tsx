"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { withAuth } from '@/contexts/auth-context';
import {
  ArrowLeft,
  User,
  Shield,
  Save,
  Check,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function ProfileUpdate() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  // Flow state management following the flowchart
  const [currentStep, setCurrentStep] = useState<'view' | 'decision' | 'profile' | 'privacy' | 'complete'>('view');
  const [updateType, setUpdateType] = useState<'profile' | 'privacy' | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Profile data state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.profile?.bio || '',
    location: user?.profile?.location || '',
    phone: user?.profile?.phone || '',
    linkedin: user?.profile?.linkedin || '',
    github: user?.profile?.github || ''
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: user?.privacy?.profileVisibility || 'public',
    showEmail: user?.privacy?.showEmail ?? true,
    showPhone: user?.privacy?.showPhone ?? true,
    showLocation: user?.privacy?.showLocation ?? true,
  });

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      setSaveError(null);

      await updateUser({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        profile: {
          bio: profileData.bio,
          location: profileData.location,
          phone: profileData.phone,
          linkedin: profileData.linkedin,
          github: profileData.github
        }
      });

      setCurrentStep('complete');
    } catch (error: any) {
      setSaveError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePrivacy = async () => {
    try {
      setSaving(true);
      setSaveError(null);

      await updateUser({
        privacy: privacySettings
      });

      setCurrentStep('complete');
    } catch (error: any) {
      setSaveError(error.message || 'Failed to update privacy settings');
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/profile/${user._id}`}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Update Profile</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: View Existing Profile Information */}
        {currentStep === 'view' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Current Profile</h2>

            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">{user.firstName}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">{user.lastName}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">{user.email}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">{user.profile?.location || 'Not set'}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">{user.profile?.bio || 'Not set'}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Privacy Settings</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm">
                    <div>Profile Visibility: <span className="font-medium">{user.privacy?.profileVisibility || 'Public'}</span></div>
                    <div>Show Email: <span className="font-medium">{user.privacy?.showEmail !== false ? 'Yes' : 'No'}</span></div>
                    <div>Show Phone: <span className="font-medium">{user.privacy?.showPhone !== false ? 'Yes' : 'No'}</span></div>
                    <div>Show Location: <span className="font-medium">{user.privacy?.showLocation !== false ? 'Yes' : 'No'}</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setCurrentStep('decision')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Update Profile
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Decision - Update Profile or Privacy Setting? */}
        {currentStep === 'decision' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">What would you like to update?</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => {
                  setUpdateType('profile');
                  setCurrentStep('profile');
                }}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <User className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900">Update Profile Information</h3>
                </div>
                <p className="text-gray-600">Change your name, bio, location, and contact details</p>
              </button>

              <button
                onClick={() => {
                  setUpdateType('privacy');
                  setCurrentStep('privacy');
                }}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900">Update Privacy Settings</h3>
                </div>
                <p className="text-gray-600">Control who can see your profile and contact information</p>
              </button>
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={() => setCurrentStep('view')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back to Profile View
              </button>
            </div>
          </div>
        )}

        {/* Step 3a: Update Profile Information */}
        {currentStep === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Update Profile Information</h2>

            {saveError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-600">{saveError}</p>
              </div>
            )}

            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City, State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={profileData.linkedin}
                    onChange={(e) => setProfileData(prev => ({ ...prev, linkedin: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                  <input
                    type="url"
                    value={profileData.github}
                    onChange={(e) => setProfileData(prev => ({ ...prev, github: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep('decision')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back to Options
              </button>
              <button
                onClick={handleUpdateProfile}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3b: Update Privacy Settings */}
        {currentStep === 'privacy' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Update Privacy Settings</h2>

            {saveError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-600">{saveError}</p>
              </div>
            )}

            <div className="space-y-6 mb-8">
              {/* Profile Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Profile Visibility
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="profileVisibility"
                      value="public"
                      checked={privacySettings.profileVisibility === 'public'}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value as any }))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">1. (Default) Full access - can see everything</div>
                      <div className="text-sm text-gray-500">Anyone can view your complete profile information</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="profileVisibility"
                      value="restricted"
                      checked={privacySettings.profileVisibility === 'restricted'}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value as any }))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">2. Restricted - cannot see name, email, and contact number</div>
                      <div className="text-sm text-gray-500">Visitors can see your profile but not your personal contact details</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="profileVisibility"
                      value="private"
                      checked={privacySettings.profileVisibility === 'private'}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value as any }))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">3. Private - cannot be searched / display private profile when search through URL directly</div>
                      <div className="text-sm text-gray-500">Your profile is completely hidden from public view</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Contact Information Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Contact Information Visibility
                </label>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Show email address</div>
                      <div className="text-sm text-gray-500">Allow others to see your email</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.showEmail}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, showEmail: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Show phone number</div>
                      <div className="text-sm text-gray-500">Allow others to see your phone</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.showPhone}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, showPhone: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Show location</div>
                      <div className="text-sm text-gray-500">Allow others to see your location</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.showLocation}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, showLocation: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep('decision')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back to Options
              </button>
              <button
                onClick={handleUpdatePrivacy}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Privacy Settings'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Completion */}
        {currentStep === 'complete' && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {updateType === 'profile' ? 'Profile Updated Successfully!' : 'Privacy Settings Updated Successfully!'}
            </h2>

            <p className="text-gray-600 mb-6">
              {updateType === 'profile'
                ? 'Your new profile information has been saved and will be visible to others according to your privacy settings.'
                : 'Your new privacy settings have been applied and are now in effect.'
              }
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setCurrentStep('view');
                  setUpdateType(null);
                  setSaveError(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Make Another Update
              </button>
              <Link
                href={`/profile/${user._id}`}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(ProfileUpdate);
