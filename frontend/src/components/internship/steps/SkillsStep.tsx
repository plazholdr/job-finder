"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, Code, Users, Globe, Award } from 'lucide-react';

interface SkillsStepProps {
  data: {
    skills: {
      technical: string[];
      soft: string[];
      languages: string[];
      certifications: string[];
    };
    companySize: string[];
    workEnvironment: string[];
    benefits: string[];
    notes: string;
  };
  onChange: (data: any) => void;
  errors?: Record<string, string>;
}

const TECHNICAL_SKILLS = [
  'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML/CSS',
  'TypeScript', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin',
  'Angular', 'Vue.js', 'Django', 'Flask', 'Spring', 'Express.js',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'AWS', 'Azure', 'GCP',
  'Docker', 'Kubernetes', 'Git', 'Linux', 'Figma', 'Adobe Creative Suite'
];

const SOFT_SKILLS = [
  'Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Critical Thinking',
  'Time Management', 'Adaptability', 'Creativity', 'Attention to Detail',
  'Project Management', 'Public Speaking', 'Negotiation', 'Analytical Thinking',
  'Customer Service', 'Conflict Resolution', 'Mentoring', 'Research'
];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Chinese (Mandarin)', 'Japanese',
  'Korean', 'Portuguese', 'Italian', 'Russian', 'Arabic', 'Hindi', 'Dutch'
];

const COMPANY_SIZES = [
  'Startup (1-50 employees)',
  'Small (51-200 employees)',
  'Medium (201-1000 employees)',
  'Large (1001-5000 employees)',
  'Enterprise (5000+ employees)'
];

const WORK_ENVIRONMENTS = [
  'Fast-paced', 'Collaborative', 'Independent', 'Creative', 'Structured',
  'Innovative', 'Casual', 'Professional', 'Flexible', 'Results-oriented'
];

const BENEFITS = [
  'Health Insurance', 'Flexible Hours', 'Remote Work Options', 'Professional Development',
  'Mentorship Program', 'Networking Opportunities', 'Free Meals', 'Gym Membership',
  'Transportation Allowance', 'Learning Budget', 'Conference Attendance'
];

