"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, Briefcase, ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import SocialLoginButtons from '@/components/auth/social-login-buttons';
import { useAuth } from '@/contexts/auth-context';

const registerSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  role: z.enum(['student', 'company'], { message: 'Please select your role' }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'student' | 'company' | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: undefined,
    },
  });

  const watchedRole = watch('role');

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setRegisterError(null);

    try {
      // Use the selected role from the form
      await registerUser(data);

      // Show success message and redirect to email verification notice
      setTimeout(() => {
        router.push(`/auth/registration-success?email=${encodeURIComponent(data.email)}`);
      }, 100);

    } catch (error: any) {
      setRegisterError(error.message || 'An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelection = (role: 'student' | 'company') => {
    setSelectedRole(role);
    setValue('role', role);
    // Move to next step after role selection
    setTimeout(() => {
      setCurrentStep(2);
    }, 300);
  };

  const goBackToRoleSelection = () => {
    setCurrentStep(1);
  };

  // Step 1: Role Selection
  const renderRoleSelection = () => (
    <motion.div
      className="w-full max-w-lg space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create your account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sign up to start your job search journey
        </p>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">I want to:</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            type="button"
            onClick={() => handleRoleSelection('student')}
            className="relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 group hover:shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
              <User className="h-8 w-8 text-gray-600 group-hover:text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Jobs</h3>
            <p className="text-sm text-gray-500 text-center">I'm looking for work</p>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => handleRoleSelection('company')}
            className="relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-blue-500 bg-blue-50 transition-all duration-200 group hover:shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Hire Talent</h3>
            <p className="text-sm text-blue-600 text-center">I'm looking to hire</p>
            <div className="absolute top-3 right-3">
              <CheckCircle className="h-5 w-5 text-blue-500" />
            </div>
          </motion.button>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );

  // Step 2: Registration Form
  const renderRegistrationForm = () => (
    <motion.div
      className="w-full max-w-md space-y-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <button
          onClick={goBackToRoleSelection}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to role selection
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Create {selectedRole === 'company' ? 'Employer' : 'Job Seeker'} Account
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {selectedRole === 'company'
            ? 'Start hiring top talent today'
            : 'Sign up to start your job search journey'
          }
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

          {/* Show selected role */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              {selectedRole === 'company' ? (
                <Briefcase className="h-5 w-5 text-blue-600" />
              ) : (
                <User className="h-5 w-5 text-blue-600" />
              )}
              <span className="text-sm font-medium text-blue-900">
                Creating {selectedRole === 'company' ? 'Employer' : 'Job Seeker'} Account
              </span>
            </div>
          </div>
        </div>

          <div>
            <Button
              type="submit"
              className="relative w-full h-12 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <span className={`${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                {selectedRole === 'student' ? 'Create Job Seeker Account' :
                 selectedRole === 'company' ? 'Create Employer Account' :
                 'Create Account'}
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
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    );

  return (
    <div className="w-full flex items-center justify-center p-8 md:p-16 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {currentStep === 1 ? renderRoleSelection() : renderRegistrationForm()}
    </div>
  );
}
