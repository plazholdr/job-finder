"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import config from '@/config';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6">Verifying…</div>}>
      <VerifyEmailPageInner />
    </Suspense>
  );
}

function VerifyEmailPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setMessage('Invalid verification link. Please check your email for the correct link.');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`${config.api.baseUrl}/email-verification/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
      } else {
        setStatus('error');
        setMessage(data.message || data.error || 'Verification failed. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  const resendVerification = async () => {
    setIsResending(true);
    try {
      // We need the user's email for resending - this would typically come from the token
      // For now, we'll redirect to a resend page
      router.push('/auth/resend-verification');
    } catch (error) {
      console.error('Resend error:', error);
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
      case 'invalid':
        return <XCircle className="h-16 w-16 text-red-500" />;
      default:
        return <Mail className="h-16 w-16 text-gray-400" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Verifying your email...';
      case 'success':
        return 'Email verified successfully!';
      case 'error':
        return 'Verification failed';
      case 'invalid':
        return 'Invalid verification link';
      default:
        return 'Email verification';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center mb-6">
              {getStatusIcon()}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {getStatusTitle()}
            </h1>

            <p className="text-gray-600 mb-8">
              {message}
            </p>

            <div className="space-y-4">
              {status === 'success' && (
                <div className="space-y-4">
                  <Link href="/auth/login">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Continue to Login
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full">
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              )}

              {(status === 'error' || status === 'invalid') && (
                <div className="space-y-4">
                  <Button
                    onClick={resendVerification}
                    disabled={isResending}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Redirecting...
                      </>
                    ) : (
                      'Resend verification email'
                    )}
                  </Button>

                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              )}

              {status === 'loading' && (
                <div className="text-sm text-gray-500">
                  Please wait while we verify your email address...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
