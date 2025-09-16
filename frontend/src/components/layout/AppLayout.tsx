'use client';

import React from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { InternWorkflowProvider } from '@/contexts/InternWorkflowContext';

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
        <AppHeader />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </InternWorkflowProvider>
  );
}
