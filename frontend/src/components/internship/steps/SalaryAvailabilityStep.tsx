"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DollarSign, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SalaryAvailabilityStepProps {
  data: {
    salary: {
      minimum: number | null;
      maximum: number | null;
      currency: string;
      negotiable: boolean;
    };
    availability: {
      startDate: string | null;
      endDate: string | null;
      immediateStart: boolean;
      partTime: boolean;
      fullTime: boolean;
    };
  };
  onChange: (data: any) => void;
  errors?: Record<string, string>;
}

// Currency is fixed to MYR for Malaysia
const CURRENCY = 'MYR';

const SALARY_RANGES = [
  { min: 0, max: 500, label: 'Unpaid' },
  { min: 500, max: 1000, label: 'RM 500 - RM 1,000/month' },
  { min: 1000, max: 1500, label: 'RM 1,000 - RM 1,500/month' },
  { min: 1500, max: 2000, label: 'RM 1,500 - RM 2,000/month' },
  { min: 2000, max: 3000, label: 'RM 2,000 - RM 3,000/month' },
  { min: 3000, max: 4000, label: 'RM 3,000 - RM 4,000/month' },
  { min: 4000, max: 10000, label: 'RM 4,000+/month' }
];

export default function SalaryAvailabilityStep({ data, onChange, errors = {} }: SalaryAvailabilityStepProps) {
  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      'MYR': 'RM',
      'USD': '$',
      'SGD': 'S$',
      'EUR': '€',
      'GBP': '£'
    };
    return symbols[currency] || currency;
  };

  const handleSalaryChange = (field: string, value: any) => {
    onChange({
      salary: {
        ...data.salary,
        currency: 'MYR', // Always ensure currency is MYR
        [field]: value
      }
    });
  };

  const handleAvailabilityChange = (field: string, value: any) => {
    onChange({
      availability: {
        ...data.availability,
        [field]: value
      }
    });
  };

  const handleSalaryRangeSelect = (range: typeof SALARY_RANGES[0]) => {
    onChange({
      salary: {
        ...data.salary,
        currency: 'MYR',
        minimum: range.min,
        maximum: range.max === 10000 ? null : range.max
      }
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString);
  };

  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    handleAvailabilityChange(field, date ? date.toISOString().split('T')[0] : null);
  };

  return (
    <div className="space-y-8">
      {/* Salary Expectations */}
      <div>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <Label className="text-base font-medium">
              Salary Expectations <span className="text-red-500">*</span>
            </Label>
          </div>
          <p className="text-sm text-gray-600">
            Set your salary expectations. This helps match you with appropriate opportunities.
          </p>
          {errors.salary && (
            <p className="text-sm text-red-600 mt-1">{errors.salary}</p>
          )}
        </div>

        {/* Quick Salary Range Selection */}
        <div className="mb-4">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Quick Select (Monthly)
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {SALARY_RANGES.map((range, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSalaryRangeSelect(range)}
                className="justify-start text-left h-auto py-2 px-3"
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Salary Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="currency" className="text-sm font-medium mb-2 block">
              Currency
            </Label>
            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
              MYR (RM) - Malaysian Ringgit
            </div>
            <p className="text-xs text-gray-500 mt-1">
              All salaries are in Malaysian Ringgit
            </p>
          </div>

          <div>
            <Label htmlFor="minSalary" className="text-sm font-medium mb-2 block">
              Minimum (Monthly)
            </Label>
            <Input
              id="minSalary"
              type="number"
              placeholder="0"
              value={data.salary.minimum || ''}
              onChange={(e) => handleSalaryChange('minimum', e.target.value ? parseInt(e.target.value) : null)}
            />
          </div>

          <div>
            <Label htmlFor="maxSalary" className="text-sm font-medium mb-2 block">
              Maximum (Monthly)
            </Label>
            <Input
              id="maxSalary"
              type="number"
              placeholder="Optional"
              value={data.salary.maximum || ''}
              onChange={(e) => handleSalaryChange('maximum', e.target.value ? parseInt(e.target.value) : null)}
            />
          </div>
        </div>

        {/* Negotiable Option */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="negotiable"
              checked={data.salary.negotiable}
              onCheckedChange={(checked) => handleSalaryChange('negotiable', checked)}
            />
            <Label htmlFor="negotiable" className="font-medium">
              Salary is Negotiable
            </Label>
          </div>
          <p className="text-sm text-gray-600 mt-1 ml-6">
            I'm open to discussing salary based on the role and company
          </p>
        </div>
      </div>

      {/* Availability */}
      <div>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <Label className="text-base font-medium">
              Availability <span className="text-red-500">*</span>
            </Label>
          </div>
          <p className="text-sm text-gray-600">
            Specify when you're available to start and your preferred work schedule.
          </p>
          {errors.availability && (
            <p className="text-sm text-red-600 mt-1">{errors.availability}</p>
          )}
        </div>

        {/* Immediate Start Option */}
        <div className="mb-4 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="immediateStart"
              checked={data.availability.immediateStart}
              onCheckedChange={(checked) => handleAvailabilityChange('immediateStart', checked)}
            />
            <Label htmlFor="immediateStart" className="font-medium">
              Available to Start Immediately
            </Label>
          </div>
          <p className="text-sm text-gray-600 mt-1 ml-6">
            I can start within 1-2 weeks
          </p>
        </div>

        {/* Date Selection */}
        {!data.availability.immediateStart && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Earliest Start Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !data.availability.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.availability.startDate ? (
                      format(formatDate(data.availability.startDate)!, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formatDate(data.availability.startDate)}
                    onSelect={(date) => handleDateChange('startDate', date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Latest End Date (Optional)
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !data.availability.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.availability.endDate ? (
                      format(formatDate(data.availability.endDate)!, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formatDate(data.availability.endDate)}
                    onSelect={(date) => handleDateChange('endDate', date)}
                    disabled={(date) => {
                      const startDate = formatDate(data.availability.startDate);
                      return startDate ? date < startDate : date < new Date();
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {/* Work Schedule Preferences */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Work Schedule Preferences
          </Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fullTime"
                checked={data.availability.fullTime}
                onCheckedChange={(checked) => handleAvailabilityChange('fullTime', checked)}
              />
              <Label htmlFor="fullTime" className="font-medium">
                Full-time (40+ hours/week)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="partTime"
                checked={data.availability.partTime}
                onCheckedChange={(checked) => handleAvailabilityChange('partTime', checked)}
              />
              <Label htmlFor="partTime" className="font-medium">
                Part-time (20-39 hours/week)
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {(data.salary.minimum || data.availability.startDate || data.availability.immediateStart) && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-2">Summary</h4>
          <div className="text-sm text-purple-800 space-y-1">
            <p>
              <strong>Salary:</strong> {
                data.salary.minimum
                  ? `RM ${data.salary.minimum}${data.salary.maximum ? ` - RM ${data.salary.maximum}` : '+'}/month${data.salary.negotiable ? ' (negotiable)' : ''}`
                  : 'Not specified'
              }
            </p>
            <p>
              <strong>Availability:</strong> {
                data.availability.immediateStart 
                  ? 'Immediate start'
                  : data.availability.startDate 
                    ? `From ${format(formatDate(data.availability.startDate)!, "MMM dd, yyyy")}`
                    : 'Not specified'
              }
            </p>
            <p>
              <strong>Schedule:</strong> {
                [
                  data.availability.fullTime && 'Full-time',
                  data.availability.partTime && 'Part-time'
                ].filter(Boolean).join(', ') || 'Not specified'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
