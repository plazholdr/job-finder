"use client";

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CompanySetupForm from '@/components/auth/CompanySetupForm';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Required in Next.js App Router: useSearchParams must be within a Suspense boundary
export default function CompanySetupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6">Loading…</div>}>
      <CompanySetupPageInner />
    </Suspense>
  );
}

function CompanySetupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 p-4">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Access</h1>
          <p className="text-gray-600 mb-4">This page requires a valid email verification token.</p>
          <Button onClick={() => router.push('/auth/register')}>Back to Registration</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Company Information</h1>
          <p className="mt-2 text-sm text-gray-600">Complete your company registration with business details</p>
        </div>
        <CompanySetupForm token={token} />
      </div>
    </div>
  );
}
