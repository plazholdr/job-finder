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
import IndustryRoleStep from './steps/IndustryRoleStep';
import LocationDurationStep from './steps/LocationDurationStep';
import SalaryAvailabilityStep from './steps/SalaryAvailabilityStep';
import SkillsStep from './steps/SkillsStep';

interface InternshipPreferences {
  // Industry & Role
  industries: string[];
  roles: string[];
  
  // Location & Duration
  locations: string[];
  remoteWork: boolean;
  duration: {
    minimum: number | null;
    maximum: number | null;
    preferred: number | null;
    flexible: boolean;
  };
  
  // Salary & Availability
  salary: {
    minimum: number | null;
    maximum: number | null;
    currency: string;
    negotiable: boolean;
  };
  availability: {
    startDate: string | null;
    endDate: string | null;
    immediateStart: boolean;
    partTime: boolean;
    fullTime: boolean;
  };
  
  // Skills
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
    certifications: string[];
  };
  
  // Additional
  companySize: string[];
  workEnvironment: string[];
  benefits: string[];
  notes: string;
}

const STEPS = [
  {
    id: 1,
    title: 'Industry & Role',
    description: 'Select your preferred industries and roles',
    component: IndustryRoleStep
  },
  {
    id: 2,
    title: 'Location & Duration',
    description: 'Choose your location preferences and internship duration',
    component: LocationDurationStep
  },
  {
    id: 3,
    title: 'Salary & Availability',
    description: 'Set your salary expectations and availability',
    component: SalaryAvailabilityStep
  },
  {
    id: 4,
    title: 'Skills',
    description: 'List your technical and soft skills',
    component: SkillsStep
  }
];

interface InternshipPreferencesWizardProps {
  onComplete?: () => void;
  onCancel?: () => void;
  initialData?: Partial<InternshipPreferences>;
  isEditing?: boolean;
}

export default function InternshipPreferencesWizard({
  onComplete,
  onCancel,
  initialData,
  isEditing = false
}: InternshipPreferencesWizardProps) {
  const { user, token } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const [preferences, setPreferences] = useState<InternshipPreferences>({
    industries: [],
    roles: [],
    locations: [],
    remoteWork: false,
    duration: {
      minimum: null,
      maximum: null,
      preferred: null,
      flexible: false
    },
    salary: {
      minimum: null,
      maximum: null,
      currency: 'MYR',
      negotiable: true
    },
    availability: {
      startDate: null,
      endDate: null,
      immediateStart: false,
      partTime: false,
      fullTime: true
    },
    skills: {
      technical: [],
      soft: [],
      languages: [],
      certifications: []
    },
    companySize: [],
    workEnvironment: [],
    benefits: [],
    notes: ''
  });

  // Load initial data if provided
  useEffect(() => {
    if (initialData) {
      setPreferences(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  // Load existing preferences if editing
  useEffect(() => {
    if (isEditing && user && token) {
      loadExistingPreferences();
    }
  }, [isEditing, user, token]);

  const loadExistingPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/internship-preferences/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Failed to load existing preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = (stepData: Partial<InternshipPreferences>) => {
    setPreferences(prev => ({
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
      case 1: // Industry & Role
        if (!preferences.industries || preferences.industries.length === 0) {
          errors.industries = 'Please select at least one industry';
        }
        if (!preferences.roles || preferences.roles.length === 0) {
          errors.roles = 'Please select at least one role';
        }
        break;

      case 2: // Location & Duration
        if (!preferences.locations || preferences.locations.length === 0) {
          if (!preferences.remoteWork) {
            errors.locations = 'Please select at least one location or enable remote work';
          }
        }
        if (!preferences.duration?.preferred || preferences.duration.preferred <= 0) {
          errors.duration = 'Please specify your preferred internship duration (minimum 1 month)';
        }
        if (preferences.duration?.minimum && preferences.duration?.maximum) {
          if (preferences.duration.minimum > preferences.duration.maximum) {
            errors.duration = 'Minimum duration cannot be greater than maximum duration';
          }
        }
        break;

      case 3: // Salary & Availability
        if (!preferences.salary?.minimum || preferences.salary.minimum <= 0) {
          errors.salary = 'Please specify a valid minimum salary expectation';
        }
        if (preferences.salary?.minimum && preferences.salary?.maximum) {
          if (preferences.salary.minimum > preferences.salary.maximum) {
            errors.salary = 'Minimum salary cannot be greater than maximum salary';
          }
        }
        if (!preferences.availability?.immediateStart && !preferences.availability?.startDate) {
          errors.availability = 'Please specify when you can start or select immediate start';
        }
        if (!preferences.availability?.fullTime && !preferences.availability?.partTime) {
          errors.availability = 'Please select at least one work schedule preference (full-time or part-time)';
        }
        break;

      case 4: // Skills
        if (!preferences.skills?.technical || preferences.skills.technical.length === 0) {
          errors.skills = 'Please add at least one technical skill';
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

  const savePreferences = async (isDraft = false) => {
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

      // First, try to check if preferences exist
      let shouldUpdate = isEditing;

      if (!isEditing) {
        try {
          const checkResponse = await fetch('/api/internship-preferences/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (checkResponse.ok) {
            // Preferences exist, use PATCH
            shouldUpdate = true;
          }
        } catch (error) {
          // Preferences don't exist, use POST
          shouldUpdate = false;
        }
      }

      const url = shouldUpdate
        ? '/api/internship-preferences/me'
        : '/api/internship-preferences';

      const method = shouldUpdate ? 'PATCH' : 'POST';

      console.log('Saving preferences:', {
        isEditing,
        shouldUpdate,
        url,
        method,
        preferences: JSON.stringify(preferences, null, 2)
      });

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });

      console.log('Save response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save preferences');
      }

      const savedPreferences = await response.json();
      
      if (isDraft) {
        toast.success('Preferences saved as draft');
      } else {
        toast.success('Preferences saved successfully!');
        onComplete?.(savedPreferences);
      }

      return savedPreferences;
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save preferences');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    await savePreferences(false);
  };

  const handleSaveDraft = async () => {
    await savePreferences(true);
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
                href="/pages/student-dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isEditing ? 'Edit Internship Preferences' : 'Set Your Internship Preferences'}
                </h1>
                <p className="text-gray-600 mt-1">
                  Complete all steps to set your internship preferences
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
          
          {/* Progress */}
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
                data={preferences}
                onChange={updatePreferences}
                errors={validationErrors}
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
                  {isSaving ? 'Saving...' : 'Complete'}
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
