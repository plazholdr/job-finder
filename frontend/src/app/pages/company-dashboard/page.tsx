"use client"

import React, { useState } from 'react';
import { Users, Briefcase, BarChart as ChartBar, Settings, Plus, Search, Filter, MoreVertical } from 'lucide-react';

interface JobPosting {
  id: number;
  title: string;
  applications: number;
  status: 'active' | 'closed';
  posted: string;
  views: number;
}

export default function CompanyDashboard() {
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
          <h2 className="text-2xl font-bold text-gray-900">Job Postings</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-5 w-5" />
            Post New Job
          </button>
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
      </div>
    </div>
  );
}
