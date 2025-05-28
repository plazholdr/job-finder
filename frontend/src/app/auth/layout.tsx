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
    <div className="min-h-screen flex">
      {children}
    </div>
  );
}