export default function SkillsStep({ data, onChange, errors = {} }: SkillsStepProps) {
  const [customInputs, setCustomInputs] = React.useState({
    technical: '',
    soft: '',
    language: '',
    certification: '',
    companySize: '',
    workEnvironment: '',
    benefit: ''
  });

  const handleSkillToggle = (category: keyof typeof data.skills, skill: string) => {
    const updatedSkills = data.skills[category].includes(skill)
      ? data.skills[category].filter(s => s !== skill)
      : [...data.skills[category], skill];
    
    onChange({
      skills: {
        ...data.skills,
        [category]: updatedSkills
      }
    });
  };

  const handleArrayToggle = (field: string, item: string) => {
    const currentArray = data[field as keyof typeof data] as string[];
    const updatedArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    
    onChange({ [field]: updatedArray });
  };

  const addCustomItem = (category: string, field?: string) => {
    const inputKey = category as keyof typeof customInputs;
    const value = customInputs[inputKey].trim();
    
    if (!value) return;

    if (field) {
      // For skills
      const currentSkills = data.skills[field as keyof typeof data.skills];
      if (!currentSkills.includes(value)) {
        onChange({
          skills: {
            ...data.skills,
            [field]: [...currentSkills, value]
          }
        });
      }
    } else {
      // For other arrays
      const currentArray = data[category as keyof typeof data] as string[];
      if (!currentArray.includes(value)) {
        onChange({ [category]: [...currentArray, value] });
      }
    }

    setCustomInputs(prev => ({ ...prev, [inputKey]: '' }));
  };

  const removeItem = (category: string, item: string, field?: string) => {
    if (field) {
      // For skills
      onChange({
        skills: {
          ...data.skills,
          [field]: data.skills[field as keyof typeof data.skills].filter(s => s !== item)
        }
      });
    } else {
      // For other arrays
      const currentArray = data[category as keyof typeof data] as string[];
      onChange({ [category]: currentArray.filter(i => i !== item) });
    }
  };

  const SkillSection = ({
    title,
    icon,
    category,
    field,
    options,
    placeholder,
    error
  }: {
    title: string;
    icon: React.ReactNode;
    category: string;
    field?: string;
    options: string[];
    placeholder: string;
    error?: string;
  }) => {
    const selectedItems = field
      ? (data.skills[field as keyof typeof data.skills] || [])
      : (data[category as keyof typeof data] as string[] || []);

    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <Label className="text-base font-medium">{title}</Label>
        </div>
        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}

        {/* Selected Items */}
        {selectedItems.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {selectedItems.map((item) => (
                <Badge
                  key={item}
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1"
                >
                  {item}
                  <button
                    onClick={() => removeItem(category, item, field)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Options */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
          {options.map((option) => (
            <Button
              key={option}
              variant={selectedItems.includes(option) ? "secondary" : "outline"}
              size="sm"
              onClick={() => field 
                ? handleSkillToggle(field as keyof typeof data.skills, option)
                : handleArrayToggle(category, option)
              }
              className="justify-start text-left h-auto py-2 px-3 text-xs"
            >
              {option}
            </Button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={customInputs[category as keyof typeof customInputs]}
            onChange={(e) => setCustomInputs(prev => ({ 
              ...prev, 
              [category]: e.target.value 
            }))}
            onKeyPress={(e) => e.key === 'Enter' && addCustomItem(category, field)}
            className="flex-1"
            size="sm"
          />
          <Button
            onClick={() => addCustomItem(category, field)}
            disabled={!customInputs[category as keyof typeof customInputs].trim()}
            size="sm"
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Technical Skills */}
      <SkillSection
        title="Technical Skills *"
        icon={<Code className="w-5 h-5 text-blue-600" />}
        category="technical"
        field="technical"
        options={TECHNICAL_SKILLS}
        placeholder="Add custom technical skill..."
        error={errors.skills}
      />

      {/* Soft Skills */}
      <SkillSection
        title="Soft Skills"
        icon={<Users className="w-5 h-5 text-green-600" />}
        category="soft"
        field="soft"
        options={SOFT_SKILLS}
        placeholder="Add custom soft skill..."
      />

      {/* Languages */}
      <SkillSection
        title="Languages"
        icon={<Globe className="w-5 h-5 text-purple-600" />}
        category="language"
        field="languages"
        options={LANGUAGES}
        placeholder="Add language..."
      />

      {/* Certifications */}
      <SkillSection
        title="Certifications"
        icon={<Award className="w-5 h-5 text-yellow-600" />}
        category="certification"
        field="certifications"
        options={[]}
        placeholder="Add certification..."
      />

      {/* Company Size Preference */}
      <SkillSection
        title="Preferred Company Size"
        icon={<Users className="w-5 h-5 text-indigo-600" />}
        category="companySize"
        options={COMPANY_SIZES}
        placeholder="Add custom company size..."
      />

      {/* Work Environment */}
      <SkillSection
        title="Preferred Work Environment"
        icon={<Users className="w-5 h-5 text-teal-600" />}
        category="workEnvironment"
        options={WORK_ENVIRONMENTS}
        placeholder="Add work environment preference..."
      />

      {/* Benefits */}
      <SkillSection
        title="Important Benefits"
        icon={<Award className="w-5 h-5 text-orange-600" />}
        category="benefit"
        options={BENEFITS}
        placeholder="Add important benefit..."
      />

      {/* Additional Notes */}
      <div>
        <Label htmlFor="notes" className="text-base font-medium mb-3 block">
          Additional Notes
        </Label>
        <Textarea
          id="notes"
          placeholder="Any additional information about your preferences, goals, or requirements..."
          value={data.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={4}
          className="resize-none"
        />
        <p className="text-sm text-gray-600 mt-2">
          Optional: Share any specific goals, learning objectives, or other preferences
        </p>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Skills & Preferences Summary</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>
            <strong>Technical Skills:</strong> {data.skills.technical.length} selected
          </p>
          <p>
            <strong>Soft Skills:</strong> {data.skills.soft.length} selected
          </p>
          <p>
            <strong>Languages:</strong> {data.skills.languages.length} selected
          </p>
          <p>
            <strong>Certifications:</strong> {data.skills.certifications.length} listed
          </p>
        </div>
      </div>
    </div>
  );
}
