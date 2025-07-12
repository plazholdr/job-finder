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
  FileText
} from 'lucide-react';

interface StudentProfileEditProps {
  user: any;
  onSave: (data: any) => void;
  saving: boolean;
}

export default function StudentProfileEdit({ user, onSave, saving }: StudentProfileEditProps) {
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
              placeholder="+60 12-345 6789"
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
  );
}
