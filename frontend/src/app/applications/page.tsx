"use client";

import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Building2,
  MapPin,
  Search,
  Filter,
  Download,
  ExternalLink,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import AppLayout from '@/components/layout/AppLayout';
import { Application } from '@/types/company-job';

interface LegacyApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: {
    id: string;
    name: string;
    logo?: string;
  };
  location: string;
  appliedDate: string;
  status: 'pending' | 'reviewing' | 'interview' | 'rejected' | 'accepted';
  lastUpdate: string;
  notes?: string;
  nextStep?: string;
  interviewDate?: string;
}

const statusConfig = {
  pending: {
    label: 'Application Submitted',
    color: 'bg-blue-100 text-blue-800',
    icon: Clock,
    description: 'Your application has been submitted and is waiting for review.'
  },
  reviewing: {
    label: 'Under Review',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Eye,
    description: 'The hiring team is currently reviewing your application.'
  },
  interview: {
    label: 'Interview Scheduled',
    color: 'bg-purple-100 text-purple-800',
    icon: Calendar,
    description: 'Congratulations! You have been selected for an interview.'
  },
  rejected: {
    label: 'Not Selected',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'Unfortunately, you were not selected for this position.'
  },
  accepted: {
    label: 'Offer Extended',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Congratulations! You have received a job offer.'
  }
};

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/applications');
      const data = await response.json();

      if (data.success) {
        // Fetch job details for each application
        const applicationsWithJobs = await Promise.all(
          data.data.map(async (app: Application) => {
            try {
              const jobResponse = await fetch(`/api/jobs/${app.jobId}`);
              const jobData = await jobResponse.json();
              return {
                ...app,
                job: jobData.success ? jobData.data.job : null
              };
            } catch (error) {
              console.error('Error fetching job details:', error);
              return app;
            }
          })
        );
        setApplications(applicationsWithJobs);
      } else {
        console.error('Failed to fetch applications:', data.error);
        // Fallback to mock data
        setApplications(mockApplications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      // Fallback to mock data
      setApplications(mockApplications);
    } finally {
      setLoading(false);
    }
  };

  // Mock applications data as fallback
  const mockApplications: Application[] = [];

  const filteredApplications = applications.filter(app => {
    const jobTitle = app.job?.title || 'Unknown Job';
    const companyName = app.job?.company?.name || app.job?.name || 'Unknown Company';
    const matchesSearch = jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusCounts = () => {
    return {
      all: applications.length,
      pending: applications.filter(app => app.status === 'pending' || app.status === 'applied').length,
      reviewed: applications.filter(app => app.status === 'reviewed').length,
      interview: applications.filter(app => app.status === 'interview_scheduled' || app.status === 'interview_completed').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      withdrawn: applications.filter(app => app.status === 'withdrawn').length,
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AppLayout user={user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
              <p className="text-gray-600 mt-1">Track your job application status and progress</p>
            </div>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Briefcase className="h-4 w-4" />
              Browse Jobs
            </Link>
          </div>
        </div>


        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              statusFilter === 'all' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white border border-gray-200'
            }`}
            onClick={() => setStatusFilter('all')}
          >
            <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>

          {Object.entries(statusConfig).map(([status, config]) => (
            <div
              key={status}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                statusFilter === status ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white border border-gray-200'
              }`}
              onClick={() => setStatusFilter(status)}
            >
              <div className="text-2xl font-bold text-gray-900">
                {statusCounts[status as keyof typeof statusCounts]}
              </div>
              <div className="text-sm text-gray-600">{config.label}</div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search applications by job title or company"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-5 w-5" />
              More Filters
            </button>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
            <p className="text-gray-600 mb-6">
              {applications.length === 0
                ? "You haven't applied to any jobs yet. Start browsing and applying to positions that interest you!"
                : "No applications match your current search criteria."
              }
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Briefcase className="h-4 w-4" />
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => {
              const statusKey = application.status as keyof typeof statusConfig;
              const statusInfo = statusConfig[statusKey] || statusConfig.pending;
              const StatusIcon = statusInfo.icon;

              const jobTitle = application.job?.title || 'Unknown Job';
              const companyName = application.job?.company?.name || application.job?.name || 'Unknown Company';
              const companyLogo = application.job?.logo || application.job?.company?.logo || '/api/placeholder/40/40';
              const jobLocation = application.job?.location || 'Unknown Location';

              return (
                <div key={application.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <img
                        src={companyLogo}
                        alt={companyName}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link
                              href={`/jobs/${application.jobId}`}
                              className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                            >
                              {jobTitle}
                            </Link>
                            <div className="flex items-center gap-4 mt-1 text-gray-600">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                {companyName}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {jobLocation}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                              <StatusIcon className="h-4 w-4" />
                              {statusInfo.label}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-900">Applied:</span>
                            <p className="text-sm text-gray-600">
                              {new Date(application.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">Last Update:</span>
                            <p className="text-sm text-gray-600">
                              {new Date(application.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          {application.interviewDetails && (
                            <div className="md:col-span-2">
                              <span className="text-sm font-medium text-gray-900">Interview Date:</span>
                              <p className="text-sm text-purple-600 font-medium">
                                {new Date(application.interviewDetails.scheduledDate).toLocaleDateString()} at {new Date(application.interviewDetails.scheduledDate).toLocaleTimeString()}
                              </p>
                            </div>
                          )}
                        </div>

                        {application.feedback && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-900">Feedback:</span>
                            <p className="text-sm text-gray-700 mt-1">{application.feedback}</p>
                          </div>
                        )}

                        <div className="mt-4 flex items-center gap-3">
                          <Link
                            href={`/applications/${application.id}`}
                            className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                          >
                            <Briefcase className="h-3 w-3" />
                            View Application
                          </Link>
                          <Link
                            href={`/jobs/${application.jobId}`}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View Job
                          </Link>
                          <button className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-700 text-sm">
                            <Download className="h-3 w-3" />
                            Download Application
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
