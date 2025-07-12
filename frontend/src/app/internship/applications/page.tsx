"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { withAuth } from '@/contexts/auth-context';
import {
  ArrowLeft,
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
  AlertCircle,
  FileText,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import type { InternshipApplication } from '@/types/internship';

function InternshipApplications() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock applications data
  const applications: InternshipApplication[] = [
    {
      id: 'app-1',
      internshipId: '1',
      applicantId: user?.id || '',
      status: 'interview',
      submittedAt: '2024-01-20T10:00:00Z',
      lastUpdated: '2024-01-25T14:30:00Z',
      coverLetter: 'I am excited to apply for the Software Engineering Intern position...',
      interviewSchedule: [
        {
          id: 'int-1',
          type: 'video',
          scheduledDate: '2024-02-01T15:00:00Z',
          duration: 60,
          meetingLink: 'https://zoom.us/j/123456789',
          interviewer: {
            name: 'Sarah Johnson',
            title: 'Engineering Manager',
            email: 'sarah.johnson@techcorp.com'
          },
          status: 'scheduled',
          notes: 'Technical interview focusing on JavaScript and React'
        }
      ],
      feedback: [
        {
          id: 'fb-1',
          stage: 'Application Review',
          feedback: 'Strong technical background and relevant coursework. Good fit for the role.',
          rating: 4,
          providedBy: 'HR Team',
          providedAt: '2024-01-22T09:00:00Z'
        }
      ]
    },
    {
      id: 'app-2',
      internshipId: '2',
      applicantId: user?.id || '',
      status: 'under_review',
      submittedAt: '2024-01-18T16:30:00Z',
      lastUpdated: '2024-01-18T16:30:00Z',
      coverLetter: 'I am passionate about digital marketing and would love to contribute...',
      feedback: []
    },
    {
      id: 'app-3',
      internshipId: '3',
      applicantId: user?.id || '',
      status: 'accepted',
      submittedAt: '2024-01-15T11:15:00Z',
      lastUpdated: '2024-01-28T10:00:00Z',
      coverLetter: 'As a data science student with experience in Python and machine learning...',
      feedback: [
        {
          id: 'fb-2',
          stage: 'Final Decision',
          feedback: 'Excellent technical skills and strong analytical thinking. Welcome to the team!',
          rating: 5,
          providedBy: 'Data Science Team Lead',
          providedAt: '2024-01-28T10:00:00Z'
        }
      ]
    },
    {
      id: 'app-4',
      internshipId: '4',
      applicantId: user?.id || '',
      status: 'rejected',
      submittedAt: '2024-01-12T14:20:00Z',
      lastUpdated: '2024-01-26T09:30:00Z',
      coverLetter: 'I am interested in the UX Design Intern position...',
      feedback: [
        {
          id: 'fb-3',
          stage: 'Portfolio Review',
          feedback: 'Portfolio shows potential but needs more diverse projects. Encourage to apply again next cycle.',
          rating: 3,
          providedBy: 'Design Team',
          providedAt: '2024-01-26T09:30:00Z'
        }
      ]
    }
  ];

  // Mock internship details for display
  const internshipDetails = {
    '1': { title: 'Software Engineering Intern', company: 'TechCorp Inc.', location: 'San Francisco, CA' },
    '2': { title: 'Marketing Intern', company: 'GrowthCo', location: 'New York, NY' },
    '3': { title: 'Data Science Intern', company: 'DataInsights Corp', location: 'Austin, TX' },
    '4': { title: 'UX Design Intern', company: 'DesignStudio', location: 'Seattle, WA' }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'under_review':
        return <Eye className="h-5 w-5 text-blue-600" />;
      case 'interview':
        return <MessageSquare className="h-5 w-5 text-purple-600" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'under_review':
        return 'Under Review';
      case 'interview':
        return 'Interview Scheduled';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Not Selected';
      default:
        return status;
    }
  };

  const filteredApplications = applications.filter(app => {
    const internship = internshipDetails[app.internshipId as keyof typeof internshipDetails];
    const matchesSearch = !searchQuery || 
      internship?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internship?.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/internship"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
              <p className="mt-2 text-gray-600">
                Track the status of your internship applications
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="interview">Interview</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredApplications.length} applications
            </h2>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'You haven\'t applied to any internships yet'
                }
              </p>
              <Link
                href="/internship/opportunities"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Briefcase className="h-4 w-4" />
                Browse Opportunities
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => {
                const internship = internshipDetails[application.internshipId as keyof typeof internshipDetails];
                const hasInterview = application.interviewSchedule && application.interviewSchedule.length > 0;
                const nextInterview = hasInterview ? application.interviewSchedule[0] : null;
                
                return (
                  <div key={application.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {internship?.title}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                                {getStatusText(application.status)}
                              </span>
                            </div>
                            
                            <p className="text-lg text-gray-700 mb-2">{internship?.company}</p>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {internship?.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Applied {new Date(application.submittedAt!).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Updated {new Date(application.lastUpdated).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Interview Information */}
                            {hasInterview && nextInterview && (
                              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <MessageSquare className="h-5 w-5 text-purple-600" />
                                  <h4 className="font-medium text-purple-900">Upcoming Interview</h4>
                                </div>
                                <div className="text-sm text-purple-800">
                                  <p><strong>Date:</strong> {new Date(nextInterview.scheduledDate).toLocaleString()}</p>
                                  <p><strong>Duration:</strong> {nextInterview.duration} minutes</p>
                                  <p><strong>Type:</strong> {nextInterview.type}</p>
                                  <p><strong>Interviewer:</strong> {nextInterview.interviewer.name} ({nextInterview.interviewer.title})</p>
                                  {nextInterview.meetingLink && (
                                    <div className="mt-2">
                                      <a
                                        href={nextInterview.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-purple-700 hover:text-purple-900"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                        Join Meeting
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Latest Feedback */}
                            {application.feedback && application.feedback.length > 0 && (
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText className="h-5 w-5 text-gray-600" />
                                  <h4 className="font-medium text-gray-900">Latest Feedback</h4>
                                </div>
                                <div className="text-sm text-gray-700">
                                  <p><strong>Stage:</strong> {application.feedback[application.feedback.length - 1].stage}</p>
                                  <p className="mt-1">{application.feedback[application.feedback.length - 1].feedback}</p>
                                  <p className="mt-1 text-gray-500">
                                    — {application.feedback[application.feedback.length - 1].providedBy}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusIcon(application.status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        Application ID: {application.id}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/internship/applications/${application.id}`}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          View Details
                        </Link>
                        {application.status === 'accepted' && (
                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            Accept Offer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(InternshipApplications);
