"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { withAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  Globe,
  Calendar,
  Star,
  Briefcase,
  ExternalLink,
  Mail,
  Phone
} from 'lucide-react';
import UserProfile from '@/components/UserProfile';

interface Company {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  company?: {
    name: string;
    description: string;
    industry: string;
    size: string;
    founded: string;
    headquarters: string;
    website: string;
    logo: string;
    phone?: string;
    registrationNumber?: string;
  };
  activeJobs?: Job[];
  activeJobsCount?: number;
}

interface Job {
  _id: string;
  title: string;
  description: string;
  location?: string;
  remoteWork?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  employmentType: string;
  status: string;
  skills?: string[];
  createdAt: string;
}

function CompanyDetailPage() {
  const params = useParams();
  const { token } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs'>('overview');

  const companyId = params.id as string;

  useEffect(() => {
    fetchCompanyDetails();
  }, [companyId, token]);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/companies/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const companyData = await response.json();
        setCompany(companyData);
      } else {
        setError('Failed to fetch company details');
      }
    } catch (error) {
      console.error('Failed to fetch company:', error);
      setError('Failed to fetch company details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Company Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'This company does not exist or is not accessible.'}</p>
          <Link
            href="/companies"
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to Companies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/companies"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  {company.company?.logo ? (
                    <img 
                      src={company.company.logo} 
                      alt={company.company?.name} 
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <Building2 className="h-8 w-8 text-blue-600" />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {company.company?.name || `${company.firstName} ${company.lastName} Company`}
                  </h1>
                  <p className="text-gray-600 mt-1">{company.company?.industry || 'Industry not specified'}</p>
                </div>
              </div>
            </div>
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'overview'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'jobs'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Jobs ({company.activeJobsCount || 0})
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About the Company</h2>
                <div className="prose max-w-none text-gray-700">
                  {company.company?.description ? (
                    company.company.description.split('\n').map((paragraph: string, index: number) => (
                      <p key={index} className="mb-3">{paragraph}</p>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No company description available.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'jobs' && (
              <div className="space-y-6">
                {company.activeJobs && company.activeJobs.length > 0 ? (
                  company.activeJobs.map((job) => (
                    <div key={job._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                          <div className="mt-2 flex flex-wrap gap-4 text-gray-600">
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {job.employmentType}
                            </span>
                            {job.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {job.location}
                              </span>
                            )}
                            {job.remoteWork && (
                              <span className="text-green-600">Remote Available</span>
                            )}
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-yellow-500">
                          <Star className="h-6 w-6" />
                        </button>
                      </div>

                      {job.description && (
                        <p className="mt-4 text-gray-700">
                          {job.description.length > 200 
                            ? `${job.description.substring(0, 200)}...` 
                            : job.description
                          }
                        </p>
                      )}

                      {job.skills && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {(() => {
                            const allSkills = [
                              ...(job.skills.technical || []),
                              ...(job.skills.soft || []),
                              ...(job.skills.languages || []),
                              ...(job.skills.certifications || [])
                            ];
                            return allSkills.slice(0, 5).map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                                {skill}
                              </span>
                            ));
                          })()}
                          {(() => {
                            const allSkills = [
                              ...(job.skills.technical || []),
                              ...(job.skills.soft || []),
                              ...(job.skills.languages || []),
                              ...(job.skills.certifications || [])
                            ];
                            return allSkills.length > 5 && (
                              <span className="text-sm text-gray-500">+{allSkills.length - 5} more</span>
                            );
                          })()}
                        </div>
                      )}

                      {/* Internship Job Details */}
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                        {job.createdAt && (
                          <div>
                            <span className="font-medium">Internship Job Listing Posted Date:</span>
                            <p>{new Date(job.createdAt).toLocaleDateString()}</p>
                          </div>
                        )}
                        {job.duration && (
                          <div>
                            <span className="font-medium">Internship Job Duration:</span>
                            <p>
                              {job.duration.months ? `${job.duration.months} months` : ''}
                              {job.duration.startDate && job.duration.endDate ? (
                                ` (${new Date(job.duration.startDate).toLocaleDateString()} - ${new Date(job.duration.endDate).toLocaleDateString()})`
                              ) : ''}
                              {job.duration.flexible ? ' (Flexible)' : ''}
                            </p>
                          </div>
                        )}
                        {job.location && (
                          <div>
                            <span className="font-medium">Internship Job Location:</span>
                            <p>{job.location}</p>
                          </div>
                        )}
                        {(job.salary?.minimum || job.salary?.maximum) && (
                          <div>
                            <span className="font-medium">Internship Job Salary Range:</span>
                            <p>
                              {job.salary.minimum && job.salary.maximum ? (
                                `${job.salary.currency || 'MYR'} ${job.salary.minimum.toLocaleString()} - ${job.salary.maximum.toLocaleString()}`
                              ) : job.salary.minimum ? (
                                `From ${job.salary.currency || 'MYR'} ${job.salary.minimum.toLocaleString()}`
                              ) : job.salary.maximum ? (
                                `Up to ${job.salary.currency || 'MYR'} ${job.salary.maximum.toLocaleString()}`
                              ) : 'Not specified'}
                              {job.salary.negotiable && ' (Negotiable)'}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 flex justify-between items-center">
                        <div className="text-lg font-semibold text-gray-900">
                          <span className="font-medium text-sm text-gray-500">Internship Job Listing Title:</span>
                          <p>{job.title}</p>
                        </div>
                        <div className="flex gap-3">
                          <Link
                            href={`/jobs/view/${job._id}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={() => {
                              // Placeholder for apply functionality
                              alert('Apply functionality coming soon!');
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-lg shadow p-8 text-center">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Job Openings</h3>
                    <p className="text-gray-500">This company doesn't have any active job openings at the moment.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Info</h2>
              <div className="space-y-4">
                {/* Company Logo & Name */}
                <div>
                  <span className="text-sm text-gray-500">Company Logo & Name</span>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      {company.company?.logo ? (
                        <img
                          src={company.company.logo}
                          alt={company.company?.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <Building2 className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <p className="font-medium text-gray-900">
                      {company.company?.name || `${company.firstName} ${company.lastName} Company`}
                    </p>
                  </div>
                </div>

                {/* Company Website */}
                {company.company?.website && (
                  <div>
                    <span className="text-sm text-gray-500">Company Website</span>
                    <p className="font-medium text-gray-900">
                      <a
                        href={company.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Globe className="h-4 w-4" />
                        {company.company.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                  </div>
                )}

                {/* Company Registration Number */}
                <div>
                  <span className="text-sm text-gray-500">Company Registration Number</span>
                  <p className="font-medium text-gray-900">
                    {company.company?.registrationNumber || 'Not provided'}
                  </p>
                </div>

                {/* Company Email and Number */}
                <div>
                  <span className="text-sm text-gray-500">Company Email</span>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {company.email}
                  </p>
                </div>

                {company.company?.phone && (
                  <div>
                    <span className="text-sm text-gray-500">Company Phone</span>
                    <p className="font-medium text-gray-900 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {company.company.phone}
                    </p>
                  </div>
                )}

                {/* Company Business Nature */}
                {company.company?.industry && (
                  <div>
                    <span className="text-sm text-gray-500">Company Business Nature</span>
                    <p className="font-medium text-gray-900">{company.company.industry}</p>
                  </div>
                )}

                {/* Company Description */}
                <div>
                  <span className="text-sm text-gray-500">Company Description</span>
                  <p className="font-medium text-gray-900">
                    {company.company?.description || 'No description provided'}
                  </p>
                </div>

                {/* Company Full Address */}
                {company.company?.headquarters && (
                  <div>
                    <span className="text-sm text-gray-500">Company Full Address</span>
                    <p className="font-medium text-gray-900 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {company.company.headquarters}
                    </p>
                  </div>
                )}

                {/* Company Size */}
                {company.company?.size && (
                  <div>
                    <span className="text-sm text-gray-500">Company Size</span>
                    <p className="font-medium text-gray-900 flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {company.company.size} employees
                    </p>
                  </div>
                )}

                {/* Founded */}
                {company.company?.founded && (
                  <div>
                    <span className="text-sm text-gray-500">Founded</span>
                    <p className="font-medium text-gray-900 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {company.company.founded}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact</h2>
              <div className="space-y-3">
                {company.company?.website && (
                  <a 
                    href={company.company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Globe className="h-4 w-4" />
                    Company Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{company.email}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Jobs</span>
                  <span className="font-semibold text-green-600">{company.activeJobsCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(CompanyDetailPage);
