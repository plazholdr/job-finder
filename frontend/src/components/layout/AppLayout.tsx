'use client';

import React from 'react';
import MainNavigation from '@/components/navigation/MainNavigation';
import { InternWorkflowProvider } from '@/contexts/InternWorkflowContext';
import NotificationCenter from '@/components/notifications/NotificationCenter';

interface AppLayoutProps {
  children: React.ReactNode;
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'intern' | 'company' | 'admin';
  };
}

export default function AppLayout({ children, user }: AppLayoutProps) {
  return (
    <InternWorkflowProvider>
      <div className="min-h-screen bg-gray-50">
        <MainNavigation user={user} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </InternWorkflowProvider>
  );
}
