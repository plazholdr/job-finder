"use client";

import React, { useState, useRef, useEffect } from 'react';
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
  Loader2,
  Calendar,
  DollarSign,
  Download,
  GraduationCap,
  Award
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface EnhancedJobApplicationModalProps {
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
  candidateStatement: string;
  applicationValidity: string;
  profileConfirmed: boolean;
}

export default function EnhancedJobApplicationModal({
  isOpen,
  onClose,
  job,
  onSubmit
}: EnhancedJobApplicationModalProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'duplicate'>('idle');
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);




  const [applicationData, setApplicationData] = useState<ApplicationData>({
    candidateStatement: '',
    applicationValidity: '',
    profileConfirmed: false,
  });

  // Fetch user profile when modal opens
  useEffect(() => {
    if (isOpen && !userProfile && user) {
      // Use the user data from auth context directly, or fetch fresh data
      if (user._id) {
        fetchUserProfile();
      } else {
        setUserProfile(user);
      }
    }
  }, [isOpen, user]);

  const fetchUserProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`/api/users/${user?._id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) {
          setUserProfile(user);
          return;
        }

        const payload = await res.json();
        const profile = payload?.data ?? payload;

        setUserProfile(profile);
        setResumeUrl(profile?.student?.resume || null);
      } catch (e) {
        console.error('Error fetching user profile:', e);
        setUserProfile(user);
      } finally {
        setIsLoadingProfile(false);
      }
    };


  const downloadResume = async () => {
    if (!userProfile?.student?.resume) {
      alert('No resume found');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const resp = await fetch('/api/users/resume/download', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resp.ok) {
        // show server error (e.g., "Authentication required", "No resume found")
        const j = await resp.json().catch(() => null);
        throw new Error(j?.error || `Download failed (${resp.status})`);
      }

      // try to use filename from server if present
      const dispo = resp.headers.get('content-disposition') || '';
      let filename = 'resume';
      const m =
        dispo.match(/filename\*?=(?:UTF-8''|")(.*?)(?:;|$|")/i) ||
        dispo.match(/filename="?([^"]+)"?/i);
      if (m) filename = decodeURIComponent(m[1]);

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Resume download error:', err);
      alert(String((err as Error).message || 'Failed to download resume'));
    }
  };


  const handleInputChange = (field: keyof ApplicationData, value: string | boolean) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // …type/size checks…

    try {
      setUploadingResume(true);
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/users/resume/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Upload failed');
      }
      const j = await res.json();
      setResumeFile(file);
      setResumeUrl(j.data?.filePath || null);
      alert('Resume uploaded successfully!');
    } catch (err) {
      console.error('Resume upload error:', err);
      alert('Failed to upload resume. Please try again.');
    } finally {
      setUploadingResume(false);
    }
  };


  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return applicationData.candidateStatement.trim().length > 0 && applicationData.applicationValidity.trim().length > 0;
      case 2:
        return applicationData.profileConfirmed;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  
  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await onSubmit({
        candidateStatement: applicationData.candidateStatement,
        applicationValidity: applicationData.applicationValidity,
        profileConfirmed: applicationData.profileConfirmed, 
      });
      setSubmitStatus('success');
    } catch (err: any) {
      const msg = String(err?.message || 'Failed to submit application');
      if (err?.code === 'DUPLICATE' || /already applied/i.test(msg)) {
        setSubmitStatus('duplicate');
      } else {
        setSubmitStatus('error');
      }
    } finally {
      setIsSubmitting(false);
      setCurrentStep(3); 
    }
  };


  const handleClose = () => {
    if (submitStatus === 'success') {
      // Reset form
      setCurrentStep(1);
      setSubmitStatus('idle');
      setApplicationData({
        candidateStatement: '',
        applicationValidity: '',
        profileConfirmed: false,
      });
      setUserProfile(null);
    }
    onClose();
  };

  if (!isOpen) return null;

  const steps = [
    'Application Details',
    'Profile Confirmation',
    'Submit Application'
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

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  index + 1 < currentStep
                    ? 'bg-green-600 text-white'
                    : index + 1 === currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {index + 1 < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`ml-2 text-sm ${
                  index + 1 <= currentStep ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    index + 1 < currentStep ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Application Details</h3>

              {/* Candidate Statement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Candidate Statement *
                </label>
                <textarea
                  value={applicationData.candidateStatement}
                  onChange={(e) => handleInputChange('candidateStatement', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us why you're interested in this position and what makes you a great candidate..."
                />
                <p className="text-sm text-gray-600 mt-2">
                  {applicationData.candidateStatement.length} characters
                </p>
              </div>

              {/* Application Validity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Valid Until *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={applicationData.applicationValidity}
                    onChange={(e) => handleInputChange('applicationValidity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Select the date until which this application should remain valid
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Profile Confirmation</h3>

              {isLoadingProfile ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading your profile...</span>
                </div>
              ) : userProfile ? (
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-gray-900">Personal Information</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <p className="font-medium">{userProfile.firstName} {userProfile.lastName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="font-medium">{userProfile.email}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <p className="font-medium">{userProfile.profile?.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Location:</span>
                        <p className="font-medium">{userProfile.profile?.location || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Education Background */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-gray-900">Education Background</h4>
                    </div>
                    {userProfile.student?.education?.length > 0 ? (
                      <div className="space-y-2">
                        {userProfile.student.education.map((edu: any, index: number) => (
                          <div key={index} className="text-sm">
                            <p className="font-medium">{edu.degree} in {edu.field}</p>
                            <p className="text-gray-600">{edu.institution}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">No education information provided</p>
                    )}
                  </div>

                  {/* Skills */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-gray-900">Skills</h4>
                    </div>
                    {userProfile.student?.skills?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {userProfile.student.skills.map((skill: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">No skills listed</p>
                    )}
                  </div>

                  {/* Resume */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-gray-900">Resume</h4>
                    </div>
                    {userProfile.student?.resume ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">Resume.pdf</p>
                            <p className="text-sm text-gray-600">Click to download and review</p>
                          </div>
                        </div>
                        <button
                          onClick={downloadResume}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">No resume uploaded</p>
                    )}
                  </div>

                  {/* Confirmation Checkbox */}
                  <div className="border-t pt-4">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={applicationData.profileConfirmed}
                        onChange={(e) => handleInputChange('profileConfirmed', e.target.checked)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">I confirm that the information above is accurate</p>
                        <p className="text-gray-600">
                          By checking this box, I confirm that all the personal information, education background,
                          skills, and resume shown above are accurate and up-to-date for this job application.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-gray-600">Failed to load profile information. Please try again.</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center space-y-6">
              {submitStatus === 'success' && (
                <>
                  <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
                  <h3 className="text-lg font-medium text-gray-900">Application Submitted!</h3>
                  <p className="text-gray-600">
                    Your application has been successfully submitted to {job.company.name}.
                    You’ll receive updates via email.
                  </p>
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Close
                  </button>
                </>
              )}

              {submitStatus === 'duplicate' && (
                <>
                  <AlertCircle className="mx-auto h-16 w-16 text-yellow-500" />
                  <h3 className="text-lg font-medium text-gray-900">Application Failed</h3>
                  <p className="text-gray-600">
                    {'Our records show you have already applied to this job. If you want to re-apply, please withdraw the current application first.'}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <a
                      href="/applications"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      View My Applications
                    </a>
                    <button
                      onClick={handleClose}
                      className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}

              {submitStatus === 'error' && (
                <>
                  <AlertCircle className="mx-auto h-16 w-16 text-red-600" />
                  <h3 className="text-lg font-medium text-gray-900">Submission Failed</h3>
                  <p className="text-gray-600">
                    {'There was an error submitting your application. Please try again.'}
                  </p>
                  <button
                    onClick={() => setSubmitStatus('idle')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </>
              )}

              {submitStatus === 'idle' && (
                <>
                  <AlertCircle className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">Ready to submit</h3>
                  <p className="text-gray-600">Click submit to send your application.</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {currentStep < 3 && (
          <div className="flex items-center justify-between h-6 p-6 border-t bg-gray-50">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Previous
                </button>
              )}
            </div>

            <div>
              {currentStep < 2 ? (
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
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!validateStep(currentStep) || isSubmitting}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    validateStep(currentStep) && !isSubmitting
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit Application
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
