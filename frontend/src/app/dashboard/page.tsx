'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { QuickActions } from '@/components/navigation/MainNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Briefcase,
  BookOpen,
  FileText,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Star,
  Award,
  Calendar,
  MapPin,
  ArrowRight,
  Bell,
  Target,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import InternWorkflowIntegration from '@/components/workflow/InternWorkflowIntegration';
import ProfileCompletionWizard from '@/components/profile/ProfileCompletionWizard';
import ProfileCompletionCard from '@/components/profile/ProfileCompletionCard';
import { useAuth } from '@/contexts/auth-context';

export default function Dashboard() {
  const { user } = useAuth();
  const [showProfileWizard, setShowProfileWizard] = useState(false);
  const [internships, setInternships] = useState<any[]>([]);
  const [loadingInternships, setLoadingInternships] = useState(true);

  // Fetch user's internships
  useEffect(() => {
    const fetchInternships = async () => {
      if (!user) return;

      try {
        setLoadingInternships(true);
        const token = localStorage.getItem('authToken');

        if (!token) {
          console.log('No auth token found');
          setInternships([]);
          return;
        }

        const response = await fetch('/api/internships', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (result.success) {
          setInternships(result.data || []);
        } else {
          console.error('Failed to fetch internships:', result.error);
          setInternships([]);
        }
      } catch (error) {
        console.error('Error fetching internships:', error);
        setInternships([]);
      } finally {
        setLoadingInternships(false);
      }
    };

    fetchInternships();
  }, [user]);

  // Helper function to format dates safely
  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'Start TBD';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleProfileComplete = async (profileData: any) => {
    try {
      console.log('Profile completed:', profileData);

      const token = localStorage.getItem('authToken');

      // Handle resume upload first if there's a file
      let resumeUrl = null;
      if (profileData.resume && profileData.resume instanceof File) {
        try {
          const formData = new FormData();
          formData.append('file', profileData.resume);

          const uploadResponse = await fetch('/api/users/resume/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            resumeUrl = uploadResult.data.filePath;
            console.log('Resume uploaded successfully:', resumeUrl);
          } else {
            console.error('Resume upload failed');
            alert('Failed to upload resume, but profile will still be saved.');
          }
        } catch (uploadError) {
          console.error('Resume upload error:', uploadError);
          alert('Failed to upload resume, but profile will still be saved.');
        }
      }

      // Prepare the update data to match your database structure
      const updateData = {
        // Update main profile section
        'profile.bio': profileData.basicInfo?.bio || '',
        'profile.phone': profileData.basicInfo?.phone || '',
        'profile.location': profileData.basicInfo?.location || '',
        'profile.linkedin': profileData.basicInfo?.linkedin || '',
        'profile.github': profileData.basicInfo?.github || '',
        'profile.website': profileData.basicInfo?.website || '',

        // Update student section
        'student.education': profileData.education || [],
        'student.experience': profileData.experience || [],
        'student.skills': profileData.skills || [],
        'student.expectedSalary': profileData.preferences?.expectedSalary || null,
        'student.jobPreferences.jobTypes': profileData.preferences?.jobTypes || [],
        'student.jobPreferences.locations': profileData.preferences?.locations || [],
        'student.jobPreferences.remote': profileData.preferences?.remote || false,
        // Resume is handled separately through the resume upload endpoint

        // Update internship.profile section (for compatibility)
        'internship.profile.profileInformation': {
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          phone: profileData.basicInfo?.phone || '',
          location: profileData.basicInfo?.location || '',
          bio: profileData.basicInfo?.bio || '',
          linkedin: profileData.basicInfo?.linkedin || '',
          github: profileData.basicInfo?.github || ''
        },
        'internship.profile.educationBackground': profileData.education || [],
        'internship.profile.workExperience': profileData.experience || [],
        'internship.profile.certifications': [],
        'internship.profile.interests': [],

        // Update internship.details section
        'internship.details.preferredIndustry': profileData.preferences?.jobTypes || [],
        'internship.details.preferredLocations': profileData.preferences?.locations || [],
        'internship.details.skills': profileData.skills || [],
        'internship.details.salaryRange': {
          min: 15,
          max: 25,
          currency: 'USD',
          period: 'hour',
          isNegotiable: true
        },
        'internship.details.workPreferences': {
          remote: profileData.preferences?.remote || false,
          hybrid: true,
          onSite: true,
          travelWillingness: 'Local'
        }
      };

      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.success) {
        alert('Profile updated successfully!');
        setShowProfileWizard(false);
        // Optionally refresh user data in auth context
        window.location.reload(); // Simple way to refresh user data
      } else {
        alert(`Failed to update profile: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your internship journey overview</p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">6</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Applications</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Interviews</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Offers</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Recent Applications */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Applications</CardTitle>
                <Link href="/applications">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Software Development Intern</p>
                        <p className="text-sm text-gray-600">TechCorp Solutions</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-purple-100 text-purple-800 flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>Interview Scheduled</span>
                      </Badge>
                      <span className="text-sm text-gray-500">Jan 20</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Environmental Research Intern</p>
                        <p className="text-sm text-gray-600">Green Energy Inc</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-green-100 text-green-800 flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>Accepted</span>
                      </Badge>
                      <span className="text-sm text-gray-500">Jan 18</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Marketing Intern</p>
                        <p className="text-sm text-gray-600">Creative Agency</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-yellow-100 text-yellow-800 flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Under Review</span>
                      </Badge>
                      <span className="text-sm text-gray-500">Jan 15</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ongoing Internships */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Ongoing Internships</span>
                </CardTitle>
                <Link href="/internship">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loadingInternships ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : internships.length === 0 ? (
                  <div className="text-center p-8">
                    <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Internships</h3>
                    <p className="text-gray-600 mb-4">You don't have any ongoing internships yet.</p>
                    <Link href="/jobs">
                      <Button>
                        Browse Opportunities
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {internships.slice(0, 3).map((internship) => (
                      <Link key={internship._id} href={`/internships/${internship._id}`}>
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{internship.position || 'Internship'}</p>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <MapPin className="h-3 w-3" />
                                <span>{internship.location || 'Location TBD'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <Badge
                                className={`${
                                  internship.internshipStatus === 'ongoing' || internship.internshipStatus === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : internship.internshipStatus === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                } flex items-center space-x-1`}
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span className="capitalize">{internship.internshipStatus || 'active'}</span>
                              </Badge>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>
                                  {formatDate(internship.startDate)}
                                  {internship.endDate && ` - ${formatDate(internship.endDate)}`}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <ProfileCompletionCard
              showDetails={true}
              onSectionClick={(section) => {
                if (section === 'basic' || section === 'profile') {
                  setShowProfileWizard(true);
                }
              }}
            />

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Upcoming Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Interview with TechCorp Solutions</p>
                      <p className="text-xs text-gray-600">Feb 5 at 2:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-red-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Application Deadline</p>
                      <p className="text-xs text-gray-600">Feb 8 at 11:59 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-green-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Onboarding - Green Energy Inc</p>
                      <p className="text-xs text-gray-600">Jun 1 at 9:00 AM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Saved Jobs</span>
                    </div>
                    <span className="font-medium">12</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Companies Viewed</span>
                    </div>
                    <span className="font-medium">24</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Avg. Response Time</span>
                    </div>
                    <span className="font-medium">5 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Workflow Integration */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Internship Journey</h2>
          <InternWorkflowIntegration />
        </div>
      </div>

      {/* Profile Completion Wizard */}
      {user && (
        <ProfileCompletionWizard
          isOpen={showProfileWizard}
          onClose={() => setShowProfileWizard(false)}
          user={user}
          onComplete={handleProfileComplete}
        />
      )}
    </AppLayout>
  );
}
