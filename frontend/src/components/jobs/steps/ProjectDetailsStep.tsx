"use client";

import React, { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const MALAYSIAN_LOCATIONS = [
  'Kuala Lumpur','Selangor','Penang','Johor Bahru','Petaling Jaya','Shah Alam','Subang Jaya','Cyberjaya','Putrajaya','Ipoh','Kota Kinabalu','Kuching','Melaka','Kota Bharu','Alor Setar'
];

interface ProjectDetailsStepProps {
  data: {
    project?: {
      title?: string;
      description?: string;
      startMonth?: string | null; // format YYYY-MM
      endMonth?: string | null;   // format YYYY-MM
      locations?: string[];
      roleDescription?: string;
      areasOfInterest?: string[]; // up to 3
    }
  };
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export default function ProjectDetailsStep({ data, onChange, errors }: ProjectDetailsStepProps) {
  const project = data.project || {};

  const update = (patch: Partial<ProjectDetailsStepProps['data']['project']>) => {
    onChange({ project: { ...(data.project || {}), ...patch } });
  };

  const areas = useMemo(() => project.areasOfInterest || ['', '', ''], [project.areasOfInterest]);

  const toggleLocation = (loc: string, checked: boolean | string) => {
    const current = new Set(project.locations || []);
    if (checked) current.add(loc); else current.delete(loc);
    update({ locations: Array.from(current) });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="projectTitle" className="text-sm font-medium text-gray-700">Project title *</Label>
          <Input id="projectTitle" value={project.title || ''} onChange={(e)=>update({ title: e.target.value })} placeholder="e.g. AI Resume Screener" className={`mt-1 ${errors['project.title'] ? 'border-red-500' : ''}`} />
          {errors['project.title'] && <p className="mt-1 text-sm text-red-600">{errors['project.title']}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Start (MM/YY)</Label>
            <Input type="month" value={project.startMonth || ''} onChange={(e)=>update({ startMonth: e.target.value })} className="mt-1"/>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">End (MM/YY)</Label>
            <Input type="month" value={project.endMonth || ''} onChange={(e)=>update({ endMonth: e.target.value })} className="mt-1"/>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="projectDescription" className="text-sm font-medium text-gray-700">Project description *</Label>
        <Textarea id="projectDescription" rows={5} value={project.description || ''} onChange={(e)=>update({ description: e.target.value })} placeholder="Describe the project scope, goals, and impact..." className={`mt-1 ${errors['project.description'] ? 'border-red-500' : ''}`} />
        {errors['project.description'] && <p className="mt-1 text-sm text-red-600">{errors['project.description']}</p>}
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700">Project location (multiple)</Label>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {MALAYSIAN_LOCATIONS.map((loc) => (
            <label key={loc} className="flex items-center space-x-2 text-sm">
              <Checkbox checked={(project.locations || []).includes(loc)} onCheckedChange={(c)=>toggleLocation(loc, c)} />
              <span>{loc}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="roleDescription" className="text-sm font-medium text-gray-700">Role description</Label>
        <Textarea id="roleDescription" rows={4} value={project.roleDescription || ''} onChange={(e)=>update({ roleDescription: e.target.value })} placeholder="Explain the intern's role within this project..." className="mt-1" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0,1,2].map((i)=> (
          <div key={i}>
            <Label className="text-sm font-medium text-gray-700">Area of interest {i+1}</Label>
            <Input value={areas[i] || ''} onChange={(e)=>{
              const next = [...areas];
              next[i] = e.target.value;
              update({ areasOfInterest: next });
            }} placeholder="e.g. Data Science" className="mt-1"/>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-indigo-900 mb-2">💡 Tips for project details:</h4>
        <ul className="text-sm text-indigo-800 space-y-1">
          <li>• Share clear outcomes and deliverables</li>
          <li>• Align areas of interest with the actual tasks</li>
          <li>• Multiple locations supported for distributed teams</li>
        </ul>
      </div>
    </div>
  );
}

