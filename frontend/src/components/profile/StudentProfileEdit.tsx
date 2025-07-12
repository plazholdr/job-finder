"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Save,
  Plus,
  Trash2,
  Upload,
  User,
  GraduationCap,
  Briefcase,
  Award,
  FileText,
  Shield,
  Settings,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';

interface StudentProfileEditProps {
  user: any;
  onSave: (data: any) => void;
  saving: boolean;
}

export default function StudentProfileEdit({ user, onSave, saving }: StudentProfileEditProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy'>('profile');
  const [formData, setFormData] = useState({
    // Basic Profile
    profile: {
      bio: user.profile?.bio || '',
      phone: user.profile?.phone || '',
      location: user.profile?.location || '',
      website: user.profile?.website || '',
      linkedin: user.profile?.linkedin || '',
      github: user.profile?.github || '',
    },
    // Student Specific
    student: {
      title: user.student?.title || '',
      skills: user.student?.skills || [],
      education: user.student?.education || [],
      experience: user.student?.experience || [],
      certifications: user.student?.certifications || [],
      resume: user.student?.resume || '',
      portfolio: user.student?.portfolio || '',
    },
    // Privacy Settings
    privacy: {
      profileVisibility: user.privacy?.profileVisibility || 'public',
      showEmail: user.privacy?.showEmail ?? true,
      showPhone: user.privacy?.showPhone ?? true,
      showLocation: user.privacy?.showLocation ?? true,
    }
  });

  const [newSkill, setNewSkill] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        student: {
          ...prev.student,
          skills: [...prev.student.skills, newSkill.trim()]
        }
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      student: {
        ...prev.student,
        skills: prev.student.skills.filter((_: any, i: number) => i !== index)
      }
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      student: {
        ...prev.student,
        education: [...prev.student.education, {
          degree: '',
          institution: '',
          startDate: '',
          endDate: '',
          description: ''
        }]
      }
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      student: {
        ...prev.student,
        education: prev.student.education.map((edu: any, i: number) =>
          i === index ? { ...edu, [field]: value } : edu
        )
      }
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      student: {
        ...prev.student,
        education: prev.student.education.filter((_: any, i: number) => i !== index)
      }
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      student: {
        ...prev.student,
        experience: [...prev.student.experience, {
          position: '',
          company: '',
          startDate: '',
          endDate: '',
          description: ''
        }]
      }
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      student: {
        ...prev.student,
        experience: prev.student.experience.map((exp: any, i: number) =>
          i === index ? { ...exp, [field]: value } : exp
        )
      }
    }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      student: {
        ...prev.student,
        experience: prev.student.experience.filter((_: any, i: number) => i !== index)
      }
    }));
  };

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Update Profile
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'privacy'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy Settings
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Title
            </label>
            <Input
              value={formData.student.title}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                student: { ...prev.student, title: e.target.value }
              }))}
              placeholder="e.g., Software Developer, Marketing Specialist"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <Input
              value={formData.profile.phone}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                profile: { ...prev.profile, phone: e.target.value }
              }))}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <Input
              value={formData.profile.location}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                profile: { ...prev.profile, location: e.target.value }
              }))}
              placeholder="City, State/Country"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <Input
              value={formData.profile.website}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                profile: { ...prev.profile, website: e.target.value }
              }))}
              placeholder="https://yourwebsite.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn Profile
            </label>
            <Input
              value={formData.profile.linkedin}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                profile: { ...prev.profile, linkedin: e.target.value }
              }))}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Profile
            </label>
            <Input
              value={formData.profile.github}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                profile: { ...prev.profile, github: e.target.value }
              }))}
              placeholder="https://github.com/yourusername"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <Textarea
            value={formData.profile.bio}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              profile: { ...prev.profile, bio: e.target.value }
            }))}
            placeholder="Tell us about yourself..."
            rows={4}
          />
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Award className="h-5 w-5" />
          Skills
        </h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <Button type="button" onClick={addSkill} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.student.skills.map((skill: string, index: number) => (
              <div key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents & Links
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resume/CV URL
            </label>
            <Input
              value={formData.student.resume}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                student: { ...prev.student, resume: e.target.value }
              }))}
              placeholder="https://link-to-your-resume.pdf"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Portfolio URL
            </label>
            <Input
              value={formData.student.portfolio}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                student: { ...prev.student, portfolio: e.target.value }
              }))}
              placeholder="https://your-portfolio.com"
            />
          </div>
        </div>
      </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </h2>

          <div className="space-y-6">
            {/* Profile Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Profile Visibility
              </label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="profileVisibility"
                    value="public"
                    checked={formData.privacy.profileVisibility === 'public'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, profileVisibility: e.target.value as any }
                    }))}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Full Access</div>
                    <div className="text-sm text-gray-500">Anyone can see everything on your profile</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="profileVisibility"
                    value="restricted"
                    checked={formData.privacy.profileVisibility === 'restricted'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, profileVisibility: e.target.value as any }
                    }))}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Restricted</div>
                    <div className="text-sm text-gray-500">Cannot see name, email, and contact number</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="profileVisibility"
                    value="private"
                    checked={formData.privacy.profileVisibility === 'private'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, profileVisibility: e.target.value as any }
                    }))}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Private</div>
                    <div className="text-sm text-gray-500">Cannot be searched/display private profile when search through URL directly</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Contact Information Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Contact Information Visibility
              </label>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Show email address</div>
                    <div className="text-sm text-gray-500">Allow others to see your email</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.privacy.showEmail}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, showEmail: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Show phone number</div>
                    <div className="text-sm text-gray-500">Allow others to see your phone</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.privacy.showPhone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, showPhone: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Show location</div>
                    <div className="text-sm text-gray-500">Allow others to see your location</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.privacy.showLocation}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, showLocation: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>

            {/* Save Privacy Settings Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => onSave(formData)}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Privacy Settings'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
