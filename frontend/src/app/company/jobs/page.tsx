'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import config from '@/config';
import {
  Building2,
  Briefcase,
  Plus,
  Search,
  Filter,
  Eye,
  Users,
  Edit,
  MoreHorizontal,
  MapPin,
  Calendar,
  DollarSign,
  Trash2,
  Copy,
  Pause,
  Play,
  Send,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import AppHeader from '@/components/layout/AppHeader';
import { useRouter } from 'next/navigation';

// Updated Job interface to match backend structure
interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  remoteWork: boolean;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
    certifications: string[];
  };
  salary: {
    minimum: number | null;
    maximum: number | null;
    currency: string;
    negotiable: boolean;
    type: string;
  };
  duration: {
    months: number | null;
    startDate: string | null;
    endDate: string | null;
    flexible: boolean;
  };
  attachments: any[];
  status: 'Draft' | 'Pending' | 'Active' | 'Closed' | 'Rejected';
  views: number;
  applications: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
  expiredAt?: string | null;
}

export default function CompanyJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('draft');
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, activeTab]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${config.api.baseUrl}/jobs?$limit=100&$sort=${encodeURIComponent(JSON.stringify({ createdAt: -1 }))}`, { headers });
      const result = await response.json().catch(() => ({}));

      // Normalize list shape: support Feathers pagination style and plain arrays
      const list = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);

      if (Array.isArray(list)) {
        setJobs(list as Job[]);
      } else {
        console.error('Unexpected jobs API response:', result);
        setJobs([]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(job =>
        (job?.title || '').toLowerCase().includes(q) ||
        (job?.description || '').toLowerCase().includes(q)
      );
    }

    // Tab-based status filter
    const statusMap = {
      'draft': 'Draft',
      'pending': 'Pending',
      'approved': 'Active',
      'rejected': 'Rejected'
    };

    const targetStatus = statusMap[activeTab];
    if (targetStatus) {
      filtered = filtered.filter(job => job.status === targetStatus);
    }

    setFilteredJobs(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Closed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircle className="h-4 w-4" />;
      case 'Draft': return <Edit className="h-4 w-4" />;
      case 'Pending': return <Clock className="h-4 w-4" />;
      case 'Rejected': return <XCircle className="h-4 w-4" />;
      case 'Closed': return <Pause className="h-4 w-4" />;
      default: return <Edit className="h-4 w-4" />;
    }
  };

  const handleAmendAndEdit = async (jobId: string) => {
    try {
      setIsSubmitting(jobId);
      const token = localStorage.getItem('authToken');
      const resp = await fetch(`${config.api.baseUrl}/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'Draft' })
      });
      if (resp.ok) {
        router.push(`/company/jobs/${jobId}/edit`);
      } else {
        console.error('Failed to move job to Draft for amendment');
      }
    } catch (e) {
      console.error('Error amending job:', e);
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleRequestApproval = async (jobId: string) => {
    try {
      setIsSubmitting(jobId);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.api.baseUrl}/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'Pending' }),
      });

      if (response.ok) {
        // Update local state
        setJobs(prevJobs =>
          prevJobs.map(job =>
            job._id === jobId ? { ...job, status: 'Pending' as any } : job
          )
        );
        // Switch to pending tab to show the updated job
        setActiveTab('pending');
      } else {
        console.error('Failed to request approval');
      }
    } catch (error) {

      console.error('Error requesting approval:', error);
    } finally {
      setIsSubmitting(null);
    }
  };



  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.api.baseUrl}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));

      }
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const handleDuplicateJob = async (job: Job) => {
    try {
      const duplicatedJob = {
        ...job,
        title: `${job.title} (Copy)`,
        status: 'Draft'
      };
      // Remove the _id field so backend creates a new one
      delete duplicatedJob._id;

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.api.baseUrl}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,

        },
        body: JSON.stringify(duplicatedJob),
      });

      const result = await response.json();
      if (result.success) {
        setJobs(prevJobs => [result.data, ...prevJobs]);
        // Switch to draft tab to show the duplicated job
        setActiveTab('draft');
      }
    } catch (error) {
      console.error('Error duplicating job:', error);
    }
  };


  const handleRenew = async (jobId: string) => {
    try {
      setIsSubmitting(jobId);
      const token = localStorage.getItem('authToken');
      const resp = await fetch(`${config.api.baseUrl}/jobs/${jobId}/renew`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error('Failed to renew job');
      await fetchJobs();
    } catch (e) {
      console.error('Error renewing job', e);
    } finally {
      setIsSubmitting(null);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      {/* Main Content */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
            <p className="text-sm text-gray-600">Manage your internship opportunities</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex rounded-md border overflow-hidden">
              <button
                className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                List
              </button>
              <button
                className={`px-3 py-2 text-sm border-l ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                Grid
              </button>
            </div>
            <Link href="/company/jobs/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Job
              </Button>
            </Link>
          </div>
        </div>
        {/* Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                placeholder="Search jobs by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Job Status */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="draft" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Draft ({jobs.filter(job => job.status === 'Draft').length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Approval ({jobs.filter(job => job.status === 'Pending').length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Approved ({jobs.filter(job => job.status === 'Active').length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Rejected ({jobs.filter(job => job.status === 'Rejected').length})
            </TabsTrigger>
          </TabsList>

          {/* Tab Content with Stats */}
          <TabsContent value={activeTab} className="space-y-6">
            {/* Stats for current tab */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                      <p className="text-3xl font-bold text-gray-900">{filteredJobs.length}</p>
                    </div>
                    <Briefcase className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                      <p className="text-3xl font-bold text-green-600">
                        {jobs.filter(job => job.status === 'Active').length}
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
                      <p className="text-sm font-medium text-gray-600">Total Applications</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {jobs.reduce((sum, job) => sum + (job.applications || 0), 0)}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Views</p>
                      <p className="text-3xl font-bold text-orange-600">
                        {jobs.reduce((sum, job) => sum + (job.views || 0), 0)}
                      </p>
                    </div>
                    <Eye className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Jobs List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => {
                  const min = job?.salary?.minimum;
                  const max = job?.salary?.maximum;
                  const currency = job?.salary?.currency || 'MYR';
                  const type = job?.salary?.type || 'month';
                  const created = job?.createdAt ? new Date(job.createdAt).toLocaleDateString() : '';
                  const description = job?.description || '';
                  const location = job?.remoteWork ? 'Remote' : (job?.location || 'Location not specified');

                  return (
                    <Card key={job._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title || 'Untitled job'}</h3>
                                {job.expiresAt && (
                                  <div className="mb-2">
                                    {(() => {
                                      const ms = new Date(job.expiresAt as any).getTime() - Date.now();
                                      const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
                                      if (days <= 0) return (<Badge variant="destructive">Expired</Badge>);
                                      if (days <= 7) return (<Badge variant="secondary">Expires in {days} day{days === 1 ? '' : 's'}</Badge>);
                                      return null;
                                    })()}
                                  </div>
                                )}

                                <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600 mb-3">
                                  <span className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {location}
                                  </span>
                                  <span className="flex items-center">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    {min != null && max != null ? `${currency} ${min}-${max}/${type}` : 'Salary not specified'}
                                  </span>
                                  {created && (
                                    <span className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-1" />
                                      {created}
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-700 mb-4 line-clamp-2">{description}</p>
                              </div>

                              <div className="flex items-center space-x-2 ml-4">
                                <Badge className={`${getStatusColor(job.status)} flex items-center gap-1`}>
                                  {getStatusIcon(job.status)}
                                  {job.status || 'Draft'}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-6 text-sm text-gray-600">
                                <span className="flex items-center">
                                  <Eye className="h-4 w-4 mr-1" />
                                  {job?.views || 0} views
                                </span>
                                <span className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {job?.applications || 0} applications
                                </span>
                              </div>

                              <div className="flex items-center space-x-2">
                                {/* View Button - Always available */}
                                <Link href={`/company/jobs/${job._id}`}>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </Button>
                                </Link>

                                {/* Amend and Edit - For Rejected jobs: move to Draft then open editor */}
                                {job.status === 'Rejected' && (
                                  <Button
                                    onClick={() => handleAmendAndEdit(job._id)}
                                    disabled={isSubmitting === job._id}
                                    size="sm"
                                    className="bg-orange-600 hover:bg-orange-700 text-white"
                                  >
                                    {isSubmitting === job._id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    ) : (
                                      <Edit className="h-4 w-4 mr-2" />
                                    )}
                                    Amend & Edit
                                  </Button>
                                )}

                                {/* Applications Button - Only for Active jobs */}
                                {/* Renewal Button - Active jobs expiring within 7 days */}
                                {job.status === 'Active' && job.expiresAt && (() => {
                                  const msLeft = new Date(job.expiresAt as any).getTime() - Date.now();
                                  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
                                  return daysLeft <= 7 ? (
                                    <Button
                                      onClick={() => handleRenew(job._id)}
                                      disabled={isSubmitting === job._id}
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      {isSubmitting === job._id ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      ) : (
                                        <Clock className="h-4 w-4 mr-2" />
                                      )}
                                      Renew (+30d)
                                    </Button>
                                  ) : null;
                                })()}

                                {job.status === 'Active' && (!job.expiresAt || new Date(job.expiresAt as any).getTime() > Date.now()) && (
                                  <Link href={`/company/jobs/${job._id}/applications`}>
                                    <Button variant="outline" size="sm">
                                      <Users className="h-4 w-4 mr-2" />
                                      Applications
                                    </Button>
                                  </Link>
                                )}

                                {/* Edit Button - Only for Draft jobs */}
                                {job.status === 'Draft' && (
                                  <Link href={`/company/jobs/${job._id}/edit`}>
                                    <Button variant="outline" size="sm">
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </Button>
                                  </Link>
                                )}

                                {/* Request Approval Button - Only for Draft jobs */}
                                {job.status === 'Draft' && (
                                  <Button
                                    onClick={() => handleRequestApproval(job._id)}
                                    disabled={isSubmitting === job._id}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    {isSubmitting === job._id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    ) : (
                                      <Send className="h-4 w-4 mr-2" />
                                    )}
                                    Request Approval
                                  </Button>
                                )}

                                {/* More Options */}
                                <div className="relative group">
                                  <Button variant="outline" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>

                                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                    <div className="py-1">
                                      <button
                                        onClick={() => handleDuplicateJob(job)}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Duplicate
                                      </button>

                                      {job.status === 'Draft' && (
                                        <button
                                          onClick={() => handleDeleteJob(job._id)}
                                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </button>
                                      )}
                                    </div>

                                      {job.status === 'Rejected' && (
                                        <button
                                          onClick={() => handleAmendAndEdit(job._id)}
                                          className="flex items-center w-full px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
                                        >
                                          <Edit className="h-4 w-4 mr-2" />
                                          Amend & Edit
                                        </button>
                                      )}

                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {activeTab === 'draft' && 'No draft jobs'}
                      {activeTab === 'pending' && 'No pending jobs'}
                      {activeTab === 'approved' && 'No approved jobs'}
                      {activeTab === 'rejected' && 'No rejected jobs'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {jobs.length === 0
                        ? "You haven't created any job postings yet."
                        : `No jobs in ${activeTab} status match your search.`}
                    </p>
                    {jobs.length === 0 && (
                      <Link href="/company/jobs/create">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Job
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
