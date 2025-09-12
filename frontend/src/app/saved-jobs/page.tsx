"use client";

import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Search,
  Filter,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Briefcase,
  Trash2,
  ExternalLink,
  AlertCircle,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import AppLayout from '@/components/layout/AppLayout';

interface SavedJob {
  id: string;
  jobId: string;
  title: string;
  company: {
    id: string;
    name: string;
    logo?: string;
  };
  location: string;
  type: string;
  salary: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  posted: string;
  savedDate: string;
  description: string;
  tags: string[];
  status: 'active' | 'closed' | 'filled';
}

export default function SavedJobsPage() {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'savedDate' | 'posted' | 'salary'>('savedDate');

  useEffect(() => {
    // Mock saved jobs data - replace with actual API call
    const mockSavedJobs: SavedJob[] = [
      {
        id: '1',
        jobId: '1',
        title: 'Senior Frontend Developer',
        company: {
          id: '1',
          name: 'TechCorp Inc.',
          logo: '/api/placeholder/40/40'
        },
        location: 'San Francisco, CA',
        type: 'Full-time',
        salary: {
          min: 120000,
          max: 180000,
          currency: 'USD',
          period: 'year'
        },
        posted: '2024-01-15',
        savedDate: '2024-01-16',
        description: 'We are looking for a talented Senior Frontend Developer to join our growing team...',
        tags: ['React', 'TypeScript', 'Remote'],
        status: 'active'
      },
      {
        id: '2',
        jobId: '2',
        title: 'Full Stack Engineer',
        company: {
          id: '2',
          name: 'StartupXYZ',
          logo: '/api/placeholder/40/40'
        },
        location: 'Remote',
        type: 'Full-time',
        salary: {
          min: 90000,
          max: 140000,
          currency: 'USD',
          period: 'year'
        },
        posted: '2024-01-12',
        savedDate: '2024-01-14',
        description: 'Join our fast-growing startup as a Full Stack Engineer...',
        tags: ['Node.js', 'React', 'MongoDB'],
        status: 'active'
      },
      {
        id: '3',
        jobId: '3',
        title: 'React Developer',
        company: {
          id: '3',
          name: 'WebSolutions',
          logo: '/api/placeholder/40/40'
        },
        location: 'New York, NY',
        type: 'Contract',
        salary: {
          min: 80,
          max: 120,
          currency: 'USD',
          period: 'hour'
        },
        posted: '2024-01-10',
        savedDate: '2024-01-12',
        description: 'Looking for an experienced React developer for a 6-month contract...',
        tags: ['React', 'JavaScript', 'CSS'],
        status: 'closed'
      }
    ];

    // Simulate API call delay
    setTimeout(() => {
      setSavedJobs(mockSavedJobs);
      setLoading(false);
    }, 500);
  }, []);

  const handleUnsaveJob = (jobId: string) => {
    setSavedJobs(prev => prev.filter(job => job.id !== jobId));
    // TODO: Implement actual API call to unsave job
  };

  const filteredAndSortedJobs = savedJobs
    .filter(job =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'savedDate':
          return new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime();
        case 'posted':
          return new Date(b.posted).getTime() - new Date(a.posted).getTime();
        case 'salary':
          return b.salary.max - a.salary.max;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <AppLayout user={user}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Saved Jobs</h1>
              <p className="text-gray-600 mt-1">
                {savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} saved for later
              </p>
            </div>
            <Link
              href="/pages/student-dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Briefcase className="h-4 w-4" />
              Browse More Jobs
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search saved jobs by title, company, or skills"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="savedDate">Sort by: Recently Saved</option>
                <option value="posted">Sort by: Recently Posted</option>
                <option value="salary">Sort by: Highest Salary</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="h-5 w-5" />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Saved Jobs List */}
        {filteredAndSortedJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <BookmarkCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {savedJobs.length === 0 ? 'No Saved Jobs Yet' : 'No Jobs Match Your Search'}
            </h3>
            <p className="text-gray-600 mb-6">
              {savedJobs.length === 0
                ? "Start saving jobs that interest you to keep track of opportunities you want to apply to later."
                : "Try adjusting your search terms or filters to find the jobs you're looking for."
              }
            </p>
            <Link
              href="/pages/student-dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Briefcase className="h-4 w-4" />
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={job.company.logo}
                      alt={job.company.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link
                            href={`/jobs/${job.jobId}`}
                            className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {job.title}
                          </Link>
                          <div className="flex items-center gap-4 mt-1 text-gray-600">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {job.company.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {job.type}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            job.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {job.status === 'active' ? 'Active' : 'Closed'}
                          </div>
                          <button
                            onClick={() => handleUnsaveJob(job.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                            title="Remove from saved jobs"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <p className="mt-3 text-gray-700 line-clamp-2">{job.description}</p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {job.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <span className="flex items-center gap-1 font-semibold text-gray-900">
                            <DollarSign className="h-4 w-4" />
                            ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                            <span className="text-gray-600">/{job.salary.period}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Posted {new Date(job.posted).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookmarkCheck className="h-4 w-4" />
                            Saved {new Date(job.savedDate).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <Link
                            href={`/jobs/${job.jobId}`}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View Details
                          </Link>
                          {job.status === 'active' && (
                            <Link
                              href={`/jobs/${job.jobId}`}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                            >
                              Apply Now
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
