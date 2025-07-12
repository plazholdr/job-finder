'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import HiringWorkflow from '@/components/hiring/HiringWorkflow';

export default function HiringWorkflowPage() {
  const params = useParams();
  const applicationId = params.id as string;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <HiringWorkflow applicationId={applicationId} />
      </div>
    </AppLayout>
  );
}
