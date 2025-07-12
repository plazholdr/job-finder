"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, withAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import dynamic from 'next/dynamic';

const InternshipPreferencesWizard = dynamic(
  () => import('@/components/internship/InternshipPreferencesWizard'),
  { ssr: false }
);
import {
  Settings,
  Plus,
  Edit,
  CheckCircle,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Code,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import UserProfile from '@/components/UserProfile';
import Link from 'next/link';

interface InternshipPreferences {
  _id: string;
  userId: string;
  preferences: any;
  status: string;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

function InternshipPreferencesPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [preferences, setPreferences] = useState<InternshipPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Redirect non-students
  useEffect(() => {
    if (user && user.role !== 'student') {
      toast.error('This page is only accessible to students');
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  // Load existing preferences
  useEffect(() => {
    if (user && token && user.role === 'student') {
      loadPreferences();
    }
  }, [user, token]);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/internship-preferences/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      } else if (response.status === 404) {
        // No preferences found - this is expected for new users
        setPreferences(null);
      } else {
        // For other errors, try to get error message but don't throw
        try {
          const errorData = await response.json();
          console.error('Error loading preferences:', errorData.error || 'Failed to load preferences');
          toast.error('Failed to load preferences');
        } catch (parseError) {
          console.error('Error loading preferences: Failed to parse error response');
          toast.error('Failed to load preferences');
        }
        setPreferences(null);
      }
    } catch (error) {
      console.error('Network error loading preferences:', error);
      // Only show error toast for network errors
      toast.error('Network error - please check your connection');
      setPreferences(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePreferences = () => {
    setIsEditing(false);
    setShowWizard(true);
  };

  const handleEditPreferences = () => {
    setIsEditing(true);
    setShowWizard(true);
  };

  const handleWizardComplete = (savedPreferences?: any) => {
    setShowWizard(false);
    setIsEditing(false);
    // Use the saved data directly instead of reloading
    if (savedPreferences) {
      setPreferences(savedPreferences);
    } else {
      // Only reload if we don't have the saved data
      loadPreferences();
    }
    toast.success('Internship preferences saved successfully!');
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showWizard) {
    return (
      <InternshipPreferencesWizard
        onComplete={handleWizardComplete}
        onCancel={handleWizardCancel}
        initialData={preferences?.preferences}
        isEditing={isEditing}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/pages/student-dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Internship Preferences
                </h1>
                <p className="text-gray-600 mt-1">
                  Set your preferences to help us match you with the perfect internship opportunities.
                </p>
              </div>
            </div>
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {preferences ? (
          /* Existing Preferences */
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Preferences Set
                    </CardTitle>
                    <CardDescription>
                      Last updated: {new Date(preferences.updatedAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Button onClick={handleEditPreferences} className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Edit Preferences
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Profile Completion</span>
                    <span>{preferences.completionPercentage}%</span>
                  </div>
                  <Progress value={preferences.completionPercentage} className="h-2" />
                </div>
                <Badge 
                  variant={preferences.status === 'active' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {preferences.status}
                </Badge>
              </CardContent>
            </Card>

            {/* Preferences Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Industries & Roles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                    Industries & Roles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Industries</p>
                      <div className="flex flex-wrap gap-1">
                        {preferences.preferences.industries?.slice(0, 3).map((industry: string) => (
                          <Badge key={industry} variant="outline" className="text-xs">
                            {industry}
                          </Badge>
                        ))}
                        {preferences.preferences.industries?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{preferences.preferences.industries.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Roles</p>
                      <div className="flex flex-wrap gap-1">
                        {preferences.preferences.roles?.slice(0, 3).map((role: string) => (
                          <Badge key={role} variant="outline" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                        {preferences.preferences.roles?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{preferences.preferences.roles.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location & Duration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Location & Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Locations</p>
                      <div className="flex flex-wrap gap-1">
                        {preferences.preferences.locations?.slice(0, 2).map((location: string) => (
                          <Badge key={location} variant="outline" className="text-xs">
                            {location}
                          </Badge>
                        ))}
                        {preferences.preferences.remoteWork && (
                          <Badge variant="outline" className="text-xs">Remote</Badge>
                        )}
                        {preferences.preferences.locations?.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{preferences.preferences.locations.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Duration</p>
                      <p className="text-sm text-gray-600">
                        {preferences.preferences.duration?.preferred 
                          ? `${preferences.preferences.duration.preferred} months preferred`
                          : 'Not specified'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Salary & Availability */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    Salary & Availability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Salary Range</p>
                      <p className="text-sm text-gray-600">
                        {preferences.preferences.salary?.minimum 
                          ? `${preferences.preferences.salary.currency} ${preferences.preferences.salary.minimum}${
                              preferences.preferences.salary.maximum 
                                ? ` - ${preferences.preferences.salary.maximum}` 
                                : '+'
                            }/month`
                          : 'Not specified'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Availability</p>
                      <p className="text-sm text-gray-600">
                        {preferences.preferences.availability?.immediateStart 
                          ? 'Immediate start'
                          : preferences.preferences.availability?.startDate
                            ? `From ${new Date(preferences.preferences.availability.startDate).toLocaleDateString()}`
                            : 'Not specified'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Code className="w-5 h-5 text-orange-600" />
                    Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Technical Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {preferences.preferences.skills?.technical?.slice(0, 4).map((skill: string) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {preferences.preferences.skills?.technical?.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{preferences.preferences.skills.technical.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Languages</p>
                      <p className="text-sm text-gray-600">
                        {preferences.preferences.skills?.languages?.length > 0
                          ? preferences.preferences.skills.languages.slice(0, 3).join(', ')
                          : 'None specified'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* No Preferences - Call to Action */
          <Card className="text-center py-12">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Settings className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl mb-2">Set Your Internship Preferences</CardTitle>
              <CardDescription className="text-lg max-w-2xl mx-auto">
                Help us find the perfect internship opportunities for you by setting your preferences. 
                This will only take a few minutes and can be updated anytime.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCreatePreferences}
                size="lg"
                className="flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Set My Preferences
              </Button>
              <p className="text-sm text-gray-600 mt-4">
                You can always edit your preferences later
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default withAuth(InternshipPreferencesPage);
