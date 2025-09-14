import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication | Job Finder Portal',
  description: 'Login or register to access the Job Finder Portal',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {children}
    </div>
  );
}
