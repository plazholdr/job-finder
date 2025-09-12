"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, Briefcase, ArrowLeft, CheckCircle, ArrowRight, Plus, Trash2, GraduationCap, Heart, Building, Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import SocialLoginButtons from '@/components/auth/social-login-buttons';
import { useAuth } from '@/contexts/auth-context';
import config from '@/config';

// Step-by-step schemas
const step1Schema = z.object({
  role: z.enum(['student', 'company'], { message: 'Please select your role' }),
});

const step2Schema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});

const step3Schema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  icPassport: z.string().min(1, { message: 'IC/Passport number is required' }),
  phone: z.string().min(1, { message: 'Phone number is required' }),
  photo: z.any().optional(),
});

const educationSchema = z.object({
  level: z.string().min(1, { message: 'Education level is required' }),
  institution: z.string().min(1, { message: 'Institution name is required' }),
  qualification: z.string().min(1, { message: 'Qualification/Programme is required' }),
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().min(1, { message: 'End date is required' }),
  fieldOfStudy: z.string().min(1, { message: 'Field of study is required' }),
});

const certificationSchema = z.object({
  title: z.string().min(1, { message: 'Certificate title is required' }),
  issuer: z.string().min(1, { message: 'Certificate issuer is required' }),
  acquiredDate: z.string().min(1, { message: 'Acquired date is required' }),
  description: z.string().optional(),
});

const interestSchema = z.object({
  title: z.string().min(1, { message: 'Interest title is required' }),
  description: z.string().optional(),
  socialLink: z.string().optional(),
});

const workExperienceSchema = z.object({
  companyName: z.string().min(1, { message: 'Company name is required' }),
  industry: z.string().min(1, { message: 'Industry is required' }),
  jobTitle: z.string().min(1, { message: 'Job title is required' }),
  employmentType: z.enum(['part-time', 'full-time'], { message: 'Employment type is required' }),
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().optional(),
  isOngoing: z.boolean().optional(),
  jobDescription: z.string().optional(),
});

const eventExperienceSchema = z.object({
  eventName: z.string().min(1, { message: 'Event name is required' }),
  eventDescription: z.string().optional(),
  eventPosition: z.string().optional(),
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().optional(),
  eventLocation: z.string().optional(),
});

const completeRegistrationSchema = z.object({
  role: z.enum(['student', 'company']),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  icPassport: z.string().min(1),
  phone: z.string().min(1),
  photo: z.any().optional(),
  education: z.array(educationSchema).min(1, { message: 'At least one education entry is required' }),
  certifications: z.array(certificationSchema).optional(),
  interests: z.array(interestSchema).optional(),
  workExperience: z.array(workExperienceSchema).optional(),
  eventExperience: z.array(eventExperienceSchema).optional(),
});

