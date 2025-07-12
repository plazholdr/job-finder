'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Clock, 
  PlayCircle,
  FileText,
  Video,
  ExternalLink,
  User,
  AlertCircle,
  Calendar,
  Target
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  category: 'setup' | 'verification' | 'configuration' | 'training' | 'launch';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  isRequired: boolean;
  estimatedDuration: string;
  dependencies: string[];
  assignedTo?: string;
  dueDate?: Date;
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
  resources: Array<{
    type: 'document' | 'video' | 'link' | 'contact';
    title: string;
    url?: string;
    description?: string;
  }>;
}

interface CompanyOnboarding {
  id: string;
  companyId: string;
  companyName: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  currentStep: string;
  progress: number;
  steps: OnboardingStep[];
  setupInfo: {
    accountManager: {
      name: string;
      email: string;
      phone: string;
    };
    expectedCompletionDate: Date;
  };
  timeline: Array<{
    id: string;
    timestamp: Date;
    event: string;
    description: string;
    performedBy: string;
    category: 'milestone' | 'task' | 'issue' | 'note';
  }>;
  startedAt: Date;
  expectedCompletionDate: Date;
  actualCompletionDate?: Date;
}

export default function CompanyOnboardingPage() {
  const [onboarding, setOnboarding] = useState<CompanyOnboarding | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOnboardingStatus();
  }, []);

  const fetchOnboardingStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In real app, get company ID from auth
      const response = await fetch('/api/company/onboarding?companyId=company-1');
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        setOnboarding(result.data[0]);
      }
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      setError('Failed to load onboarding status');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIcon = (step: OnboardingStep) => {
    if (step.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (step.status === 'in_progress') {
      return <PlayCircle className="h-5 w-5 text-blue-600" />;
    } else {
      return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-gray-100 text-gray-800' },
      in_progress: { color: 'bg-blue-100 text-blue-800' },
      completed: { color: 'bg-green-100 text-green-800' },
      skipped: { color: 'bg-yellow-100 text-yellow-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge className={config.color}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      setup: 'bg-blue-100 text-blue-800',
      verification: 'bg-purple-100 text-purple-800',
      configuration: 'bg-orange-100 text-orange-800',
      training: 'bg-green-100 text-green-800',
      launch: 'bg-red-100 text-red-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'link':
        return <ExternalLink className="h-4 w-4" />;
      case 'contact':
        return <User className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!onboarding) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Onboarding Process Found</h3>
            <p className="text-gray-600 mb-4">Your company onboarding process hasn't been initiated yet.</p>
            <Button>
              <PlayCircle className="h-4 w-4 mr-2" />
              Start Onboarding Process
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Company Onboarding</h1>
        <p className="text-gray-600 mt-2">Complete your company setup and get started</p>
      </div>

      {/* Progress Overview */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Onboarding Progress</CardTitle>
            <Badge className={`${onboarding.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
              {onboarding.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{onboarding.progress}%</span>
              </div>
              <Progress value={onboarding.progress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {onboarding.steps.filter(step => step.status === 'completed').length}/{onboarding.steps.length}
                </div>
                <div className="text-sm text-gray-600">Steps Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {onboarding.setupInfo.accountManager.name || 'Not Assigned'}
                </div>
                <div className="text-sm text-gray-600">Account Manager</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {new Date(onboarding.expectedCompletionDate).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">Expected Completion</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Steps */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Onboarding Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {onboarding.steps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getStepIcon(step)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge className={getCategoryColor(step.category)}>
                        {step.category}
                      </Badge>
                      {getStepStatusBadge(step.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {step.estimatedDuration}
                    </div>
                    {step.isRequired && (
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    )}
                    {step.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due: {new Date(step.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Resources */}
                  {step.resources.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">Resources:</h5>
                      <div className="flex flex-wrap gap-2">
                        {step.resources.map((resource, resourceIndex) => (
                          <Button
                            key={resourceIndex}
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => resource.url && window.open(resource.url, '_blank')}
                          >
                            {getResourceIcon(resource.type)}
                            <span className="ml-1">{resource.title}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {step.status === 'pending' && (
                    <div className="mt-3">
                      <Button size="sm">
                        <PlayCircle className="h-4 w-4 mr-1" />
                        Start Step
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {onboarding.timeline.map((entry, index) => (
              <div key={entry.id} className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{entry.description}</p>
                    <time className="text-sm text-gray-500">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </time>
                  </div>
                  <p className="text-sm text-gray-600">
                    Performed by {entry.performedBy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
