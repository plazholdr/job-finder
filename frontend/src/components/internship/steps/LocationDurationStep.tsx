"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, MapPin, Clock } from 'lucide-react';

interface LocationDurationStepProps {
  data: {
    locations: string[];
    remoteWork: boolean;
    duration: {
      minimum: number | null;
      maximum: number | null;
      preferred: number | null;
      flexible: boolean;
    };
  };
  onChange: (data: any) => void;
  errors?: Record<string, string>;
}

const POPULAR_LOCATIONS = [
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

const DURATION_OPTIONS = [
  { value: 1, label: '1 month' },
  { value: 2, label: '2 months' },
  { value: 3, label: '3 months' },
  { value: 4, label: '4 months' },
  { value: 6, label: '6 months' },
  { value: 12, label: '12 months' }
];

export default function LocationDurationStep({ data, onChange, errors = {} }: LocationDurationStepProps) {
  const [customLocation, setCustomLocation] = React.useState('');

  const handleLocationToggle = (location: string) => {
    const updatedLocations = data.locations.includes(location)
      ? data.locations.filter(l => l !== location)
      : [...data.locations, location];
    
    onChange({ locations: updatedLocations });
  };

  const addCustomLocation = () => {
    if (customLocation.trim() && !data.locations.includes(customLocation.trim())) {
      onChange({ locations: [...data.locations, customLocation.trim()] });
      setCustomLocation('');
    }
  };

  const removeLocation = (location: string) => {
    onChange({ locations: data.locations.filter(l => l !== location) });
  };

  const handleRemoteWorkChange = (checked: boolean) => {
    onChange({ remoteWork: checked });
  };

  const handleDurationChange = (field: string, value: number | null | boolean) => {
    onChange({
      duration: {
        ...data.duration,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Location Preferences */}
      <div>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <Label className="text-base font-medium">
              Location Preferences <span className="text-red-500">*</span>
            </Label>
          </div>
          <p className="text-sm text-gray-600">
            Select your preferred work locations. You can choose multiple cities or opt for remote work.
          </p>
          {errors.locations && (
            <p className="text-sm text-red-600 mt-1">{errors.locations}</p>
          )}
        </div>

        {/* Remote Work Option */}
        <div className="mb-4 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remoteWork"
              checked={data.remoteWork}
              onCheckedChange={handleRemoteWorkChange}
            />
            <Label htmlFor="remoteWork" className="font-medium">
              Open to Remote Work
            </Label>
          </div>
          <p className="text-sm text-gray-600 mt-1 ml-6">
            I'm interested in remote internship opportunities
          </p>
        </div>

        {/* Selected Locations */}
        {data.locations.length > 0 && (
          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Selected Locations ({data.locations.length})
            </Label>
            <div className="flex flex-wrap gap-2">
              {data.locations.map((location) => (
                <Badge
                  key={location}
                  variant="default"
                  className="flex items-center gap-1 px-3 py-1"
                >
                  {location}
                  <button
                    onClick={() => removeLocation(location)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Popular Locations */}
        <div className="mb-4">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Popular Locations
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {POPULAR_LOCATIONS.map((location) => (
              <Button
                key={location}
                variant={data.locations.includes(location) ? "default" : "outline"}
                size="sm"
                onClick={() => handleLocationToggle(location)}
                className="justify-start text-left h-auto py-2 px-3"
              >
                {location}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Location Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Add custom location (e.g., Klang, Selangor)..."
            value={customLocation}
            onChange={(e) => setCustomLocation(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomLocation()}
            className="flex-1"
          />
          <Button
            onClick={addCustomLocation}
            disabled={!customLocation.trim()}
            size="sm"
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Duration Preferences */}
      <div>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-green-600" />
            <Label className="text-base font-medium">
              Duration Preferences <span className="text-red-500">*</span>
            </Label>
          </div>
          <p className="text-sm text-gray-600">
            Specify your preferred internship duration and flexibility.
          </p>
          {errors.duration && (
            <p className="text-sm text-red-600 mt-1">{errors.duration}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Minimum Duration */}
          <div>
            <Label htmlFor="minDuration" className="text-sm font-medium mb-2 block">
              Minimum Duration
            </Label>
            <Select
              value={data.duration.minimum?.toString() || ''}
              onValueChange={(value) => handleDurationChange('minimum', value ? parseInt(value) : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select minimum" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preferred Duration */}
          <div>
            <Label htmlFor="preferredDuration" className="text-sm font-medium mb-2 block">
              Preferred Duration
            </Label>
            <Select
              value={data.duration.preferred?.toString() || ''}
              onValueChange={(value) => handleDurationChange('preferred', value ? parseInt(value) : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select preferred" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Maximum Duration */}
          <div>
            <Label htmlFor="maxDuration" className="text-sm font-medium mb-2 block">
              Maximum Duration
            </Label>
            <Select
              value={data.duration.maximum?.toString() || ''}
              onValueChange={(value) => handleDurationChange('maximum', value ? parseInt(value) : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select maximum" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Flexibility Option */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="flexible"
              checked={data.duration.flexible}
              onCheckedChange={(checked) => handleDurationChange('flexible', checked)}
            />
            <Label htmlFor="flexible" className="font-medium">
              Flexible with Duration
            </Label>
          </div>
          <p className="text-sm text-gray-600 mt-1 ml-6">
            I'm open to discussing different duration options based on the opportunity
          </p>
        </div>
      </div>

      {/* Summary */}
      {(data.locations.length > 0 || data.remoteWork || data.duration.preferred) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Preferences Summary</h4>
          <div className="text-sm text-green-800 space-y-1">
            <p>
              <strong>Locations:</strong> {
                data.locations.length > 0 
                  ? data.locations.join(', ') + (data.remoteWork ? ', Remote' : '')
                  : data.remoteWork 
                    ? 'Remote only' 
                    : 'None specified'
              }
            </p>
            <p>
              <strong>Duration:</strong> {
                data.duration.preferred 
                  ? `${data.duration.preferred} months preferred` +
                    (data.duration.minimum ? ` (min: ${data.duration.minimum} months)` : '') +
                    (data.duration.maximum ? ` (max: ${data.duration.maximum} months)` : '') +
                    (data.duration.flexible ? ', flexible' : '')
                  : 'Not specified'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
