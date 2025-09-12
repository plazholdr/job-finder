'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import JobCreationWizard from '@/components/jobs/JobCreationWizard';

export default function CreateJobPage() {
    const router = useRouter();

    const handleJobComplete = (job: any) => {
        console.log('Job completed:', job);
        router.push('/company/jobs');
    };

    const handleCancel = () => {
        router.push('/company/jobs');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create New Job Posting</h1>
                    <p className="mt-2 text-gray-600">
                        Fill out the details below to create a new job posting for your company.
                    </p>
                </div>

                <JobCreationWizard
                    onComplete={handleJobComplete}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