type RegisterFormValues = z.infer<typeof completeRegistrationSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'student' | 'company' | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<RegisterFormValues>>({});

  // Dynamic form arrays
  const [educationEntries, setEducationEntries] = useState([{
    level: '', institution: '', qualification: '', startDate: '', endDate: '', fieldOfStudy: ''
  }]);
  const [certificationEntries, setCertificationEntries] = useState([{
    title: '', issuer: '', acquiredDate: '', description: ''
  }]);
  const [interestEntries, setInterestEntries] = useState([{
    title: '', description: '', socialLink: ''
  }]);
  const [workExperienceEntries, setWorkExperienceEntries] = useState([{
    companyName: '', industry: '', jobTitle: '', employmentType: 'part-time' as 'part-time' | 'full-time',
    startDate: '', endDate: '', isOngoing: false, jobDescription: ''
  }]);
  const [eventExperienceEntries, setEventExperienceEntries] = useState([{
    eventName: '', eventDescription: '', eventPosition: '', startDate: '', endDate: '', eventLocation: ''
  }]);

  // Dynamic form for current step
  const getCurrentSchema = () => {
    switch (currentStep) {
      case 1: return step1Schema;
      case 2: return step2Schema;
      case 3: return step3Schema;
      default: return completeRegistrationSchema;
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<any>({
    // resolver: zodResolver(getCurrentSchema()),
    defaultValues: formData,
  });

  const watchedRole = watch('role');
  const watchedEmail = watch('email');

  const onStepSubmit = async (data: any) => {
    setRegisterError(null);

    // Save current step data
    setFormData(prev => ({ ...prev, ...data }));

    if (currentStep === 8) {
      // Final submission
      setIsLoading(true);
      try {
        const completeData = { ...formData, ...data };
        await registerUser(completeData);

        setTimeout(() => {
          router.push(`/auth/registration-success?email=${encodeURIComponent(completeData.email)}`);
        }, 100);
      } catch (error: any) {
        setRegisterError(error.message || 'An error occurred during registration. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Move to next step
      setCurrentStep(prev => prev + 1);
      reset(); // Reset form for next step
    }
  };

  const handleRoleSelection = (role: 'student' | 'company') => {
    setSelectedRole(role);
    setValue('role', role);
    setFormData(prev => ({ ...prev, role }));

    // Move to next step after role selection
    setTimeout(() => {
      setCurrentStep(2);
      reset(); // Reset form for next step
    }, 300);
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      reset(); // Reset form for previous step
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    reset();
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
            <p className="text-sm text-gray-500 text-center">I'm a student/job seeker</p>
            <p className="text-xs text-blue-600 mt-1 font-medium">8-step profile setup</p>
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
            <p className="text-sm text-blue-600 text-center">I'm a company/employer</p>
            <p className="text-xs text-blue-500 mt-1 font-medium">Simplified setup (for now)</p>
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

  // Step 2: Username/Password
  const renderStep2 = () => (
    <motion.div
      className="w-full max-w-md space-y-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <button
          onClick={goToPreviousStep}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Account Credentials</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create your login credentials
        </p>
      </div>

      {registerError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-500">{registerError}</p>
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onStepSubmit)}>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                placeholder="Email address (this will be your username)"
                className={`pl-10 h-12 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{String(errors.email?.message || '')}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <Input
                type="password"
                placeholder="Password (minimum 8 characters)"
                className={`pl-10 h-12 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{String(errors.password?.message || '')}</p>
            )}
          </div>

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

        <Button
          type="submit"
          className="w-full h-12 bg-blue-600 hover:bg-blue-500"
        >
          Continue to Profile Information
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </motion.div>
  );

  // Step 3: Profile Information
  const renderStep3 = () => (
    <motion.div
      className="w-full max-w-md space-y-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <button
          onClick={goToPreviousStep}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Profile Information</h1>
        <p className="mt-2 text-sm text-gray-600">
          Tell us about yourself
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

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onStepSubmit)}>
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
                <p className="text-sm text-red-500">{String(errors.firstName?.message || '')}</p>
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
                <p className="text-sm text-red-500">{String(errors.lastName?.message || '')}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Input
              type="text"
              placeholder="IC / Passport Number"
              className={`h-12 ${errors.icPassport ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              {...register('icPassport')}
            />
            {errors.icPassport && (
              <p className="text-sm text-red-500">{String(errors.icPassport?.message || '')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Input
              type="tel"
              placeholder="Phone Number"
              className={`h-12 ${errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              {...register('phone')}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{String(errors.phone?.message || '')}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Profile Photo (Optional)
            </label>
            <Input
              type="file"
              accept="image/*"
              className="h-12"
              {...register('photo')}
            />
          </div>

          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email (if different from username)"
              className="h-12"
              defaultValue={formData.email || ''}
              disabled
            />
            <p className="text-xs text-gray-500">This will be your login email</p>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-blue-600 hover:bg-blue-500"
        >
          Continue to Education Background
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </motion.div>
  );

  // Step 4: Education Background
  const renderStep4 = () => (
    <motion.div
      className="w-full max-w-2xl space-y-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <button
          onClick={goToPreviousStep}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Education Background</h1>
        <p className="mt-2 text-sm text-gray-600">
          Add your educational qualifications (you can add multiple entries)
        </p>
      </div>

      {registerError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-500">{registerError}</p>
        </div>
      )}

      <div className="space-y-6">
        {educationEntries.map((entry, index) => (
          <div key={index} className="p-6 border border-gray-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">Education {index + 1}</h3>
              </div>
              {educationEntries.length > 1 && (
                <button
                  type="button"
                  onClick={() => setEducationEntries(prev => prev.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <select
                  value={entry.level}
                  onChange={(e) => {
                    const newEntries = [...educationEntries];
                    newEntries[index].level = e.target.value;
                    setEducationEntries(newEntries);
                  }}
                  className="w-full h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Education Level</option>
                  <option value="high-school">High School</option>
                  <option value="diploma">Diploma</option>
                  <option value="bachelor">Bachelor's Degree</option>
                  <option value="master">Master's Degree</option>
                  <option value="phd">PhD</option>
                  <option value="certificate">Certificate</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Input
                  type="text"
                  placeholder="Institution Name"
                  value={entry.institution}
                  onChange={(e) => {
                    const newEntries = [...educationEntries];
                    newEntries[index].institution = e.target.value;
                    setEducationEntries(newEntries);
                  }}
                  className="h-12"
                />
              </div>

              <div>
                <Input
                  type="text"
                  placeholder="Qualification / Programme"
                  value={entry.qualification}
                  onChange={(e) => {
                    const newEntries = [...educationEntries];
                    newEntries[index].qualification = e.target.value;
                    setEducationEntries(newEntries);
                  }}
                  className="h-12"
                />
              </div>

              <div>
                <Input
                  type="text"
                  placeholder="Field of Study"
                  value={entry.fieldOfStudy}
                  onChange={(e) => {
                    const newEntries = [...educationEntries];
                    newEntries[index].fieldOfStudy = e.target.value;
                    setEducationEntries(newEntries);
                  }}
                  className="h-12"
                />
              </div>

              <div>
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={entry.startDate}
                  onChange={(e) => {
                    const newEntries = [...educationEntries];
                    newEntries[index].startDate = e.target.value;
                    setEducationEntries(newEntries);
                  }}
                  className="h-12"
                />
              </div>

              <div>
                <Input
                  type="date"
                  placeholder="End Date"
                  value={entry.endDate}
                  onChange={(e) => {
                    const newEntries = [...educationEntries];
                    newEntries[index].endDate = e.target.value;
                    setEducationEntries(newEntries);
                  }}
                  className="h-12"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setEducationEntries(prev => [...prev, {
            level: '', institution: '', qualification: '', startDate: '', endDate: '', fieldOfStudy: ''
          }])}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
        >
          <Plus className="h-5 w-5 mx-auto mb-2" />
          Add Another Education Entry
        </button>
      </div>

      <Button
        onClick={() => {
          setFormData(prev => ({ ...prev, education: educationEntries }));
          setCurrentStep(5);
        }}
        className="w-full h-12 bg-blue-600 hover:bg-blue-500"
        disabled={educationEntries.some(entry => !entry.level || !entry.institution || !entry.qualification)}
      >
        Continue to Certifications
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </motion.div>
  );

  // Step 5: Certifications
  const renderStep5 = () => (
    <motion.div
      className="w-full max-w-2xl space-y-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <button
          onClick={goToPreviousStep}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Certifications</h1>
        <p className="mt-2 text-sm text-gray-600">
          Add your professional certifications (optional - you can skip this step)
        </p>
      </div>

      <div className="space-y-6">
        {certificationEntries.map((entry, index) => (
          <div key={index} className="p-6 border border-gray-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-gray-900">Certification {index + 1}</h3>
              </div>
              {certificationEntries.length > 1 && (
                <button
                  type="button"
                  onClick={() => setCertificationEntries(prev => prev.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  type="text"
                  placeholder="Certificate Title"
                  value={entry.title}
                  onChange={(e) => {
                    const newEntries = [...certificationEntries];
                    newEntries[index].title = e.target.value;
                    setCertificationEntries(newEntries);
                  }}
                  className="h-12"
                />
              </div>

              <div>
                <Input
                  type="text"
                  placeholder="Certificate Issuer"
                  value={entry.issuer}
                  onChange={(e) => {
                    const newEntries = [...certificationEntries];
                    newEntries[index].issuer = e.target.value;
                    setCertificationEntries(newEntries);
                  }}
                  className="h-12"
                />
              </div>

              <div>
                <Input
                  type="date"
                  placeholder="Acquired Date"
                  value={entry.acquiredDate}
                  onChange={(e) => {
                    const newEntries = [...certificationEntries];
                    newEntries[index].acquiredDate = e.target.value;
                    setCertificationEntries(newEntries);
                  }}
                  className="h-12"
                />
              </div>

              <div className="md:col-span-2">
                <textarea
                  placeholder="Description (optional)"
                  value={entry.description}
                  onChange={(e) => {
                    const newEntries = [...certificationEntries];
                    newEntries[index].description = e.target.value;
                    setCertificationEntries(newEntries);
                  }}
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setCertificationEntries(prev => [...prev, {
            title: '', issuer: '', acquiredDate: '', description: ''
          }])}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
        >
          <Plus className="h-5 w-5 mx-auto mb-2" />
          Add Another Certification
        </button>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => {
            setFormData(prev => ({ ...prev, certifications: [] }));
            setCurrentStep(6);
          }}
          variant="outline"
          className="flex-1 h-12"
        >
          Skip This Step
        </Button>
        <Button
          onClick={() => {
            setFormData(prev => ({ ...prev, certifications: certificationEntries }));
            setCurrentStep(6);
          }}
          className="flex-1 h-12 bg-blue-600 hover:bg-blue-500"
        >
          Continue to Interests
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );

  // Step 6: Interests
  const renderStep6 = () => (
    <motion.div
      className="w-full max-w-2xl space-y-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <button
          onClick={goToPreviousStep}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Interests</h1>
        <p className="mt-2 text-sm text-gray-600">
          Tell us about your interests and hobbies (optional)
        </p>
      </div>

      <div className="space-y-6">
        {interestEntries.map((entry, index) => (
          <div key={index} className="p-6 border border-gray-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <h3 className="font-medium text-gray-900">Interest {index + 1}</h3>
              </div>
              {interestEntries.length > 1 && (
                <button
                  type="button"
                  onClick={() => setInterestEntries(prev => prev.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Input
                  type="text"
                  placeholder="Interest Title"
                  value={entry.title}
                  onChange={(e) => {
                    const newEntries = [...interestEntries];
                    newEntries[index].title = e.target.value;
                    setInterestEntries(newEntries);
                  }}
                  className="h-12"
                />
              </div>

              <div>
                <textarea
                  placeholder="Interest Description (optional)"
                  value={entry.description}
                  onChange={(e) => {
                    const newEntries = [...interestEntries];
                    newEntries[index].description = e.target.value;
                    setInterestEntries(newEntries);
                  }}
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <Input
                  type="url"
                  placeholder="Social Link (optional)"
                  value={entry.socialLink}
                  onChange={(e) => {
                    const newEntries = [...interestEntries];
                    newEntries[index].socialLink = e.target.value;
                    setInterestEntries(newEntries);
                  }}
                  className="h-12"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setInterestEntries(prev => [...prev, {
            title: '', description: '', socialLink: ''
          }])}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
        >
          <Plus className="h-5 w-5 mx-auto mb-2" />
          Add Another Interest
        </button>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => {
            setFormData(prev => ({ ...prev, interests: [] }));
            setCurrentStep(7);
          }}
          variant="outline"
          className="flex-1 h-12"
        >
          Skip This Step
        </Button>
        <Button
          onClick={() => {
            setFormData(prev => ({ ...prev, interests: interestEntries }));
            setCurrentStep(7);
          }}
          className="flex-1 h-12 bg-blue-600 hover:bg-blue-500"
        >
          Continue to Work Experience
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );

  // Step 7: Work Experience
  const renderStep7 = () => (
    <motion.div
      className="w-full max-w-2xl space-y-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <button
          onClick={goToPreviousStep}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Work Experience</h1>
        <p className="mt-2 text-sm text-gray-600">
          Add your previous work experience (optional)
        </p>
      </div>

      <div className="space-y-6">
        {workExperienceEntries.map((entry, index) => (
          <div key={index} className="p-6 border border-gray-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">Work Experience {index + 1}</h3>
              </div>
              {workExperienceEntries.length > 1 && (
                <button
                  type="button"
                  onClick={() => setWorkExperienceEntries(prev => prev.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  type="text"
                  placeholder="Company Name"
                  value={entry.companyName}
                  onChange={(e) => {
                    const newEntries = [...workExperienceEntries];
                    newEntries[index].companyName = e.target.value;
                    setWorkExperienceEntries(newEntries);
                  }}
                  className="h-12"
                />
              </div>

              <div>
                <select
                  value={entry.industry}
                  onChange={(e) => {
                    const newEntries = [...workExperienceEntries];
                    newEntries[index].industry = e.target.value;
                    setWorkExperienceEntries(newEntries);
                  }}
                  className="w-full h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Industry</option>
                  <option value="technology">Technology</option>
                  <option value="finance">Finance</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                  <option value="retail">Retail</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="consulting">Consulting</option>
                  <option value="media">Media & Entertainment</option>
                  <option value="government">Government</option>
                  <option value="nonprofit">Non-profit</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Input
                  type="text"
                  placeholder="Job Title"
                  value={entry.jobTitle}
                  onChange={(e) => {
                    const newEntries = [...workExperienceEntries];
                    newEntries[index].jobTitle = e.target.value;
                    setWorkExperienceEntries(newEntries);
                  }}
                  className="h-12"
                />
              </div>

              <div>
                <select
                  value={entry.employmentType}
                  onChange={(e) => {
                    const newEntries = [...workExperienceEntries];
                    newEntries[index].employmentType = e.target.value as 'part-time' | 'full-time';
                    setWorkExperienceEntries(newEntries);
                  }}
                  className="w-full h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="part-time">Part-time</option>
                  <option value="full-time">Full-time</option>
                </select>
              </div>

              <div>
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={entry.startDate}
                  onChange={(e) => {
                    const newEntries = [...workExperienceEntries];
                    newEntries[index].startDate = e.target.value;
                    setWorkExperienceEntries(newEntries);
                  }}
                  className="h-12"
                />
              </div>

              <div>
                <Input
                  type="date"
                  placeholder="End Date"
                  value={entry.endDate}
                  onChange={(e) => {
                    const newEntries = [...workExperienceEntries];
                    newEntries[index].endDate = e.target.value;
                    setWorkExperienceEntries(newEntries);
                  }}
                  className="h-12"
                  disabled={entry.isOngoing}
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={entry.isOngoing}
                    onChange={(e) => {
                      const newEntries = [...workExperienceEntries];
                      newEntries[index].isOngoing = e.target.checked;
                      if (e.target.checked) {
                        newEntries[index].endDate = '';
                      }
                      setWorkExperienceEntries(newEntries);
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Currently working here</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <textarea
                  placeholder="Job Description (optional)"
                  value={entry.jobDescription}
                  onChange={(e) => {
                    const newEntries = [...workExperienceEntries];
                    newEntries[index].jobDescription = e.target.value;
                    setWorkExperienceEntries(newEntries);
                  }}
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setWorkExperienceEntries(prev => [...prev, {
            companyName: '', industry: '', jobTitle: '', employmentType: 'part-time' as const,
            startDate: '', endDate: '', isOngoing: false, jobDescription: ''
          }])}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
        >
          <Plus className="h-5 w-5 mx-auto mb-2" />
          Add Another Work Experience
        </button>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => {
            setFormData(prev => ({ ...prev, workExperience: [] }));
            setCurrentStep(8);
          }}
          variant="outline"
          className="flex-1 h-12"
        >
          Skip This Step
        </Button>
        <Button
          onClick={() => {
            setFormData(prev => ({ ...prev, workExperience: workExperienceEntries }));
            setCurrentStep(8);
          }}
          className="flex-1 h-12 bg-blue-600 hover:bg-blue-500"
        >
          Continue to Event Experience
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );

  // Step 8: Event Experience (Final Step)
  const renderStep8 = () => (
    <motion.div
      className="w-full max-w-2xl space-y-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <button
          onClick={goToPreviousStep}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Event Experience</h1>
        <p className="mt-2 text-sm text-gray-600">
          Add your event participation experience (optional - final step!)
        </p>
      </div>

      {registerError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-500">{registerError}</p>
        </div>
      )}

      <div className="space-y-6">
        {eventExperienceEntries.map((entry, index) => (
          <div key={index} className="p-6 border border-gray-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <h3 className="font-medium text-gray-900">Event Experience {index + 1}</h3>
              </div>
              {eventExperienceEntries.length > 1 && (
                <button
                  type="button"
                  onClick={() => setEventExperienceEntries(prev => prev.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  type="text"
                  placeholder="Event Name"
                  value={entry.eventName}
                  onChange={(e) => {
                    const newEntries = [...eventExperienceEntries];
                    newEntries[index].eventName = e.target.value;
                    setEventExperienceEntries(newEntries);
                  }}
                  className="h-12"
                />
              </div>

              <div>
                <Input
                  type="text"
                  placeholder="Event Position (optional)"
                  value={entry.eventPosition}
                  onChange={(e) => {
                    const newEntries = [...eventExperienceEntries];
                    newEntries[index].eventPosition = e.target.value;
                    setEventExperienceEntries(newEntries);
                  }}
                  className="h-12"
                />
              </div>

              <div>
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={entry.startDate}
                  onChange={(e) => {
                    const newEntries = [...eventExperienceEntries];
                    newEntries[index].startDate = e.target.value;
                    setEventExperienceEntries(newEntries);
                  }}
                  className="h-12"
                />
              </div>

              <div>
                <Input
                  type="date"
                  placeholder="End Date (optional)"
                  value={entry.endDate}
                  onChange={(e) => {
                    const newEntries = [...eventExperienceEntries];
                    newEntries[index].endDate = e.target.value;
                    setEventExperienceEntries(newEntries);
                  }}
                  className="h-12"
                />
              </div>

              <div>
                <Input
                  type="text"
                  placeholder="Event Location (optional)"
                  value={entry.eventLocation}
                  onChange={(e) => {
                    const newEntries = [...eventExperienceEntries];
                    newEntries[index].eventLocation = e.target.value;
                    setEventExperienceEntries(newEntries);
                  }}
                  className="h-12"
                />
              </div>

              <div className="md:col-span-2">
                <textarea
                  placeholder="Event Description (optional)"
                  value={entry.eventDescription}
                  onChange={(e) => {
                    const newEntries = [...eventExperienceEntries];
                    newEntries[index].eventDescription = e.target.value;
                    setEventExperienceEntries(newEntries);
                  }}
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setEventExperienceEntries(prev => [...prev, {
            eventName: '', eventDescription: '', eventPosition: '', startDate: '', endDate: '', eventLocation: ''
          }])}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
        >
          <Plus className="h-5 w-5 mx-auto mb-2" />
          Add Another Event Experience
        </button>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={async () => {
            setIsLoading(true);
            try {
              const completeData = {
                ...formData,
                eventExperience: [],
                // Add any additional interests from this step
                interests: [...(formData.interests || []), ...interestEntries.filter(i => i.title)]
              };
              await registerUser(completeData as any);

              setTimeout(() => {
                router.push(`/auth/registration-success?email=${encodeURIComponent(completeData.email || '')}`);
              }, 100);
            } catch (error: any) {
              setRegisterError(error.message || 'An error occurred during registration. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }}
          variant="outline"
          className="flex-1 h-12"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Skip & Complete Registration'}
        </Button>
        <Button
          onClick={async () => {
            setIsLoading(true);
            try {
              const completeData = {
                ...formData,
                eventExperience: eventExperienceEntries,
                // Add any additional interests from this step
                interests: [...(formData.interests || []), ...interestEntries.filter(i => i.title)]
              };
              await registerUser(completeData as any);

              setTimeout(() => {
                router.push(`/auth/registration-success?email=${encodeURIComponent(completeData.email || '')}`);
              }, 100);
            } catch (error: any) {
              setRegisterError(error.message || 'An error occurred during registration. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }}
          className="flex-1 h-12 bg-blue-600 hover:bg-blue-500"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Complete Registration'}
          {!isLoading && <CheckCircle className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </motion.div>
  );

  // Company registration step 2 - Basic credentials
  const renderCompanyStep2 = () => (
    <motion.div
      className="w-full max-w-md space-y-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <button
          onClick={goToPreviousStep}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Company Admin Setup</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create your company admin account - Step 1 of 2
        </p>
      </div>

      {registerError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-500">{registerError}</p>
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(async (data) => {
        setIsLoading(true);
        try {
          // Step 1: Create company admin account and send verification email
          const adminData = {
            ...formData,
            ...data,
            role: 'company',
            requireEmailVerification: true
          };

          // Call backend users endpoint directly (backend sends verification email on create)
          const username = (data.username || '').trim();
          const providedEmail = (data.email || '').trim();
          const looksLikeEmail = /.+@.+\..+/.test(username);
          const email = providedEmail || (looksLikeEmail ? username : '');

          // Client-side validation: if username isn't an email, email is required
          if (!email) {
            throw new Error('Email is required if username is not an email');
          }

          // Build payload without firstName/lastName for company role
          const { firstName: _fn, lastName: _ln, ...restAdmin } = adminData as any;
          const payload = {
            ...restAdmin,
            username: username || undefined,
            email,
            password: data.password,
          };

          const response = await fetch(`${config.api.baseUrl}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
          }

          // Redirect to email sent page
          router.push(`/auth/email-sent?email=${encodeURIComponent(email)}&type=company`);

        } catch (error: any) {
          setRegisterError(error.message || 'An error occurred during registration. Please try again.');
        } finally {
          setIsLoading(false);
        }
      })}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Username (can be email)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Username or Email"
                className="pl-10 h-12"
                {...register('username')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <Input
                type="password"
                placeholder="Password"
                className="pl-10 h-12"
                {...register('password')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Email (if username is not email)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                placeholder="Company Email (optional if username is email)"
                className="pl-10 h-12"
                {...register('email')}
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Company Admin Account
              </span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              You'll receive a verification email (valid for 24 hours)
            </p>
          </div>
        </div>

        <Button
          type="submit"
          className="relative w-full h-12 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <span className={`${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            Create Admin Account & Send Verification
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
      </form>
    </motion.div>
  );

  // Placeholder function (no longer used)
  const renderPlaceholderStep = (stepNumber: number, title: string, nextTitle: string) => (
    <motion.div
      className="w-full max-w-md space-y-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <button
          onClick={goToPreviousStep}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-gray-600">
          Step {stepNumber} of 8
        </p>
      </div>

      <div className="p-8 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600 mb-4">This step is coming soon!</p>
        <p className="text-sm text-gray-500">For now, we'll skip to the next step.</p>
      </div>

      <Button
        onClick={() => setCurrentStep(prev => prev + 1)}
        className="w-full h-12 bg-blue-600 hover:bg-blue-500"
      >
        Continue to {nextTitle}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </motion.div>
  );

  const renderCurrentStep = () => {
    // Role selection is always step 1
    if (currentStep === 1) {
      return renderRoleSelection();
    }

    // Different flows based on selected role
    if (selectedRole === 'student') {
      // 8-step flow for job seekers (Find Jobs)
      switch (currentStep) {
        case 2:
          return renderStep2();
        case 3:
          return renderStep3();
        case 4:
          return renderStep4();
        case 5:
          return renderStep5();
        case 6:
          return renderStep6();
        case 7:
          return renderStep7();
        case 8:
          return renderStep8();
        default:
          return renderRoleSelection();
      }
    } else if (selectedRole === 'company') {
      // Simplified flow for employers (Hire Talent) - placeholder for now
      switch (currentStep) {
        case 2:
          return renderCompanyStep2();
        default:
          return renderRoleSelection();
      }
    }

    return renderRoleSelection();
  };

  return (
    <div className="w-full flex items-center justify-center p-8 md:p-16 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {renderCurrentStep()}
    </div>
  );
}
