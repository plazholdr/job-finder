"use client"

import React, { useState } from 'react';
import { Users, Briefcase, BarChart as ChartBar, Settings, Plus, Search, Filter, MoreVertical, Building2, Edit, Eye, UserCheck, Globe, Mail, Phone, MapPin } from 'lucide-react';
import UserProfile from '@/components/UserProfile';
import { withAuth } from '@/contexts/auth-context';
import Link from 'next/link';

interface JobPosting {
  id: number;
  title: string;
  applications: number;
  status: 'active' | 'closed';
  posted: string;
  views: number;
}

function CompanyDashboard() {
  const [activeTab, setActiveTab] = useState('jobs');

  const jobPostings: JobPosting[] = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      applications: 45,
      status: "active",
      posted: "5 days ago",
      views: 234
    },
    {
      id: 2,
      title: "Product Manager",
      applications: 28,
      status: "active",
      posted: "3 days ago",
      views: 156
    },
    // Add more mock job postings as needed
  ];

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
          <h2 className="text-2xl font-bold text-gray-900">
            {activeTab === 'jobs' && 'Job Postings'}
            {activeTab === 'candidates' && 'Candidates'}
            {activeTab === 'analytics' && 'Analytics'}
            {activeTab === 'settings' && 'Company Settings'}
          </h2>
          <div className="flex items-center gap-4">
            {activeTab === 'jobs' && (
              <Link href="/company/jobs/create">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="h-5 w-5" />
                  Post New Job
                </button>
              </Link>
            )}
            <UserProfile />
          </div>
        </div>

        {/* Job Postings Tab */}
        {activeTab === 'jobs' && (
          <>
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
            <div className="bg-white rounded-lg shadow">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Job Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Applications</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Posted</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Views</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900"></th>
                  </tr>
                </thead>
                <tbody>
                  {jobPostings.map((job) => (
                    <tr key={job.id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{job.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{job.applications}</td>
                      <td className="px-6 py-4 text-gray-500">{job.posted}</td>
                      <td className="px-6 py-4 text-gray-900">{job.views}</td>
                      <td className="px-6 py-4">
                        <button className="text-gray-400 hover:text-gray-500">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Settings Tab - Company Management */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            {/* Company Profile Management */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Company Profile
                  </h3>
                  <p className="text-gray-600">Manage your company information and public profile</p>
                </div>
                <Link href="/company/profile">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Company Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Company Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Company Name</label>
                      <p className="font-medium">TechCorp Solutions</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Industry</label>
                      <p className="text-gray-900">Technology</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Company Size</label>
                      <p className="text-gray-900">51-200 employees</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Founded</label>
                      <p className="text-gray-900">2015</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <label className="text-sm text-gray-500">Email</label>
                        <p className="text-gray-900">contact@techcorp.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <label className="text-sm text-gray-500">Phone</label>
                        <p className="text-gray-900">+1 (555) 123-4567</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <div>
                        <label className="text-sm text-gray-500">Website</label>
                        <p className="text-blue-600">techcorp.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <label className="text-sm text-gray-500">Location</label>
                        <p className="text-gray-900">San Francisco, CA</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Status */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Profile Status</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Verification Status</label>
                      <div className="flex items-center gap-2 mt-1">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">Verified</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Profile Completeness</label>
                      <div className="mt-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>85% Complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm">
                      <Eye className="h-4 w-4" />
                      View Public Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/company/profile">
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left w-full">
                    <Edit className="h-6 w-6 text-blue-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Edit Company Profile</h4>
                    <p className="text-sm text-gray-500">Update company information</p>
                  </button>
                </Link>
                <Link href="/company/verification">
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left w-full">
                    <UserCheck className="h-6 w-6 text-green-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Verification Center</h4>
                    <p className="text-sm text-gray-500">Manage verification status</p>
                  </button>
                </Link>
                <Link href="/companies">
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left w-full">
                    <Eye className="h-6 w-6 text-purple-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Preview Profile</h4>
                    <p className="text-sm text-gray-500">See how others view you</p>
                  </button>
                </Link>
                <Link href="/company/settings">
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left w-full">
                    <Settings className="h-6 w-6 text-gray-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Account Settings</h4>
                    <p className="text-sm text-gray-500">Manage account preferences</p>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Candidates Tab */}
        {activeTab === 'candidates' && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Candidates Management</h3>
            <p className="text-gray-500">View and manage candidate applications and profiles.</p>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <ChartBar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-500">View detailed analytics about your job postings and applications.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(CompanyDashboard);
