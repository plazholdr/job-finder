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
  ChevronUp
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
      }
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-gray-50 p-6 mb-6">
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

        {/* First Time Check Prompt */}
        {currentStep === 'first-time-check' && (
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Internship Section</h2>
                  <p className="text-gray-600">Let's get you set up with your internship profile</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Is this your first time setting up?</h3>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => handleFirstTimeDecision(true)}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl"
                    >
                      Yes, First Time
                    </Button>
                    <Button
                      onClick={() => handleFirstTimeDecision(false)}
                      variant="outline"
                      className="px-8 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl"
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
                  onClick={() => setCurrentStep('update-check')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

                {/* Education & Experience Card */}
                <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 shadow-lg bg-white"
                      onClick={() => setExpandedSections(prev => ({ ...prev, education: !prev.education }))}>
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-4">
                      <div className="h-16 w-16 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                        <GraduationCap className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-green-600 transition-colors">
                        Education & Experience
                      </h3>
                      <Badge variant="secondary" className="text-xs px-3 py-1 bg-green-50 text-green-700 border-green-200">
                        {((existingInternshipInfo.profile?.educationBackground?.length || 0) +
                          (existingInternshipInfo.profile?.workExperience?.length || 0) +
                          (existingInternshipInfo.profile?.certifications?.length || 0)) > 0 ? 'Complete' : 'Not set'}
                      </Badge>
                    </div>
                    <div className="text-gray-600 text-sm mt-3 space-y-1">
                      <div>Education: {existingInternshipInfo.profile?.educationBackground?.length || 0}</div>
                      <div>Experience: {existingInternshipInfo.profile?.workExperience?.length || 0}</div>
                      <div>Certifications: {existingInternshipInfo.profile?.certifications?.length || 0}</div>
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

            {/* Education & Experience Expanded */}
            {expandedSections.education && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="h-8 w-8 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-green-600" />
                      </div>
                      Education & Experience
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
                  {/* Education Background */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Education Background</h4>
                    {existingInternshipInfo.profile?.educationBackground && existingInternshipInfo.profile.educationBackground.length > 0 ? (
                      <div className="space-y-3">
                        {existingInternshipInfo.profile.educationBackground.map((edu, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="font-medium text-gray-900">{edu.institution}</h5>
                                <p className="text-sm text-gray-600">{edu.degree} in {edu.fieldOfStudy}</p>
                              </div>
                              <div className="text-sm text-gray-500">
                                {edu.startDate} - {edu.endDate}
                              </div>
                            </div>
                            {edu.description && (
                              <p className="text-sm text-gray-600 mt-2">{edu.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <GraduationCap className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No education background added yet</p>
                      </div>
                    )}
                  </div>

                  {/* Certifications */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Certifications</h4>
                    {existingInternshipInfo.profile?.certifications && existingInternshipInfo.profile.certifications.length > 0 ? (
                      <div className="space-y-3">
                        {existingInternshipInfo.profile.certifications.map((cert, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium text-gray-900">{cert.name}</h5>
                                <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                              </div>
                              <div className="text-sm text-gray-500">
                                {cert.issueDate}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No certifications added yet</p>
                      </div>
                    )}
                  </div>

                  {/* Work Experience */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Work Experience</h4>
                    {existingInternshipInfo.profile?.workExperience && existingInternshipInfo.profile.workExperience.length > 0 ? (
                      <div className="space-y-3">
                        {existingInternshipInfo.profile.workExperience.map((work, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="font-medium text-gray-900">{work.jobTitle}</h5>
                                <p className="text-sm text-gray-600">{work.company} • {work.location}</p>
                              </div>
                              <div className="text-sm text-gray-500">
                                {work.startDate} - {work.endDate || 'Present'}
                              </div>
                            </div>
                            {work.description && (
                              <p className="text-sm text-gray-600 mt-2">{work.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <User className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No work experience added yet</p>
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
