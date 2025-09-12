"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import config from '@/config';

export default function EmailSentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6">Loading…</div>}>
      <EmailSentPageInner />
    </Suspense>
  );
}

function EmailSentPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const type = searchParams.get('type'); // 'company' or 'student'
  
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendMessage('');
    
    try {
      const response = await fetch(`${config.api.baseUrl}/email-verification/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResendMessage('Verification email sent successfully!');
        setTimeLeft(24 * 60 * 60); // Reset timer
      } else {
        const error = await response.json();
        setResendMessage(error.message || error.error || 'Failed to resend email');
      }
    } catch (error) {
      setResendMessage('Failed to resend email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <motion.div
        className="w-full max-w-md space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Check Your Email
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification link to
          </p>
          <p className="font-medium text-blue-600">{email}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <p className="font-medium">Email sent successfully!</p>
              <p>Click the verification link in your email to continue.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <p className="font-medium">Link expires in:</p>
              <p className="font-mono text-lg text-orange-600">{formatTime(timeLeft)}</p>
            </div>
          </div>

          {type === 'company' && (
            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-medium">Next steps:</p>
                <p>After verification, you'll complete your company registration with business details and Malaysian Superform.</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Didn't receive the email? Check your spam folder or
            </p>
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              variant="outline"
              className="w-full"
            >
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </Button>
            {resendMessage && (
              <p className={`text-sm mt-2 ${resendMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {resendMessage}
              </p>
            )}
          </div>

          <div className="text-center">
            <Button
              onClick={() => router.push('/auth/login')}
              variant="ghost"
              className="text-sm"
            >
              Back to Login
            </Button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Important:</p>
              <p>The verification link will expire in 24 hours. If it expires, you'll need to register again.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
