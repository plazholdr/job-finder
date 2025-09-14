"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, FileText, Hash, Phone } from 'lucide-react';

export interface CompanySetupFormData {
  companyName: string;
  companyRegistrationNumber: string;
  companyContactNumber: string;
  superform: FileList;
}

interface CompanySetupFormProps {
  token: string;
  afterSubmitPath?: string;
}

export default function CompanySetupForm({ token, afterSubmitPath = '/auth/company-pending-approval' }: CompanySetupFormProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [duplicateCompany, setDuplicateCompany] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CompanySetupFormData>();

  const watchedFile = watch('superform');

  const onSubmit = async (data: CompanySetupFormData) => {
    setIsSubmitting(true);
    setSubmitError('');
    setDuplicateCompany(false);

    try {
      const checkResponse = await fetch('/api/companies/check-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationNumber: data.companyRegistrationNumber }),
      });

      const checkResult = await checkResponse.json();
      if (!checkResponse.ok) {
        throw new Error(checkResult.error || 'Failed to check company registration');
      }

      if (!checkResult.isUnique) {
        setDuplicateCompany(true);
        setSubmitError('A company with this registration number already exists. Please login instead.');
        return;
      }

      const formData = new FormData();
      formData.append('token', token || '');
      formData.append('companyName', data.companyName);
      formData.append('companyRegistrationNumber', data.companyRegistrationNumber);
      formData.append('companyContactNumber', data.companyContactNumber);
      if (data.superform && data.superform[0]) {
        formData.append('superform', data.superform[0]);
      }

      const response = await fetch('/api/companies/setup', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit company information');
      }

      router.push(afterSubmitPath);
    } catch (error: any) {
      setSubmitError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push('/auth/login');
  };

  return (
    <div className="w-full max-w-2xl space-y-8">
      {submitError && (
        <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-red-900 mb-1">Registration Error</p>
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          </div>
        </div>
      )}

      {duplicateCompany && (
        <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-yellow-900 mb-1">Company Already Registered</p>
              <p className="text-sm text-yellow-800 mb-4">A company with this registration number already exists in our system.</p>
              <Button
                onClick={handleLoginRedirect}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
              >
                Proceed to Login
              </Button>
            </div>
          </div>
        </div>
      )}

      {!duplicateCompany && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-white/20 shadow-xl space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-800">
                Company Name *
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V7a2 2 0 0 1 2-2h6"></path><path d="M15 7h4a2 2 0 0 1 2 2v12"></path><path d="M3 10h18"></path><path d="M7 10v11"></path><path d="M11 10v11"></path><path d="M15 10v11"></path></svg>
                <Input
                  type="text"
                  placeholder="Enter your company name"
                  className={`pl-10 h-12 border-2 transition-all duration-200 ${errors.companyName ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'} rounded-xl`}
                  {...register('companyName', {
                    required: 'Company name is required',
                    minLength: { value: 2, message: 'Company name must be at least 2 characters' },
                  })}
                />
              </div>
              {errors.companyName && (
                <p className="text-sm text-red-600 font-medium">{errors.companyName.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-800">
                Company Registration Number *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="e.g., 123456-A"
                  className={`pl-10 h-12 border-2 transition-all duration-200 ${errors.companyRegistrationNumber ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'} rounded-xl`}
                  {...register('companyRegistrationNumber', {
                    required: 'Company registration number is required',
                    pattern: {
                      value: /^[0-9]+-[A-Z]$/,
                      message: 'Invalid format. Use format: 123456-A',
                    },
                  })}
                />
              </div>
              {errors.companyRegistrationNumber && (
                <p className="text-sm text-red-600 font-medium">{errors.companyRegistrationNumber.message}</p>
              )}
              <p className="text-xs text-blue-600 font-medium">Malaysian company registration number format: 123456-A</p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-800">
                Company Contact Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  type="tel"
                  placeholder="+60 3-1234 5678"
                  className={`pl-10 h-12 border-2 transition-all duration-200 ${errors.companyContactNumber ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'} rounded-xl`}
                  {...register('companyContactNumber', {
                    required: 'Company contact number is required',
                    pattern: {
                      value: /^(\+?6?01)[0-46-9]-*[0-9]{7,8}$|^(\+?603)[0-9]{8}$/,
                      message: 'Invalid Malaysian phone number format',
                    },
                  })}
                />
              </div>
              {errors.companyContactNumber && (
                <p className="text-sm text-red-600 font-medium">{errors.companyContactNumber.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-800">
                Company Superform *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className={`pl-10 h-12 border-2 transition-all duration-200 ${errors.superform ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'} rounded-xl`}
                  {...register('superform', { required: 'Company Superform document is required' })}
                />
              </div>
              {errors.superform && (
                <p className="text-sm text-red-600 font-medium">{errors.superform.message}</p>
              )}
              {watchedFile && watchedFile[0] && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-green-800">File selected: {watchedFile[0].name}</span>
                </div>
              )}
              <p className="text-xs text-blue-600 font-medium">Upload your Malaysian Company Superform (PDF, DOC, or DOCX format)</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-blue-900 mb-2">About Company Superform</p>
                <p className="text-sm text-blue-800">The Superform is Malaysia's single electronic form for company incorporation, replacing multiple manual forms under the Companies Act 1965.</p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Submitting for Approval...
              </div>
            ) : (
              '🚀 Submit for Admin Approval'
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
