"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { withAuth } from '@/contexts/auth-context';
import {
  User,
  GraduationCap,
  Award,
  Heart,
  Briefcase,
  BookOpen,
  FileText,
  ArrowRight,
  Check,
  AlertCircle,
  Edit,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { InternshipSetupState, InternshipProfile } from '@/types/internship';

function InternshipSection() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  // Flow state management following the flowchart
  const [currentStep, setCurrentStep] = useState<'view' | 'decision' | 'profile' | 'details' | 'courses' | 'assignments' | 'complete'>('view');
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(true);
  const [updateType, setUpdateType] = useState<'profile' | 'details' | 'courses' | 'assignments' | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Check if intern has existing internship information
  useEffect(() => {
    if (user?.internship) {
      setIsFirstTimeSetup(false);
      setCurrentStep('view');
    } else {
      setIsFirstTimeSetup(true);
      setCurrentStep('profile');
    }
  }, [user]);

  // Mock internship data - in real app, this would come from the intern object
  const existingInternshipInfo = user?.internship || {
    profile: {
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
    },
    details: {
      duration: { startDate: '', endDate: '', isFlexible: true },
      preferredIndustry: [],
      preferredLocations: [],
      salaryRange: { min: 0, max: 0, currency: 'USD', period: 'hour', isNegotiable: true },
      skills: [],
      languages: [],
      availability: { hoursPerWeek: 40, flexibleSchedule: true, availableDays: [] },
      workPreferences: { remote: false, hybrid: false, onSite: true, travelWillingness: 'Local' }
    },
    courses: [],
    assignments: []
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Internship Section</h1>
              <p className="mt-2 text-gray-600">
                {isFirstTimeSetup
                  ? 'Set up your intern profile to get started'
                  : 'Manage your intern information and applications'
                }
              </p>
            </div>
            {!isFirstTimeSetup && (
              <div className="flex items-center gap-3">
                <Link
                  href="/internship/opportunities"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Opportunities
                </Link>
                <Link
                  href="/internship/applications"
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  My Applications
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* First Time Setup Flow */}
        {isFirstTimeSetup && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to Internships!</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Let's set up your intern profile so you can start exploring opportunities.
                We'll gather information about your background, skills, and preferences.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { icon: User, title: 'Profile Information', desc: 'Basic details and contact info' },
                { icon: GraduationCap, title: 'Education & Experience', desc: 'Academic background and work history' },
                { icon: BookOpen, title: 'Course Information', desc: 'Relevant coursework and projects' },
                { icon: FileText, title: 'Assignment Portfolio', desc: 'Past assignments and achievements' }
              ].map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <Link
                href="/internship/setup"
                className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Existing Information View */}
        {!isFirstTimeSetup && currentStep === 'view' && (
          <div className="space-y-6">
            {/* Profile Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Intern Profile Overview</h2>
                <button
                  onClick={() => setCurrentStep('decision')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4" />
                  Update Information
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Profile Information Card */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <User className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900">Intern Profile Information</h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Name: {existingInternshipInfo.profile.profileInformation.firstName} {existingInternshipInfo.profile.profileInformation.lastName}</div>
                    <div>Email: {existingInternshipInfo.profile.profileInformation.email}</div>
                    <div>Location: {existingInternshipInfo.profile.profileInformation.location || 'Not set'}</div>
                  </div>
                </div>

                {/* Education & Experience Card */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <GraduationCap className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium text-gray-900">Education & Experience</h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Education: {existingInternshipInfo.profile.educationBackground.length} entries</div>
                    <div>Certifications: {existingInternshipInfo.profile.certifications.length} entries</div>
                    <div>Work Experience: {existingInternshipInfo.profile.workExperience.length} entries</div>
                  </div>
                </div>

                {/* Course Information Card */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    <h3 className="font-medium text-gray-900">Course Information</h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Courses: {existingInternshipInfo.courses.length} entries</div>
                    <div>Status: {existingInternshipInfo.courses.length > 0 ? 'Complete' : 'Not set'}</div>
                  </div>
                </div>

                {/* Assignment Portfolio Card */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="h-5 w-5 text-orange-600" />
                    <h3 className="font-medium text-gray-900">Assignment Portfolio</h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Assignments: {existingInternshipInfo.assignments.length} entries</div>
                    <div>Status: {existingInternshipInfo.assignments.length > 0 ? 'Complete' : 'Not set'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href="/internship/opportunities"
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Browse Opportunities</h3>
                    <p className="text-sm text-gray-600">Find internships that match your profile</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/internship/applications"
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">My Applications</h3>
                    <p className="text-sm text-gray-600">Track your application status</p>
                  </div>
                </div>
              </Link>

              <button
                onClick={() => setCurrentStep('decision')}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Edit className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Update Profile</h3>
                    <p className="text-sm text-gray-600">Modify your internship information</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Decision Flow - Update Internship Info? */}
        {!isFirstTimeSetup && currentStep === 'decision' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">What would you like to update?</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => {
                  setUpdateType('profile');
                  router.push('/internship/setup?step=profile&update=true');
                }}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <User className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900">Update Intern Profile Information</h3>
                </div>
                <p className="text-gray-600">Modify your personal details, education, certifications, and work experience</p>
              </button>

              <button
                onClick={() => {
                  setUpdateType('details');
                  router.push('/internship/setup?step=details&update=true');
                }}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Briefcase className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-medium text-gray-900">Update Internship Details</h3>
                </div>
                <p className="text-gray-600">Change your preferences, availability, and internship requirements</p>
              </button>

              <button
                onClick={() => {
                  setUpdateType('courses');
                  router.push('/internship/setup?step=courses&update=true');
                }}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                  <h3 className="text-lg font-medium text-gray-900">Update Course Information</h3>
                </div>
                <p className="text-gray-600">Add or modify your course details and academic projects</p>
              </button>

              <button
                onClick={() => {
                  setUpdateType('assignments');
                  router.push('/internship/setup?step=assignments&update=true');
                }}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="h-6 w-6 text-orange-600" />
                  <h3 className="text-lg font-medium text-gray-900">Update Assignment Portfolio</h3>
                </div>
                <p className="text-gray-600">Manage your past assignments and project portfolio</p>
              </button>
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={() => setCurrentStep('view')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back to Overview
              </button>
            </div>
          </div>
        )}

        {/* Completion Message */}
        {currentStep === 'complete' && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Internship Information Updated Successfully!
            </h2>

            <p className="text-gray-600 mb-6">
              Your intern profile has been updated and is now ready for applications.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setCurrentStep('view')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                View Profile
              </button>
              <Link
                href="/internship/opportunities"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Browse Opportunities
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(InternshipSection);
