'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  FileText,
  User,
  DollarSign,
  Calendar,
  Plus,
  X,
  Save,
  Send,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { CandidateApplication, JobOfferForm } from '@/types/company';

export default function CreateOfferPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [formData, setFormData] = useState<JobOfferForm>({
    applicationId: '',
    jobTitle: '',
    salary: {
      amount: 0,
      currency: 'USD',
      period: 'hour'
    },
    startDate: new Date(),
    endDate: new Date(),
    benefits: [''],
    terms: '',
    expiresAt: new Date(),
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
    // Set default dates
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    setFormData(prev => ({
      ...prev,
      expiresAt: nextWeek,
      startDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      endDate: threeMonthsLater
    }));
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/company/applications?status=interview_completed');
      const result = await response.json();
      if (result.success) {
        setApplications(result.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      // Mock data for demo
      setApplications([
        {
          id: 'app-1',
          jobId: 'job-1',
          candidateId: 'candidate-1',
          candidate: {
            id: 'candidate-1',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@email.com',
            phone: '+1 (555) 123-4567',
            location: 'San Francisco, CA',
            education: 'BS Computer Science, Stanford University',
            experience: '2 years internship experience',
            skills: ['JavaScript', 'React', 'Node.js']
          },
          status: 'interview_completed',
          submittedAt: new Date(),
          lastUpdated: new Date(),
          reviewers: []
        }
      ]);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof JobOfferForm],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    const currentArray = formData[field as keyof JobOfferForm] as string[];
    const newArray = [...currentArray];
    newArray[index] = value;
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const addArrayItem = (field: string) => {
    const currentArray = formData[field as keyof JobOfferForm] as string[];
    setFormData(prev => ({
      ...prev,
      [field]: [...currentArray, '']
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    const currentArray = formData[field as keyof JobOfferForm] as string[];
    const newArray = currentArray.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.applicationId) {
      setError('Please select a candidate');
      return false;
    }
    if (!formData.jobTitle.trim()) {
      setError('Job title is required');
      return false;
    }
    if (formData.salary.amount <= 0) {
      setError('Salary amount must be greater than 0');
      return false;
    }
    if (formData.startDate <= new Date()) {
      setError('Start date must be in the future');
      return false;
    }
    if (formData.endDate <= formData.startDate) {
      setError('End date must be after start date');
      return false;
    }
    if (formData.expiresAt <= new Date()) {
      setError('Expiration date must be in the future');
      return false;
    }
    if (!formData.terms.trim()) {
      setError('Terms and conditions are required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (status: 'draft' | 'pending_approval') => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const offerData = {
        ...formData,
        status,
        // Filter out empty strings from benefits
        benefits: formData.benefits.filter(b => b.trim())
      };

      const response = await fetch('/api/company/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(offerData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`Offer ${status === 'pending_approval' ? 'submitted for approval' : 'saved as draft'} successfully!`);
        setTimeout(() => {
          router.push('/company/offers');
        }, 2000);
      } else {
        setError(result.error || 'Failed to create offer');
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedApplication = () => {
    return applications.find(app => app.id === formData.applicationId);
  };

  // Auto-populate job title when application is selected
  useEffect(() => {
    const selectedApp = getSelectedApplication();
    if (selectedApp) {
      // In real app, fetch job details from jobId
      setFormData(prev => ({
        ...prev,
        jobTitle: 'Software Engineering Intern' // Mock job title
      }));
    }
  }, [formData.applicationId]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/company/offers">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Offers
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Create Job Offer</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          {/* Candidate Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Select Candidate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="applicationId">Candidate *</Label>
                <select
                  id="applicationId"
                  value={formData.applicationId}
                  onChange={(e) => handleInputChange('applicationId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select a candidate...</option>
                  {applications.map(application => (
                    <option key={application.id} value={application.id}>
                      {application.candidate.name} - {application.candidate.email}
                    </option>
                  ))}
                </select>
              </div>

              {getSelectedApplication() && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Selected Candidate</h4>
                  <div className="text-sm text-blue-800">
                    <p><strong>Name:</strong> {getSelectedApplication()?.candidate.name}</p>
                    <p><strong>Email:</strong> {getSelectedApplication()?.candidate.email}</p>
                    <p><strong>Education:</strong> {getSelectedApplication()?.candidate.education}</p>
                    <p><strong>Experience:</strong> {getSelectedApplication()?.candidate.experience}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  placeholder="e.g., Software Engineering Intern"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate.toISOString().split('T')[0]}
                    onChange={(e) => handleInputChange('startDate', new Date(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate.toISOString().split('T')[0]}
                    onChange={(e) => handleInputChange('endDate', new Date(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="expiresAt">Offer Expires At *</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={formData.expiresAt.toISOString().split('T')[0]}
                  onChange={(e) => handleInputChange('expiresAt', new Date(e.target.value))}
                />
                <p className="text-sm text-gray-500 mt-1">
                  How long the candidate has to accept this offer
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Compensation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Compensation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="salaryAmount">Salary Amount *</Label>
                  <Input
                    id="salaryAmount"
                    type="number"
                    value={formData.salary.amount}
                    onChange={(e) => handleInputChange('salary.amount', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    value={formData.salary.currency}
                    onChange={(e) => handleInputChange('salary.currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="period">Period</Label>
                  <select
                    id="period"
                    value={formData.salary.period}
                    onChange={(e) => handleInputChange('salary.period', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="hour">Per Hour</option>
                    <option value="month">Per Month</option>
                    <option value="year">Per Year</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Benefits</Label>
                <div className="space-y-2 mt-2">
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={benefit}
                        onChange={(e) => handleArrayChange('benefits', index, e.target.value)}
                        placeholder="Enter a benefit"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('benefits', index)}
                        disabled={formData.benefits.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('benefits')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Benefit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms and Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Terms and Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="terms">Terms and Conditions *</Label>
                <Textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => handleInputChange('terms', e.target.value)}
                  placeholder="Enter the terms and conditions for this offer..."
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Internal notes (not visible to candidate)..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Link href="/company/offers">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </>
              )}
            </Button>
            <Button 
              onClick={() => handleSubmit('pending_approval')}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Approval
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
