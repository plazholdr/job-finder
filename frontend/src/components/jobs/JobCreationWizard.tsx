"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Save, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import UserProfile from '@/components/UserProfile';
import Link from 'next/link';

// Import step components
import BasicInfoStep from './steps/BasicInfoStep';
import DetailsStep from './steps/DetailsStep';
import SalaryDatesStep from './steps/SalaryDatesStep';
import UploadStep from './steps/UploadStep';

interface JobData {
  title: string;
  description: string;
  requirements: string;
  location: string;
  remoteWork: boolean;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
    certifications: string[];
  };
  salary: {
    minimum: number | null;
    maximum: number | null;
    currency: string;
    negotiable: boolean;
    type: string;
  };
  duration: {
    months: number | null;
    startDate: string | null;
    endDate: string | null;
    flexible: boolean;
  };
  attachments: Array<{
    fileName: string;
    originalName: string;
    publicUrl: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
  }>;
}

const STEPS = [
  {
    id: 1,
    title: 'Basic Information',
    description: 'Job title and description',
    component: BasicInfoStep
  },
  {
    id: 2,
    title: 'Requirements & Skills',
    description: 'Qualifications and required skills',
    component: DetailsStep
  },
  {
    id: 3,
    title: 'Salary & Timeline',
    description: 'Compensation and duration details',
    component: SalaryDatesStep
  },
  {
    id: 4,
    title: 'Upload Documents',
    description: 'Supporting files and attachments',
    component: UploadStep
  }
];

interface JobCreationWizardProps {
  onComplete?: (job: any) => void;
  onCancel?: () => void;
  initialData?: Partial<JobData>;
  isEditing?: boolean;
  jobId?: string;
}

export default function JobCreationWizard({
  onComplete,
  onCancel,
  initialData,
  isEditing = false,
  jobId
}: JobCreationWizardProps) {
  const { user, token } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const [jobData, setJobData] = useState<JobData>({
    title: '',
    description: '',
    requirements: '',
    location: '',
    remoteWork: false,
    skills: {
      technical: [],
      soft: [],
      languages: [],
      certifications: []
    },
    salary: {
      minimum: null,
      maximum: null,
      currency: 'MYR',
      negotiable: false,
      type: 'monthly'
    },
    duration: {
      months: null,
      startDate: null,
      endDate: null,
      flexible: false
    },
    attachments: []
  });

  // Load initial data if provided
  useEffect(() => {
    if (initialData) {
      setJobData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  const updateJobData = (newData: Partial<JobData>) => {
    setJobData(prev => ({
      ...prev,
      ...newData
    }));
    
    // Clear validation errors for updated fields
    const updatedFields = Object.keys(newData);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      updatedFields.forEach(field => {
        delete newErrors[field];
      });
      return newErrors;
    });
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!jobData.title?.trim()) {
          errors.title = 'Job title is required';
        }
        if (!jobData.description?.trim()) {
          errors.description = 'Job description is required';
        }
        if (!jobData.location?.trim()) {
          errors.location = 'Location is required';
        }
        break;
      case 2:
        if (!jobData.requirements?.trim()) {
          errors.requirements = 'Job requirements are required';
        }
        if (!jobData.skills?.technical?.length) {
          errors.skills = 'At least one technical skill is required';
        }
        break;
      case 3:
        if (!jobData.salary?.minimum) {
          errors.salary = 'Minimum salary is required';
        }
        if (!jobData.duration?.months) {
          errors.duration = 'Duration is required';
        }
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      toast.error('Please fill in all required fields before proceeding');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const saveJob = async (isDraft = false) => {
    if (!user || !token) {
      toast.error('Please log in to save job');
      return;
    }

    // Validate all steps before final save (unless it's a draft)
    if (!isDraft) {
      let allValid = true;
      for (let step = 1; step <= STEPS.length; step++) {
        if (!validateStep(step)) {
          allValid = false;
        }
      }

      if (!allValid) {
        toast.error('Please complete all required fields before saving');
        return;
      }
    }

    try {
      setIsSaving(true);

      const url = isEditing && jobId
        ? `/api/jobs/${jobId}`
        : '/api/jobs';
      
      const method = isEditing ? 'PATCH' : 'POST';

      // Filter out draft attachments (ones with file objects) from the job data
      // These will be uploaded separately after job creation
      const jobDataToSave = {
        ...jobData,
        attachments: jobData.attachments?.filter(att => !att.file) || []
      };

      console.log('Saving job:', {
        isEditing,
        url,
        method,
        originalAttachments: jobData.attachments?.length || 0,
        filteredAttachments: jobDataToSave.attachments.length,
        jobData: JSON.stringify(jobDataToSave, null, 2)
      });

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobDataToSave)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to save job');
      }

      const savedJob = result.data || result;

      // Upload any pending attachments
      if (jobData.attachments?.some(att => att.file)) {
        try {
          const attachmentsToUpload = jobData.attachments.filter(att => att.file);
          
          for (const attachment of attachmentsToUpload) {
            const formData = new FormData();
            formData.append('file', attachment.file);
            formData.append('jobId', savedJob._id || savedJob.id);

            const uploadResponse = await fetch('/api/jobs/attachments', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: formData
            });

            if (!uploadResponse.ok) {
              console.error('Failed to upload attachment:', attachment.originalName);
            }
          }
        } catch (uploadError) {
          console.error('Error uploading attachments:', uploadError);
          toast.error('Job saved but some attachments failed to upload');
        }
      }

      if (isDraft) {
        toast.success('Job saved as draft');
      } else {
        toast.success('Job saved successfully!');
        onComplete?.(savedJob);
      }

      return savedJob;
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save job');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    await saveJob(false);
  };

  const handleSaveDraft = async () => {
    await saveJob(true);
  };

  const progress = (currentStep / STEPS.length) * 100;
  const CurrentStepComponent = STEPS[currentStep - 1].component;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/company/jobs">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Jobs
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Edit Job Posting' : 'Create Job Posting'}
              </h1>
            </div>
            <UserProfile />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-8">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${
                index + 1 <= currentStep ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                  index + 1 < currentStep
                    ? 'bg-blue-600 text-white'
                    : index + 1 === currentStep
                    ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {index + 1 < currentStep ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>
              <span className="text-xs text-center max-w-20">
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {STEPS[currentStep - 1].title}
            </h2>
            <p className="text-gray-600">
              {STEPS[currentStep - 1].description}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentStepComponent
                data={jobData}
                onChange={updateJobData}
                errors={validationErrors}
                jobId={jobId}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div>
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={isSaving}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>

            {currentStep < STEPS.length ? (
              <Button
                onClick={nextStep}
                disabled={isSaving}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isSaving ? 'Publishing...' : 'Publish Job'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
