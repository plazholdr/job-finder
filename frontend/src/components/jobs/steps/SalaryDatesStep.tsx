"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface SalaryDatesStepProps {
  data: {
    salary: {
      minimum: number | null;
      maximum: number | null;
      currency: string;
      negotiable: boolean;
      type: string;
    };
    duration: {
      months: number | null;
      startDate: string | null;
      endDate: string | null;
      flexible: boolean;
    };
  };
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export default function SalaryDatesStep({ data, onChange, errors }: SalaryDatesStepProps) {
  const handleSalaryChange = (field: string, value: any) => {
    onChange({
      salary: {
        ...data.salary,
        [field]: value
      }
    });
  };

  const handleDurationChange = (field: string, value: any) => {
    onChange({
      duration: {
        ...data.duration,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Salary Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Compensation</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="salaryType" className="text-sm font-medium text-gray-700">
              Salary Type *
            </Label>
            <Select
              value={data.salary?.type || 'monthly'}
              onValueChange={(value) => handleSalaryChange('type', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="currency" className="text-sm font-medium text-gray-700">
              Currency
            </Label>
            <div className="mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
              MYR (RM) - Malaysian Ringgit
            </div>
            <p className="mt-1 text-sm text-gray-500">
              All salaries are in Malaysian Ringgit
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minSalary" className="text-sm font-medium text-gray-700">
              Minimum Salary *
            </Label>
            <Input
              id="minSalary"
              type="number"
              value={data.salary?.minimum || ''}
              onChange={(e) => handleSalaryChange('minimum', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="e.g. 3000"
              className={`mt-1 ${errors.salary ? 'border-red-500' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="maxSalary" className="text-sm font-medium text-gray-700">
              Maximum Salary
            </Label>
            <Input
              id="maxSalary"
              type="number"
              value={data.salary?.maximum || ''}
              onChange={(e) => handleSalaryChange('maximum', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="e.g. 5000"
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="negotiable"
            checked={data.salary?.negotiable || false}
            onCheckedChange={(checked) => handleSalaryChange('negotiable', checked)}
          />
          <Label htmlFor="negotiable" className="text-sm text-gray-700">
            Salary is negotiable
          </Label>
        </div>

        {errors.salary && (
          <p className="text-sm text-red-600">{errors.salary}</p>
        )}
      </div>

      {/* Duration & Dates Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Duration & Timeline</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
              Duration (months) *
            </Label>
            <Input
              id="duration"
              type="number"
              value={data.duration?.months || ''}
              onChange={(e) => handleDurationChange('months', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="e.g. 3"
              className={`mt-1 ${errors.duration ? 'border-red-500' : ''}`}
            />
            <p className="mt-1 text-sm text-gray-500">
              Typical internship duration
            </p>
          </div>

          <div>
            <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
              Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={data.duration?.startDate || ''}
              onChange={(e) => handleDurationChange('startDate', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
              End Date
            </Label>
            <Input
              id="endDate"
              type="date"
              value={data.duration?.endDate || ''}
              onChange={(e) => handleDurationChange('endDate', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="flexible"
            checked={data.duration?.flexible || false}
            onCheckedChange={(checked) => handleDurationChange('flexible', checked)}
          />
          <Label htmlFor="flexible" className="text-sm text-gray-700">
            Dates are flexible
          </Label>
        </div>

        {errors.duration && (
          <p className="text-sm text-red-600">{errors.duration}</p>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">💰 Salary Guidelines:</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Research market rates for similar positions</li>
          <li>• Consider the candidate's experience level</li>
          <li>• Include benefits and perks in your job description</li>
          <li>• Be transparent about compensation to attract quality candidates</li>
        </ul>
      </div>
    </div>
  );
}
