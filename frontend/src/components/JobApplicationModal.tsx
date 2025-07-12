"use client";

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    company: {
      name: string;
    };
  };
  onSubmit: (applicationData: ApplicationData) => Promise<void>;
}

interface ApplicationData {
  coverLetter: string;
  resume: File | null;
  additionalDocuments: File[];
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
  };
  experience: {
    currentRole: string;
    yearsOfExperience: string;
    expectedSalary: string;
    availableStartDate: string;
  };
  questions: Record<string, string>;
}

export default function JobApplicationModal({ isOpen, onClose, job, onSubmit }: JobApplicationModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const documentsInputRef = useRef<HTMLInputElement>(null);

  const [applicationData, setApplicationData] = useState<ApplicationData>({
    coverLetter: '',
    resume: null,
    additionalDocuments: [],
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
    },
    experience: {
      currentRole: '',
      yearsOfExperience: '',
      expectedSalary: '',
      availableStartDate: '',
    },
    questions: {},
  });

  // Mock screening questions - in real app, these would come from the job posting
  const screeningQuestions = [
    {
      id: 'authorization',
      question: 'Are you authorized to work in the United States?',
      type: 'select',
      options: ['Yes', 'No', 'Will require sponsorship'],
      required: true,
    },
    {
      id: 'relocation',
      question: 'Are you willing to relocate for this position?',
      type: 'select',
      options: ['Yes', 'No', 'Maybe'],
      required: true,
    },
    {
      id: 'remote',
      question: 'Do you have experience working remotely?',
      type: 'textarea',
      required: false,
    },
  ];

  const handleInputChange = (section: keyof ApplicationData, field: string, value: string) => {
    setApplicationData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleFileUpload = (type: 'resume' | 'documents', files: FileList | null) => {
    if (!files) return;

    if (type === 'resume') {
      setApplicationData(prev => ({
        ...prev,
        resume: files[0],
      }));
    } else {
      setApplicationData(prev => ({
        ...prev,
        additionalDocuments: [...prev.additionalDocuments, ...Array.from(files)],
      }));
    }
  };

  const removeDocument = (index: number) => {
    setApplicationData(prev => ({
      ...prev,
      additionalDocuments: prev.additionalDocuments.filter((_, i) => i !== index),
    }));
  };

  const handleQuestionChange = (questionId: string, value: string) => {
    setApplicationData(prev => ({
      ...prev,
      questions: {
        ...prev.questions,
        [questionId]: value,
      },
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          applicationData.personalInfo.firstName &&
          applicationData.personalInfo.lastName &&
          applicationData.personalInfo.email &&
          applicationData.personalInfo.phone
        );
      case 2:
        return !!applicationData.resume;
      case 3:
        return !!applicationData.coverLetter.trim();
      case 4:
        return screeningQuestions
          .filter(q => q.required)
          .every(q => applicationData.questions[q.id]);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await onSubmit(applicationData);
      setSubmitStatus('success');
      setCurrentStep(5);
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitStatus === 'success') {
      // Reset form
      setCurrentStep(1);
      setSubmitStatus('idle');
      setApplicationData({
        coverLetter: '',
        resume: null,
        additionalDocuments: [],
        personalInfo: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          location: '',
        },
        experience: {
          currentRole: '',
          yearsOfExperience: '',
          expectedSalary: '',
          availableStartDate: '',
        },
        questions: {},
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  const steps = [
    'Personal Info',
    'Resume & Documents',
    'Cover Letter',
    'Screening Questions',
    'Review & Submit'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Apply for {job.title}</h2>
            <p className="text-gray-600">at {job.company.name}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index + 1 < currentStep
                      ? 'bg-green-600 text-white'
                      : index + 1 === currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1 < currentStep ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      index + 1 < currentStep ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-600">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1]}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={applicationData.personalInfo.firstName}
                    onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={applicationData.personalInfo.lastName}
                    onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={applicationData.personalInfo.email}
                    onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={applicationData.personalInfo.phone}
                    onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={applicationData.personalInfo.location}
                    onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City, State/Country"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Professional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Role
                    </label>
                    <input
                      type="text"
                      value={applicationData.experience.currentRole}
                      onChange={(e) => handleInputChange('experience', 'currentRole', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Software Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <select
                      value={applicationData.experience.yearsOfExperience}
                      onChange={(e) => handleInputChange('experience', 'yearsOfExperience', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select experience</option>
                      <option value="0-1">0-1 years</option>
                      <option value="1-3">1-3 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Resume & Documents</h3>

              {/* Resume Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume * (PDF, DOC, DOCX - Max 5MB)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  {applicationData.resume ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">{applicationData.resume.name}</p>
                          <p className="text-sm text-gray-600">
                            {(applicationData.resume.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setApplicationData(prev => ({ ...prev, resume: null }))}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Click to upload your resume</p>
                      <button
                        onClick={() => resumeInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Choose File
                      </button>
                    </div>
                  )}
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload('resume', e.target.files)}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Additional Documents */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Documents (Optional)
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Portfolio, cover letter, certifications, etc.
                </p>

                {applicationData.additionalDocuments.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {applicationData.additionalDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-600" />
                          <span className="text-sm text-gray-900">{doc.name}</span>
                        </div>
                        <button
                          onClick={() => removeDocument(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => documentsInputRef.current?.click()}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
                >
                  + Add Document
                </button>
                <input
                  ref={documentsInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('documents', e.target.files)}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Cover Letter</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why are you interested in this position? *
                </label>
                <textarea
                  value={applicationData.coverLetter}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about your interest in this role, relevant experience, and what you can bring to the team..."
                />
                <p className="text-sm text-gray-600 mt-2">
                  {applicationData.coverLetter.length} characters
                </p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Screening Questions</h3>
              <div className="space-y-6">
                {screeningQuestions.map((question) => (
                  <div key={question.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {question.question} {question.required && '*'}
                    </label>
                    {question.type === 'select' ? (
                      <select
                        value={applicationData.questions[question.id] || ''}
                        onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select an option</option>
                        {question.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <textarea
                        value={applicationData.questions[question.id] || ''}
                        onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Please provide details..."
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              {submitStatus === 'success' ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Application Submitted!</h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for applying to {job.title} at {job.company.name}.
                    We'll review your application and get back to you soon.
                  </p>
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              ) : submitStatus === 'error' ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Submission Failed</h3>
                  <p className="text-gray-600 mb-6">
                    There was an error submitting your application. Please try again.
                  </p>
                  <button
                    onClick={() => setSubmitStatus('idle')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Review Your Application</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                      <p className="text-sm text-gray-600">
                        {applicationData.personalInfo.firstName} {applicationData.personalInfo.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{applicationData.personalInfo.email}</p>
                      <p className="text-sm text-gray-600">{applicationData.personalInfo.phone}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                      <p className="text-sm text-gray-600">
                        Resume: {applicationData.resume?.name}
                      </p>
                      {applicationData.additionalDocuments.length > 0 && (
                        <p className="text-sm text-gray-600">
                          Additional documents: {applicationData.additionalDocuments.length} files
                        </p>
                      )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {applicationData.coverLetter}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {submitStatus !== 'success' && (
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`px-4 py-2 border rounded-lg ${
                currentStep === 1
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={!validateStep(currentStep)}
                  className={`px-4 py-2 rounded-lg ${
                    validateStep(currentStep)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              ) : currentStep === 4 ? (
                <button
                  onClick={handleSubmit}
                  disabled={!validateStep(currentStep) || isSubmitting}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    validateStep(currentStep) && !isSubmitting
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit Application
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
