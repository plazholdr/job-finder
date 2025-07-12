'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Calendar, 
  Clock,
  Video,
  MapPin,
  User,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  MoreHorizontal,
  Phone,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { Interview } from '@/types/company';

export default function CompanyInterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  useEffect(() => {
    fetchInterviews();
  }, []);

  useEffect(() => {
    filterInterviews();
  }, [interviews, searchTerm, statusFilter, typeFilter, dateFilter]);

  const fetchInterviews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/company/interviews');
      const result = await response.json();

      if (result.success) {
        setInterviews(result.data);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterInterviews = () => {
    let filtered = [...interviews];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(interview =>
        interview.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.interviewer.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(interview => interview.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(interview => interview.type === typeFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      filtered = filtered.filter(interview => {
        const interviewDate = new Date(interview.scheduledAt);
        switch (dateFilter) {
          case 'today':
            return interviewDate.toDateString() === today.toDateString();
          case 'tomorrow':
            return interviewDate.toDateString() === tomorrow.toDateString();
          case 'this_week':
            return interviewDate >= today && interviewDate <= nextWeek;
          case 'past':
            return interviewDate < today;
          default:
            return true;
        }
      });
    }

    setFilteredInterviews(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-orange-100 text-orange-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Calendar className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'rescheduled': return <AlertCircle className="h-4 w-4" />;
      case 'no_show': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'in_person': return <MapPin className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = async (interviewId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/company/interviews/${interviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const result = await response.json();
        setInterviews(prevInterviews =>
          prevInterviews.map(interview =>
            interview.id === interviewId ? result.data : interview
          )
        );
      }
    } catch (error) {
      console.error('Error updating interview status:', error);
    }
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date));
  };

  const isUpcoming = (date: Date) => {
    return new Date(date) > new Date();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interviews...</p>
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
                <h1 className="text-xl font-bold text-gray-900">Interviews</h1>
                <p className="text-sm text-gray-600">Schedule and manage candidate interviews</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/company/dashboard">
                <Button variant="outline">
                  Back to Dashboard
                </Button>
              </Link>
              <Link href="/company/interviews/schedule">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Interview
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    placeholder="Search by candidate or interviewer name..."
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
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="no_show">No Show</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Types</option>
                  <option value="video">Video Call</option>
                  <option value="phone">Phone Call</option>
                  <option value="in_person">In Person</option>
                </select>

                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="this_week">This Week</option>
                  <option value="past">Past</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Interviews</p>
                  <p className="text-3xl font-bold text-gray-900">{interviews.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {interviews.filter(interview => interview.status === 'scheduled').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-green-600">
                    {interviews.filter(interview => interview.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {interviews.filter(interview => 
                      new Date(interview.scheduledAt).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interviews List */}
        <div className="space-y-6">
          {filteredInterviews.length > 0 ? (
            filteredInterviews.map((interview) => (
              <Card key={interview.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Interview with {interview.candidate.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDateTime(interview.scheduledAt)}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {interview.duration} minutes
                            </span>
                            <span className="flex items-center">
                              {getTypeIcon(interview.type)}
                              <span className="ml-1 capitalize">{interview.type.replace('_', ' ')}</span>
                            </span>
                            <span className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {interview.interviewer.name}
                            </span>
                          </div>
                          
                          {interview.location && (
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <MapPin className="h-4 w-4 mr-1" />
                              {interview.location}
                            </div>
                          )}

                          {interview.meetingLink && (
                            <div className="flex items-center text-sm text-blue-600 mb-2">
                              <Video className="h-4 w-4 mr-1" />
                              <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                Join Meeting
                              </a>
                            </div>
                          )}

                          {interview.notes && (
                            <p className="text-gray-700 text-sm mb-3 line-clamp-2">{interview.notes}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge className={getStatusColor(interview.status)}>
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(interview.status)}
                              <span>{interview.status.replace('_', ' ')}</span>
                            </span>
                          </Badge>
                          {isUpcoming(interview.scheduledAt) && (
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                              Upcoming
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Job: {interview.jobTitle}</span>
                          <span>•</span>
                          <span>Application ID: {interview.applicationId}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link href={`/company/interviews/${interview.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                          
                          {interview.status === 'scheduled' && (
                            <Link href={`/company/interviews/${interview.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            </Link>
                          )}

                          <div className="relative group">
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <div className="py-1">
                                {interview.status === 'scheduled' && (
                                  <>
                                    <button
                                      onClick={() => handleStatusUpdate(interview.id, 'in_progress')}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <Clock className="h-4 w-4 mr-2" />
                                      Start Interview
                                    </button>
                                    <button
                                      onClick={() => handleStatusUpdate(interview.id, 'rescheduled')}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <Calendar className="h-4 w-4 mr-2" />
                                      Reschedule
                                    </button>
                                    <button
                                      onClick={() => handleStatusUpdate(interview.id, 'cancelled')}
                                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Cancel
                                    </button>
                                  </>
                                )}
                                
                                {interview.status === 'in_progress' && (
                                  <button
                                    onClick={() => handleStatusUpdate(interview.id, 'completed')}
                                    className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark Complete
                                  </button>
                                )}
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
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No interviews found</h3>
                <p className="text-gray-600 mb-6">
                  {interviews.length === 0 
                    ? "No interviews have been scheduled yet." 
                    : "No interviews match your current filters."
                  }
                </p>
                {interviews.length === 0 && (
                  <Link href="/company/interviews/schedule">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Your First Interview
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
