"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { withAuth } from '@/contexts/auth-context';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Eye,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { InternshipSetupState, InternshipProfile } from '@/types/internship';

function InternshipSection() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  // Flow state management following the flowchart
  const [currentStep, setCurrentStep] = useState<'initial' | 'first-time-check' | 'update-check' | 'view' | 'profile' | 'details' | 'courses' | 'assignments' | 'complete'>('initial');
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(true);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [updateType, setUpdateType] = useState<'profile' | 'details' | 'courses' | 'assignments' | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState<{
    profile: boolean;
    education: boolean;
    courses: boolean;
    assignments: boolean;
  }>({
    profile: false,
    education: false,
    courses: false,
    assignments: false
  });

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

  // Get internship data from user object - matching your exact data structure
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
      workExperience: [],
      details: {
        courses: [],
        assignments: []
      }
    },
    details: {
      duration: { startDate: '', endDate: '', isFlexible: true },
      preferredIndustry: [],
      preferredLocations: [],
      salaryRange: { min: 0, max: 0, currency: 'MYR', period: 'month', isNegotiable: true },
      skills: [],
      languages: [],
      availability: { hoursPerWeek: 40, flexibleSchedule: true, availableDays: [] },
      workPreferences: { remote: false, hybrid: false, onSite: true, travelWillingness: 'Local' },
      courses: [],
      assignments: []
    },
    applications: [],
    isSetupComplete: false
  };

  // Check if user has existing internship data and set initial flow
  useEffect(() => {
    if (user?.internship?.isSetupComplete) {
      setIsFirstTimeSetup(false);
      setCurrentStep('first-time-check');
    } else {
      setIsFirstTimeSetup(true);
      setCurrentStep('first-time-check');
    }
  }, [user]);

  // Handle first time setup decision
  const handleFirstTimeDecision = (isFirstTime: boolean) => {
    setIsFirstTimeSetup(isFirstTime);
    if (isFirstTime) {
      setCurrentStep('profile'); // Go directly to setup
    } else {
      setCurrentStep('update-check'); // Ask if they want to update
    }
  };

  // Handle update decision
  const handleUpdateDecision = (wantToUpdate: boolean) => {
    if (wantToUpdate) {
      router.push('/internship/setup?update=true'); // Go STRAIGHT to setup forms
    } else {
      setCurrentStep('view'); // Show existing info
    }
  };

  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-xl p-8 mb-8 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Internship Section</h1>
                <p className="text-xl text-blue-100">
                  {isFirstTimeSetup
                    ? 'Set up your intern profile to get started'
                    : 'Manage your intern information and applications'
                  }
                </p>
              </div>
              {!isFirstTimeSetup && (
                <div className="flex items-center gap-4">
                  <Link
                    href="/jobs"
                    className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-all duration-200 font-semibold shadow-md"
                  >
                    Browse Opportunities
                  </Link>
                  <Link
                    href="/internship/applications"
                    className="px-6 py-3 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-all duration-200 font-semibold backdrop-blur-sm"
                  >
                    My Applications
                  </Link>
                </div>
              )}
            </div>
          </div>

        {/* First Time Check Prompt */}
        {currentStep === 'first-time-check' && (
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-10 text-center">
                <div className="mb-8">
                  <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">Welcome to Internship Section</h2>
                  <p className="text-xl text-gray-600">Let's get you set up with your internship profile</p>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900">Is this your first time setting up?</h3>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => handleFirstTimeDecision(true)}
                      className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      Yes, First Time
                    </Button>
                    <Button
                      onClick={() => handleFirstTimeDecision(false)}
                      variant="outline"
                      className="px-10 py-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
                    >
                      No, I have existing info
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Update Check Prompt */}
        {currentStep === 'update-check' && (
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="h-16 w-16 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Edit className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Update Your Information</h2>
                  <p className="text-gray-600">We found your existing internship profile</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Do you want to update your details?</h3>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => handleUpdateDecision(true)}
                      className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl"
                    >
                      Yes, Update Details
                    </Button>
                    <Button
                      onClick={() => handleUpdateDecision(false)}
                      variant="outline"
                      className="px-8 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl"
                    >
                      No, View Current Info
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* First Time Setup Flow */}
        {isFirstTimeSetup && (currentStep === 'profile' || currentStep === 'details' || currentStep === 'courses' || currentStep === 'assignments') && (
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
                { icon: User, title: 'Profile Information', desc: 'Basic details and contact info', color: 'from-blue-500 to-cyan-500' },
                { icon: Briefcase, title: 'Internship Details', desc: 'Duration, industry, location, salary, skills', color: 'from-green-500 to-emerald-500' },
                { icon: BookOpen, title: 'Course Information', desc: 'Relevant coursework and projects', color: 'from-purple-500 to-violet-500' },
                { icon: FileText, title: 'Assignment Portfolio', desc: 'Past assignments and achievements', color: 'from-orange-500 to-red-500' }
              ].map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
                    <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <Link
                href="/internship/setup"
                className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        )}

        {/* Existing Information View */}
        {!isFirstTimeSetup && currentStep === 'view' && (
          <div className="space-y-6">
            {/* Profile Overview */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Intern Profile Overview</h2>
                <button
                  onClick={() => setCurrentStep('update-check')}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold shadow-md transition-all duration-200"
                >
                  <Edit className="h-4 w-4" />
                  Update Information
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Profile Information Card */}
                <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 shadow-lg bg-white"
                      onClick={() => setExpandedSections(prev => ({ ...prev, profile: !prev.profile }))}>
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-4">
                      <div className="h-16 w-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                        <User className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                        Profile Information
                      </h3>
                      <Badge variant="secondary" className="text-xs px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
                        {existingInternshipInfo.profile?.profileInformation?.firstName ? 'Complete' : 'Not set'}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                      {existingInternshipInfo.profile?.profileInformation?.firstName
                        ? `${existingInternshipInfo.profile.profileInformation.firstName} ${existingInternshipInfo.profile.profileInformation.lastName || ''}`
                        : 'Set up your personal information'
                      }
                    </p>
                    <div className="mt-4">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                        {expandedSections.profile ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Internship Details Card */}
                <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 shadow-lg bg-white"
                      onClick={() => setExpandedSections(prev => ({ ...prev, education: !prev.education }))}>
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-4">
                      <div className="h-16 w-16 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                        <Briefcase className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-green-600 transition-colors">
                        Internship Details
                      </h3>
                      <Badge variant="secondary" className="text-xs px-3 py-1 bg-green-50 text-green-700 border-green-200">
                        {(((existingInternshipInfo as any).details?.duration?.startDate || (existingInternshipInfo as any).profile?.details?.duration?.startDate) &&
                          (((existingInternshipInfo as any).details?.preferredIndustry?.length || (existingInternshipInfo as any).profile?.details?.preferredIndustry?.length || 0) > 0) &&
                          (((existingInternshipInfo as any).details?.preferredLocations?.length || (existingInternshipInfo as any).profile?.details?.preferredLocations?.length || 0) > 0)) ? 'Complete' : 'Not set'}
                      </Badge>
                    </div>
                    <div className="text-gray-600 text-sm mt-3 space-y-1">
                      <div>Duration: {((existingInternshipInfo as any).details?.duration?.startDate || (existingInternshipInfo as any).profile?.details?.duration?.startDate) ? 'Set' : 'Not set'}</div>
                      <div>Industries: {(existingInternshipInfo as any).details?.preferredIndustry?.length || (existingInternshipInfo as any).profile?.details?.preferredIndustry?.length || 0}</div>
                      <div>Locations: {(existingInternshipInfo as any).details?.preferredLocations?.length || (existingInternshipInfo as any).profile?.details?.preferredLocations?.length || 0}</div>
                      <div>Skills: {(existingInternshipInfo as any).details?.skills?.length || (existingInternshipInfo as any).profile?.details?.skills?.length || 0}</div>
                    </div>
                    <div className="mt-4">
                      <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                        {expandedSections.education ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Course Information Card */}
                <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 shadow-lg bg-white"
                      onClick={() => setExpandedSections(prev => ({ ...prev, courses: !prev.courses }))}>
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-4">
                      <div className="h-16 w-16 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                        <BookOpen className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors">
                        Course Information
                      </h3>
                      <Badge variant="secondary" className="text-xs px-3 py-1 bg-purple-50 text-purple-700 border-purple-200">
                        {(existingInternshipInfo.profile?.details?.courses?.length || 0) > 0 ? 'Complete' : 'Not set'}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                      {existingInternshipInfo.profile?.details?.courses?.length || 0} courses added
                    </p>
                    <div className="mt-4">
                      <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                        {expandedSections.courses ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Assignment Portfolio Card */}
                <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 shadow-lg bg-white"
                      onClick={() => setExpandedSections(prev => ({ ...prev, assignments: !prev.assignments }))}>
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-4">
                      <div className="h-16 w-16 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                        <FileText className="h-8 w-8 text-orange-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors">
                        Assignment Portfolio
                      </h3>
                      <Badge variant="secondary" className="text-xs px-3 py-1 bg-orange-50 text-orange-700 border-orange-200">
                        {(existingInternshipInfo.profile?.details?.assignments?.length || 0) > 0 ? 'Complete' : 'Not set'}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                      {existingInternshipInfo.profile?.details?.assignments?.length || 0} assignments added
                    </p>
                    <div className="mt-4">
                      <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                        {expandedSections.assignments ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Expanded Sections */}
            {expandedSections.profile && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="h-8 w-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      Profile Information
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedSections(prev => ({ ...prev, profile: false }))}
                      className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0"
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Name:</span> {existingInternshipInfo.profile?.profileInformation?.firstName || ''} {existingInternshipInfo.profile?.profileInformation?.lastName || ''}</div>
                      <div><span className="font-medium">Email:</span> {existingInternshipInfo.profile?.profileInformation?.email || ''}</div>
                      <div><span className="font-medium">Phone:</span> {existingInternshipInfo.profile?.profileInformation?.phone || 'Not set'}</div>
                      <div><span className="font-medium">Location:</span> {existingInternshipInfo.profile?.profileInformation?.location || 'Not set'}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Online Presence</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Website:</span> {existingInternshipInfo.profile?.profileInformation?.website || 'Not set'}</div>
                      <div><span className="font-medium">LinkedIn:</span> {existingInternshipInfo.profile?.profileInformation?.linkedin || 'Not set'}</div>
                      <div><span className="font-medium">GitHub:</span> {existingInternshipInfo.profile?.profileInformation?.github || 'Not set'}</div>
                    </div>
                  </div>
                  {existingInternshipInfo.profile?.profileInformation?.bio && (
                    <div className="md:col-span-2">
                      <h4 className="font-medium text-gray-900 mb-3">Bio</h4>
                      <p className="text-sm text-gray-600">{existingInternshipInfo.profile.profileInformation.bio}</p>
                    </div>
                  )}
                  {existingInternshipInfo.profile?.interests && existingInternshipInfo.profile.interests.length > 0 && (
                    <div className="md:col-span-2">
                      <h4 className="font-medium text-gray-900 mb-3">Interests</h4>
                      <div className="flex flex-wrap gap-2">
                        {existingInternshipInfo.profile.interests.map((interest, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                </CardContent>
              </Card>
            )}

            {/* Internship Details Expanded */}
            {expandedSections.education && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="h-8 w-8 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-green-600" />
                      </div>
                      Internship Details
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedSections(prev => ({ ...prev, education: false }))}
                      className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0"
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>

                <div className="space-y-6">
                  {/* Internship Duration */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Internship Duration</h4>
                    {((existingInternshipInfo as any).details?.duration?.startDate || (existingInternshipInfo as any).profile?.details?.duration?.startDate) ? (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">
                              {new Date(((existingInternshipInfo as any).details?.duration?.startDate || (existingInternshipInfo as any).profile?.details?.duration?.startDate)).toLocaleDateString()} - {' '}
                              {((existingInternshipInfo as any).details?.duration?.endDate || (existingInternshipInfo as any).profile?.details?.duration?.endDate) ?
                                new Date(((existingInternshipInfo as any).details?.duration?.endDate || (existingInternshipInfo as any).profile?.details?.duration?.endDate)).toLocaleDateString() :
                                'Open-ended'
                              }
                            </p>
                            {((existingInternshipInfo as any).details?.duration?.isFlexible || (existingInternshipInfo as any).profile?.details?.duration?.isFlexible) && (
                              <p className="text-sm text-blue-600">Flexible dates</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No duration set yet</p>
                      </div>
                    )}
                  </div>

                  {/* Preferred Industry */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Preferred Industry</h4>
                    {(((existingInternshipInfo as any).details?.preferredIndustry && (existingInternshipInfo as any).details.preferredIndustry.length > 0) ||
                      ((existingInternshipInfo as any).profile?.details?.preferredIndustry && (existingInternshipInfo as any).profile.details.preferredIndustry.length > 0)) ? (
                      <div className="flex flex-wrap gap-2">
                        {((existingInternshipInfo as any).details?.preferredIndustry || (existingInternshipInfo as any).profile?.details?.preferredIndustry || []).map((industry: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {industry}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No preferred industry set yet</p>
                      </div>
                    )}
                  </div>

                  {/* Preferred Locations */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Preferred Locations</h4>
                    {(((existingInternshipInfo as any).details?.preferredLocations && (existingInternshipInfo as any).details.preferredLocations.length > 0) ||
                      ((existingInternshipInfo as any).profile?.details?.preferredLocations && (existingInternshipInfo as any).profile.details.preferredLocations.length > 0)) ? (
                      <div className="flex flex-wrap gap-2">
                        {((existingInternshipInfo as any).details?.preferredLocations || (existingInternshipInfo as any).profile?.details?.preferredLocations || []).map((location: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {location}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No preferred locations set yet</p>
                      </div>
                    )}
                  </div>

                  {/* Salary Range */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Preferred Salary Range</h4>
                    {((existingInternshipInfo as any).details?.salaryRange || (existingInternshipInfo as any).profile?.details?.salaryRange) ? (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-gray-900">
                            {((existingInternshipInfo as any).details?.salaryRange || (existingInternshipInfo as any).profile?.details?.salaryRange).currency} {((existingInternshipInfo as any).details?.salaryRange || (existingInternshipInfo as any).profile?.details?.salaryRange).min} - {((existingInternshipInfo as any).details?.salaryRange || (existingInternshipInfo as any).profile?.details?.salaryRange).max}
                          </span>
                          <span className="text-sm text-gray-600">per {((existingInternshipInfo as any).details?.salaryRange || (existingInternshipInfo as any).profile?.details?.salaryRange).period}</span>
                          {((existingInternshipInfo as any).details?.salaryRange || (existingInternshipInfo as any).profile?.details?.salaryRange).isNegotiable && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Negotiable</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <DollarSign className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No salary range set yet</p>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Skills</h4>
                    {(((existingInternshipInfo as any).details?.skills && (existingInternshipInfo as any).details.skills.length > 0) ||
                      ((existingInternshipInfo as any).profile?.details?.skills && (existingInternshipInfo as any).profile.details.skills.length > 0)) ? (
                      <div className="flex flex-wrap gap-2">
                        {((existingInternshipInfo as any).details?.skills || (existingInternshipInfo as any).profile?.details?.skills || []).map((skill: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Award className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No skills added yet</p>
                      </div>
                    )}
                  </div>

                  {/* Languages */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Languages</h4>
                    {(((existingInternshipInfo as any).details?.languages && (existingInternshipInfo as any).details.languages.length > 0) ||
                      ((existingInternshipInfo as any).profile?.details?.languages && (existingInternshipInfo as any).profile.details.languages.length > 0)) ? (
                      <div className="flex flex-wrap gap-2">
                        {((existingInternshipInfo as any).details?.languages || (existingInternshipInfo as any).profile?.details?.languages || []).map((language: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                            {String(language)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <User className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No languages added yet</p>
                      </div>
                    )}
                  </div>
                </div>
                </CardContent>
              </Card>
            )}

            {/* Course Information Expanded */}
            {expandedSections.courses && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="h-8 w-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                      </div>
                      Course Information
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedSections(prev => ({ ...prev, courses: false }))}
                      className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0"
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>

                {existingInternshipInfo.profile?.details?.courses && existingInternshipInfo.profile.details.courses.length > 0 ? (
                  <div className="space-y-3">
                    {existingInternshipInfo.profile.details.courses.map((course, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{course.courseName}</h4>
                            <p className="text-sm text-gray-600">Course ID: {course.courseId}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            course.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            course.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {course.status}
                          </span>
                        </div>
                        {course.courseDescription && (
                          <p className="text-sm text-gray-600 mt-2">{course.courseDescription}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No courses added yet</p>
                    <p className="text-sm text-gray-400">Add courses in your setup to see them here</p>
                  </div>
                )}
                </CardContent>
              </Card>
            )}

            {/* Assignment Portfolio Expanded */}
            {expandedSections.assignments && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="h-8 w-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-orange-600" />
                      </div>
                      Assignment Portfolio
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedSections(prev => ({ ...prev, assignments: false }))}
                      className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0"
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>

                {existingInternshipInfo.profile?.details?.assignments && existingInternshipInfo.profile.details.assignments.length > 0 ? (
                  <div className="space-y-3">
                    {existingInternshipInfo.profile.details.assignments.map((assignment, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="mb-3">
                          <h4 className="font-medium text-gray-900">{assignment.assignmentTitle}</h4>
                          <p className="text-sm text-gray-600">{assignment.natureOfAssignment}</p>
                          {assignment.courseName && (
                            <p className="text-sm text-gray-500">Course: {assignment.courseName}</p>
                          )}
                        </div>

                        {assignment.assignmentDescription && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-600">{assignment.assignmentDescription}</p>
                          </div>
                        )}

                        {assignment.methodology && assignment.methodology.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Methodology:</p>
                            <div className="flex flex-wrap gap-2">
                              {assignment.methodology.map((method, methodIndex) => (
                                <span key={methodIndex} className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                                  {method}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No assignments added yet</p>
                    <p className="text-sm text-gray-400">Add assignments in your setup to see them here</p>
                  </div>
                )}
                </CardContent>
              </Card>
            )}

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
                onClick={() => setCurrentStep('update-check')}
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
        {false && (
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
    </AppLayout>
  );
}

export default withAuth(InternshipSection);
