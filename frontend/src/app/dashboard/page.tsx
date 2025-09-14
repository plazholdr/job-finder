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
  GraduationCap,
  Plus,
  Eye,
  MoreHorizontal,
  UserCheck,
  ArrowUpRight,
  Edit,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import InternWorkflowIntegration from '@/components/workflow/InternWorkflowIntegration';
import ProfileCompletionWizard from '@/components/profile/ProfileCompletionWizard';
import ProfileCompletionCard from '@/components/profile/ProfileCompletionCard';
import { useAuth } from '@/contexts/auth-context';
import dynamic from 'next/dynamic';

const CompanyEssentialsModal = dynamic(() => import('@/components/company/CompanyEssentialsModal'), { ssr: false });

export default function Dashboard() {
  const { user } = useAuth();
  const [showProfileWizard, setShowProfileWizard] = useState(false);
  const [internships, setInternships] = useState<any[]>([]);
  const [loadingInternships, setLoadingInternships] = useState(true);

  // Company dashboard state (when user.role === 'company')
  const [companyStats, setCompanyStats] = useState<any>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    interviewsScheduled: 0,
    hiredCandidates: 0,
  });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [showEssentials, setShowEssentials] = useState(false);

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

  // Company dashboard data
  useEffect(() => {
    if (!user || user.role !== 'company') return;

    const fetchCompany = async () => {
      try {
        setLoadingCompany(true);
        const token = localStorage.getItem('authToken');
        // Show essentials modal if approved/verified but essentials not provided
        if (user?.company?.approvalStatusCode === 1 && !user?.company?.inputEssentials) {
          setShowEssentials(true);
        }

        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        // NOTE: In production, /api/* is proxied by Nginx directly to the backend.
        // Use backend paths here to avoid hitting non-existent Next API routes.
        const [statsRes, jobsRes, appsRes] = await Promise.all([
          fetch('/api/applications/stats/company', { headers }),
          fetch('/api/jobs?$limit=5', { headers }),
          fetch('/api/applications?$limit=5', { headers }),
        ]);

        const statsData = await statsRes.json().catch(() => ({}));
        // Backend returns plain stats object; accept either {success,data} or plain object
        if (statsData?.success && statsData.data) {
          setCompanyStats(statsData.data);
        } else if (statsData && !statsData.error) {
          setCompanyStats(statsData);
        }

        const jobsData = await jobsRes.json().catch(() => ([]));
        const jobsArr = Array.isArray(jobsData?.data)
          ? jobsData.data
          : Array.isArray(jobsData)
          ? jobsData
          : [];
        setRecentJobs(jobsArr);

        const appsData = await appsRes.json().catch(() => ([]));
        const appsArr = Array.isArray(appsData?.data)
          ? appsData.data
          : Array.isArray(appsData)
          ? appsData
          : [];
        setRecentApplications(appsArr);
      } catch (e) {
        console.error('Error loading company dashboard:', e);
      } finally {
        setLoadingCompany(false);
      }
    };

    fetchCompany();
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

  // Helpers for company statuses
  const companyStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'submitted': return 'bg-green-100 text-green-800';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-purple-100 text-purple-800';
      case 'interview_scheduled': return 'bg-indigo-100 text-indigo-800';
      case 'offer_extended': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const companyStatusText = (status: string) => {
    switch (status) {
      case 'submitted': return 'New Application';
      case 'reviewing': return 'Reviewing';
      case 'shortlisted': return 'Shortlisted';
      case 'interview_scheduled': return 'Interview Scheduled';
      case 'offer_extended': return 'Offer Extended';
      case 'rejected': return 'Rejected';
      default: return (status || '').replace('_', ' ');
    }
  };

  // If company, render company dashboard within the same layout/template
  if (user?.role === 'company') {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Manage your hiring at a glance</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                    <p className="text-3xl font-bold text-gray-900">{companyStats.totalJobs}</p>
                    <p className="text-sm text-gray-500">{companyStats.activeJobs} active</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Applications</p>
                    <p className="text-3xl font-bold text-gray-900">{companyStats.totalApplications}</p>
                    <p className="text-sm text-green-600 flex items-center">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      {companyStats.newApplications} new
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Interviews</p>
                    <p className="text-3xl font-bold text-gray-900">{companyStats.interviewsScheduled}</p>
                    <p className="text-sm text-gray-500">scheduled</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hired</p>
                    <p className="text-3xl font-bold text-gray-900">{companyStats.hiredCandidates}</p>
                    <p className="text-sm text-gray-500">this month</p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Job Postings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Job Postings</CardTitle>
                <Link href="/company/jobs">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentJobs.length > 0 ? (
                    recentJobs.map((job: any, idx: number) => (
                      <div key={job._id || job.id || idx} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-600">{job.department} • {job.type}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-500 flex items-center">
                              <Eye className="h-4 w-4 mr-1" />{job.viewsCount} views
                            </span>
                            <span className="text-sm text-gray-500 flex items-center">
                              <Users className="h-4 w-4 mr-1" />{job.applicationsCount} applications
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={companyStatusColor(job.status)}>{job.status}</Badge>
                          <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No job postings yet</p>
                      <Link href="/company/jobs/create"><Button className="mt-2">Create Your First Job</Button></Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Applications</CardTitle>
                <Link href="/company/applications">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentApplications.length > 0 ? (
                    recentApplications.map((application: any, idx: number) => (
                      <div key={application.id || idx} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{application.candidate?.name}</h3>
                          <p className="text-sm text-gray-600">{application.candidate?.email}</p>
                          <p className="text-sm text-blue-600 font-medium">{application.jobTitle || 'Unknown Position'}</p>
                          <p className="text-sm text-gray-500 mt-1">Applied {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : ''}</p>
                        </div>
                        <Badge className={companyStatusColor(application.status)}>
                          {companyStatusText(application.status)}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No applications yet</p>
                      <p className="text-sm text-gray-500 mt-1">Applications will appear once candidates start applying</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Company Management */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" /> Company Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/company/profile">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-300">
                    <Edit className="h-6 w-6 mb-2 text-blue-600" />
                    <span className="text-sm font-medium">Manage Profile</span>
                    <span className="text-xs text-gray-500">Edit company information</span>
                  </Button>
                </Link>
                <Link href="/company/settings">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center hover:bg-green-50 hover:border-green-300">
                    <Settings className="h-6 w-6 mb-2 text-green-600" />
                    <span className="text-sm font-medium">Settings</span>
                    <span className="text-xs text-gray-500">Account & preferences</span>
                  </Button>
                </Link>
                <Link href="/company/verification">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center hover:bg-purple-50 hover:border-purple-300">
                    <UserCheck className="h-6 w-6 mb-2 text-purple-600" />
                    <span className="text-sm font-medium">Verification</span>
                    <span className="text-xs text-gray-500">Company verification status</span>
                  </Button>
                </Link>
                <Link href="/companies">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center hover:bg-orange-50 hover:border-orange-300">
                    <Eye className="h-6 w-6 mb-2 text-orange-600" />
                    <span className="text-sm font-medium">View Public Profile</span>
                    <span className="text-xs text-gray-500">See how others see you</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Essentials modal */}
        <CompanyEssentialsModal open={showEssentials} onOpenChange={setShowEssentials} />
      </AppLayout>
    );
  }

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
