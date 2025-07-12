import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/auth-context';
import ClientOnly from '@/components/client-only';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Job Finder Portal',
  description: 'Find your dream job or hire the best talent',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientOnly fallback={<div>Loading...</div>}>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
