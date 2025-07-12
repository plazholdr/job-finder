"use client"

import React, { useState } from 'react';
import { Search, Briefcase, BookOpen, Star, MapPin, Building2, Clock, Filter, ChevronDown, DollarSign, Bookmark, User, Settings } from 'lucide-react';
import UserProfile from '@/components/UserProfile';
import { withAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import JobFilters, { JobFilters as JobFiltersType } from '@/components/JobFilters';
import JobRecommendations from '@/components/JobRecommendations';
import NotificationSystem from '@/components/NotificationSystem';
import ProfileCompletionWizard from '@/components/profile/ProfileCompletionWizard';
import EmailVerificationBanner from '@/components/auth/EmailVerificationBanner';
import ProfileCompletionCard from '@/components/profile/ProfileCompletionCard';

interface Job {
  id: number;
  title: string;
  company: {
    name: string;
    logo?: string;
    size?: string;
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
  description: string;
  skills: string[];
  experienceLevel: string;
  remote: boolean;
}

function StudentDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [showProfileWizard, setShowProfileWizard] = useState(false);
  const [activeTab, setActiveTab] = useState<'jobs' | 'recommendations'>('jobs');
  const [filters, setFilters] = useState<JobFiltersType>({
    location: [],
    jobType: [],
    experienceLevel: [],
    salaryRange: { min: 0, max: 500000 },
    companySize: [],
    remote: null,
    postedWithin: 'any',
    skills: []
  });

  // Mock user data - in real app, this would come from auth context
  const mockUser = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    profile: {
      bio: 'Passionate software developer with experience in React and Node.js',
      location: 'San Francisco, CA',
      phone: '+1 (555) 123-4567',
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe'
    },
    student: {
      skills: ['React', 'JavaScript', 'Node.js', 'TypeScript'],
      education: [],
      experience: [],
      jobPreferences: {
        jobTypes: ['Full-time'],
        locations: ['San Francisco, CA', 'Remote'],
        remote: true
      },
      expectedSalary: '$100,000 - $150,000'
    }
  };

  const jobs: Job[] = [
    {
      id: 1,
      title: "Software Engineer Intern",
      company: {
        name: "TechCorp",
        logo: "/api/placeholder/40/40",
        size: "100-500 employees"
      },
      location: "San Francisco, CA",
      type: "Internship",
      salary: {
        min: 40,
        max: 50,
        currency: "USD",
        period: "hour"
      },
      posted: "2 days ago",
      description: "Looking for a passionate software engineer intern to join our team...",
      skills: ["React", "JavaScript", "Node.js"],
      experienceLevel: "Entry Level",
      remote: false
    },
    {
      id: 2,
      title: "Junior Data Scientist",
      company: {
        name: "DataWorks",
        logo: "/api/placeholder/40/40",
        size: "51-200 employees"
      },
      location: "Remote",
      type: "Full-time",
      salary: {
        min: 80000,
        max: 100000,
        currency: "USD",
        period: "year"
      },
      posted: "1 day ago",
      description: "Join our data science team and work on exciting ML projects...",
      skills: ["Python", "Machine Learning", "SQL"],
      experienceLevel: "Mid Level",
      remote: true
    },
    {
      id: 3,
      title: "Senior Frontend Developer",
      company: {
        name: "WebSolutions",
        logo: "/api/placeholder/40/40",
        size: "201-500 employees"
      },
      location: "New York, NY",
      type: "Full-time",
      salary: {
        min: 120000,
        max: 160000,
        currency: "USD",
        period: "year"
      },
      posted: "3 days ago",
      description: "Lead our frontend development team and build amazing user experiences...",
      skills: ["React", "TypeScript", "Redux"],
      experienceLevel: "Senior Level",
      remote: false
    }
  ];

  const handleSaveJob = (jobId: number | string) => {
    const id = typeof jobId === 'string' ? parseInt(jobId) : jobId;
    setSavedJobs(prev =>
      prev.includes(id)
        ? prev.filter(savedId => savedId !== id)
        : [...prev, id]
    );
  };

  const handleProfileComplete = (profileData: any) => {
    console.log('Profile completed:', profileData);
    // TODO: Save profile data to backend
    setShowProfileWizard(false);
  };

  const handleApplyFilters = () => {
    // Filter logic will be applied here
    console.log('Applying filters:', filters);
  };

  const handleClearFilters = () => {
    setFilters({
      location: [],
      jobType: [],
      experienceLevel: [],
      salaryRange: { min: 0, max: 500000 },
      companySize: [],
      remote: null,
      postedWithin: 'any',
      skills: []
    });
  };

  const filteredJobs = jobs.filter(job => {
    // Search term filter
    const matchesSearch = searchTerm === '' ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    // Location filter
    const matchesLocation = filters.location.length === 0 ||
      filters.location.includes(job.location) ||
      (filters.location.includes('Remote') && job.remote);

    // Job type filter
    const matchesJobType = filters.jobType.length === 0 ||
      filters.jobType.includes(job.type);

    // Experience level filter
    const matchesExperience = filters.experienceLevel.length === 0 ||
      filters.experienceLevel.includes(job.experienceLevel);

    // Salary filter
    const jobSalaryMin = job.salary.period === 'hour' ? job.salary.min * 2080 : job.salary.min;
    const jobSalaryMax = job.salary.period === 'hour' ? job.salary.max * 2080 : job.salary.max;
    const matchesSalary = jobSalaryMin >= filters.salaryRange.min &&
      jobSalaryMax <= filters.salaryRange.max;

    // Skills filter
    const matchesSkills = filters.skills.length === 0 ||
      filters.skills.some(skill => job.skills.includes(skill));

    return matchesSearch && matchesLocation && matchesJobType &&
           matchesExperience && matchesSalary && matchesSkills;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Find Your Dream Job</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowProfileWizard(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
              >
                <User className="h-4 w-4" />
                Complete Profile
              </button>
              <Link
                href="/internship"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <BookOpen className="h-4 w-4" />
                Internships
              </Link>
              <Link
                href="/saved-jobs"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Star className="h-4 w-4" />
                Saved Jobs
              </Link>
              <Link
                href="/applications"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Briefcase className="h-4 w-4" />
                My Applications
              </Link>
              <Link
                href="/users/search"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <User className="h-4 w-4" />
                Discover People
              </Link>
              <NotificationSystem user={mockUser} />
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      {/* Email Verification Banner */}
      <EmailVerificationBanner className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for jobs, companies, or keywords"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-5 w-5" />
                Filters
                {(filters.location.length > 0 || filters.jobType.length > 0 || filters.skills.length > 0) && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium ml-2">
                    Active
                  </span>
                )}
              </button>
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'jobs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Jobs ({filteredJobs.length})
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'recommendations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Recommended for You
              </button>
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'jobs' ? (
              <>
                {/* Job Listings */}
                <div className="grid grid-cols-1 gap-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4 flex-1">
                  <img
                    src={job.company.logo}
                    alt={job.company.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                    <div className="mt-2 flex items-center gap-4 text-gray-600">
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
                      {job.remote && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          Remote
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-gray-600 line-clamp-2">{job.description}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{job.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleSaveJob(job.id)}
                  className={`p-2 rounded-lg ${
                    savedJobs.includes(job.id)
                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                      : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {savedJobs.includes(job.id) ? (
                    <Bookmark className="h-5 w-5 fill-current" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-lg font-semibold text-gray-900">
                    <DollarSign className="h-4 w-4" />
                    ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                    <span className="text-sm text-gray-600">/{job.salary.period}</span>
                  </span>
                  <span className="text-gray-500 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {job.posted}
                  </span>
                </div>
                <Link
                  href={`/jobs/${job.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block text-center"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

            {/* No Results */}
            {filteredJobs.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or filters to find more opportunities.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Clear Filters
                </button>
                </div>
              )}
            </>
          ) : (
            /* Recommendations Tab */
            <JobRecommendations
              user={mockUser}
              onSaveJob={handleSaveJob}
              savedJobs={savedJobs.map(id => id.toString())}
            />
          )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileCompletionCard
              showDetails={true}
              onSectionClick={(section) => {
                if (section === 'basic' || section === 'profile') {
                  setShowProfileWizard(true);
                }
              }}
            />
          </div>
        </div>
      </main>

      {/* Job Filters Modal */}
      <JobFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Profile Completion Wizard */}
      <ProfileCompletionWizard
        isOpen={showProfileWizard}
        onClose={() => setShowProfileWizard(false)}
        user={mockUser}
        onComplete={handleProfileComplete}
      />
    </div>
  );
}

export default withAuth(StudentDashboard);
