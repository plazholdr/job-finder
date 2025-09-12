"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { withAuth } from '@/contexts/auth-context';
import { 
  ArrowLeft, 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Eye,
  EyeOff,
  Save,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function Settings() {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: user?.privacy?.profileVisibility || 'public',
    showEmail: user?.privacy?.showEmail ?? true,
    showPhone: user?.privacy?.showPhone ?? true,
    showLocation: user?.privacy?.showLocation ?? true,
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    jobAlerts: user?.preferences?.jobAlerts ?? true,
    applicationUpdates: user?.preferences?.applicationUpdates ?? true,
    marketingEmails: user?.preferences?.marketingEmails ?? false,
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setSaveError('New password must be at least 8 characters');
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);

      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change password');
      }

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      setSaveError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePrivacyUpdate = async () => {
    try {
      setSaving(true);
      setSaveError(null);

      await updateUser({
        privacy: privacySettings
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      setSaveError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      setSaving(true);
      setSaveError(null);

      await updateUser({
        preferences: {
          ...user?.preferences,
          ...notificationSettings
        }
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      setSaveError(error.message);
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
          <div className="flex items-center gap-4">
            <Link
              href={`/profile/${user._id}`}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow p-4">
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('account')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                    activeTab === 'account' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-5 w-5" />
                  Account
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                    activeTab === 'password' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Lock className="h-5 w-5" />
                  Password
                </button>
                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                    activeTab === 'privacy' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="h-5 w-5" />
                  Privacy
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                    activeTab === 'notifications' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  Notifications
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Success/Error Messages */}
            {saveSuccess && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-600">Settings saved successfully!</p>
              </div>
            )}
            
            {saveError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{saveError}</p>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <Input value={user.firstName} disabled />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <Input value={user.lastName} disabled />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input value={user.email} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <Input value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} disabled />
                  </div>
                  <p className="text-sm text-gray-500">
                    To update your basic information, please{' '}
                    <Link href="/profile/edit" className="text-blue-600 hover:text-blue-700">
                      edit your profile
                    </Link>
                    .
                  </p>
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" disabled={saving} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {saving ? 'Changing Password...' : 'Change Password'}
                  </Button>
                </form>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Profile Visibility
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="profileVisibility"
                          value="public"
                          checked={privacySettings.profileVisibility === 'public'}
                          onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value as any }))}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">Public</div>
                          <div className="text-sm text-gray-500">Anyone can view your profile</div>
                        </div>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="profileVisibility"
                          value="restricted"
                          checked={privacySettings.profileVisibility === 'restricted'}
                          onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value as any }))}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">Restricted</div>
                          <div className="text-sm text-gray-500">Only registered users can view your profile</div>
                        </div>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="profileVisibility"
                          value="private"
                          checked={privacySettings.profileVisibility === 'private'}
                          onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value as any }))}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">Private</div>
                          <div className="text-sm text-gray-500">Only you can view your profile</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Contact Information Visibility
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span>Show email address</span>
                        <input
                          type="checkbox"
                          checked={privacySettings.showEmail}
                          onChange={(e) => setPrivacySettings(prev => ({ ...prev, showEmail: e.target.checked }))}
                          className="rounded"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span>Show phone number</span>
                        <input
                          type="checkbox"
                          checked={privacySettings.showPhone}
                          onChange={(e) => setPrivacySettings(prev => ({ ...prev, showPhone: e.target.checked }))}
                          className="rounded"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span>Show location</span>
                        <input
                          type="checkbox"
                          checked={privacySettings.showLocation}
                          onChange={(e) => setPrivacySettings(prev => ({ ...prev, showLocation: e.target.checked }))}
                          className="rounded"
                        />
                      </label>
                    </div>
                  </div>

                  <Button onClick={handlePrivacyUpdate} disabled={saving} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Privacy Settings'}
                  </Button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Email Notifications</div>
                        <div className="text-sm text-gray-500">Receive general email notifications</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                        className="rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Job Alerts</div>
                        <div className="text-sm text-gray-500">Get notified about new job opportunities</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.jobAlerts}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, jobAlerts: e.target.checked }))}
                        className="rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Application Updates</div>
                        <div className="text-sm text-gray-500">Updates on your job applications</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.applicationUpdates}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, applicationUpdates: e.target.checked }))}
                        className="rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Marketing Emails</div>
                        <div className="text-sm text-gray-500">Promotional content and updates</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.marketingEmails}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                        className="rounded"
                      />
                    </label>
                  </div>

                  <Button onClick={handleNotificationUpdate} disabled={saving} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Notification Settings'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(Settings);
