'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Building2,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Save,
  Eye,
  ArrowLeft,
  Plus,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { JobPostingForm } from '@/types/company';
import Link from 'next/link';

const jobTypes = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' }
];

const jobLevels = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' }
];

const locationTypes = [
  { value: 'remote', label: 'Remote' },
  { value: 'on-site', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' }
];

const educationLevels = [
  { value: 'high-school', label: 'High School' },
  { value: 'associate', label: 'Associate Degree' },
  { value: 'bachelor', label: 'Bachelor\'s Degree' },
  { value: 'master', label: 'Master\'s Degree' },
  { value: 'phd', label: 'PhD' }
];

export default function CreateJobPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<JobPostingForm>({
    title: '',
    description: '',
    requirements: [''],
    responsibilities: [''],
    type: 'internship',
    level: 'entry',
    department: '',
    location: {
      type: 'remote',
      country: 'USA'
    },
    salary: {
      min: 0,
      max: 0,
      currency: 'USD',
      period: 'hour'
    },
    applicationDeadline: new Date(),
    requiredSkills: [''],
    preferredSkills: [''],
    education: {
      level: 'bachelor'
    },
    experience: {
      min: 0,
      unit: 'years'
    },
    applicationProcess: {
      steps: ['Application Review', 'Interview'],
      documentsRequired: ['Resume'],
      interviewProcess: ''
    },
    status: 'draft'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof JobPostingForm],
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
    const currentArray = formData[field as keyof JobPostingForm] as string[];
    const newArray = [...currentArray];
    newArray[index] = value;
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const addArrayItem = (field: string) => {
    const currentArray = formData[field as keyof JobPostingForm] as string[];
    setFormData(prev => ({
      ...prev,
      [field]: [...currentArray, '']
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    const currentArray = formData[field as keyof JobPostingForm] as string[];
    const newArray = currentArray.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Job title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Job description is required');
      return false;
    }
    if (!formData.department.trim()) {
      setError('Department is required');
      return false;
    }
    if (formData.salary.min < 0 || formData.salary.max < 0) {
      setError('Salary values must be positive');
      return false;
    }
    if (formData.salary.min > formData.salary.max && formData.salary.max > 0) {
      setError('Maximum salary must be greater than minimum salary');
      return false;
    }
    return true;
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const jobData = {
        ...formData,
        status,
        // Filter out empty strings from arrays
        requirements: formData.requirements.filter(r => r.trim()),
        responsibilities: formData.responsibilities.filter(r => r.trim()),
        requiredSkills: formData.requiredSkills.filter(s => s.trim()),
        preferredSkills: formData.preferredSkills.filter(s => s.trim()),
        applicationProcess: {
          ...formData.applicationProcess,
          steps: formData.applicationProcess.steps.filter(s => s.trim()),
          documentsRequired: formData.applicationProcess.documentsRequired.filter(d => d.trim())
        }
      };

      const response = await fetch('/api/company/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`Job ${status === 'published' ? 'published' : 'saved as draft'} successfully!`);
        setTimeout(() => {
          router.push('/company/jobs');
        }, 2000);
      } else {
        setError(result.error || 'Failed to create job posting');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/company/jobs">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Jobs
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Create Job Posting</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={() => handleSubmit('published')}
                disabled={isSubmitting}
              >
                <Eye className="h-4 w-4 mr-2" />
                Publish Job
              </Button>
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
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Software Engineering Intern"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="type">Job Type</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {jobTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="level">Experience Level</Label>
                  <select
                    id="level"
                    value={formData.level}
                    onChange={(e) => handleInputChange('level', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {jobLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="e.g., Engineering"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the role, what the intern will do, and what they'll learn..."
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location & Compensation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Location & Compensation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="locationType">Location Type</Label>
                    <select
                      id="locationType"
                      value={formData.location.type}
                      onChange={(e) => handleInputChange('location.type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {locationTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {formData.location.type !== 'remote' && (
                    <>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.location.city || ''}
                          onChange={(e) => handleInputChange('location.city', e.target.value)}
                          placeholder="e.g., San Francisco"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={formData.location.state || ''}
                          onChange={(e) => handleInputChange('location.state', e.target.value)}
                          placeholder="e.g., CA"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.location.country}
                      onChange={(e) => handleInputChange('location.country', e.target.value)}
                      placeholder="e.g., USA"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <Label>Compensation</Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="salaryMin">Min Salary</Label>
                      <Input
                        id="salaryMin"
                        type="number"
                        value={formData.salary.min}
                        onChange={(e) => handleInputChange('salary.min', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="salaryMax">Max Salary</Label>
                      <Input
                        id="salaryMax"
                        type="number"
                        value={formData.salary.max}
                        onChange={(e) => handleInputChange('salary.max', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements & Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Requirements & Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Job Requirements</Label>
                  <div className="space-y-2 mt-2">
                    {formData.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={requirement}
                          onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                          placeholder="Enter a requirement"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('requirements', index)}
                          disabled={formData.requirements.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('requirements')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Requirement
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Job Responsibilities</Label>
                  <div className="space-y-2 mt-2">
                    {formData.responsibilities.map((responsibility, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={responsibility}
                          onChange={(e) => handleArrayChange('responsibilities', index, e.target.value)}
                          placeholder="Enter a responsibility"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('responsibilities', index)}
                          disabled={formData.responsibilities.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('responsibilities')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Responsibility
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Qualifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Skills & Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Required Skills</Label>
                  <div className="space-y-2 mt-2">
                    {formData.requiredSkills.map((skill, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={skill}
                          onChange={(e) => handleArrayChange('requiredSkills', index, e.target.value)}
                          placeholder="Enter a required skill"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('requiredSkills', index)}
                          disabled={formData.requiredSkills.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('requiredSkills')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Required Skill
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Preferred Skills</Label>
                  <div className="space-y-2 mt-2">
                    {formData.preferredSkills.map((skill, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={skill}
                          onChange={(e) => handleArrayChange('preferredSkills', index, e.target.value)}
                          placeholder="Enter a preferred skill"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('preferredSkills', index)}
                          disabled={formData.preferredSkills.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('preferredSkills')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Preferred Skill
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="educationLevel">Education Level</Label>
                  <select
                    id="educationLevel"
                    value={formData.education.level}
                    onChange={(e) => handleInputChange('education.level', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {educationLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="educationField">Field of Study</Label>
                  <Input
                    id="educationField"
                    value={formData.education.field || ''}
                    onChange={(e) => handleInputChange('education.field', e.target.value)}
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="experienceMin">Minimum Experience</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="experienceMin"
                      type="number"
                      value={formData.experience.min}
                      onChange={(e) => handleInputChange('experience.min', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="flex-1"
                    />
                    <select
                      value={formData.experience.unit}
                      onChange={(e) => handleInputChange('experience.unit', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="applicationDeadline">Application Deadline</Label>
                  <Input
                    id="applicationDeadline"
                    type="date"
                    value={formData.applicationDeadline.toISOString().split('T')[0]}
                    onChange={(e) => handleInputChange('applicationDeadline', new Date(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Process */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Application Process
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Interview Process Description</Label>
                <Textarea
                  value={formData.applicationProcess.interviewProcess || ''}
                  onChange={(e) => handleInputChange('applicationProcess.interviewProcess', e.target.value)}
                  placeholder="Describe your interview process..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Application Steps</Label>
                  <div className="space-y-2 mt-2">
                    {formData.applicationProcess.steps.map((step, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={step}
                          onChange={(e) => {
                            const newSteps = [...formData.applicationProcess.steps];
                            newSteps[index] = e.target.value;
                            handleInputChange('applicationProcess.steps', newSteps);
                          }}
                          placeholder="Enter application step"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newSteps = formData.applicationProcess.steps.filter((_, i) => i !== index);
                            handleInputChange('applicationProcess.steps', newSteps);
                          }}
                          disabled={formData.applicationProcess.steps.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newSteps = [...formData.applicationProcess.steps, ''];
                        handleInputChange('applicationProcess.steps', newSteps);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Required Documents</Label>
                  <div className="space-y-2 mt-2">
                    {formData.applicationProcess.documentsRequired.map((doc, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={doc}
                          onChange={(e) => {
                            const newDocs = [...formData.applicationProcess.documentsRequired];
                            newDocs[index] = e.target.value;
                            handleInputChange('applicationProcess.documentsRequired', newDocs);
                          }}
                          placeholder="Enter required document"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newDocs = formData.applicationProcess.documentsRequired.filter((_, i) => i !== index);
                            handleInputChange('applicationProcess.documentsRequired', newDocs);
                          }}
                          disabled={formData.applicationProcess.documentsRequired.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newDocs = [...formData.applicationProcess.documentsRequired, ''];
                        handleInputChange('applicationProcess.documentsRequired', newDocs);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Document
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Link href="/company/jobs">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save as Draft'}
            </Button>
            <Button
              onClick={() => handleSubmit('published')}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Publishing...' : 'Publish Job'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
