"use client"

import React, { useState } from 'react';
import { Search, Briefcase, BookOpen, Star, MapPin, Building2, Clock, Filter, ChevronDown, Settings } from 'lucide-react';
import UserProfile from '@/components/UserProfile';
import { withAuth } from '@/contexts/auth-context';
import Link from 'next/link';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  posted: string;
  description: string;
}

function StudentDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const jobs: Job[] = [
    {
      id: 1,
      title: "Software Engineer Intern",
      company: "TechCorp",
      location: "San Francisco, CA",
      type: "Internship",
      salary: "$40-50/hr",
      posted: "2 days ago",
      description: "Looking for a passionate software engineer intern to join our team..."
    },
    {
      id: 2,
      title: "Junior Data Scientist",
      company: "DataWorks",
      location: "Remote",
      type: "Full-time",
      salary: "$80-100k/year",
      posted: "1 day ago",
      description: "Join our data science team and work on exciting ML projects..."
    },
    // Add more mock jobs as needed
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Find Your Dream Job</h1>
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/companies"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Building2 className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-medium text-gray-900">Discover Companies</h3>
                <p className="text-sm text-gray-600">Browse companies and their job opportunities</p>
              </div>
            </Link>
            <Link
              href="/internship-preferences"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-medium text-gray-900">Internship Preferences</h3>
                <p className="text-sm text-gray-600">Set your preferences to find better matches</p>
              </div>
            </Link>
            <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <Briefcase className="h-6 w-6 text-purple-600" />
              <div>
                <h3 className="font-medium text-gray-900">My Applications</h3>
                <p className="text-sm text-gray-600">Track your application status</p>
              </div>
            </div>
          </div>
        </div>

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
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-5 w-5" />
                Filters
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <div className="grid grid-cols-1 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                  <div className="mt-2 flex items-center gap-4 text-gray-600">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {job.company}
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
                <button className="text-blue-600 hover:text-blue-700">
                  <Star className="h-6 w-6" />
                </button>
              </div>
              <p className="mt-4 text-gray-600">{job.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">{job.salary}</span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {job.posted}
                  </span>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default withAuth(StudentDashboard);
