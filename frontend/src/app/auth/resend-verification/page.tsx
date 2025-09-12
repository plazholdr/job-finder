"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import config from '@/config';
import { Input } from '@/components/ui/input';

const resendSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ResendFormValues = z.infer<typeof resendSchema>;

export default function ResendVerificationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendFormValues>({
    resolver: zodResolver(resendSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ResendFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
  const response = await fetch(`${config.api.baseUrl}/email-verification/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        setError(result.error || 'Failed to resend verification email');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>

          {!isSubmitted ? (
            <>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Resend verification email</h1>
              <p className="mt-2 text-sm text-gray-600">
                Enter your email address and we&apos;ll send you a new verification link
              </p>
            </>
          ) : (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Check your email</h1>
              <p className="mt-2 text-sm text-gray-600">
                We&apos;ve sent a new verification link to your email address
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!isSubmitted ? (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <Input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className={errors.email ? 'border-red-300' : ''}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="relative w-full h-12 bg-blue-600 hover:bg-blue-500"
                  disabled={isLoading}
                >
                  <span className={`${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                    Send verification email
                  </span>
                  {isLoading && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </span>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Didn&apos;t receive the email? Check your spam folder or try again in a few minutes.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setIsSubmitted(false);
                    setError(null);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Send another email
                </Button>

                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Need help?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/contact" className="text-sm text-blue-600 hover:text-blue-500">
                Contact support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
