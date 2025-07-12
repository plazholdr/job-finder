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

  const updateJobData = (stepData: Partial<JobData>) => {
    setJobData(prev => ({
      ...prev,
      ...stepData
    }));
    // Clear validation errors for updated fields
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(stepData).forEach(key => {
        delete newErrors[key];
      });
      return newErrors;
    });
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1: // Basic Information
        if (!jobData.title || jobData.title.trim().length === 0) {
          errors.title = 'Job title is required';
        }
        if (!jobData.description || jobData.description.trim().length === 0) {
          errors.description = 'Job description is required';
        }
        if (!jobData.location || jobData.location.trim().length === 0) {
          if (!jobData.remoteWork) {
            errors.location = 'Please specify a location or enable remote work';
          }
        }
        break;

      case 2: // Requirements & Skills
        if (!jobData.skills?.technical || jobData.skills.technical.length === 0) {
          errors.skills = 'Please add at least one technical skill';
        }
        break;

      case 3: // Salary & Timeline
        if (!jobData.salary?.minimum || jobData.salary.minimum <= 0) {
          errors.salary = 'Please specify a valid minimum salary';
        }
        if (jobData.salary?.minimum && jobData.salary?.maximum) {
          if (jobData.salary.minimum > jobData.salary.maximum) {
            errors.salary = 'Minimum salary cannot be greater than maximum salary';
          }
        }
        if (!jobData.duration?.months || jobData.duration.months <= 0) {
          errors.duration = 'Please specify the internship duration';
        }
        break;

      case 4: // Upload Documents
        // No required validations for uploads
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

      console.log('Save response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save job');
      }

      const savedJob = await response.json();

      // Upload any files that have file objects (not yet uploaded)
      if (savedJob._id && jobData.attachments?.length > 0) {
        const filesToUpload = jobData.attachments.filter(att => att.file);

        if (filesToUpload.length > 0) {
          console.log(`Uploading ${filesToUpload.length} files for job ${savedJob._id}`);

          for (const attachment of filesToUpload) {
            try {
              const formData = new FormData();
              formData.append('file', attachment.file);

              const uploadResponse = await fetch(`/api/jobs/${savedJob._id}/upload`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
                body: formData,
              });

              if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                console.error('File upload failed:', errorData);
                toast.error(`Failed to upload ${attachment.originalName}`);
              } else {
                console.log(`Successfully uploaded ${attachment.originalName}`);
              }
            } catch (uploadError) {
              console.error('File upload error:', uploadError);
              toast.error(`Failed to upload ${attachment.originalName}`);
            }
          }
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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/jobs"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isEditing ? 'Edit Job Listing' : 'Create Job Listing'}
                </h1>
                <p className="text-gray-600 mt-1">
                  Complete all steps to create your job listing
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep} of {STEPS.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step indicators */}
          <div className="flex justify-between">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  index < STEPS.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id < currentStep
                      ? 'bg-green-500 text-white'
                      : step.id === currentStep
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.id < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step.id < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
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
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </Button>

              {currentStep < STEPS.length ? (
                <Button
                  onClick={nextStep}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  {isSaving ? 'Saving...' : 'Create Job'}
                  <CheckCircle className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
