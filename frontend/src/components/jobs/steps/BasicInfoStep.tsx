"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';

const MALAYSIAN_LOCATIONS = [
  'Kuala Lumpur',
  'Selangor',
  'Penang',
  'Johor Bahru',
  'Petaling Jaya',
  'Shah Alam',
  'Subang Jaya',
  'Cyberjaya',
  'Putrajaya',
  'Ipoh',
  'Kota Kinabalu',
  'Kuching',
  'Melaka',
  'Kota Bharu',
  'Alor Setar'
];

interface BasicInfoStepProps {
  data: {
    title: string;
    description: string;
    location: string;
    remoteWork: boolean;
  };
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export default function BasicInfoStep({ data, onChange, errors }: BasicInfoStepProps) {
  const handleChange = (field: string, value: string) => {
    onChange({
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title" className="text-sm font-medium text-gray-700">
          Job Title *
        </Label>
        <Input
          id="title"
          type="text"
          value={data.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="e.g. Software Engineer Intern"
          className={`mt-1 ${errors.title ? 'border-red-500' : ''}`}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Enter a clear, descriptive job title that candidates will understand
        </p>
      </div>

      <div>
        <Label htmlFor="description" className="text-sm font-medium text-gray-700">
          Job Description *
        </Label>
        <Textarea
          id="description"
          value={data.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
          rows={6}
          className={`mt-1 ${errors.description ? 'border-red-500' : ''}`}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Provide a detailed description of the role, responsibilities, and company culture
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            Work Location *
          </Label>
          <Select
            value={data.location || ''}
            onValueChange={(value) => handleChange('location', value)}
          >
            <SelectTrigger className={`mt-1 ${errors.location ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {MALAYSIAN_LOCATIONS.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Select the primary work location for this position
          </p>
        </div>

        <div className="flex items-center space-x-2 mt-6">
          <Checkbox
            id="remoteWork"
            checked={data.remoteWork || false}
            onCheckedChange={(checked) => 
              onChange({ remoteWork: checked })
            }
          />
          <Label htmlFor="remoteWork" className="text-sm text-gray-700">
            Remote work available
          </Label>
          <p className="mt-1 text-sm text-gray-500">
            Select the primary work location for this position
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for a great job description:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Be specific about daily responsibilities</li>
          <li>• Mention learning opportunities and mentorship</li>
          <li>• Highlight company culture and values</li>
          <li>• Include information about the team structure</li>
        </ul>
      </div>
    </div>
  );
}
