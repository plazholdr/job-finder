"use client";

import React, { useState, useCallback, memo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

// Separate SkillSection component to prevent re-renders
const SkillSection = memo(({
  title,
  category,
  placeholder,
  description,
  value,
  skills,
  onInputChange,
  onAddSkill,
  onRemoveSkill,
  onKeyPress
}: {
  title: string;
  category: string;
  placeholder: string;
  description: string;
  value: string;
  skills: string[];
  onInputChange: (category: string, value: string) => void;
  onAddSkill: (category: string) => void;
  onRemoveSkill: (category: string, skill: string) => void;
  onKeyPress: (e: React.KeyboardEvent, category: string) => void;
}) => (
  <div>
    <Label className="text-sm font-medium text-gray-700">{title}</Label>
    <div className="mt-1 flex gap-2">
      <Input
        value={value}
        onChange={(e) => onInputChange(category, e.target.value)}
        onKeyPress={(e) => onKeyPress(e, category)}
        placeholder={placeholder}
        className="flex-1"
      />
      <Button
        type="button"
        onClick={() => onAddSkill(category)}
        size="sm"
        variant="outline"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
    <p className="mt-1 text-sm text-gray-500">{description}</p>

    {skills && skills.length > 0 && (
      <div className="mt-2 flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {skill}
            <button
              type="button"
              onClick={() => onRemoveSkill(category, skill)}
              className="ml-1 hover:text-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    )}
  </div>
));

SkillSection.displayName = 'SkillSection';

interface DetailsStepProps {
  data: {
    requirements: string;
    skills: {
      technical: string[];
      soft: string[];
      languages: string[];
      certifications: string[];
    };
  };
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export default function DetailsStep({ data, onChange, errors }: DetailsStepProps) {
  const [newSkill, setNewSkill] = useState({
    technical: '',
    soft: '',
    languages: '',
    certifications: ''
  });

  const handleRequirementsChange = useCallback((value: string) => {
    onChange({
      requirements: value
    });
  }, [onChange]);

  const addSkill = useCallback((category: keyof typeof newSkill) => {
    const skill = newSkill[category].trim();
    if (skill) {
      const currentSkills = data.skills?.[category] || [];
      if (!currentSkills.includes(skill)) {
        onChange({
          skills: {
            ...data.skills,
            [category]: [...currentSkills, skill]
          }
        });
      }
      setNewSkill(prev => ({ ...prev, [category]: '' }));
    }
  }, [newSkill, data.skills, onChange]);

  const removeSkill = useCallback((category: keyof typeof newSkill, skillToRemove: string) => {
    const currentSkills = data.skills?.[category] || [];
    onChange({
      skills: {
        ...data.skills,
        [category]: currentSkills.filter(skill => skill !== skillToRemove)
      }
    });
  }, [data.skills, onChange]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent, category: keyof typeof newSkill) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(category);
    }
  }, [addSkill]);

  const handleSkillInputChange = useCallback((category: string, value: string) => {
    setNewSkill(prev => ({ ...prev, [category]: value }));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="requirements" className="text-sm font-medium text-gray-700">
          Requirements & Qualifications
        </Label>
        <Textarea
          id="requirements"
          value={data.requirements || ''}
          onChange={(e) => handleRequirementsChange(e.target.value)}
          placeholder="List the required qualifications, education level, experience, etc..."
          rows={6}
          className={`mt-1 ${errors.requirements ? 'border-red-500' : ''}`}
        />
        {errors.requirements && (
          <p className="mt-1 text-sm text-red-600">{errors.requirements}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Include education requirements, minimum GPA, relevant coursework, etc.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkillSection
          title="Technical Skills *"
          category="technical"
          placeholder="e.g. JavaScript, Python, React"
          description="Programming languages, frameworks, tools"
          value={newSkill.technical}
          skills={data.skills?.technical || []}
          onInputChange={handleSkillInputChange}
          onAddSkill={addSkill}
          onRemoveSkill={removeSkill}
          onKeyPress={handleKeyPress}
        />

        <SkillSection
          title="Soft Skills"
          category="soft"
          placeholder="e.g. Communication, Teamwork"
          description="Interpersonal and professional skills"
          value={newSkill.soft}
          skills={data.skills?.soft || []}
          onInputChange={handleSkillInputChange}
          onAddSkill={addSkill}
          onRemoveSkill={removeSkill}
          onKeyPress={handleKeyPress}
        />

        <SkillSection
          title="Languages"
          category="languages"
          placeholder="e.g. English, Spanish"
          description="Spoken/written language requirements"
          value={newSkill.languages}
          skills={data.skills?.languages || []}
          onInputChange={handleSkillInputChange}
          onAddSkill={addSkill}
          onRemoveSkill={removeSkill}
          onKeyPress={handleKeyPress}
        />

        <SkillSection
          title="Certifications"
          category="certifications"
          placeholder="e.g. AWS Certified, Google Analytics"
          description="Preferred or required certifications"
          value={newSkill.certifications}
          skills={data.skills?.certifications || []}
          onInputChange={handleSkillInputChange}
          onAddSkill={addSkill}
          onRemoveSkill={removeSkill}
          onKeyPress={handleKeyPress}
        />
      </div>

      {errors.skills && (
        <p className="text-sm text-red-600">{errors.skills}</p>
      )}

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-green-900 mb-2">✨ Pro tip:</h4>
        <p className="text-sm text-green-800">
          Focus on essential skills only. Too many requirements can discourage qualified candidates from applying.
        </p>
      </div>
    </div>
  );
}
