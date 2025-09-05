"use client";

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RegistrationSuccessPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const resendVerification = async () => {
    if (!email) return;
    
    setIsResending(true);
    setResendMessage('');
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage('Verification email sent successfully!');
      } else {
        setResendMessage(data.error || 'Failed to resend verification email');
      }
    } catch (error) {
      setResendMessage('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="w-full">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Registration Successful!
            </h1>
            
            <div className="space-y-4 text-gray-600">
              <p>
                Welcome to Job Finder! Your account has been created successfully.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Mail className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-900">Verify your email</span>
                </div>
                <p className="text-sm text-blue-800">
                  We&apos;ve sent a verification email to{' '}
                  <span className="font-medium">{email}</span>. 
                  Please check your inbox and click the verification link to activate your account.
                </p>
              </div>

              <div className="text-sm text-gray-500">
                <p>
                  <strong>Important:</strong> You&apos;ll need to verify your email address before you can access all features.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {resendMessage && (
                <div className={`p-3 rounded-md text-sm ${
                  resendMessage.includes('successfully') 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {resendMessage}
                </div>
              )}

              <Button
                onClick={resendVerification}
                disabled={isResending || !email}
                variant="outline"
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend verification email'
                )}
              </Button>

              <Link href="/auth/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Continue to Login
                </Button>
              </Link>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Didn&apos;t receive the email? Check your spam folder or{' '}
                <Link href="/contact" className="text-blue-600 hover:text-blue-500">
                  contact support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
