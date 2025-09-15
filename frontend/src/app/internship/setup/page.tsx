"use client";

import React, { Suspense, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { withAuth } from '@/contexts/auth-context';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  User,
  GraduationCap,
  Award,
  Heart,
  Briefcase,
  BookOpen,
  FileText,
  Save,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import type {
  InternshipProfile,
  InternshipDetails,
  CourseInformation,
  AssignmentInformation,
  EducationBackground,
  Certification,
  WorkExperience
} from '@/types/internship';

function InternshipSetup() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get step and update mode from URL params
  const stepParam = searchParams.get('step') || 'profile';
  const isUpdateMode = searchParams.get('update') === 'true';

  // Flow state management following the flowchart
  const [currentStep, setCurrentStep] = useState<'profile' | 'details' | 'courses' | 'assignments' | 'complete'>(stepParam as any);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form data state
  const [profileData, setProfileData] = useState<Partial<InternshipProfile>>({
    profileInformation: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.profile?.phone || '',
      location: user?.profile?.location || '',
      bio: user?.profile?.bio || '',
      website: user?.profile?.website || '',
      linkedin: user?.profile?.linkedin || '',
      github: user?.profile?.github || ''
    },
    educationBackground: [],
    certifications: [],
    interests: [],
    workExperience: []
  });

  const [internshipDetails, setInternshipDetails] = useState<Partial<InternshipDetails>>({
    duration: { startDate: '', endDate: '', isFlexible: true },
    preferredIndustry: [],
    preferredLocations: [],
    salaryRange: { min: 0, max: 0, currency: 'MYR', period: 'month', isNegotiable: true },
    skills: [],
    languages: [],
    availability: { hoursPerWeek: 40, flexibleSchedule: true, availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
    workPreferences: { remote: false, hybrid: true, onSite: true, travelWillingness: 'Local' },
    courses: [],
    assignments: []
  });

  const [courses, setCourses] = useState<CourseInformation[]>([]);
  const [assignments, setAssignments] = useState<AssignmentInformation[]>([]);
  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null);

  // Load existing data if in update mode
  useEffect(() => {
    if (isUpdateMode && user?.internship) {
      setProfileData(user.internship.profile || profileData);
      // Load from the correct nested path: internship.profile.details
      const existingDetails = user.internship.profile?.details || internshipDetails;
      setInternshipDetails(existingDetails);
      setCourses(existingDetails.courses || []);
      setAssignments(existingDetails.assignments || []);
    }
  }, [user, isUpdateMode]);

  // Check authentication status on component mount
  useEffect(() => {
    if (!user) {
      console.warn('No user found in internship setup');
    } else {
      console.log('User authenticated:', user.email, 'ID:', user._id);
      console.log('Full user object:', user);

      // Check localStorage data
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('authUser');
        const storedToken = localStorage.getItem('authToken');
        console.log('Stored user:', storedUser);
        console.log('Stored token:', storedToken);
      }
    }
  }, [user]);

  const handleSaveAndContinue = async (nextStep: string) => {
    try {
      setSaving(true);
      setSaveError(null);

      // Check if user is still authenticated
      if (!user) {
        setSaveError('You are not logged in. Please log in again.');
        return;
      }

      // Prepare data to save - match your exact data structure
      const internshipData = {
        profile: {
          ...profileData,
          details: {
            ...internshipDetails,
            courses,
            assignments
          }
        },
        applications: user?.internship?.applications || [],
        isSetupComplete: true
      };

      console.log('Saving internship data for user:', user._id);
      console.log('Data structure:', JSON.stringify(internshipData, null, 2));

      // Upload resume if selected (only on complete setup)
      if (nextStep === 'complete' && selectedResumeFile) {
        console.log('Uploading resume file:', selectedResumeFile.name);
        const formData = new FormData();
        formData.append('file', selectedResumeFile);

        const resumeResponse = await fetch('/api/users/resume/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: formData,
        });

        if (!resumeResponse.ok) {
          throw new Error('Failed to upload resume');
        }
        console.log('Resume uploaded successfully');
      }

      await updateUser({
        internship: internshipData
      });

      // Navigate to next step or complete
      if (nextStep === 'complete') {
        router.push('/internship?completed=true');
      } else {
        setCurrentStep(nextStep as any);
        // Update URL without page reload
        const newUrl = `/internship/setup?step=${nextStep}${isUpdateMode ? '&update=true' : ''}`;
        window.history.pushState({}, '', newUrl);
      }
    } catch (error: any) {
      console.error('Save error:', error);

      // Provide more specific error messages
      let errorMessage = 'Failed to save internship information';

      if (error.message?.includes('User not found')) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (error.message?.includes('Not authenticated')) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.message?.includes('Invalid or expired token')) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSaveError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/internship"
              className="text-white/80 hover:text-white transition-colors duration-200 hover:bg-white/10 px-3 py-2 rounded-md"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                {isUpdateMode ? 'Update Internship Information' : 'Internship Setup'}
              </h1>
              <p className="text-lg text-blue-100">
                {currentStep === 'profile' && 'Set up your intern profile information'}
                {currentStep === 'details' && 'Input internship details (duration, industry, location, salary, skills, languages)'}
                {currentStep === 'courses' && 'Input course information (multiple)'}
                {currentStep === 'assignments' && 'Input past/current assignment information (multiple)'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {[
              { key: 'profile', label: 'Profile', icon: User, color: 'from-blue-500 to-cyan-500' },
              { key: 'details', label: 'Details', icon: Briefcase, color: 'from-green-500 to-emerald-500' },
              { key: 'courses', label: 'Courses', icon: BookOpen, color: 'from-purple-500 to-violet-500' },
              { key: 'assignments', label: 'Assignments', icon: FileText, color: 'from-orange-500 to-red-500' }
            ].map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.key;
              const isCompleted = ['profile', 'details', 'courses', 'assignments'].indexOf(currentStep) > index;

              return (
                <div key={step.key} className="flex items-center">
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive ? `bg-gradient-to-r ${step.color} text-white shadow-lg` :
                    isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md' :
                    'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>
                    <Icon className="h-5 w-5" />
                    <span className="font-semibold">{step.label}</span>
                  </div>
                  {index < 3 && (
                    <ArrowRight className="h-5 w-5 text-gray-400 mx-3" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {saveError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-600 font-medium">Error</p>
            </div>
            <p className="text-red-600 mb-3">{saveError}</p>
            {(saveError.includes('session has expired') || saveError.includes('log in again') || saveError.includes('Authentication failed')) && (
              <button
                onClick={() => router.push('/auth/login')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Go to Login
              </button>
            )}
          </div>
        )}

        {/* Step 1: Profile Information */}
        {currentStep === 'profile' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">Profile Information</h2>

            {/* Show existing profile information */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Your Current Intern Profile Information:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Name:</strong> {user.firstName} {user.lastName}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Phone:</strong> {user.profile?.phone || 'Not set'}</div>
                <div><strong>Location:</strong> {user.profile?.location || 'Not set'}</div>
              </div>
              {user.profile?.bio && (
                <div className="mt-3">
                  <strong>Bio:</strong> {user.profile.bio}
                </div>
              )}
            </div>

            {/* Profile Information Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={profileData.profileInformation?.firstName || ''}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    profileInformation: { ...prev.profileInformation!, firstName: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={profileData.profileInformation?.lastName || ''}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    profileInformation: { ...prev.profileInformation!, lastName: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.profileInformation?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={profileData.profileInformation?.phone || ''}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    profileInformation: { ...prev.profileInformation!, phone: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={profileData.profileInformation?.location || ''}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    profileInformation: { ...prev.profileInformation!, location: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  value={profileData.profileInformation?.website || ''}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    profileInformation: { ...prev.profileInformation!, website: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                <input
                  type="url"
                  value={profileData.profileInformation?.linkedin || ''}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    profileInformation: { ...prev.profileInformation!, linkedin: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                <input
                  type="url"
                  value={profileData.profileInformation?.github || ''}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    profileInformation: { ...prev.profileInformation!, github: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={profileData.profileInformation?.bio || ''}
                onChange={(e) => setProfileData(prev => ({
                  ...prev,
                  profileInformation: { ...prev.profileInformation!, bio: e.target.value }
                }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Resume Section */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Resume</label>

              {/* Current Resume */}
              {user?.student?.resume && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-800">Current Resume</span>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/users/resume/download', {
                            headers: {
                              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                            },
                          });
                          if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'resume.pdf';
                            a.click();
                            window.URL.revokeObjectURL(url);
                          }
                        } catch (error) {
                          console.error('Download failed:', error);
                        }
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Download
                    </button>
                  </div>
                </div>
              )}

              {/* Upload New Resume */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedResumeFile(file);
                    }
                  }}
                  className="w-full"
                />
                <div className="text-center mt-2">
                  <p className="text-sm text-gray-600">
                    {user?.student?.resume ? 'Select new resume (PDF, DOC, DOCX)' : 'Select your resume (PDF, DOC, DOCX)'}
                  </p>
                  {selectedResumeFile && (
                    <p className="text-sm text-green-600 mt-1">
                      Selected: {selectedResumeFile.name} - Will upload when setup is completed
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Link
                href="/internship"
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back to Internship Section
              </Link>
              <button
                onClick={() => setCurrentStep('details')}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Internship Details */}
        {currentStep === 'details' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Internship Details</h2>

            <div className="space-y-8">
              {/* Duration */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Internship Duration (start - end date)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={internshipDetails.duration?.startDate || ''}
                      onChange={(e) => setInternshipDetails(prev => ({
                        ...prev,
                        duration: { ...prev.duration!, startDate: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={internshipDetails.duration?.endDate || ''}
                      onChange={(e) => setInternshipDetails(prev => ({
                        ...prev,
                        duration: { ...prev.duration!, endDate: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Preferred Industry */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preferred Industry</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 'Engineering'].map((industry) => (
                    <label key={industry} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={internshipDetails.preferredIndustry?.includes(industry) || false}
                        onChange={(e) => {
                          const current = internshipDetails.preferredIndustry || [];
                          if (e.target.checked) {
                            setInternshipDetails(prev => ({
                              ...prev,
                              preferredIndustry: [...current, industry]
                            }));
                          } else {
                            setInternshipDetails(prev => ({
                              ...prev,
                              preferredIndustry: current.filter(i => i !== industry)
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{industry}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preferred Location 1 - 3 (city, state) - Malaysia locations */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preferred Location 1 - 3 (city, state) - Malaysia</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Add a Malaysian location (e.g., Kuala Lumpur, Selangor) and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        const location = e.currentTarget.value.trim();
                        if (!internshipDetails.preferredLocations?.includes(location) && (internshipDetails.preferredLocations?.length || 0) < 3) {
                          setInternshipDetails(prev => ({
                            ...prev,
                            preferredLocations: [...(prev.preferredLocations || []), location]
                          }));
                        }
                        e.currentTarget.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex flex-wrap gap-2">
                    {internshipDetails.preferredLocations?.map((location, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {location}
                        <button
                          onClick={() => setInternshipDetails(prev => ({
                            ...prev,
                            preferredLocations: prev.preferredLocations?.filter((_, i) => i !== index)
                          }))}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preferred salary range (min - max) */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preferred salary range (min - max)</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min (MYR)</label>
                    <input
                      type="number"
                      value={internshipDetails.salaryRange?.min || ''}
                      onChange={(e) => setInternshipDetails(prev => ({
                        ...prev,
                        salaryRange: { ...prev.salaryRange!, min: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max (MYR)</label>
                    <input
                      type="number"
                      value={internshipDetails.salaryRange?.max || ''}
                      onChange={(e) => setInternshipDetails(prev => ({
                        ...prev,
                        salaryRange: { ...prev.salaryRange!, max: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={internshipDetails.salaryRange?.currency || 'MYR'}
                      onChange={(e) => setInternshipDetails(prev => ({
                        ...prev,
                        salaryRange: { ...prev.salaryRange!, currency: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="MYR">MYR</option>
                      <option value="USD">USD</option>
                      <option value="SGD">SGD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                    <select
                      value={internshipDetails.salaryRange?.period || 'month'}
                      onChange={(e) => setInternshipDetails(prev => ({
                        ...prev,
                        salaryRange: { ...prev.salaryRange!, period: e.target.value as any }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="hour">Per Hour</option>
                      <option value="week">Per Week</option>
                      <option value="month">Per Month</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={internshipDetails.salaryRange?.isNegotiable || false}
                      onChange={(e) => setInternshipDetails(prev => ({
                        ...prev,
                        salaryRange: { ...prev.salaryRange!, isNegotiable: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Salary is negotiable</span>
                  </label>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Skills</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Add a skill and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        const skill = e.currentTarget.value.trim();
                        if (!internshipDetails.skills?.includes(skill)) {
                          setInternshipDetails(prev => ({
                            ...prev,
                            skills: [...(prev.skills || []), skill]
                          }));
                        }
                        e.currentTarget.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex flex-wrap gap-2">
                    {internshipDetails.skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          onClick={() => setInternshipDetails(prev => ({
                            ...prev,
                            skills: prev.skills?.filter((_, i) => i !== index)
                          }))}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Languages */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Languages</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Add a language and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        const language = e.currentTarget.value.trim();
                        if (!internshipDetails.languages?.includes(language)) {
                          setInternshipDetails(prev => ({
                            ...prev,
                            languages: [...(prev.languages || []), language]
                          }));
                        }
                        e.currentTarget.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex flex-wrap gap-2">
                    {internshipDetails.languages?.map((language, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {language}
                        <button
                          onClick={() => setInternshipDetails(prev => ({
                            ...prev,
                            languages: prev.languages?.filter((_, i) => i !== index)
                          }))}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep('profile')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep('courses')}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Course Information (multiple) */}
        {currentStep === 'courses' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Intern Course Information (multiple)</h2>

            <div className="space-y-6">
              {courses.map((course, index) => (
                <div key={course.id || index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Course {index + 1}</h3>
                    <button
                      onClick={() => setCourses(prev => prev.filter((_, i) => i !== index))}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Course ID</label>
                      <input
                        type="text"
                        value={course.courseId}
                        onChange={(e) => {
                          const updated = [...courses];
                          updated[index] = { ...updated[index], courseId: e.target.value };
                          setCourses(updated);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="CS101"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                      <input
                        type="text"
                        value={course.courseName}
                        onChange={(e) => {
                          const updated = [...courses];
                          updated[index] = { ...updated[index], courseName: e.target.value };
                          setCourses(updated);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Introduction to Computer Science"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={course.status}
                        onChange={(e) => {
                          const updated = [...courses];
                          updated[index] = { ...updated[index], status: e.target.value as any };
                          setCourses(updated);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Completed">Completed</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Planned">Planned</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Description</label>
                    <textarea
                      value={course.courseDescription}
                      onChange={(e) => {
                        const updated = [...courses];
                        updated[index] = { ...updated[index], courseDescription: e.target.value };
                        setCourses(updated);
                      }}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe what you learned in this course..."
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={() => setCourses(prev => [...prev, {
                  id: Date.now().toString(),
                  courseId: '',
                  courseName: '',
                  courseDescription: '',
                  status: 'In Progress'
                }])}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 w-full justify-center"
              >
                <Plus className="h-4 w-4" />
                Add Course
              </button>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep('details')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep('assignments')}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Assignment Information (multiple) */}
        {currentStep === 'assignments' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Intern Assignment Information (multiple)</h2>

            <div className="space-y-6">
              {assignments.map((assignment, index) => (
                <div key={assignment.id || index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Assignment {index + 1}</h3>
                    <button
                      onClick={() => setAssignments(prev => prev.filter((_, i) => i !== index))}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Title</label>
                      <input
                        type="text"
                        value={assignment.assignmentTitle}
                        onChange={(e) => {
                          const updated = [...assignments];
                          updated[index] = { ...updated[index], assignmentTitle: e.target.value };
                          setAssignments(updated);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Final Project: Web Application"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nature of Assignment</label>
                      <input
                        type="text"
                        value={assignment.natureOfAssignment}
                        onChange={(e) => {
                          const updated = [...assignments];
                          updated[index] = { ...updated[index], natureOfAssignment: e.target.value };
                          setAssignments(updated);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Individual Project, Group Work, Research, etc."
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Methodology</label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Add a methodology and press Enter"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            const methodology = e.currentTarget.value.trim();
                            const updated = [...assignments];
                            updated[index] = {
                              ...updated[index],
                              methodology: [...(updated[index].methodology || []), methodology]
                            };
                            setAssignments(updated);
                            e.currentTarget.value = '';
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="flex flex-wrap gap-2">
                        {assignment.methodology?.map((method, methodIndex) => (
                          <span
                            key={methodIndex}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                          >
                            {method}
                            <button
                              onClick={() => {
                                const updated = [...assignments];
                                updated[index] = {
                                  ...updated[index],
                                  methodology: updated[index].methodology?.filter((_, i) => i !== methodIndex)
                                };
                                setAssignments(updated);
                              }}
                              className="text-purple-600 hover:text-purple-800"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Description</label>
                    <textarea
                      value={assignment.assignmentDescription}
                      onChange={(e) => {
                        const updated = [...assignments];
                        updated[index] = { ...updated[index], assignmentDescription: e.target.value };
                        setAssignments(updated);
                      }}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe the assignment, what you accomplished, technologies used, challenges faced, etc."
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={() => setAssignments(prev => [...prev, {
                  id: Date.now().toString(),
                  assignmentTitle: '',
                  natureOfAssignment: '',
                  methodology: [],
                  assignmentDescription: ''
                }])}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 w-full justify-center"
              >
                <Plus className="h-4 w-4" />
                Add Assignment
              </button>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep('courses')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
              <button
                onClick={() => handleSaveAndContinue('complete')}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InternshipSetupWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6">Loading…</div>}>
      <InternshipSetup />
    </Suspense>
  );
}

export default withAuth(InternshipSetupWrapper);
