"use client";

import React, { useState } from 'react';
import {
  X,
  User,
  GraduationCap,
  Briefcase,
  Award,
  Target,
  Upload,
  FileText,
  CheckCircle,
  ChevronRight,
  Plus,
  Trash2
} from 'lucide-react';

interface ProfileCompletionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onComplete: (profileData: any) => void;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  skills: string[];
}

export default function ProfileCompletionWizard({ isOpen, onClose, user, onComplete }: ProfileCompletionWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    basicInfo: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.profile?.bio || '',
      location: user?.profile?.location || '',
      phone: user?.profile?.phone || '',
      linkedin: user?.profile?.linkedin || '',
      github: user?.profile?.github || '',
      website: user?.profile?.website || ''
    },
    education: user?.student?.education || [],
    experience: user?.student?.experience || [],
    skills: user?.student?.skills || [],
    preferences: {
      jobTypes: user?.student?.jobPreferences?.jobTypes || [],
      locations: user?.student?.jobPreferences?.locations || [],
      remote: user?.student?.jobPreferences?.remote || false,
      expectedSalary: user?.student?.expectedSalary || ''
    },
    resume: user?.student?.resume || null
  });

  const steps = [
    { id: 1, title: 'Basic Information', icon: User },
    { id: 2, title: 'Education', icon: GraduationCap },
    { id: 3, title: 'Experience', icon: Briefcase },
    { id: 4, title: 'Skills', icon: Award },
    { id: 5, title: 'Preferences', icon: Target },
    { id: 6, title: 'Resume', icon: FileText }
  ];

  const popularSkills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'TypeScript', 'Java', 'C++', 'SQL',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'MongoDB', 'PostgreSQL', 'Redis',
    'HTML/CSS', 'Vue.js', 'Angular', 'Express.js', 'Django', 'Flask', 'Spring Boot',
    'Machine Learning', 'Data Analysis', 'UI/UX Design', 'Project Management'
  ];

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];

  const handleBasicInfoChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, [field]: value }
    }));
  };

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: '',
      description: ''
    };
    setProfileData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id: string) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      skills: []
    };
    setProfileData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id: string) => {
    setProfileData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const toggleSkill = (skill: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const addCustomSkill = (skill: string) => {
    if (skill && !profileData.skills.includes(skill)) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete(profileData);
    onClose();
  };

  const getCompletionPercentage = () => {
    let completed = 0;
    let total = 6;

    // Basic info
    if (profileData.basicInfo.bio && profileData.basicInfo.location) completed++;
    // Education
    if (profileData.education.length > 0) completed++;
    // Experience
    if (profileData.experience.length > 0) completed++;
    // Skills
    if (profileData.skills.length >= 3) completed++;
    // Preferences
    if (profileData.preferences.jobTypes.length > 0) completed++;
    // Resume
    if (profileData.resume) completed++;

    return Math.round((completed / total) * 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Complete Your Profile</h2>
            <p className="text-gray-600">Help employers find you by completing your profile</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Profile Completion</span>
            <span className="text-sm font-medium text-blue-600">{getCompletionPercentage()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionPercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Steps Navigation */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center space-x-4 overflow-x-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : isCompleted
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                    onClick={() => setCurrentStep(step.id)}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={profileData.basicInfo.firstName}
                    onChange={(e) => handleBasicInfoChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profileData.basicInfo.lastName}
                    onChange={(e) => handleBasicInfoChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={profileData.basicInfo.bio}
                    onChange={(e) => handleBasicInfoChange('bio', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={profileData.basicInfo.location}
                    onChange={(e) => handleBasicInfoChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City, State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profileData.basicInfo.phone}
                    onChange={(e) => handleBasicInfoChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={profileData.basicInfo.linkedin}
                    onChange={(e) => handleBasicInfoChange('linkedin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                  <input
                    type="url"
                    value={profileData.basicInfo.github}
                    onChange={(e) => handleBasicInfoChange('github', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Education */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Education</h3>
                <button
                  onClick={addEducation}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Education
                </button>
              </div>

              {profileData.education.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No education added yet. Click "Add Education" to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {profileData.education.map((edu, index) => (
                    <div key={edu.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Education #{index + 1}</h4>
                        <button
                          onClick={() => removeEducation(edu.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="University name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Bachelor's, Master's, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                          <input
                            type="text"
                            value={edu.field}
                            onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Computer Science, Engineering, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input
                            type="month"
                            value={edu.startDate}
                            onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                          <input
                            type="month"
                            value={edu.endDate}
                            onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Experience */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
                <button
                  onClick={addExperience}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Experience
                </button>
              </div>

              {profileData.experience.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No experience added yet. Click "Add Experience" to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {profileData.experience.map((exp, index) => (
                    <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Experience #{index + 1}</h4>
                        <button
                          onClick={() => removeExperience(exp.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Company name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                          <input
                            type="text"
                            value={exp.position}
                            onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Job title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                          <input
                            type="month"
                            value={exp.endDate}
                            onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                            disabled={exp.current}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={exp.current}
                              onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">I currently work here</span>
                          </label>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Describe your responsibilities and achievements..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Skills */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Skills & Technologies</h3>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Popular Skills</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {popularSkills.map((skill) => (
                    <label key={skill} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileData.skills.includes(skill)}
                        onChange={() => toggleSkill(skill)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Add Custom Skill</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter a skill..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addCustomSkill(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      addCustomSkill(input.value);
                      input.value = '';
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {profileData.skills.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Selected Skills ({profileData.skills.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          onClick={() => toggleSkill(skill)}
                          className="hover:text-blue-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Preferences */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Job Preferences</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Job Types</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {jobTypes.map((type) => (
                    <label key={type} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileData.preferences.jobTypes.includes(type)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...profileData.preferences.jobTypes, type]
                            : profileData.preferences.jobTypes.filter(t => t !== type);
                          setProfileData(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, jobTypes: newTypes }
                          }));
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Salary Range</label>
                <input
                  type="text"
                  value={profileData.preferences.expectedSalary}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, expectedSalary: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., $80,000 - $120,000"
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={profileData.preferences.remote}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, remote: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Open to remote work</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 6: Resume */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Resume Upload</h3>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {profileData.resume ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{profileData.resume.name || 'Resume uploaded'}</p>
                      <p className="text-sm text-gray-600">Click to replace</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Upload your resume</p>
                    <p className="text-sm text-gray-500">PDF, DOC, or DOCX (max 5MB)</p>
                  </div>
                )}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setProfileData(prev => ({ ...prev, resume: file }));
                    }
                  }}
                  className="hidden"
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  {profileData.resume ? 'Replace Resume' : 'Choose File'}
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
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
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Save & Close
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Complete Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
