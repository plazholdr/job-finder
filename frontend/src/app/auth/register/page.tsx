"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, Briefcase, ArrowLeft, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import SocialLoginButtons from '@/components/auth/social-login-buttons';

const registerSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setRegisterError(null);

    try {
      // Determine role based on email (you can add a dropdown later)
      const role = data.email.includes('company') ? 'company' : 'student';

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const result = await response.json();

      // If auto-login was successful, store auth data
      if (result.accessToken && result.user) {
        localStorage.setItem('authToken', result.accessToken);
        localStorage.setItem('authUser', JSON.stringify(result.user));

        // Redirect to role-based dashboard
        if (result.user.role === 'student') {
          router.push('/pages/student-dashboard');
        } else {
          router.push('/pages/company-dashboard');
        }
      } else {
        // Registration successful but need to login manually
        router.push('/auth/login?message=Registration successful. Please login.');
      }
    } catch (error: any) {
      setRegisterError(error.message || 'An error occurred during registration. Please try again.');
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

          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign up to start your job search journey
          </p>
        </div>

        {registerError && (
          <motion.div
            className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-5 w-5 text-red-500 mt-0.5">!</div>
            <p className="text-sm text-red-500">{registerError}</p>
          </motion.div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="First name"
                    className={`pl-10 h-12 ${errors.firstName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    {...register('firstName')}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Last name"
                    className={`pl-10 h-12 ${errors.lastName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    {...register('lastName')}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

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

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Password"
                  className={`pl-10 h-12 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
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
                Create account
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

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <SocialLoginButtons />
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500 inline-flex items-center"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
