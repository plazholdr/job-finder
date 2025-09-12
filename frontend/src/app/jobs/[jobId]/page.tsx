"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Users,
  Calendar,
  Bookmark,
  BookmarkCheck,
  Share2,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import EnhancedJobApplicationModal from '@/components/EnhancedJobApplicationModal';

interface JobDetails {
  id: string;
  title: string;
  company: {
    id: string;
    name: string;
    logo?: string;
    industry: string;
    size: string;
    location: string;
    website?: string;
    description: string;
  };
  location: string;
  type: string;
  level: string;
  salary: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  posted: string;
  deadline?: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  skills: string[];
  experience: string;
  education: string;
  remote: boolean;
  applications: number;
  views: number;
  status: 'active' | 'closed' | 'filled';
}

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const jobId = params.jobId as string;

  const checkApplicationStatus = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/jobs/${jobId}/applied`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setHasApplied(data.hasApplied || false);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };


  const fetchJob = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/jobs/${jobId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();

    
      const raw = payload?.data ?? payload;
      if (!raw || typeof raw !== 'object') throw new Error('Invalid job payload');

      
      const idStr = String(raw._id ?? raw.id ?? '');

      
      const techSkills = Array.isArray(raw.skills?.technical)
        ? raw.skills.technical
        : typeof raw.skills?.technical === 'string'
          ? raw.skills.technical.split(/[,\s]+/).filter(Boolean)
          : [];

      const transformedJob: JobDetails = {
        id: idStr,
        title: raw.title,
        company: {
          id: String(raw.companyId ?? ''),
          name: raw.companyName || raw.companyInfo?.name || 'Company Name',
          logo: "/api/placeholder/80/80",
          industry: raw.companyInfo?.industry || "Technology",
          size: raw.companyInfo?.size || "Unknown",
          location: raw.companyInfo?.location || raw.location,
          website: raw.companyInfo?.website || "",
          description: raw.companyInfo?.description || "Company description not available."
        },
        location: raw.location,
        type: "Internship",
        level: "Entry",
        salary: {
          min: raw.salary?.minimum ?? 0,
          max: raw.salary?.maximum ?? 0,
          currency: raw.salary?.currency || "USD",
          period: raw.salary?.type || "hour"
        },
        posted: raw.createdAt,
        deadline: raw.duration?.endDate,
        description: raw.description,
        requirements: typeof raw.requirements === 'string'
          ? raw.requirements.split('\n').map(s => s.trim()).filter(Boolean)
          : [],
        responsibilities: [],
        benefits: [],
        skills: techSkills,
        experience: "Entry level",
        education: "Currently enrolled in relevant field",
        remote: !!raw.remoteWork,
        applications: raw.applications ?? 0,
        views: raw.views ?? 0,
        
        status: (raw.status && String(raw.status).toLowerCase() === 'active') ? 'active' : 'closed'
      };

      setJob(transformedJob);
    } catch (err) {
      console.error('Error fetching job:', err);
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
    checkApplicationStatus();
  }, [jobId, user, fetchJob]);

  const handleSaveJob = () => {
    setIsSaved(!isSaved);
    // TODO: Implement save job API call
  };

  const handleApply = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setShowApplicationModal(true);
  };

  const handleApplicationSubmit = async (applicationData: any) => {
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId: jobId,
          personalInformation: `${user?.firstName} ${user?.lastName}, ${user?.email}, ${user?.profile?.phone || 'N/A'}, ${user?.profile?.location || 'N/A'}`,
          internshipDetails: applicationData.applicationValidity,
          courseInformation: user?.student?.education ? JSON.stringify(user.student.education) : 'No education info provided',
          assignmentInformation: user?.student?.experience ? JSON.stringify(user.student.experience) : 'No experience info provided',
          coverLetter: applicationData.candidateStatement,
          resumeUrl: user?.student?.resume || null,
          portfolioUrl: user?.student?.portfolio || null,
          additionalDocuments: []
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Show success message
        alert('🎉 Application submitted successfully! The company will review your application and get back to you.');
        setShowApplicationModal(false);
        setHasApplied(true);
        // Refresh job data to update application count
        fetchJob();
      } else {
        throw new Error(result.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error; // Re-throw to let the modal handle the error
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `Check out this job opportunity: ${job?.title} at ${job?.company.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-8">The job you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/pages/student-dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/pages/student-dashboard"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Jobs
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={handleSaveJob}
                className={`p-2 rounded-lg ${
                  isSaved
                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {isSaved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <img
                    src={job.company.logo}
                    alt={job.company.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                    <Link
                      href={`/companies/${job.company.id}`}
                      className="text-lg text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {job.company.name}
                    </Link>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {job.status === 'active' ? 'Actively Hiring' : 'Closed'}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>{job.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>{job.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Posted {new Date(job.posted).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {job.applications} applications
                </span>
                <span>{job.views} views</span>
                {job.remote && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    Remote OK
                  </span>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Responsibilities */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsibilities</h2>
              <ul className="space-y-2">
                {job.responsibilities.map((responsibility, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{responsibility}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits & Perks</h2>
              <ul className="space-y-2">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Apply Section */}
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 text-2xl font-bold text-gray-900 mb-2">
                  <DollarSign className="h-6 w-6" />
                  ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                </div>
                <p className="text-gray-600">per {job.salary.period}</p>
              </div>

              {job.deadline && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Application deadline: {new Date(job.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleApply}
                disabled={job.status !== 'active' || hasApplied}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  job.status === 'active' && !hasApplied
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : hasApplied
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {hasApplied
                  ? 'Application Submitted'
                  : job.status === 'active'
                  ? 'Apply Now'
                  : 'Position Closed'
                }
              </button>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  {job.applications} people have applied
                </p>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About {job.company.name}</h3>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{job.company.industry}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{job.company.size}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{job.company.location}</span>
                </div>
                {job.company.website && (
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Company Website
                    </a>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-700 mb-4">{job.company.description}</p>

              <Link
                href={`/companies/${job.company.id}`}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View Company Profile
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            {/* Job Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-900">Experience Level:</span>
                  <p className="text-sm text-gray-600">{job.experience}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">Education:</span>
                  <p className="text-sm text-gray-600">{job.education}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">Employment Type:</span>
                  <p className="text-sm text-gray-600">{job.type}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">Remote Work:</span>
                  <p className="text-sm text-gray-600">{job.remote ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {job && (
        <EnhancedJobApplicationModal
          isOpen={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
          job={{
            id: job.id,
            title: job.title,
            company: {
              name: job.company?.name || 'Company Name'
            }
          }}
          onSubmit={handleApplicationSubmit}
        />
      )}
    </div>
  );
}
