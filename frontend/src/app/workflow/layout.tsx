'use client';

import React from 'react';
import { InternWorkflowProvider } from '@/contexts/InternWorkflowContext';

export default function WorkflowLayout({ children }: { children: React.ReactNode }) {
  // Ensure the InternWorkflowProvider wraps the /workflow page so hooks are inside the provider during render
  return (
    <InternWorkflowProvider>
      {children}
    </InternWorkflowProvider>
  );
}
