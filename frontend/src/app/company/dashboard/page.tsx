'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  Users,
  Briefcase,
  TrendingUp,
  Calendar,
  FileText,
  Eye,
  UserCheck,
  Plus,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList,
  GraduationCap,
  Settings,
  Edit
} from 'lucide-react';
import Link from 'next/link';
import { CompanyAnalytics, JobPosting, CandidateApplication } from '@/types/company';

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  newApplications: number;
  interviewsScheduled: number;
  hiredCandidates: number;
}

export default function CompanyDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    interviewsScheduled: 0,
    hiredCandidates: 0
  });

  const [recentJobs, setRecentJobs] = useState<JobPosting[]>([]);
  const [recentApplications, setRecentApplications] = useState<CandidateApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch dashboard statistics
      const token = localStorage.getItem('authToken');

      const statsResponse = await fetch('/api/company/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const statsData = await statsResponse.json();

      if (statsData.success) {
        setStats(statsData.data);
      }

      // Fetch recent jobs
      const jobsResponse = await fetch('/api/company/jobs?limit=5&sort=recent', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const jobsData = await jobsResponse.json();

      if (jobsData.success || jobsData.data) {
        setRecentJobs(jobsData.data || jobsData);
      }

      // Fetch recent applications
      const applicationsResponse = await fetch('/api/company/applications?limit=5&sort=recent', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const applicationsData = await applicationsResponse.json();

      if (applicationsData.success) {
        setRecentApplications(applicationsData.data);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusDisplayText = (status: string) => {
    switch (status) {
      case 'submitted': return 'New Application';
      case 'reviewing': return 'Reviewing';
      case 'shortlisted': return 'Shortlisted';
      case 'interview_scheduled': return 'Interview Scheduled';
      case 'offer_extended': return 'Offer Extended';
      case 'rejected': return 'Rejected';
      default: return status.replace('_', ' ');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Company Dashboard</h1>
                <p className="text-sm text-gray-600">Manage your internship programs</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/company/profile">
                <Button variant="outline">
                  <Building2 className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Link href="/company/jobs/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Job
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalJobs}</p>
                  <p className="text-sm text-gray-500">{stats.activeJobs} active</p>
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
                  <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    {stats.newApplications} new
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
                  <p className="text-3xl font-bold text-gray-900">{stats.interviewsScheduled}</p>
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
                  <p className="text-3xl font-bold text-gray-900">{stats.hiredCandidates}</p>
                  <p className="text-sm text-gray-500">this month</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Job Postings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Job Postings</CardTitle>
              <Link href="/company/jobs">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentJobs.length > 0 ? (
                  recentJobs.map((job, index) => (
                    <div key={job._id || job.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600">{job.department} • {job.type}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-500 flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {job.viewsCount} views
                          </span>
                          <span className="text-sm text-gray-500 flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {job.applicationsCount} applications
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No job postings yet</p>
                    <Link href="/company/jobs/create">
                      <Button className="mt-2">
                        Create Your First Job
                      </Button>
                    </Link>
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
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentApplications.length > 0 ? (
                  recentApplications.map((application, index) => (
                    <div key={application.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{application.candidate.name}</h3>
                        <p className="text-sm text-gray-600">{application.candidate.email}</p>
                        <p className="text-sm text-blue-600 font-medium">{application.jobTitle || 'Unknown Position'}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Applied {new Date(application.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusDisplayText(application.status)}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/company/applications/${application.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Application
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No applications yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Applications will appear here once candidates start applying
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company Profile Overview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Company Info */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Company Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Company Name:</span>
                    <span className="font-medium">TechCorp Solutions</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Industry:</span>
                    <span>Technology</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Size:</span>
                    <span>51-200 employees</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Founded:</span>
                    <span>2015</span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span>contact@techcorp.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone:</span>
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Website:</span>
                    <span className="text-blue-600">techcorp.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location:</span>
                    <span>San Francisco, CA</span>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Profile Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Verification Status:</span>
                    <Badge className="bg-green-100 text-green-800">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Profile Completeness:</span>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <Link href="/company/profile">
                    <Button size="sm" className="w-full mt-3">
                      <Edit className="h-4 w-4 mr-2" />
                      Update Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Management */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Management
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

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <Link href="/company/jobs/create">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                  <Plus className="h-6 w-6 mb-2" />
                  Post New Job
                </Button>
              </Link>

              <Link href="/company/applications">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                  <FileText className="h-6 w-6 mb-2" />
                  Review Applications
                </Button>
              </Link>

              <Link href="/company/recruitment/universities">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                  <GraduationCap className="h-6 w-6 mb-2" />
                  Browse Universities
                </Button>
              </Link>

              <Link href="/company/employment/early-requests">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                  <ClipboardList className="h-6 w-6 mb-2" />
                  Early Completion Requests
                </Button>
              </Link>

              <Link href="/company/employment/dashboard">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                  <Users className="h-6 w-6 mb-2" />
                  Employment Management
                </Button>
              </Link>

              <Link href="/company/analytics">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
