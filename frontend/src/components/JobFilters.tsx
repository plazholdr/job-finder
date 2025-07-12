"use client";

import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Building2, 
  Clock,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface JobFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export interface JobFilters {
  location: string[];
  jobType: string[];
  experienceLevel: string[];
  salaryRange: {
    min: number;
    max: number;
  };
  companySize: string[];
  remote: boolean | null;
  postedWithin: string;
  skills: string[];
}

const jobTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Freelance',
  'Temporary'
];

const experienceLevels = [
  'Entry Level',
  'Mid Level',
  'Senior Level',
  'Lead/Principal',
  'Executive'
];

const companySizes = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees'
];

const postedWithinOptions = [
  { value: 'any', label: 'Any time' },
  { value: '1', label: 'Past 24 hours' },
  { value: '3', label: 'Past 3 days' },
  { value: '7', label: 'Past week' },
  { value: '14', label: 'Past 2 weeks' },
  { value: '30', label: 'Past month' }
];

const popularSkills = [
  'JavaScript', 'React', 'Node.js', 'Python', 'TypeScript',
  'Java', 'AWS', 'Docker', 'Kubernetes', 'MongoDB',
  'PostgreSQL', 'Git', 'REST APIs', 'GraphQL', 'Redux'
];

const popularLocations = [
  'San Francisco, CA',
  'New York, NY',
  'Seattle, WA',
  'Austin, TX',
  'Boston, MA',
  'Los Angeles, CA',
  'Chicago, IL',
  'Denver, CO',
  'Remote',
  'Hybrid'
];

export default function JobFilters({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange, 
  onApplyFilters,
  onClearFilters 
}: JobFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    location: true,
    jobType: true,
    experience: false,
    salary: false,
    company: false,
    remote: false,
    posted: false,
    skills: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleArrayFilterChange = (
    filterKey: keyof JobFilters,
    value: string,
    checked: boolean
  ) => {
    const currentArray = filters[filterKey] as string[];
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    onFiltersChange({
      ...filters,
      [filterKey]: newArray
    });
  };

  const handleSalaryChange = (type: 'min' | 'max', value: number) => {
    onFiltersChange({
      ...filters,
      salaryRange: {
        ...filters.salaryRange,
        [type]: value
      }
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.location.length > 0) count++;
    if (filters.jobType.length > 0) count++;
    if (filters.experienceLevel.length > 0) count++;
    if (filters.salaryRange.min > 0 || filters.salaryRange.max < 500000) count++;
    if (filters.companySize.length > 0) count++;
    if (filters.remote !== null) count++;
    if (filters.postedWithin !== 'any') count++;
    if (filters.skills.length > 0) count++;
    return count;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Job Filters</h2>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                {getActiveFiltersCount()} active
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('location')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-900">Location</span>
                </div>
                {expandedSections.location ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedSections.location && (
                <div className="space-y-2 pl-6">
                  {popularLocations.map((location) => (
                    <label key={location} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.location.includes(location)}
                        onChange={(e) => handleArrayFilterChange('location', location, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{location}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Job Type */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('jobType')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-900">Job Type</span>
                </div>
                {expandedSections.jobType ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedSections.jobType && (
                <div className="space-y-2 pl-6">
                  {jobTypes.map((type) => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.jobType.includes(type)}
                        onChange={(e) => handleArrayFilterChange('jobType', type, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Experience Level */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('experience')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-900">Experience Level</span>
                </div>
                {expandedSections.experience ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedSections.experience && (
                <div className="space-y-2 pl-6">
                  {experienceLevels.map((level) => (
                    <label key={level} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.experienceLevel.includes(level)}
                        onChange={(e) => handleArrayFilterChange('experienceLevel', level, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{level}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Salary Range */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('salary')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-900">Salary Range</span>
                </div>
                {expandedSections.salary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedSections.salary && (
                <div className="space-y-4 pl-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Min Salary</label>
                      <input
                        type="number"
                        value={filters.salaryRange.min}
                        onChange={(e) => handleSalaryChange('min', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Max Salary</label>
                      <input
                        type="number"
                        value={filters.salaryRange.max}
                        onChange={(e) => handleSalaryChange('max', parseInt(e.target.value) || 500000)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="500000"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Company Size */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('company')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-900">Company Size</span>
                </div>
                {expandedSections.company ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedSections.company && (
                <div className="space-y-2 pl-6">
                  {companySizes.map((size) => (
                    <label key={size} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.companySize.includes(size)}
                        onChange={(e) => handleArrayFilterChange('companySize', size, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{size}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Posted Within */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('posted')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-900">Posted Within</span>
                </div>
                {expandedSections.posted ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedSections.posted && (
                <div className="space-y-2 pl-6">
                  {postedWithinOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="postedWithin"
                        value={option.value}
                        checked={filters.postedWithin === option.value}
                        onChange={(e) => onFiltersChange({ ...filters, postedWithin: e.target.value })}
                        className="border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Skills - Full Width */}
          <div className="mt-6 space-y-3">
            <button
              onClick={() => toggleSection('skills')}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="font-medium text-gray-900">Skills & Technologies</span>
              {expandedSections.skills ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {expandedSections.skills && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {popularSkills.map((skill) => (
                  <label key={skill} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.skills.includes(skill)}
                      onChange={(e) => handleArrayFilterChange('skills', skill, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{skill}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Clear All Filters
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onApplyFilters();
                onClose();
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
