'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  User, 
  Briefcase,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { CompanyRegistration } from '@/types/company';

interface CompanyRegistrationFormProps {
  onSubmit: (data: CompanyRegistration) => void;
  onCancel?: () => void;
  className?: string;
}

const industryOptions = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Media & Entertainment',
  'Real Estate',
  'Transportation',
  'Energy',
  'Non-profit',
  'Government',
  'Other'
];

const companySizeOptions = [
  { value: 'startup', label: '1-10 employees' },
  { value: 'small', label: '11-50 employees' },
  { value: 'medium', label: '51-200 employees' },
  { value: 'large', label: '201-1000 employees' },
  { value: 'enterprise', label: '1000+ employees' }
];

export default function CompanyRegistrationForm({ 
  onSubmit, 
  onCancel, 
  className = '' 
}: CompanyRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CompanyRegistration>({
    companyName: '',
    industry: '',
    companySize: 'startup',
    foundedYear: new Date().getFullYear(),
    website: '',
    description: '',
    businessEmail: '',
    businessPhone: '',
    headquarters: '',
    contactPerson: {
      firstName: '',
      lastName: '',
      title: '',
      email: '',
      phone: ''
    },
    registrationNumber: '',
    taxId: '',
    termsAccepted: false,
    privacyPolicyAccepted: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof CompanyRegistration],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.industry) newErrors.industry = 'Industry is required';
        if (!formData.description.trim()) newErrors.description = 'Company description is required';
        if (!formData.website.trim()) newErrors.website = 'Website is required';
        break;
      
      case 2:
        if (!formData.businessEmail.trim()) newErrors.businessEmail = 'Business email is required';
        if (!formData.businessPhone.trim()) newErrors.businessPhone = 'Business phone is required';
        if (!formData.headquarters.trim()) newErrors.headquarters = 'Headquarters location is required';
        break;
      
      case 3:
        if (!formData.contactPerson.firstName.trim()) newErrors['contactPerson.firstName'] = 'First name is required';
        if (!formData.contactPerson.lastName.trim()) newErrors['contactPerson.lastName'] = 'Last name is required';
        if (!formData.contactPerson.title.trim()) newErrors['contactPerson.title'] = 'Job title is required';
        if (!formData.contactPerson.email.trim()) newErrors['contactPerson.email'] = 'Email is required';
        break;
      
      case 4:
        if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';
        if (!formData.privacyPolicyAccepted) newErrors.privacyPolicyAccepted = 'You must accept the privacy policy';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onSubmit(formData);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Company Information</h2>
        <p className="text-gray-600">Tell us about your company</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            placeholder="Enter your company name"
            className={errors.companyName ? 'border-red-500' : ''}
          />
          {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="industry">Industry *</Label>
            <select
              id="industry"
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${errors.industry ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select industry</option>
              {industryOptions.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry}</p>}
          </div>

          <div>
            <Label htmlFor="companySize">Company Size</Label>
            <select
              id="companySize"
              value={formData.companySize}
              onChange={(e) => handleInputChange('companySize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {companySizeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="foundedYear">Founded Year</Label>
            <Input
              id="foundedYear"
              type="number"
              value={formData.foundedYear}
              onChange={(e) => handleInputChange('foundedYear', parseInt(e.target.value))}
              min="1800"
              max={new Date().getFullYear()}
            />
          </div>

          <div>
            <Label htmlFor="website">Website *</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://www.yourcompany.com"
              className={errors.website ? 'border-red-500' : ''}
            />
            {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Company Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your company, mission, and what you do..."
            rows={4}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
        <p className="text-gray-600">How can we reach your company?</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="businessEmail">Business Email *</Label>
          <Input
            id="businessEmail"
            type="email"
            value={formData.businessEmail}
            onChange={(e) => handleInputChange('businessEmail', e.target.value)}
            placeholder="contact@yourcompany.com"
            className={errors.businessEmail ? 'border-red-500' : ''}
          />
          {errors.businessEmail && <p className="text-red-500 text-sm mt-1">{errors.businessEmail}</p>}
        </div>

        <div>
          <Label htmlFor="businessPhone">Business Phone *</Label>
          <Input
            id="businessPhone"
            value={formData.businessPhone}
            onChange={(e) => handleInputChange('businessPhone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className={errors.businessPhone ? 'border-red-500' : ''}
          />
          {errors.businessPhone && <p className="text-red-500 text-sm mt-1">{errors.businessPhone}</p>}
        </div>

        <div>
          <Label htmlFor="headquarters">Headquarters Location *</Label>
          <Input
            id="headquarters"
            value={formData.headquarters}
            onChange={(e) => handleInputChange('headquarters', e.target.value)}
            placeholder="City, State, Country"
            className={errors.headquarters ? 'border-red-500' : ''}
          />
          {errors.headquarters && <p className="text-red-500 text-sm mt-1">{errors.headquarters}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="registrationNumber">Business Registration Number</Label>
            <Input
              id="registrationNumber"
              value={formData.registrationNumber}
              onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div>
            <Label htmlFor="taxId">Tax ID</Label>
            <Input
              id="taxId"
              value={formData.taxId}
              onChange={(e) => handleInputChange('taxId', e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <User className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Primary Contact</h2>
        <p className="text-gray-600">Who should we contact regarding your account?</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.contactPerson.firstName}
              onChange={(e) => handleInputChange('contactPerson.firstName', e.target.value)}
              className={errors['contactPerson.firstName'] ? 'border-red-500' : ''}
            />
            {errors['contactPerson.firstName'] && <p className="text-red-500 text-sm mt-1">{errors['contactPerson.firstName']}</p>}
          </div>

          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.contactPerson.lastName}
              onChange={(e) => handleInputChange('contactPerson.lastName', e.target.value)}
              className={errors['contactPerson.lastName'] ? 'border-red-500' : ''}
            />
            {errors['contactPerson.lastName'] && <p className="text-red-500 text-sm mt-1">{errors['contactPerson.lastName']}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="title">Job Title *</Label>
          <Input
            id="title"
            value={formData.contactPerson.title}
            onChange={(e) => handleInputChange('contactPerson.title', e.target.value)}
            placeholder="e.g., HR Manager, CEO, Recruiter"
            className={errors['contactPerson.title'] ? 'border-red-500' : ''}
          />
          {errors['contactPerson.title'] && <p className="text-red-500 text-sm mt-1">{errors['contactPerson.title']}</p>}
        </div>

        <div>
          <Label htmlFor="contactEmail">Email Address *</Label>
          <Input
            id="contactEmail"
            type="email"
            value={formData.contactPerson.email}
            onChange={(e) => handleInputChange('contactPerson.email', e.target.value)}
            className={errors['contactPerson.email'] ? 'border-red-500' : ''}
          />
          {errors['contactPerson.email'] && <p className="text-red-500 text-sm mt-1">{errors['contactPerson.email']}</p>}
        </div>

        <div>
          <Label htmlFor="contactPhone">Phone Number</Label>
          <Input
            id="contactPhone"
            value={formData.contactPerson.phone}
            onChange={(e) => handleInputChange('contactPerson.phone', e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Terms & Conditions</h2>
        <p className="text-gray-600">Please review and accept our terms</p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">Registration Summary</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Company:</span> {formData.companyName}</p>
            <p><span className="font-medium">Industry:</span> {formData.industry}</p>
            <p><span className="font-medium">Contact:</span> {formData.contactPerson.firstName} {formData.contactPerson.lastName}</p>
            <p><span className="font-medium">Email:</span> {formData.businessEmail}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={formData.termsAccepted}
              onCheckedChange={(checked) => handleInputChange('termsAccepted', checked)}
            />
            <div className="text-sm">
              <label htmlFor="terms" className="font-medium text-gray-900">
                I accept the Terms and Conditions *
              </label>
              <p className="text-gray-600">
                By checking this box, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
              </p>
            </div>
          </div>
          {errors.termsAccepted && <p className="text-red-500 text-sm">{errors.termsAccepted}</p>}

          <div className="flex items-start space-x-3">
            <Checkbox
              id="privacy"
              checked={formData.privacyPolicyAccepted}
              onCheckedChange={(checked) => handleInputChange('privacyPolicyAccepted', checked)}
            />
            <div className="text-sm">
              <label htmlFor="privacy" className="font-medium text-gray-900">
                I accept the Privacy Policy *
              </label>
              <p className="text-gray-600">
                By checking this box, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
              </p>
            </div>
          </div>
          {errors.privacyPolicyAccepted && <p className="text-red-500 text-sm">{errors.privacyPolicyAccepted}</p>}
        </div>
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: 'Company Info', component: renderStep1 },
    { number: 2, title: 'Contact Details', component: renderStep2 },
    { number: 3, title: 'Primary Contact', component: renderStep3 },
    { number: 4, title: 'Review & Accept', component: renderStep4 }
  ];

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Company Registration</CardTitle>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4 mt-6">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step.number 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {currentStep > step.number ? <CheckCircle className="h-5 w-5" /> : step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-px mx-2 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-2">
            <p className="text-sm text-gray-600">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {steps[currentStep - 1].component()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevious}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
              {currentStep === 1 && onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>

            <div>
              {currentStep < steps.length ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit}>
                  Complete Registration
                  <CheckCircle className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
