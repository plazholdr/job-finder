"use client";

import { useState } from 'react';
import { AlertTriangle, Mail, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import config from '@/config';

interface EmailVerificationBannerProps {
  onDismiss?: () => void;
  className?: string;
}

export default function EmailVerificationBanner({ onDismiss, className = '' }: EmailVerificationBannerProps) {
  const { user } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if user is verified or banner is dismissed
  if (!user || user.emailVerified || isDismissed) {
    return null;
  }

  const resendVerification = async () => {
    setIsResending(true);
    setResendMessage('');
    
    try {
  const response = await fetch(`${config.api.baseUrl}/email-verification/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
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

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Email verification required
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Please verify your email address to access all features. 
              We sent a verification link to <span className="font-medium">{user.email}</span>.
            </p>
          </div>
          
          {resendMessage && (
            <div className={`mt-2 text-sm ${
              resendMessage.includes('successfully') 
                ? 'text-green-700' 
                : 'text-red-700'
            }`}>
              {resendMessage}
            </div>
          )}

          <div className="mt-3 flex items-center space-x-3">
            <Button
              onClick={resendVerification}
              disabled={isResending}
              size="sm"
              variant="outline"
              className="bg-white hover:bg-yellow-50 border-yellow-300 text-yellow-800"
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-1" />
                  Resend email
                </>
              )}
            </Button>
            
            <button
              onClick={handleDismiss}
              className="text-sm text-yellow-600 hover:text-yellow-500"
            >
              Dismiss
            </button>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={handleDismiss}
              className="inline-flex rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
