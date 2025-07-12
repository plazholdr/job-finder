'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Building2, 
  Briefcase, 
  FileText, 
  Star, 
  Target, 
  Award, 
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Calendar,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import InternWorkflowIntegration from '@/components/workflow/InternWorkflowIntegration';
import { useInternWorkflow, workflowSelectors } from '@/contexts/InternWorkflowContext';

export default function WorkflowPage() {
  const { state } = useInternWorkflow();
  
  const profileCompletion = workflowSelectors.getProfileCompletion(state);
  const activeApplications = workflowSelectors.getActiveApplications(state);
  const overallProgress = workflowSelectors.getOverallProgress(state);

  const workflowFeatures = [
    {
      id: 'profile',
      title: 'Profile Management',
      description: 'Complete your internship profile with education, skills, and experience',
      href: '/internship',
      icon: User,
      status: profileCompletion === 100 ? 'completed' : 'in-progress',
      progress: profileCompletion,
      features: [
        'Personal Information',
        'Education Background',
        'Work Experience',
        'Skills & Certifications',
        'Interests & Preferences'
      ]
    },
    {
      id: 'companies',
      title: 'Company Discovery',
      description: 'Explore companies and learn about their internship opportunities',
      href: '/companies',
      icon: Building2,
      status: 'available',
      features: [
        'Company Profiles',
        'Industry Filtering',
        'Company Reviews',
        'Location-based Search',
        'Company Comparison'
      ]
    },
    {
      id: 'jobs',
      title: 'Job Search',
      description: 'Find and filter internship positions that match your interests',
      href: '/jobs',
      icon: Briefcase,
      status: 'available',
      features: [
        'Advanced Job Search',
        'Skill-based Matching',
        'Salary Range Filtering',
        'Location Preferences',
        'Job Recommendations'
      ]
    },
    {
      id: 'saved',
      title: 'Saved Items',
      description: 'Manage your liked companies and job opportunities',
      href: '/saved-jobs',
      icon: Star,
      status: state.savedItems.length > 0 ? 'active' : 'available',
      count: state.savedItems.length,
      features: [
        'Save Favorite Jobs',
        'Bookmark Companies',
        'Organized Collections',
        'Quick Access',
        'Share Opportunities'
      ]
    },
    {
      id: 'applications',
      title: 'Application Management',
      description: 'Submit and track your internship applications',
      href: '/applications',
      icon: FileText,
      status: state.applications.length > 0 ? 'active' : 'available',
      count: state.applications.length,
      features: [
        'Application Submission',
        'Status Tracking',
        'Document Management',
        'Communication History',
        'Interview Scheduling'
      ]
    },
    {
      id: 'management',
      title: 'Intern Management',
      description: 'Comprehensive view of your internship journey',
      href: '/intern-management',
      icon: Target,
      status: 'available',
      features: [
        'Application Overview',
        'Progress Tracking',
        'Advanced Filtering',
        'Status Management',
        'Performance Analytics'
      ]
    },
    {
      id: 'hiring',
      title: 'Hiring & Onboarding',
      description: 'Manage the hiring process and onboarding experience',
      href: '/hiring',
      icon: Award,
      status: state.applications.some(app => app.status === 'accepted') ? 'active' : 'upcoming',
      features: [
        'Offer Management',
        'Onboarding Checklist',
        'Team Introduction',
        'Document Submission',
        'Progress Tracking'
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'available':
        return 'bg-gray-100 text-gray-800';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'active':
      case 'in-progress':
        return <TrendingUp className="h-4 w-4" />;
      case 'available':
        return <ArrowRight className="h-4 w-4" />;
      case 'upcoming':
        return <Calendar className="h-4 w-4" />;
      default:
        return <ArrowRight className="h-4 w-4" />;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Internship Workflow</h1>
          <p className="text-gray-600">
            Complete overview of your internship journey and all available features
          </p>
        </div>

        {/* Overall Progress */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {overallProgress}% Complete
              </Badge>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="font-medium text-gray-900">{state.completedSteps.length}</p>
                <p className="text-gray-600">Steps Completed</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">{activeApplications.length}</p>
                <p className="text-gray-600">Active Applications</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">{state.savedItems.length}</p>
                <p className="text-gray-600">Saved Items</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">{profileCompletion}%</p>
                <p className="text-gray-600">Profile Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {workflowFeatures.map((feature) => {
            const IconComponent = feature.icon;
            
            return (
              <Card key={feature.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {feature.count !== undefined && (
                        <Badge variant="secondary">{feature.count}</Badge>
                      )}
                      <Badge className={`${getStatusColor(feature.status)} flex items-center space-x-1`}>
                        {getStatusIcon(feature.status)}
                        <span className="capitalize">{feature.status.replace('-', ' ')}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                  
                  {feature.progress !== undefined && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{feature.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${feature.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-gray-700">Features:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {feature.features.slice(0, 3).map((item, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
                          <span>{item}</span>
                        </li>
                      ))}
                      {feature.features.length > 3 && (
                        <li className="text-gray-500">+{feature.features.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                  
                  <Link href={feature.href}>
                    <Button className="w-full">
                      {feature.status === 'completed' ? 'Review' : 
                       feature.status === 'active' || feature.status === 'in-progress' ? 'Continue' : 
                       'Get Started'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Workflow */}
        <InternWorkflowIntegration />
      </div>
    </AppLayout>
  );
}
