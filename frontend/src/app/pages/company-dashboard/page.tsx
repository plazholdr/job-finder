"use client"

import React, { useState, useEffect } from 'react';
import { Users, Briefcase, BarChart as ChartBar, Settings, Plus, Search, Filter, MoreVertical, MapPin, Calendar, Eye, Edit } from 'lucide-react';
import UserProfile from '@/components/UserProfile';
import { withAuth, useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface JobPosting {
  _id: string;
  title: string;
  description: string;
  location: string;
  remoteWork: boolean;
  applications: number;
  status: string;
  createdAt: string;
  views: number;
  salary: {
    minimum: number;
    maximum: number;
    currency: string;
  };
  duration: {
    months: number;
  };
}

function CompanyDashboard() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Fetch active job postings
  useEffect(() => {
    const fetchActiveJobs = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await fetch('/api/jobs', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Fetched result from API:', result);

          // Extract jobs from the result (backend returns { data: jobs, total, limit, skip })
          const jobs = result.data || result;
          console.log('Extracted jobs:', jobs);

          // Filter for active jobs only
          const activeJobs = jobs.filter((job: JobPosting) =>
            job.status === 'Active' || job.status === 'Pending'
          );
          console.log('Filtered active jobs:', activeJobs);
          setJobPostings(activeJobs);
        } else {
          console.error('Failed to fetch jobs:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveJobs();
  }, [token]);



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">Company Name</h1>
        </div>
        <nav className="mt-6">
          <a
            href="#"
            className={`flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 ${
              activeTab === 'jobs' ? 'bg-blue-50 text-blue-600' : ''
            }`}
            onClick={() => setActiveTab('jobs')}
          >
            <Briefcase className="h-5 w-5" />
            Job Postings
          </a>
          <a
            href="#"
            className={`flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 ${
              activeTab === 'candidates' ? 'bg-blue-50 text-blue-600' : ''
            }`}
            onClick={() => setActiveTab('candidates')}
          >
            <Users className="h-5 w-5" />
            Candidates
          </a>
          <a
            href="#"
            className={`flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 ${
              activeTab === 'analytics' ? 'bg-blue-50 text-blue-600' : ''
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            <ChartBar className="h-5 w-5" />
            Analytics
          </a>
          <a
            href="#"
            className={`flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 ${
              activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : ''
            }`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="h-5 w-5" />
            Settings
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Job Postings</h2>
          <div className="flex items-center gap-4">
            <Link
              href="/jobs"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Manage Jobs
            </Link>
            <UserProfile />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search job postings"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-5 w-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Job Postings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading job postings...</p>
            </div>
          ) : jobPostings.length === 0 ? (
            <div className="p-8 text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Job Postings</h3>
              <p className="text-gray-500 mb-4">You don't have any active job postings yet.</p>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Your First Job
              </Link>
            </div>
          ) : (
            <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Job Details</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Salary</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Metrics</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {jobPostings.map((job) => (
                    <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900 text-lg">{job.title}</div>
                          <div className="text-sm text-gray-600 mt-1 flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {job.duration?.months} months
                            </span>
                            <span className="text-gray-400">•</span>
                            <span>Posted {formatDate(job.createdAt)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-700">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {job.remoteWork ? (
                            <span className="text-blue-600 font-medium">Remote</span>
                          ) : (
                            <span>{job.location}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-medium">
                          RM {job.salary?.minimum?.toLocaleString()}
                          {job.salary?.maximum && ` - RM ${job.salary.maximum.toLocaleString()}`}
                        </div>
                        <div className="text-sm text-gray-500">per month</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={job.status === 'Active' ? 'default' : job.status === 'Pending' ? 'secondary' : 'outline'}
                          className={
                            job.status === 'Active'
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : job.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                              : ''
                          }
                        >
                          {job.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{job.applications || 0}</span>
                            <span className="text-gray-500">applications</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Eye className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{job.views || 0}</span>
                            <span className="text-gray-500">views</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-2">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.location.href = `/jobs/view/${job._id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {job.status !== 'Active' && (
                              <DropdownMenuItem onClick={() => window.location.href = `/jobs?edit=${job._id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(CompanyDashboard);
