'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Calendar,
  MapPin,
  Building2,
  Briefcase,
  Clock,
  Star,
  Heart,
  Eye,
  MoreHorizontal,
  Download,
  Share,
  Bookmark,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import { Application, Job, Company } from '@/types/company-job';
import AdvancedFilters, { FilterState } from './AdvancedFilters';

interface InternManagementProps {
  view: 'ongoing' | 'shared' | 'complete' | 'terminated';
  className?: string;
}

interface ManagementFilters extends FilterState {
  sortBy: 'date' | 'status' | 'company' | 'title';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
}

export default function InternManagementInterface({ view, className = '' }: InternManagementProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ManagementFilters>({
    search: '',
    status: [],
    companies: [],
    locations: [],
    dateRange: {},
    salaryRange: {},
    applicationDate: {},
    jobTypes: [],
    experienceLevels: [],
    skills: [],
    sortBy: 'date',
    sortOrder: 'desc',
    viewMode: 'grid'
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, [view, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch applications based on view type
      const applicationsResponse = await fetch('/api/applications');
      const applicationsData = await applicationsResponse.json();

      if (applicationsData.success) {
        let filteredApplications = applicationsData.data;

        // Filter by view type
        switch (view) {
          case 'ongoing':
            filteredApplications = filteredApplications.filter((app: Application) =>
              ['applied', 'reviewed', 'interview_scheduled', 'interview_completed'].includes(app.status)
            );
            break;
          case 'complete':
            filteredApplications = filteredApplications.filter((app: Application) =>
              app.status === 'accepted'
            );
            break;
          case 'terminated':
            filteredApplications = filteredApplications.filter((app: Application) =>
              ['rejected', 'withdrawn'].includes(app.status)
            );
            break;
          case 'shared':
            // For shared view, we might want to show saved/liked items
            break;
        }

        setApplications(filteredApplications);
      }

      // Fetch jobs and companies for additional data
      const [jobsResponse, companiesResponse] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/companies')
      ]);

      const jobsData = await jobsResponse.json();
      const companiesData = await companiesResponse.json();

      if (jobsData.success) setJobs(jobsData.data);
      if (companiesData.success) setCompanies(companiesData.data);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getViewTitle = () => {
    switch (view) {
      case 'ongoing':
        return 'Ongoing Applications';
      case 'shared':
        return 'Shared & Saved Items';
      case 'complete':
        return 'Completed Applications';
      case 'terminated':
        return 'Terminated Applications';
      default:
        return 'Intern Management';
    }
  };

  const getViewDescription = () => {
    switch (view) {
      case 'ongoing':
        return 'Track your active job applications and their progress';
      case 'shared':
        return 'Manage your saved jobs and companies';
      case 'complete':
        return 'View your successful applications and offers';
      case 'terminated':
        return 'Review applications that were not successful';
      default:
        return 'Manage your internship journey';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'interview_scheduled':
      case 'interview_completed':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'withdrawn':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
      case 'withdrawn':
        return <XCircle className="h-4 w-4" />;
      case 'interview_scheduled':
      case 'interview_completed':
        return <Users className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleFilterChange = (key: keyof ManagementFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSort = (sortBy: ManagementFilters['sortBy']) => {
    const newOrder = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: newOrder
    }));
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {applications.map((application) => (
        <Card key={application.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  {application.job?.logo ? (
                    <img
                      src={application.job.logo}
                      alt="Company logo"
                      className="h-8 w-8 object-contain"
                    />
                  ) : (
                    <Building2 className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {application.job?.title || 'Unknown Job'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {application.job?.company?.name || application.job?.name || 'Unknown Company'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="p-1">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{application.job?.location || 'Unknown Location'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Applied {formatDate(application.submittedAt)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge className={`${getStatusColor(application.status)} flex items-center space-x-1`}>
                {getStatusIcon(application.status)}
                <span className="capitalize">{application.status.replace('_', ' ')}</span>
              </Badge>

              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" className="p-1">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-1">
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {applications.map((application) => (
        <Card key={application.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  {application.job?.logo ? (
                    <img
                      src={application.job.logo}
                      alt="Company logo"
                      className="h-8 w-8 object-contain"
                    />
                  ) : (
                    <Building2 className="h-6 w-6 text-gray-400" />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {application.job?.title || 'Unknown Job'}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Building2 className="h-4 w-4" />
                      <span>{application.job?.company?.name || application.job?.name || 'Unknown Company'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{application.job?.location || 'Unknown Location'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Applied {formatDate(application.submittedAt)}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Badge className={`${getStatusColor(application.status)} flex items-center space-x-1`}>
                  {getStatusIcon(application.status)}
                  <span className="capitalize">{application.status.replace('_', ' ')}</span>
                </Badge>

                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="p-1">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1">
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getViewTitle()}</h1>
          <p className="text-gray-600 mt-1">{getViewDescription()}</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={filters.viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('viewMode', 'grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={filters.viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('viewMode', 'list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search applications, jobs, or companies..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort(filters.sortBy)}
              >
                {filters.sortOrder === 'asc' ? (
                  <SortAsc className="h-4 w-4 mr-2" />
                ) : (
                  <SortDesc className="h-4 w-4 mr-2" />
                )}
                Sort
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters Modal */}
      <AdvancedFilters
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        filters={filters}
        onFiltersChange={(newFilters) => setFilters({ ...filters, ...newFilters })}
        onApplyFilters={() => {}}
        onClearFilters={() => {}}
      />

      {/* Content */}
      {applications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {view} applications found
            </h3>
            <p className="text-gray-600">
              {view === 'ongoing' && "You don't have any active applications yet."}
              {view === 'complete' && "You haven't completed any applications yet."}
              {view === 'terminated' && "No terminated applications to show."}
              {view === 'shared' && "You haven't saved any items yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {filters.viewMode === 'grid' ? renderGridView() : renderListView()}
        </>
      )}
    </div>
  );
}
