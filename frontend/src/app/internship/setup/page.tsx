"use client";

import React, { useState, useEffect } from 'react';
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
  const [currentStep, setCurrentStep] = useState<'profile' | 'decision' | 'details' | 'courses' | 'assignments' | 'complete'>(stepParam as any);
  const [useExistingInfo, setUseExistingInfo] = useState<boolean | null>(null);
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
    salaryRange: { min: 15, max: 25, currency: 'USD', period: 'hour', isNegotiable: true },
    skills: [],
    languages: [{ name: 'English', proficiency: 'Fluent' }],
    availability: { hoursPerWeek: 40, flexibleSchedule: true, availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
    workPreferences: { remote: false, hybrid: true, onSite: true, travelWillingness: 'Local' }
  });

  const [courses, setCourses] = useState<CourseInformation[]>([]);
  const [assignments, setAssignments] = useState<AssignmentInformation[]>([]);

  // Load existing data if in update mode
  useEffect(() => {
    if (isUpdateMode && user?.internship) {
      setProfileData(user.internship.profile || profileData);
      setInternshipDetails(user.internship.details || internshipDetails);
      setCourses(user.internship.courses || []);
      setAssignments(user.internship.assignments || []);
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

      // Prepare data to save
      const internshipData = {
        profile: profileData,
        details: internshipDetails,
        courses,
        assignments
      };

      console.log('Saving internship data for user:', user._id);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/internship"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isUpdateMode ? 'Update Internship Information' : 'Internship Setup'}
              </h1>
              <p className="text-gray-600">
                {currentStep === 'profile' && 'Set up your intern profile information'}
                {currentStep === 'decision' && 'Choose which information to use'}
                {currentStep === 'details' && 'Input internship details (duration, industry, location, salary, skills, languages)'}
                {currentStep === 'courses' && 'Input course information (multiple)'}
                {currentStep === 'assignments' && 'Input past/current assignment information (multiple)'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {[
              { key: 'profile', label: 'Profile', icon: User },
              { key: 'details', label: 'Details', icon: Briefcase },
              { key: 'courses', label: 'Courses', icon: BookOpen },
              { key: 'assignments', label: 'Assignments', icon: FileText }
            ].map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.key;
              const isCompleted = ['profile', 'details', 'courses', 'assignments'].indexOf(currentStep) > index;

              return (
                <div key={step.key} className="flex items-center">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    isActive ? 'bg-blue-100 text-blue-700' :
                    isCompleted ? 'bg-green-100 text-green-700' :
                    'text-gray-500'
                  }`}>
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                  {index < 3 && (
                    <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
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
        {currentStep === 'profile' && !isUpdateMode && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>

            {/* Show existing profile information */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Your Current Intern Profile Information:</h3>
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

            {/* Decision: Use same info? */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Use same info?</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="useExistingInfo"
                    value="yes"
                    checked={useExistingInfo === true}
                    onChange={() => setUseExistingInfo(true)}
                    className="text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Yes, use same info</div>
                    <div className="text-sm text-gray-500">Continue with the existing intern profile information shown above</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="useExistingInfo"
                    value="no"
                    checked={useExistingInfo === false}
                    onChange={() => setUseExistingInfo(false)}
                    className="text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">No, I want to choose which info to use and input new information</div>
                    <div className="text-sm text-gray-500">Customize your intern profile with new details of your choice</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-between">
              <Link
                href="/internship"
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back to Internship Section
              </Link>
              <button
                onClick={() => {
                  if (useExistingInfo === true) {
                    setCurrentStep('details');
                  } else if (useExistingInfo === false) {
                    setCurrentStep('decision');
                  }
                }}
                disabled={useExistingInfo === null}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Decision - Input new profile info */}
        {currentStep === 'decision' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose which intern info to use and input the new info of choice</h2>

            <div className="space-y-6">
              {/* Profile Information Form */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Intern Profile Information</h3>
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
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        profileInformation: { ...prev.profileInformation!, email: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
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
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={profileData.profileInformation?.location || ''}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        profileInformation: { ...prev.profileInformation!, location: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="City, State"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={profileData.profileInformation?.bio || ''}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        profileInformation: { ...prev.profileInformation!, bio: e.target.value }
                      }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us about yourself as an intern and your career goals..."
                    />
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Interests</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Add an interest and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        setProfileData(prev => ({
                          ...prev,
                          interests: [...(prev.interests || []), e.currentTarget.value.trim()]
                        }));
                        e.currentTarget.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex flex-wrap gap-2">
                    {profileData.interests?.map((interest, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {interest}
                        <button
                          onClick={() => setProfileData(prev => ({
                            ...prev,
                            interests: prev.interests?.filter((_, i) => i !== index)
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
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep('profile')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
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

        {/* Step 3: Internship Details */}
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

              {/* Preferred Location 1 - 3 (city, state) */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preferred Location 1 - 3 (city, state)</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Add a location and press Enter"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min ($)</label>
                    <input
                      type="number"
                      value={internshipDetails.salaryRange?.min || ''}
                      onChange={(e) => setInternshipDetails(prev => ({
                        ...prev,
                        salaryRange: { ...prev.salaryRange!, min: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max ($)</label>
                    <input
                      type="number"
                      value={internshipDetails.salaryRange?.max || ''}
                      onChange={(e) => setInternshipDetails(prev => ({
                        ...prev,
                        salaryRange: { ...prev.salaryRange!, max: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                    <select
                      value={internshipDetails.salaryRange?.period || 'hour'}
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
                <div className="space-y-3">
                  {internshipDetails.languages?.map((language, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="Language"
                        value={language.name}
                        onChange={(e) => {
                          const updatedLanguages = [...(internshipDetails.languages || [])];
                          updatedLanguages[index] = { ...updatedLanguages[index], name: e.target.value };
                          setInternshipDetails(prev => ({ ...prev, languages: updatedLanguages }));
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <select
                        value={language.proficiency}
                        onChange={(e) => {
                          const updatedLanguages = [...(internshipDetails.languages || [])];
                          updatedLanguages[index] = { ...updatedLanguages[index], proficiency: e.target.value as any };
                          setInternshipDetails(prev => ({ ...prev, languages: updatedLanguages }));
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Basic">Basic</option>
                        <option value="Conversational">Conversational</option>
                        <option value="Fluent">Fluent</option>
                        <option value="Native">Native</option>
                      </select>
                      <button
                        onClick={() => setInternshipDetails(prev => ({
                          ...prev,
                          languages: prev.languages?.filter((_, i) => i !== index)
                        }))}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setInternshipDetails(prev => ({
                      ...prev,
                      languages: [...(prev.languages || []), { name: '', proficiency: 'Basic' }]
                    }))}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                    Add Language
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(useExistingInfo ? 'profile' : 'decision')}
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

        {/* Step 4: Course Information (multiple) */}
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

        {/* Step 5: Assignment Information (multiple) */}
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

export default withAuth(InternshipSetup);
