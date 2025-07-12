"use client";

import React, { useState } from 'react';
import { useAuth, withAuth } from '@/contexts/auth-context';
import { ArrowLeft } from 'lucide-react';
import UserProfile from '@/components/UserProfile';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamic imports to prevent SSR issues
const JobDashboard = dynamic(
  () => import('@/components/jobs/JobDashboard'),
  { ssr: false }
);

const JobCreationWizard = dynamic(
  () => import('@/components/jobs/JobCreationWizard'),
  { ssr: false }
);

interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
    certifications: string[];
  };
  salary: {
    minimum: number | null;
    maximum: number | null;
    currency: string;
    negotiable: boolean;
    type: string;
  };
  duration: {
    months: number | null;
    startDate: string | null;
    endDate: string | null;
    flexible: boolean;
  };
  attachments: Array<{
    fileName: string;
    originalName: string;
    publicUrl: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
  }>;
  status: 'Draft' | 'Pending' | 'Active' | 'Closed' | 'Rejected';
}

function JobsPage() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'create' | 'edit'>('dashboard');
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Redirect non-company users
  if (user && user.role !== 'company') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Link
                  href="/pages/student-dashboard"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-6 w-6" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
                  <p className="text-gray-600 mt-1">
                    This page is only available to company accounts
                  </p>
                </div>
              </div>
              <UserProfile />
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Company Access Required
            </h2>
            <p className="text-gray-600 mb-6">
              You need a company account to access job management features.
            </p>
            <Link
              href="/pages/student-dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const handleCreateJob = () => {
    setEditingJob(null);
    setCurrentView('create');
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setCurrentView('edit');
  };

  const handleJobComplete = (job: any) => {
    console.log('Job completed:', job);
    setCurrentView('dashboard');
    setEditingJob(null);
  };

  const handleCancel = () => {
    setCurrentView('dashboard');
    setEditingJob(null);
  };

  if (currentView === 'create') {
    return (
      <JobCreationWizard
        onComplete={handleJobComplete}
        onCancel={handleCancel}
      />
    );
  }

  if (currentView === 'edit' && editingJob) {
    return (
      <JobCreationWizard
        onComplete={handleJobComplete}
        onCancel={handleCancel}
        initialData={editingJob}
        isEditing={true}
        jobId={editingJob._id}
      />
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
                href="/pages/company-dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Job Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Create and manage your job listings
                </p>
              </div>
            </div>
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <JobDashboard
          onCreateJob={handleCreateJob}
          onEditJob={handleEditJob}
        />
      </main>
    </div>
  );
}

export default withAuth(JobsPage);
