'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import UnloggedInternDashboard from '@/components/dashboard/UnloggedInternDashboard';
import CompanyDashboard from '@/components/dashboard/CompanyDashboard';

export default function Home() {
  const { user } = useAuth();

  if (user?.role === 'company') {
    return <CompanyDashboard />;
  }

  // For now, students/interns and anonymous users see the public/home experience
  return <UnloggedInternDashboard />;
}
