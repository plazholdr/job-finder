'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  User, 
  Briefcase, 
  Building2,
  FileText,
  Star,
  Award,
  Target,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming' | 'blocked';
  href: string;
  icon: React.ComponentType<any>;
  progress?: number;
  dependencies?: string[];
}

interface WorkflowIntegrationProps {
  className?: string;
}

export default function InternWorkflowIntegration({ className = '' }: WorkflowIntegrationProps) {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    // Mock workflow data - in a real app, this would come from API
    const steps: WorkflowStep[] = [
      {
        id: 'profile-setup',
        title: 'Complete Profile Setup',
        description: 'Set up your internship profile with education, skills, and experience',
        status: 'completed',
        href: '/internship/profile',
        icon: User,
        progress: 100
      },
      {
        id: 'browse-companies',
        title: 'Explore Companies',
        description: 'Browse companies and learn about their internship opportunities',
        status: 'completed',
        href: '/companies',
        icon: Building2,
        progress: 100
      },
      {
        id: 'find-jobs',
        title: 'Find Internship Jobs',
        description: 'Search and filter internship positions that match your interests',
        status: 'completed',
        href: '/jobs',
        icon: Briefcase,
        progress: 100
      },
      {
        id: 'save-favorites',
        title: 'Save Favorite Opportunities',
        description: 'Like and save companies and jobs for easy access later',
        status: 'completed',
        href: '/saved-jobs',
        icon: Star,
        progress: 100,
        dependencies: ['browse-companies', 'find-jobs']
      },
      {
        id: 'apply-jobs',
        title: 'Submit Applications',
        description: 'Apply to internship positions with your profile and documents',
        status: 'current',
        href: '/applications',
        icon: FileText,
        progress: 60,
        dependencies: ['profile-setup', 'find-jobs']
      },
      {
        id: 'track-applications',
        title: 'Track Application Progress',
        description: 'Monitor your application status and manage communications',
        status: 'current',
        href: '/intern-management',
        icon: Target,
        progress: 40,
        dependencies: ['apply-jobs']
      },
      {
        id: 'interview-process',
        title: 'Interview Process',
        description: 'Participate in interviews and assessment processes',
        status: 'upcoming',
        href: '/applications',
        icon: TrendingUp,
        progress: 0,
        dependencies: ['apply-jobs']
      },
      {
        id: 'receive-offers',
        title: 'Receive & Evaluate Offers',
        description: 'Review job offers and make decisions about your internship',
        status: 'upcoming',
        href: '/applications',
        icon: Award,
        progress: 0,
        dependencies: ['interview-process']
      },
      {
        id: 'onboarding',
        title: 'Onboarding & Start Internship',
        description: 'Complete onboarding process and begin your internship journey',
        status: 'upcoming',
        href: '/hiring',
        icon: CheckCircle,
        progress: 0,
        dependencies: ['receive-offers']
      }
    ];

    setWorkflowSteps(steps);

    // Calculate overall progress
    const totalSteps = steps.length;
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    const currentStepsProgress = steps
      .filter(step => step.status === 'current')
      .reduce((sum, step) => sum + (step.progress || 0), 0);
    
    const progress = Math.round(((completedSteps * 100) + currentStepsProgress) / totalSteps);
    setOverallProgress(progress);
  }, []);

  const getStepIcon = (step: WorkflowStep) => {
    const IconComponent = step.icon;
    
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'current':
        return <IconComponent className="h-5 w-5 text-blue-600" />;
      case 'upcoming':
        return <IconComponent className="h-5 w-5 text-gray-400" />;
      case 'blocked':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <IconComponent className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'current':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'upcoming':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNextSteps = () => {
    return workflowSteps.filter(step => step.status === 'current' || step.status === 'upcoming').slice(0, 3);
  };

  const getCurrentSteps = () => {
    return workflowSteps.filter(step => step.status === 'current');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Internship Journey</span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {overallProgress}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={overallProgress} className="h-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="font-medium text-gray-900">
                  {workflowSteps.filter(s => s.status === 'completed').length}
                </p>
                <p className="text-gray-600">Completed</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">
                  {workflowSteps.filter(s => s.status === 'current').length}
                </p>
                <p className="text-gray-600">In Progress</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">
                  {workflowSteps.filter(s => s.status === 'upcoming').length}
                </p>
                <p className="text-gray-600">Upcoming</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">
                  {workflowSteps.length}
                </p>
                <p className="text-gray-600">Total Steps</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Focus */}
      {getCurrentSteps().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Current Focus</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getCurrentSteps().map((step) => (
                <div key={step.id} className={`p-4 border rounded-lg ${getStepColor(step.status)}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStepIcon(step)}
                      <div>
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm opacity-80">{step.description}</p>
                      </div>
                    </div>
                    <Link href={step.href}>
                      <Button size="sm">
                        Continue
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                  
                  {step.progress !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{step.progress}%</span>
                      </div>
                      <Progress value={step.progress} className="h-2" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflowSteps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center">
                    {getStepIcon(step)}
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div className="w-px h-12 bg-gray-200 mt-2"></div>
                  )}
                </div>
                
                <div className="flex-1 pb-8">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{step.title}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStepColor(step.status)}>
                        {step.status}
                      </Badge>
                      {step.status !== 'upcoming' && (
                        <Link href={step.href}>
                          <Button variant="outline" size="sm">
                            {step.status === 'completed' ? 'Review' : 'Continue'}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                  
                  {step.progress !== undefined && step.status !== 'upcoming' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Progress</span>
                        <span>{step.progress}%</span>
                      </div>
                      <Progress value={step.progress} className="h-1" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/internship/profile">
              <Button variant="outline" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                Update Profile
              </Button>
            </Link>
            
            <Link href="/jobs">
              <Button variant="outline" className="w-full justify-start">
                <Briefcase className="h-4 w-4 mr-2" />
                Browse Jobs
              </Button>
            </Link>
            
            <Link href="/applications">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                My Applications
              </Button>
            </Link>
            
            <Link href="/intern-management">
              <Button variant="outline" className="w-full justify-start">
                <Target className="h-4 w-4 mr-2" />
                Manage Journey
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
