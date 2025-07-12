'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  X, 
  Calendar, 
  MapPin, 
  Building2, 
  DollarSign, 
  Clock,
  Filter,
  RotateCcw,
  Search
} from 'lucide-react';

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export interface FilterState {
  search: string;
  status: string[];
  companies: string[];
  locations: string[];
  dateRange: {
    start?: Date;
    end?: Date;
  };
  salaryRange: {
    min?: number;
    max?: number;
  };
  applicationDate: {
    start?: Date;
    end?: Date;
  };
  jobTypes: string[];
  experienceLevels: string[];
  skills: string[];
}

const statusOptions = [
  { value: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-800' },
  { value: 'reviewed', label: 'Under Review', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'interview_scheduled', label: 'Interview Scheduled', color: 'bg-purple-100 text-purple-800' },
  { value: 'interview_completed', label: 'Interview Completed', color: 'bg-purple-100 text-purple-800' },
  { value: 'accepted', label: 'Accepted', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'bg-gray-100 text-gray-800' }
];

const jobTypeOptions = [
  'Full-time Internship',
  'Part-time Internship',
  'Summer Internship',
  'Winter Internship',
  'Remote Internship',
  'On-site Internship',
  'Hybrid Internship'
];

const experienceLevelOptions = [
  'Entry Level',
  'Beginner',
  'Intermediate',
  'Advanced',
  'No Experience Required'
];

const skillOptions = [
  'JavaScript',
  'React',
  'Node.js',
  'Python',
  'Java',
  'C++',
  'SQL',
  'HTML/CSS',
  'Git',
  'AWS',
  'Docker',
  'Machine Learning',
  'Data Analysis',
  'UI/UX Design',
  'Project Management'
];

export default function AdvancedFilters({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters
}: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const handleArrayFilterChange = (
    filterKey: keyof FilterState,
    value: string,
    checked: boolean
  ) => {
    const currentArray = localFilters[filterKey] as string[];
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    setLocalFilters(prev => ({
      ...prev,
      [filterKey]: newArray
    }));
  };

  const handleDateRangeChange = (
    rangeKey: 'dateRange' | 'applicationDate',
    dateKey: 'start' | 'end',
    value: string
  ) => {
    const date = value ? new Date(value) : undefined;
    setLocalFilters(prev => ({
      ...prev,
      [rangeKey]: {
        ...prev[rangeKey],
        [dateKey]: date
      }
    }));
  };

  const handleSalaryRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value) : undefined;
    setLocalFilters(prev => ({
      ...prev,
      salaryRange: {
        ...prev.salaryRange,
        [type]: numValue
      }
    }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApplyFilters();
    onClose();
  };

  const handleClear = () => {
    const clearedFilters: FilterState = {
      search: '',
      status: [],
      companies: [],
      locations: [],
      dateRange: {},
      salaryRange: {},
      applicationDate: {},
      jobTypes: [],
      experienceLevels: [],
      skills: []
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClearFilters();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.status.length > 0) count++;
    if (localFilters.companies.length > 0) count++;
    if (localFilters.locations.length > 0) count++;
    if (localFilters.dateRange.start || localFilters.dateRange.end) count++;
    if (localFilters.salaryRange.min || localFilters.salaryRange.max) count++;
    if (localFilters.applicationDate.start || localFilters.applicationDate.end) count++;
    if (localFilters.jobTypes.length > 0) count++;
    if (localFilters.experienceLevels.length > 0) count++;
    if (localFilters.skills.length > 0) count++;
    return count;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Advanced Filters</span>
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFilterCount()} active
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search applications, jobs, companies..."
                value={localFilters.search}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Application Status
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {statusOptions.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status.value}`}
                    checked={localFilters.status.includes(status.value)}
                    onCheckedChange={(checked) =>
                      handleArrayFilterChange('status', status.value, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`status-${status.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <Badge className={status.color}>
                      {status.label}
                    </Badge>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Date Ranges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                <Calendar className="h-4 w-4 inline mr-2" />
                Job Posting Date
              </label>
              <div className="space-y-2">
                <Input
                  type="date"
                  placeholder="Start date"
                  value={localFilters.dateRange.start ? localFilters.dateRange.start.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateRangeChange('dateRange', 'start', e.target.value)}
                />
                <Input
                  type="date"
                  placeholder="End date"
                  value={localFilters.dateRange.end ? localFilters.dateRange.end.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateRangeChange('dateRange', 'end', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                <Clock className="h-4 w-4 inline mr-2" />
                Application Date
              </label>
              <div className="space-y-2">
                <Input
                  type="date"
                  placeholder="Start date"
                  value={localFilters.applicationDate.start ? localFilters.applicationDate.start.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateRangeChange('applicationDate', 'start', e.target.value)}
                />
                <Input
                  type="date"
                  placeholder="End date"
                  value={localFilters.applicationDate.end ? localFilters.applicationDate.end.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateRangeChange('applicationDate', 'end', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Salary Range */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              <DollarSign className="h-4 w-4 inline mr-2" />
              Salary Range (per hour)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Min salary"
                value={localFilters.salaryRange.min || ''}
                onChange={(e) => handleSalaryRangeChange('min', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max salary"
                value={localFilters.salaryRange.max || ''}
                onChange={(e) => handleSalaryRangeChange('max', e.target.value)}
              />
            </div>
          </div>

          {/* Job Types */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Job Types
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {jobTypeOptions.map((jobType) => (
                <div key={jobType} className="flex items-center space-x-2">
                  <Checkbox
                    id={`jobType-${jobType}`}
                    checked={localFilters.jobTypes.includes(jobType)}
                    onCheckedChange={(checked) =>
                      handleArrayFilterChange('jobTypes', jobType, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`jobType-${jobType}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {jobType}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Levels */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Experience Level
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {experienceLevelOptions.map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`experience-${level}`}
                    checked={localFilters.experienceLevels.includes(level)}
                    onCheckedChange={(checked) =>
                      handleArrayFilterChange('experienceLevels', level, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`experience-${level}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {level}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Skills & Technologies
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {skillOptions.map((skill) => (
                <div key={skill} className="flex items-center space-x-2">
                  <Checkbox
                    id={`skill-${skill}`}
                    checked={localFilters.skills.includes(skill)}
                    onCheckedChange={(checked) =>
                      handleArrayFilterChange('skills', skill, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`skill-${skill}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {skill}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <Button variant="outline" onClick={handleClear} className="flex items-center space-x-2">
            <RotateCcw className="h-4 w-4" />
            <span>Clear All</span>
          </Button>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              Apply Filters
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
