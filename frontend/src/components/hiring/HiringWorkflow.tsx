'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  Clock, 
  Users, 
  FileText, 
  Calendar,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  ArrowRight,
  Download,
  Upload,
  AlertCircle
} from 'lucide-react';
import { Application, OfferDetails } from '@/types/company-job';

interface HiringWorkflowProps {
  applicationId: string;
  className?: string;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  dueDate?: Date;
  documents?: string[];
  assignedTo?: string;
  estimatedDuration?: string;
}

interface HiringProcess {
  id: string;
  applicationId: string;
  status: 'offer_extended' | 'offer_accepted' | 'onboarding' | 'completed';
  offerDetails: OfferDetails;
  onboardingSteps: OnboardingStep[];
  startDate: Date;
  endDate?: Date;
  mentor?: {
    id: string;
    name: string;
    title: string;
    email: string;
    phone?: string;
  };
  department: string;
  supervisor: {
    id: string;
    name: string;
    title: string;
    email: string;
  };
  workspace?: {
    location: string;
    desk?: string;
    equipment: string[];
  };
}

export default function HiringWorkflow({ applicationId, className = '' }: HiringWorkflowProps) {
  const [hiringProcess, setHiringProcess] = useState<HiringProcess | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchHiringProcess();
  }, [applicationId]);

  const fetchHiringProcess = async () => {
    try {
      setLoading(true);
      
      // Fetch application details
      const appResponse = await fetch(`/api/applications/${applicationId}`);
      const appData = await appResponse.json();
      
      if (appData.success) {
        setApplication(appData.data);
        
        // Mock hiring process data - in a real app, this would come from API
        const mockHiringProcess: HiringProcess = {
          id: 'hiring-1',
          applicationId,
          status: 'onboarding',
          offerDetails: appData.data.offerDetails || {
            id: 'offer-1',
            applicationId,
            salary: 22,
            currency: 'USD',
            period: 'hour',
            startDate: new Date('2024-06-01'),
            endDate: new Date('2024-08-31'),
            benefits: ['Health insurance', 'Flexible working hours', 'Learning stipend'],
            conditions: ['Maintain academic standing', 'Complete final project'],
            deadline: new Date('2024-02-05'),
            status: 'accepted',
            responseRequired: false
          },
          onboardingSteps: [
            {
              id: 'step-1',
              title: 'Welcome & Orientation',
              description: 'Complete company orientation and meet your team',
              status: 'completed',
              dueDate: new Date('2024-06-01'),
              estimatedDuration: '4 hours',
              assignedTo: 'HR Team'
            },
            {
              id: 'step-2',
              title: 'Documentation & Paperwork',
              description: 'Submit required documents and complete employment forms',
              status: 'completed',
              documents: ['I-9 Form', 'Tax Forms', 'Emergency Contact', 'Direct Deposit'],
              estimatedDuration: '2 hours',
              assignedTo: 'HR Team'
            },
            {
              id: 'step-3',
              title: 'IT Setup & Access',
              description: 'Receive equipment and set up accounts',
              status: 'in_progress',
              dueDate: new Date('2024-06-03'),
              estimatedDuration: '3 hours',
              assignedTo: 'IT Department'
            },
            {
              id: 'step-4',
              title: 'Department Introduction',
              description: 'Meet your team and understand your role',
              status: 'pending',
              dueDate: new Date('2024-06-04'),
              estimatedDuration: '2 hours',
              assignedTo: 'Department Manager'
            },
            {
              id: 'step-5',
              title: 'Training Program',
              description: 'Complete required training modules',
              status: 'pending',
              dueDate: new Date('2024-06-10'),
              estimatedDuration: '16 hours',
              assignedTo: 'Training Team'
            },
            {
              id: 'step-6',
              title: 'First Project Assignment',
              description: 'Receive and begin your first project',
              status: 'pending',
              dueDate: new Date('2024-06-15'),
              estimatedDuration: '1 hour',
              assignedTo: 'Project Manager'
            }
          ],
          startDate: new Date('2024-06-01'),
          mentor: {
            id: 'mentor-1',
            name: 'Sarah Johnson',
            title: 'Senior Software Engineer',
            email: 'sarah.johnson@company.com',
            phone: '+1 (555) 123-4567'
          },
          department: 'Engineering',
          supervisor: {
            id: 'supervisor-1',
            name: 'Mike Chen',
            title: 'Engineering Manager',
            email: 'mike.chen@company.com'
          },
          workspace: {
            location: 'Building A, Floor 3',
            desk: 'Desk 3A-15',
            equipment: ['MacBook Pro', 'External Monitor', 'Keyboard', 'Mouse', 'Headphones']
          }
        };
        
        setHiringProcess(mockHiringProcess);
      }
    } catch (error) {
      console.error('Error fetching hiring process:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (status: OnboardingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-400" />;
      case 'skipped':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepColor = (status: OnboardingStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'skipped':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProgressPercentage = () => {
    if (!hiringProcess) return 0;
    const completed = hiringProcess.onboardingSteps.filter(step => step.status === 'completed').length;
    return Math.round((completed / hiringProcess.onboardingSteps.length) * 100);
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!hiringProcess || !application) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Hiring process not found</h3>
        <p className="text-gray-600">
          No hiring process information available for this application.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hiring & Onboarding</h1>
          <p className="text-gray-600 mt-1">
            Welcome to {application.job?.company?.name || 'the company'}! Track your onboarding progress.
          </p>
        </div>
        
        <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
          <CheckCircle className="h-4 w-4 mr-2" />
          Hired
        </Badge>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Onboarding Progress</h3>
            <span className="text-2xl font-bold text-blue-600">{getProgressPercentage()}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="font-medium text-gray-900">
                {hiringProcess.onboardingSteps.filter(s => s.status === 'completed').length}
              </p>
              <p className="text-gray-600">Completed</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-900">
                {hiringProcess.onboardingSteps.filter(s => s.status === 'in_progress').length}
              </p>
              <p className="text-gray-600">In Progress</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-900">
                {hiringProcess.onboardingSteps.filter(s => s.status === 'pending').length}
              </p>
              <p className="text-gray-600">Pending</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-900">
                {formatDate(hiringProcess.startDate)}
              </p>
              <p className="text-gray-600">Start Date</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5" />
                  <span>Position Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Job Title</label>
                    <p className="text-gray-900">{application.job?.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Department</label>
                    <p className="text-gray-900">{hiringProcess.department}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Duration</label>
                    <p className="text-gray-900">
                      {formatDate(hiringProcess.offerDetails.startDate)} - {formatDate(hiringProcess.offerDetails.endDate)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Compensation</label>
                    <p className="text-gray-900">
                      ${hiringProcess.offerDetails.salary}/{hiringProcess.offerDetails.period}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workspace Info */}
            {hiringProcess.workspace && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Workspace</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Location</label>
                      <p className="text-gray-900">{hiringProcess.workspace.location}</p>
                    </div>
                    {hiringProcess.workspace.desk && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Desk Assignment</label>
                        <p className="text-gray-900">{hiringProcess.workspace.desk}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-600">Equipment</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {hiringProcess.workspace.equipment.map((item, index) => (
                          <Badge key={index} variant="outline">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="onboarding" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {hiringProcess.onboardingSteps.map((step, index) => (
                  <div key={step.id} className="flex space-x-4">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center">
                        {getStepIcon(step.status)}
                      </div>
                      {index < hiringProcess.onboardingSteps.length - 1 && (
                        <div className="w-px h-12 bg-gray-200 mt-2"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 pb-8">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{step.title}</h4>
                        <Badge className={getStepColor(step.status)}>
                          {step.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        {step.dueDate && (
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Due: {formatDate(step.dueDate)}</span>
                          </span>
                        )}
                        {step.estimatedDuration && (
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{step.estimatedDuration}</span>
                          </span>
                        )}
                        {step.assignedTo && (
                          <span className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{step.assignedTo}</span>
                          </span>
                        )}
                      </div>
                      
                      {step.documents && step.documents.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-600 mb-2">Required Documents:</p>
                          <div className="flex flex-wrap gap-2">
                            {step.documents.map((doc, docIndex) => (
                              <Badge key={docIndex} variant="outline" className="text-xs">
                                <FileText className="h-3 w-3 mr-1" />
                                {doc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Supervisor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Supervisor</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-900">{hiringProcess.supervisor.name}</p>
                    <p className="text-sm text-gray-600">{hiringProcess.supervisor.title}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${hiringProcess.supervisor.email}`} className="hover:text-blue-600">
                      {hiringProcess.supervisor.email}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mentor */}
            {hiringProcess.mentor && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5" />
                    <span>Mentor</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-900">{hiringProcess.mentor.name}</p>
                      <p className="text-sm text-gray-600">{hiringProcess.mentor.title}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${hiringProcess.mentor.email}`} className="hover:text-blue-600">
                          {hiringProcess.mentor.email}
                        </a>
                      </div>
                      {hiringProcess.mentor.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <a href={`tel:${hiringProcess.mentor.phone}`} className="hover:text-blue-600">
                            {hiringProcess.mentor.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Documents & Resources</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Employee Handbook</h4>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">Company policies and procedures</p>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Internship Agreement</h4>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">Your signed internship contract</p>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Benefits Guide</h4>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">Information about your benefits package</p>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">IT Setup Guide</h4>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">Instructions for setting up your accounts</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Upload Documents</h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop files here, or click to browse
                    </p>
                    <Button variant="outline" size="sm">
                      Choose Files
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
