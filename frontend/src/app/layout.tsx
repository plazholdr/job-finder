import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import config from '@/config';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: config.app.name,
  description: `Find your dream job with ${config.app.name}`,
  applicationName: config.app.name,
  viewport: 'width=device-width, initial-scale=1',
  robots: config.app.env === 'production' ? 'index, follow' : 'noindex, nofollow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Add environment indicator in non-production environments */}
        {config.app.env !== 'production' && (
          <style>{`
            body::before {
              content: "${config.app.env.toUpperCase()}";
              position: fixed;
              bottom: 10px;
              right: 10px;
              background: ${
                config.app.env === 'development' ? '#3b82f6' :
                config.app.env === 'staging' ? '#f59e0b' :
                config.app.env === 'uat' ? '#10b981' : 'transparent'
              };
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
              z-index: 9999;
              opacity: 0.8;
            }
          `}</style>
        )}
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
