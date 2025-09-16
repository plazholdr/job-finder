"use client";

import React, { useMemo } from 'react';
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

function monthsBetween(startISO?: string | null, endISO?: string | null) {
  if (!startISO || !endISO) return null;
  const s = new Date(startISO);
  const e = new Date(endISO);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  return months >= 0 ? months || 0 : null; // 0 if same month
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

  const setDurationField = (field: 'startDate'|'endDate'|'months'|'flexible', value: any) => {
    const next = { ...(data.duration || {}), [field]: value } as any;
    // auto-calc months when both dates present
    const auto = monthsBetween(next.startDate, next.endDate);
    if (auto !== null) {
      next.months = Math.max(0, auto);
    }
    onChange({ duration: next });
  };

  const readOnlyMonths = useMemo(() => {
    return Boolean(data.duration?.startDate && data.duration?.endDate);
  }, [data.duration?.startDate, data.duration?.endDate]);

  return (
    <div className="space-y-8">
      {/* Salary Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Compensation</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Currency
            </Label>
            <Select
              value={data.salary?.currency || 'MYR'}
              onValueChange={(value) => handleSalaryChange('currency', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MYR">MYR (Malaysian Ringgit)</SelectItem>
                <SelectItem value="USD">USD (US Dollar)</SelectItem>
                <SelectItem value="SGD">SGD (Singapore Dollar)</SelectItem>
                <SelectItem value="EUR">EUR (Euro)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">
              Payment Type
            </Label>
            <Select
              value={data.salary?.type || 'monthly'}
              onValueChange={(value) => handleSalaryChange('type', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Per Hour</SelectItem>
                <SelectItem value="monthly">Per Month</SelectItem>
                <SelectItem value="annual">Per Year</SelectItem>
              </SelectContent>
            </Select>
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

        {errors.salary && (
          <p className="text-sm text-red-600">{errors.salary}</p>
        )}

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
      </div>

      {/* Duration Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Duration & Timeline</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
              Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={data.duration?.startDate || ''}
              onChange={(e) => setDurationField('startDate', e.target.value)}
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
              onChange={(e) => setDurationField('endDate', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
              Duration (months) *
            </Label>
            <Input
              id="duration"
              type="number"
              value={data.duration?.months ?? ''}
              onChange={(e) => setDurationField('months', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="e.g. 6"
              className={`mt-1 ${errors.duration ? 'border-red-500' : ''}`}
              readOnly={readOnlyMonths}
            />
            {readOnlyMonths && (
              <p className="mt-1 text-xs text-gray-500">Auto-calculated from start and end dates</p>
            )}
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="flexible"
            checked={data.duration?.flexible || false}
            onCheckedChange={(checked) => setDurationField('flexible', checked)}
          />
          <Label htmlFor="flexible" className="text-sm text-gray-700">
            Flexible start/end dates
          </Label>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">💡 Compensation & Timeline Tips:</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Research market rates for similar positions</li>
          <li>• Consider offering competitive benefits beyond salary</li>
          <li>• Be flexible with start dates for student schedules</li>
          <li>• Clearly communicate payment schedule and terms</li>
        </ul>
      </div>
    </div>
  );
}
