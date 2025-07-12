"use client";

import React from 'react';
import {
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Globe,
  Briefcase,
  Plus,
  Trash2
} from 'lucide-react';
import type { InternshipDetails } from '@/types/internship';

interface InternshipDetailsFormProps {
  data: Partial<InternshipDetails>;
  onChange: (data: Partial<InternshipDetails>) => void;
}

export default function InternshipDetailsForm({ data, onChange }: InternshipDetailsFormProps) {
  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing',
    'Engineering', 'Design', 'Sales', 'Operations', 'Research',
    'Consulting', 'Non-profit', 'Government', 'Media', 'Retail'
  ];

  const skillSuggestions = [
    'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Java',
    'Project Management', 'Data Analysis', 'Marketing', 'Design',
    'Communication', 'Leadership', 'Problem Solving', 'Teamwork'
  ];

  const addSkill = (skill: string) => {
    if (skill.trim() && !data.skills?.includes(skill.trim())) {
      onChange({
        ...data,
        skills: [...(data.skills || []), skill.trim()]
      });
    }
  };

  const removeSkill = (index: number) => {
    onChange({
      ...data,
      skills: data.skills?.filter((_, i) => i !== index)
    });
  };

  const addLanguage = () => {
    onChange({
      ...data,
      languages: [...(data.languages || []), { name: '', proficiency: 'Basic' }]
    });
  };

  const updateLanguage = (index: number, field: string, value: string) => {
    const updatedLanguages = [...(data.languages || [])];
    updatedLanguages[index] = { ...updatedLanguages[index], [field]: value };
    onChange({
      ...data,
      languages: updatedLanguages
    });
  };

  const removeLanguage = (index: number) => {
    onChange({
      ...data,
      languages: data.languages?.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-8">
      {/* Duration */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Internship Duration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={data.duration?.startDate || ''}
              onChange={(e) => onChange({
                ...data,
                duration: { ...data.duration!, startDate: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={data.duration?.endDate || ''}
              onChange={(e) => onChange({
                ...data,
                duration: { ...data.duration!, endDate: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.duration?.isFlexible || false}
              onChange={(e) => onChange({
                ...data,
                duration: { ...data.duration!, isFlexible: e.target.checked }
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">I'm flexible with dates</span>
          </label>
        </div>
      </div>

      {/* Preferred Industry */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Preferred Industry
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {industries.map((industry) => (
            <label key={industry} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.preferredIndustry?.includes(industry) || false}
                onChange={(e) => {
                  const current = data.preferredIndustry || [];
                  if (e.target.checked) {
                    onChange({
                      ...data,
                      preferredIndustry: [...current, industry]
                    });
                  } else {
                    onChange({
                      ...data,
                      preferredIndustry: current.filter(i => i !== industry)
                    });
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{industry}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Preferred Locations */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Preferred Locations
        </h3>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Add a location and press Enter"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                const location = e.currentTarget.value.trim();
                if (!data.preferredLocations?.includes(location)) {
                  onChange({
                    ...data,
                    preferredLocations: [...(data.preferredLocations || []), location]
                  });
                }
                e.currentTarget.value = '';
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex flex-wrap gap-2">
            {data.preferredLocations?.map((location, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {location}
                <button
                  onClick={() => onChange({
                    ...data,
                    preferredLocations: data.preferredLocations?.filter((_, i) => i !== index)
                  })}
                  className="text-green-600 hover:text-green-800"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Salary Range */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Preferred Salary Range
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min</label>
            <input
              type="number"
              value={data.salaryRange?.min || ''}
              onChange={(e) => onChange({
                ...data,
                salaryRange: { ...data.salaryRange!, min: parseInt(e.target.value) || 0 }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max</label>
            <input
              type="number"
              value={data.salaryRange?.max || ''}
              onChange={(e) => onChange({
                ...data,
                salaryRange: { ...data.salaryRange!, max: parseInt(e.target.value) || 0 }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              value={data.salaryRange?.currency || 'USD'}
              onChange={(e) => onChange({
                ...data,
                salaryRange: { ...data.salaryRange!, currency: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
            <select
              value={data.salaryRange?.period || 'hour'}
              onChange={(e) => onChange({
                ...data,
                salaryRange: { ...data.salaryRange!, period: e.target.value as any }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="hour">Per Hour</option>
              <option value="week">Per Week</option>
              <option value="month">Per Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Skills</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Add a skill and press Enter"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  addSkill(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex flex-wrap gap-2">
              {skillSuggestions.filter(skill => !data.skills?.includes(skill)).slice(0, 8).map((skill) => (
                <button
                  key={skill}
                  onClick={() => addSkill(skill)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.skills?.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {skill}
                <button
                  onClick={() => removeSkill(index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Languages */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Languages
        </h3>
        <div className="space-y-3">
          {data.languages?.map((language, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Language"
                value={language.name}
                onChange={(e) => updateLanguage(index, 'name', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={language.proficiency}
                onChange={(e) => updateLanguage(index, 'proficiency', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Basic">Basic</option>
                <option value="Conversational">Conversational</option>
                <option value="Fluent">Fluent</option>
                <option value="Native">Native</option>
              </select>
              <button
                onClick={() => removeLanguage(index)}
                className="p-2 text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addLanguage}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            Add Language
          </button>
        </div>
      </div>
    </div>
  );
}
