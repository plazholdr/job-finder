"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';

interface IndustryRoleStepProps {
  data: {
    industries: string[];
    roles: string[];
  };
  onChange: (data: any) => void;
  errors?: Record<string, string>;
}

const POPULAR_INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Marketing',
  'Consulting',
  'Manufacturing',
  'Retail',
  'Media & Entertainment',
  'Non-profit',
  'Government',
  'Real Estate',
  'Transportation',
  'Energy',
  'Telecommunications'
];

const POPULAR_ROLES = [
  'Software Engineer',
  'Data Analyst',
  'Product Manager',
  'Marketing Coordinator',
  'Business Analyst',
  'UX/UI Designer',
  'Sales Associate',
  'Research Assistant',
  'Project Coordinator',
  'Content Creator',
  'Financial Analyst',
  'HR Assistant',
  'Operations Intern',
  'Quality Assurance',
  'Customer Success'
];

export default function IndustryRoleStep({ data, onChange, errors = {} }: IndustryRoleStepProps) {
  const [customIndustry, setCustomIndustry] = React.useState('');
  const [customRole, setCustomRole] = React.useState('');

  const handleIndustryToggle = (industry: string) => {
    const updatedIndustries = data.industries.includes(industry)
      ? data.industries.filter(i => i !== industry)
      : [...data.industries, industry];
    
    onChange({ industries: updatedIndustries });
  };

  const handleRoleToggle = (role: string) => {
    const updatedRoles = data.roles.includes(role)
      ? data.roles.filter(r => r !== role)
      : [...data.roles, role];
    
    onChange({ roles: updatedRoles });
  };

  const addCustomIndustry = () => {
    if (customIndustry.trim() && !data.industries.includes(customIndustry.trim())) {
      onChange({ industries: [...data.industries, customIndustry.trim()] });
      setCustomIndustry('');
    }
  };

  const addCustomRole = () => {
    if (customRole.trim() && !data.roles.includes(customRole.trim())) {
      onChange({ roles: [...data.roles, customRole.trim()] });
      setCustomRole('');
    }
  };

  const removeIndustry = (industry: string) => {
    onChange({ industries: data.industries.filter(i => i !== industry) });
  };

  const removeRole = (role: string) => {
    onChange({ roles: data.roles.filter(r => r !== role) });
  };

  return (
    <div className="space-y-8">
      {/* Industries Section */}
      <div>
        <div className="mb-4">
          <Label className="text-base font-medium">
            Preferred Industries <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-600 mt-1">
            Select the industries you're interested in working in. You can choose multiple options.
          </p>
          {errors.industries && (
            <p className="text-sm text-red-600 mt-1">{errors.industries}</p>
          )}
        </div>

        {/* Selected Industries */}
        {data.industries.length > 0 && (
          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Selected Industries ({data.industries.length})
            </Label>
            <div className="flex flex-wrap gap-2">
              {data.industries.map((industry) => (
                <Badge
                  key={industry}
                  variant="default"
                  className="flex items-center gap-1 px-3 py-1"
                >
                  {industry}
                  <button
                    onClick={() => removeIndustry(industry)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Popular Industries */}
        <div className="mb-4">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Popular Industries
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {POPULAR_INDUSTRIES.map((industry) => (
              <Button
                key={industry}
                variant={data.industries.includes(industry) ? "default" : "outline"}
                size="sm"
                onClick={() => handleIndustryToggle(industry)}
                className="justify-start text-left h-auto py-2 px-3"
              >
                {industry}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Industry Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Add custom industry..."
            value={customIndustry}
            onChange={(e) => setCustomIndustry(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomIndustry()}
            className="flex-1"
          />
          <Button
            onClick={addCustomIndustry}
            disabled={!customIndustry.trim()}
            size="sm"
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Roles Section */}
      <div>
        <div className="mb-4">
          <Label className="text-base font-medium">
            Preferred Roles <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-600 mt-1">
            Select the types of roles you're interested in. You can choose multiple options.
          </p>
          {errors.roles && (
            <p className="text-sm text-red-600 mt-1">{errors.roles}</p>
          )}
        </div>

        {/* Selected Roles */}
        {data.roles.length > 0 && (
          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Selected Roles ({data.roles.length})
            </Label>
            <div className="flex flex-wrap gap-2">
              {data.roles.map((role) => (
                <Badge
                  key={role}
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1"
                >
                  {role}
                  <button
                    onClick={() => removeRole(role)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Popular Roles */}
        <div className="mb-4">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Popular Roles
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {POPULAR_ROLES.map((role) => (
              <Button
                key={role}
                variant={data.roles.includes(role) ? "secondary" : "outline"}
                size="sm"
                onClick={() => handleRoleToggle(role)}
                className="justify-start text-left h-auto py-2 px-3"
              >
                {role}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Role Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Add custom role..."
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomRole()}
            className="flex-1"
          />
          <Button
            onClick={addCustomRole}
            disabled={!customRole.trim()}
            size="sm"
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Summary */}
      {(data.industries.length > 0 || data.roles.length > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Selection Summary</h4>
          <div className="text-sm text-blue-800">
            <p>
              <strong>Industries:</strong> {data.industries.length > 0 ? data.industries.join(', ') : 'None selected'}
            </p>
            <p className="mt-1">
              <strong>Roles:</strong> {data.roles.length > 0 ? data.roles.join(', ') : 'None selected'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
