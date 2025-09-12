'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  Search, 
  Filter,
  Eye,
  Download,
  Star,
  Calendar,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { CandidateApplication } from '@/types/company';

export default function CompanyApplicationsPage() {
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<CandidateApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter, jobFilter]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/company/applications');
      const result = await response.json();

      if (result.success) {
        setApplications(result.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Job filter
    if (jobFilter !== 'all') {
      filtered = filtered.filter(app => app.jobId === jobFilter);
    }

    setFilteredApplications(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-purple-100 text-purple-800';
      case 'interview_scheduled': return 'bg-indigo-100 text-indigo-800';
      case 'interview_completed': return 'bg-cyan-100 text-cyan-800';
      case 'offer_extended': return 'bg-green-100 text-green-800';
      case 'offer_accepted': return 'bg-emerald-100 text-emerald-800';
      case 'offer_declined': return 'bg-orange-100 text-orange-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Clock className="h-4 w-4" />;
      case 'reviewing': return <Eye className="h-4 w-4" />;
      case 'shortlisted': return <Star className="h-4 w-4" />;
      case 'interview_scheduled': return <Calendar className="h-4 w-4" />;
      case 'offer_extended': return <CheckCircle className="h-4 w-4" />;
      case 'offer_accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/company/applications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
          reviewerId: 'current-user-id' // In real app, get from auth
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setApplications(prevApps =>
          prevApps.map(app =>
            app.id === applicationId ? result.data : app
          )
        );
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedApplications.length === 0) return;

    try {
      const promises = selectedApplications.map(appId =>
        handleStatusUpdate(appId, action)
      );
      
      await Promise.all(promises);
      setSelectedApplications([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const toggleApplicationSelection = (applicationId: string) => {
    setSelectedApplications(prev =>
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const selectAllApplications = () => {
    if (selectedApplications.length === filteredApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(filteredApplications.map(app => app.id));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
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
                <h1 className="text-xl font-bold text-gray-900">Applications</h1>
                <p className="text-sm text-gray-600">Review and manage candidate applications</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/company/dashboard">
                <Button variant="outline">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Workflow Navigation */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Workflow Management</h3>
                <p className="text-sm text-gray-600">Access advanced workflow tools and analytics</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/company/applications/enhanced-workflow">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Enhanced Workflow
                  </Button>
                </Link>
                <Link href="/company/applications/workflow-dashboard">
                  <Button variant="outline" className="flex items-center gap-2">
                    <MoreHorizontal className="h-4 w-4" />
                    Workflow Dashboard
                  </Button>
                </Link>
                <Link href="/company/applications/workflow">
                  <Button variant="outline" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Standard Workflow
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Bulk Actions */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    placeholder="Search by candidate name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="interview_completed">Interview Completed</option>
                  <option value="offer_extended">Offer Extended</option>
                  <option value="offer_accepted">Offer Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Jobs</option>
                  <option value="job-1">Software Engineering Intern</option>
                  <option value="job-2">Marketing Intern</option>
                  <option value="job-3">Data Science Intern</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedApplications.length > 0 && (
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-blue-900">
                  {selectedApplications.length} application(s) selected
                </span>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('shortlisted')}
                  >
                    Shortlist
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('rejected')}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedApplications([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Applications</p>
                  <p className="text-3xl font-bold text-green-600">
                    {applications.filter(app => app.status === 'submitted').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {applications.filter(app => app.status === 'shortlisted').length}
                  </p>
                </div>
                <Star className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Interviews</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {applications.filter(app => app.status === 'interview_scheduled').length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {/* Select All Header */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
                  onChange={selectAllApplications}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All ({filteredApplications.length} applications)
                </span>
              </div>
            </CardContent>
          </Card>

          {filteredApplications.length > 0 ? (
            filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedApplications.includes(application.id)}
                      onChange={() => toggleApplicationSelection(application.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {application.candidate.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <span className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {application.candidate.email}
                            </span>
                            {application.candidate.phone && (
                              <span className="flex items-center">
                                <Phone className="h-4 w-4 mr-1" />
                                {application.candidate.phone}
                              </span>
                            )}
                            {application.candidate.location && (
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {application.candidate.location}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            {application.candidate.education && (
                              <span className="flex items-center">
                                <GraduationCap className="h-4 w-4 mr-1" />
                                {application.candidate.education}
                              </span>
                            )}
                            {application.candidate.experience && (
                              <span className="flex items-center">
                                <Briefcase className="h-4 w-4 mr-1" />
                                {application.candidate.experience}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(application.status)}>
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(application.status)}
                              <span>{application.status.replace('_', ' ')}</span>
                            </span>
                          </Badge>
                        </div>
                      </div>

                      {/* Skills */}
                      {application.candidate.skills && application.candidate.skills.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {application.candidate.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cover Letter Preview */}
                      {application.coverLetter && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter:</p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {application.coverLetter}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Applied {new Date(application.submittedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Job ID: {application.jobId}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Resume
                          </Button>
                          
                          <Link href={`/company/applications/${application.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </Link>

                          <div className="relative group">
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleStatusUpdate(application.id, 'shortlisted')}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Star className="h-4 w-4 mr-2" />
                                  Shortlist
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(application.id, 'interview_scheduled')}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Schedule Interview
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(application.id, 'rejected')}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-600">
                  {applications.length === 0 
                    ? "No applications have been submitted yet." 
                    : "No applications match your current filters."
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
