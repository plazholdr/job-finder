"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Edit,
  Trash2,
  Send,
  Eye,
  Calendar,
  DollarSign,
  Users,
  Clock,
  FileText,
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string;
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
  attachments: Array<{
    fileName: string;
    originalName: string;
    publicUrl: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
  }>;
  status: 'Draft' | 'Pending' | 'Active' | 'Closed' | 'Rejected';
  statusHistory: Array<{
    status: string;
    changedAt: string;
    changedBy: string;
    reason: string;
  }>;
  views: number;
  applications: number;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

interface JobDashboardProps {
  onCreateJob: () => void;
  onEditJob: (job: Job) => void;
}

export default function JobDashboard({ onCreateJob, onEditJob }: JobDashboardProps) {
  const { token } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Draft');

  const statusTabs = [
    { value: 'Draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    { value: 'Pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'Closed', label: 'Closed', color: 'bg-blue-100 text-blue-800' },
    { value: 'Rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load jobs');
      }

      const data = await response.json();
      setJobs(data.data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (jobId: string, newStatus: string, reason = '') => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      const updatedJob = await response.json();
      
      // Update job in local state
      setJobs(prev => prev.map(job => 
        job._id === jobId ? updatedJob : job
      ));

      toast.success(`Job status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete job');
      }

      // Remove job from local state
      setJobs(prev => prev.filter(job => job._id !== jobId));
      toast.success('Job deleted successfully');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete job');
    }
  };

  const formatSalary = (job: Job) => {
    const { salary } = job;
    if (!salary.minimum) return 'Not specified';
    
    const min = salary.minimum.toLocaleString();
    const max = salary.maximum ? salary.maximum.toLocaleString() : '';
    const range = max ? `${min} - ${max}` : min;
    
    return `${salary.currency} ${range}${salary.type === 'hourly' ? '/hr' : salary.type === 'yearly' ? '/year' : '/month'}`;
  };

  const getJobActions = (job: Job) => {
    const actions = [];

    // View Details action (available for all statuses)
    actions.push(
      <Button
        key="view"
        variant="outline"
        size="sm"
        onClick={() => window.location.href = `/jobs/view/${job._id}`}
        className="flex items-center gap-1"
      >
        <Eye className="h-4 w-4" />
        View Details
      </Button>
    );

    // Edit action (NOT available for Active jobs)
    if (job.status !== 'Active') {
      actions.push(
        <Button
          key="edit"
          variant="outline"
          size="sm"
          onClick={() => onEditJob(job)}
          className="flex items-center gap-1"
        >
          <Edit className="h-4 w-4" />
          Edit
        </Button>
      );
    }



    // Status-specific actions
    switch (job.status) {
      case 'Draft':
        actions.push(
          <Button
            key="submit"
            size="sm"
            onClick={() => updateJobStatus(job._id, 'Pending')}
            className="flex items-center gap-1"
          >
            <Send className="h-4 w-4" />
            Submit for Approval
          </Button>
        );
        actions.push(
          <Button
            key="delete"
            variant="destructive"
            size="sm"
            onClick={() => deleteJob(job._id)}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        );
        break;

      case 'Active':
        actions.push(
          <Button
            key="close"
            variant="outline"
            size="sm"
            onClick={() => updateJobStatus(job._id, 'Closed')}
            className="flex items-center gap-1"
          >
            <Clock className="h-4 w-4" />
            Close Job
          </Button>
        );
        break;

      case 'Closed':
        actions.push(
          <Button
            key="reopen"
            size="sm"
            onClick={() => updateJobStatus(job._id, 'Active')}
            className="flex items-center gap-1"
          >
            <Eye className="h-4 w-4" />
            Reopen
          </Button>
        );
        break;

      case 'Rejected':
        actions.push(
          <Button
            key="resubmit"
            size="sm"
            onClick={() => updateJobStatus(job._id, 'Draft')}
            className="flex items-center gap-1"
          >
            <FileText className="h-4 w-4" />
            Move to Draft
          </Button>
        );
        break;
    }

    return actions;
  };

  const filteredJobs = jobs.filter(job => job.status === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Listings</h2>
          <p className="text-gray-600">Manage your job postings and track their status</p>
        </div>
        <Button onClick={onCreateJob} className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Job
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {statusTabs.map(tab => {
          const count = jobs.filter(job => job.status === tab.value).length;
          return (
            <Card key={tab.value} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{tab.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                  <Badge className={tab.color}>{tab.label}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Jobs Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {statusTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label} ({jobs.filter(job => job.status === tab.value).length})
            </TabsTrigger>
          ))}
        </TabsList>

        {statusTabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4">
            {filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {tab.label.toLowerCase()} jobs
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {tab.value === 'Draft' 
                      ? "You haven't created any job listings yet."
                      : `No jobs in ${tab.label.toLowerCase()} status.`
                    }
                  </p>
                  {tab.value === 'Draft' && (
                    <Button onClick={onCreateJob}>
                      Create Your First Job
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredJobs.map(job => (
                <JobCard
                  key={job._id}
                  job={job}
                  actions={getJobActions(job)}
                  formatSalary={formatSalary}
                />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// Job Card Component
function JobCard({
  job,
  actions,
  formatSalary
}: {
  job: Job;
  actions: React.ReactNode[];
  formatSalary: (job: Job) => string;
}) {
  const statusTabs = [
    { value: 'Draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    { value: 'Pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'Closed', label: 'Closed', color: 'bg-blue-100 text-blue-800' },
    { value: 'Rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' }
  ];
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <CardDescription className="mt-1">
              {job.description.length > 150 
                ? `${job.description.substring(0, 150)}...` 
                : job.description
              }
            </CardDescription>
          </div>
          <Badge className={statusTabs.find(tab => tab.value === job.status)?.color}>
            {job.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{formatSalary(job)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {job.duration.months ? `${job.duration.months} months` : 'Duration TBD'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {job.applications} applications
            </span>
          </div>
        </div>

        {/* Skills */}
        {job.skills.technical.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Required Skills:</p>
            <div className="flex flex-wrap gap-1">
              {job.skills.technical.slice(0, 5).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {job.skills.technical.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{job.skills.technical.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Rejection reason */}
        {job.status === 'Rejected' && job.rejectionReason && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                <p className="text-sm text-red-700">{job.rejectionReason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {actions}
        </div>

        {/* Metadata */}
        <div className="mt-4 pt-4 border-t text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Created: {format(new Date(job.createdAt), 'MMM dd, yyyy')}</span>
            <span>Updated: {format(new Date(job.updatedAt), 'MMM dd, yyyy')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
