"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Briefcase, ArrowLeft, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real application, you would call your password reset API here
      console.log('Reset password for:', data.email);
      
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-8 md:p-16 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <motion.div 
        className="w-full max-w-md space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-xl bg-blue-50">
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          {!isSubmitted ? (
            <>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reset your password</h1>
              <p className="mt-2 text-sm text-gray-600">
                Enter your email address and we&apos;ll send you a link to reset your password
              </p>
            </>
          ) : (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Check your email</h1>
              <p className="mt-2 text-sm text-gray-600">
                We&apos;ve sent a password reset link to your email address
              </p>
            </>
          )}
        </div>

        {!isSubmitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Email address"
                  className={`pl-10 h-12 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                className="relative w-full h-12 bg-blue-600 hover:bg-blue-500"
                disabled={isLoading}
              >
                <span className={`${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                  Send reset link
                </span>
                {isLoading && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-8">
            <Button
              onClick={() => router.push('/auth/login')}
              className="w-full h-12 bg-blue-600 hover:bg-blue-500"
            >
              Return to login
            </Button>
          </div>
        )}

        <p className="mt-10 text-center text-sm text-gray-500">
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500 inline-flex items-center"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back to login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
