"use client";

import { useState } from 'react';
import { ChevronRight, CheckCircle, AlertCircle, User, Mail, GraduationCap, Briefcase, Award, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/auth-context';
import { calculateProfileCompletion, getProfileCompletionLevel, getNextProfileStep } from '@/utils/profileCompletion';

interface ProfileCompletionCardProps {
  onSectionClick?: (section: string) => void;
  showDetails?: boolean;
  className?: string;
}

export default function ProfileCompletionCard({ 
  onSectionClick, 
  showDetails = false, 
  className = '' 
}: ProfileCompletionCardProps) {
  const { user } = useAuth();
  const [showAllSections, setShowAllSections] = useState(false);

  if (!user) return null;

  const completion = calculateProfileCompletion(user);
  const level = getProfileCompletionLevel(completion.percentage);
  const nextStep = getNextProfileStep(user);

  const sectionIcons = {
    basic: User,
    profile: User,
    education: GraduationCap,
    experience: Briefcase,
    skills: Award,
    preferences: Target,
    internship: GraduationCap,
  };

  const getSectionColor = (completed: number, total: number) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    if (percentage === 100) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleSectionClick = (section: string) => {
    onSectionClick?.(section);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Profile Completion</span>
          <span className={`text-sm font-medium ${
            level.color === 'green' ? 'text-green-600' :
            level.color === 'blue' ? 'text-blue-600' :
            level.color === 'yellow' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {completion.percentage}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={completion.percentage} 
            className="h-2"
          />
          <p className="text-sm text-gray-600">
            {completion.completedFields} of {completion.totalFields} sections completed
          </p>
        </div>

        {/* Level Message */}
        <div className={`p-3 rounded-lg ${
          level.color === 'green' ? 'bg-green-50 text-green-800' :
          level.color === 'blue' ? 'bg-blue-50 text-blue-800' :
          level.color === 'yellow' ? 'bg-yellow-50 text-yellow-800' :
          'bg-red-50 text-red-800'
        }`}>
          <p className="text-sm">{level.message}</p>
        </div>

        {/* Next Step */}
        {nextStep.section !== 'complete' && (
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className={`h-4 w-4 ${
                  nextStep.priority === 'high' ? 'text-red-500' :
                  nextStep.priority === 'medium' ? 'text-yellow-500' :
                  'text-blue-500'
                }`} />
                <div>
                  <p className="text-sm font-medium">Next Step</p>
                  <p className="text-xs text-gray-600">{nextStep.action}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSectionClick(nextStep.section)}
              >
                Complete
              </Button>
            </div>
          </div>
        )}

        {/* Section Details */}
        {showDetails && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Section Details</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllSections(!showAllSections)}
              >
                {showAllSections ? 'Hide' : 'Show All'}
              </Button>
            </div>

            <div className="space-y-2">
              {Object.entries(completion.sections)
                .slice(0, showAllSections ? undefined : 3)
                .map(([sectionKey, section]) => {
                  const Icon = sectionIcons[sectionKey as keyof typeof sectionIcons];
                  const percentage = section.total > 0 ? (section.completed / section.total) * 100 : 0;
                  
                  return (
                    <div
                      key={sectionKey}
                      className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSectionClick(sectionKey)}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium capitalize">{sectionKey}</p>
                          <p className="text-xs text-gray-500">
                            {section.completed}/{section.total} completed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {percentage === 100 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className={`text-xs font-medium ${getSectionColor(section.completed, section.total)}`}>
                            {Math.round(percentage)}%
                          </div>
                        )}
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Missing Fields Summary */}
        {completion.missingFields.length > 0 && !showDetails && (
          <div className="text-xs text-gray-500">
            Missing: {completion.missingFields.slice(0, 3).join(', ')}
            {completion.missingFields.length > 3 && ` and ${completion.missingFields.length - 3} more`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
