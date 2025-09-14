'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, Search, MapPin, Calendar, DollarSign, Building2, Clock } from 'lucide-react';
import { Job, JobFilters, LikedJob } from '@/types/company-job';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import EnhancedJobApplicationModal from '@/components/EnhancedJobApplicationModal';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

export default function JobsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [likedJobs, setLikedJobs] = useState<Set<string>>(new Set());
  const [likedJobsWithDetails, setLikedJobsWithDetails] = useState<Job[]>([]);
  const [filters, setFilters] = useState<JobFilters>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'liked'>('all');
  const [showLikeNotification, setShowLikeNotification] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchLikedJobs();
  }, [filters]);

  // Fetch liked jobs with details when liked tab is active
  useEffect(() => {
    if (activeTab === 'liked') {
      fetchLikedJobsWithDetails().then(setLikedJobsWithDetails);
    }
  }, [activeTab]);

  // Auto-hide notification after 4 seconds
  useEffect(() => {
    if (showLikeNotification) {
      const timer = setTimeout(() => {
        setShowLikeNotification(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showLikeNotification]);

  // Refresh liked jobs when a job is liked/unliked
  const refreshLikedData = async () => {
    await fetchLikedJobs();
    if (activeTab === 'liked') {
      const likedJobsDetails = await fetchLikedJobsWithDetails();
      setLikedJobsWithDetails(likedJobsDetails);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.location?.length) queryParams.append('location', filters.location.join(','));
      if (filters.postedWithin) queryParams.append('postedWithin', filters.postedWithin);
      if (filters.deadline) queryParams.append('deadline', filters.deadline);

      const token = localStorage.getItem('authToken');
      // const response = await fetch(`/api/jobs?${queryParams}`
      const response = await fetch(`/api/jobs?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);

      if (list.length || data?.data) {
        console.log('Jobs fetched from API:', list);
        setJobs(list);
      } else {
        console.error('API returned unexpected shape:', data);
        setJobs([]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedJobs = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLikedJobs(new Set());
        return;
      }

      const response = await fetch('/api/jobs/liked', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const likedIds = new Set<string>(data.data.map((liked: LikedJob) => liked.jobId));
          setLikedJobs(likedIds);
        }
      }
    } catch (error) {
      console.error('Error fetching liked jobs:', error);
    }
  };

  const fetchLikedJobsWithDetails = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return [];
      }

      const response = await fetch('/api/jobs/liked?includeJobDetails=true', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Liked jobs with details response:', data);

        if (data.success && data.data) {
          // Transform the data to extract job details
          const jobsWithDetails = data.data.map((liked: any) => {
            if (liked.job) {
              // Add company name from nested company data
              const job = { ...liked.job };
              if (liked.company?.company?.name) {
                job.companyName = liked.company.company.name;
              }
              return job;
            }
            return liked;
          });

          console.log('Transformed jobs:', jobsWithDetails);
          return jobsWithDetails;
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching liked jobs with details:', error);
      return [];
    }
  };

  const handleLikeJob = async (jobId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const isLiked = likedJobs.has(jobId);
      const method = isLiked ? 'DELETE' : 'POST';

      console.log(`${isLiked ? 'Unliking' : 'Liking'} job:`, jobId);

      const response = await fetch('/api/jobs/like', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId }),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        // Update UI immediately
        const newLikedJobs = new Set(likedJobs);
        if (isLiked) {
          newLikedJobs.delete(jobId);
          console.log('Job removed from liked list');
        } else {
          newLikedJobs.add(jobId);
          console.log('Job added to liked list');
          setShowLikeNotification(true);
          setTimeout(() => setShowLikeNotification(false), 3000);
        }
        setLikedJobs(newLikedJobs);
      } else {
        const errorData = await response.json();
        console.error('Error toggling job like:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error toggling job like:', error);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDeadline = (deadline: Date) => {
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleApply = (job: any) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleApplicationSubmit = async (applicationData: any) => {
    try {
      console.log('Submitting application:', applicationData);

      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId: selectedJob._id || selectedJob.id,
          personalInformation: `${user?.firstName} ${user?.lastName}, ${user?.email}, ${user?.profile?.phone || 'N/A'}, ${user?.profile?.location || 'N/A'}`,
          internshipDetails: applicationData.applicationValidity,
          courseInformation: user?.student?.education ? JSON.stringify(user.student.education) : 'No education info provided',
          assignmentInformation: user?.student?.experience ? JSON.stringify(user.student.experience) : 'No experience info provided',
          coverLetter: applicationData.candidateStatement,
          resumeUrl: applicationData.resumeUrl || user?.student?.resume,
          portfolioUrl: user?.student?.portfolio || null,
          additionalDocuments: []
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowApplicationModal(false);
        setSelectedJob(null);
        // Refresh jobs to update application count
        fetchJobs();
      } else {
        throw new Error(result.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error; // Re-throw to let the modal handle the error
    }
  };

  return (
    <AppLayout>
      {/* Like Notification Popup */}
      {showLikeNotification && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-lg shadow-lg border border-green-400/20 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Heart className="h-5 w-5 fill-current" />
              </div>
              <div>
                <p className="font-semibold">Job added to like list!</p>
                <p className="text-sm text-green-100">You can view it in the Liked Jobs tab</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Internship Jobs
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Find the perfect internship opportunity for your career
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search jobs by title, company, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-12 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-white/20">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-8 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
                      activeTab === 'all'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    All Jobs
                  </button>
                  <button
                    onClick={() => setActiveTab('liked')}
                    className={`px-8 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
                      activeTab === 'liked'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Liked Jobs
                  </button>
                </div>
              </div>
            </div>

            {/* Jobs List */}
            {loading ? (
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="h-16 w-16 bg-gray-200 rounded-lg"></div>
                          <div>
                            <div className="h-4 bg-gray-200 rounded mb-2 w-48"></div>
                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                          </div>
                        </div>
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded mb-4 w-full"></div>
                      <div className="flex space-x-4">
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
          {(activeTab === 'liked' ? likedJobsWithDetails : jobs)
            .map((job) => {
            // Handle different date formats from backend
            const deadline = job.duration?.endDate ? new Date(job.duration.endDate) : null;
            const postedDate = job.createdAt ? new Date(job.createdAt) : new Date();
            const daysUntilDeadline = deadline ? getDaysUntilDeadline(deadline) : null;
            const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 7;

            // Format salary display
            const salaryDisplay = job.salary?.minimum && job.salary?.maximum
              ? `$${job.salary.minimum}-${job.salary.maximum}/${job.salary.type || 'month'}`
              : job.salary?.minimum
                ? `$${job.salary.minimum}+/${job.salary.type || 'month'}`
                : 'Salary negotiable';

            return (
              <Card key={job._id || job.id} className="hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Building2 className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-gray-600 font-medium">
                          {job.companyName || job.companyInfo?.name || 'Company Name'}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location || 'Location not specified'}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {salaryDisplay}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isUrgent && daysUntilDeadline !== null && (
                        <Badge variant="destructive" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {daysUntilDeadline} days left
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikeJob(job._id || job.id)}
                        className="p-3 rounded-full hover:bg-red-50 transition-all duration-200 group/heart"
                      >
                        <Heart
                          className={`h-6 w-6 transition-all duration-200 ${
                            likedJobs.has(job._id || job.id)
                              ? 'text-red-500 fill-current scale-110'
                              : 'text-gray-400 hover:text-red-500 group-hover/heart:scale-110'
                          }`}
                        />
                      </Button>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Posted {formatDate(postedDate)}
                      </div>
                      {deadline && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Deadline {formatDate(deadline)}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Link href={`/jobs/${job._id || job.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Button size="sm" onClick={() => handleApply(job)}>
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && (
        (activeTab === 'all' && jobs.length === 0) ||
        (activeTab === 'liked' && likedJobsWithDetails.length === 0)
      ) && (
        <div className="text-center py-12">
          {activeTab === 'all' ? (
            <>
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </>
          ) : (
            <>
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No liked jobs yet</h3>
              <p className="text-gray-600">Start liking jobs to see them here</p>
            </>
          )}
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {selectedJob && (
        <EnhancedJobApplicationModal
          isOpen={showApplicationModal}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedJob(null);
          }}
          job={{
            id: selectedJob._id || selectedJob.id,
            title: selectedJob.title,
            company: {
              name: selectedJob.companyName || selectedJob.companyInfo?.name || 'Company Name'
            }
          }}
          onSubmit={handleApplicationSubmit}
        />
      )}
    </AppLayout>
  );
}
