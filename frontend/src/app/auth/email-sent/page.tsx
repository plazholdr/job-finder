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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <motion.div
        className="w-full max-w-lg space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <div className="text-center">
          <motion.div
            className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Mail className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Check Your Email
          </h1>
          <p className="text-gray-600 mb-2">
            We've sent a verification link to
          </p>
          <p className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {email}
          </p>
        </div>

        {/* Main Content Card */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-white/20 shadow-xl space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Success Message */}
          <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-900 mb-1">Email sent successfully!</p>
              <p className="text-sm text-green-700">Click the verification link in your email to continue.</p>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-orange-900 mb-1">Link expires in:</p>
              <p className="font-mono text-xl text-orange-700 font-bold">{formatTime(timeLeft)}</p>
            </div>
          </div>

          {/* Next Steps for Company */}
          {type === 'company' && (
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <ArrowRight className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-blue-900 mb-1">Next steps:</p>
                <p className="text-sm text-blue-700">After verification, you'll complete your company registration with business details and Malaysian Superform.</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Didn't receive the email? Check your spam folder or
            </p>
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              variant="outline"
              className="w-full h-12 text-base font-medium border-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </Button>
            {resendMessage && (
              <motion.p
                className={`text-sm mt-3 font-medium ${resendMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {resendMessage}
              </motion.p>
            )}
          </div>

          <div className="text-center">
            <Button
              onClick={() => router.push('/auth/login')}
              variant="ghost"
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Back to Login
            </Button>
          </div>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="font-semibold text-yellow-900 mb-1">Important:</p>
              <p className="text-sm text-yellow-800">The verification link will expire in 24 hours. If it expires, you'll need to register again.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
