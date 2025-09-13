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
  const [filters, setFilters] = useState<JobFilters>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => {
    fetchJobs();
    fetchLikedJobs();
  }, [filters]);

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
      const response = await fetch('/api/jobs/liked', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        const likedIds = new Set(data.data.map((liked: LikedJob) => liked.jobId));
        setLikedJobs(likedIds);
      }
    } catch (error) {
      console.error('Error fetching liked jobs:', error);
    }
  };

  const handleLikeJob = async (jobId: string) => {
    try {
      const isLiked = likedJobs.has(jobId);
      const method = isLiked ? 'DELETE' : 'POST';
      const token = localStorage.getItem('authToken');

      const response = await fetch('/api/jobs/like', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId }),
      });

      if (response.ok) {
        const newLikedJobs = new Set(likedJobs);
        if (isLiked) {
          newLikedJobs.delete(jobId);
        } else {
          newLikedJobs.add(jobId);
        }
        setLikedJobs(newLikedJobs);
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
      <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Internship Jobs</h1>
        <p className="text-gray-600 mb-6">
          Find the perfect internship opportunity for your career
        </p>

        {/* Search Bar */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
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
          {jobs.map((job) => {
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
              <Card key={job._id || job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-xl text-gray-900 mb-1">
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
                        className="p-2"
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            likedJobs.has(job._id || job.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-gray-400'
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

      {!loading && jobs.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}
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
