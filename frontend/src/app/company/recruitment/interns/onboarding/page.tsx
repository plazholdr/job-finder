'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Building2,
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Star,
  Download,
  Upload,
  Send,
  UserCheck,
  Award,
  Target,
  TrendingUp,
  RefreshCw,
  Plus,
  Minus,
  BookOpen,
  School,
  Timer,
  Laptop,
  Key,
  Shield,
  Coffee,
  Users2,
  ClipboardList,
  Settings,
  Home,
  Monitor
} from 'lucide-react';
import Link from 'next/link';

interface OnboardingIntern {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  internshipDetails: {
    position: string;
    department: string;
    startDate: Date;
    endDate: Date;
    duration: number;
    stipend: number;
    workLocation: 'remote' | 'on-site' | 'hybrid';
    mentor: string;
    buddy: string;
    supervisor: string;
  };
  onboardingStatus: 'pending' | 'documentation' | 'orientation' | 'equipment_setup' | 'access_provisioning' | 'mentor_assignment' | 'training_schedule' | 'workspace_setup' | 'first_day_prep' | 'active' | 'completed';
  onboardingProgress: {
    documentation: {
      completed: boolean;
      completedDate?: Date;
      documents: Array<{
        name: string;
        type: string;
        status: 'pending' | 'submitted' | 'approved' | 'rejected';
        submittedDate?: Date;
        approvedDate?: Date;
        url?: string;
      }>;
    };
    orientation: {
      completed: boolean;
      scheduledDate?: Date;
      completedDate?: Date;
      attendees: string[];
      topics: string[];
      feedback?: string;
    };
    equipmentSetup: {
      completed: boolean;
      assignedDate?: Date;
      completedDate?: Date;
      equipment: Array<{
        item: string;
        serialNumber?: string;
        assignedDate: Date;
        status: 'assigned' | 'delivered' | 'setup' | 'returned';
      }>;
    };
    accessProvisioning: {
      completed: boolean;
      requestedDate?: Date;
      completedDate?: Date;
      systems: Array<{
        system: string;
        accessLevel: string;
        status: 'pending' | 'approved' | 'active' | 'revoked';
        approvedBy?: string;
        approvedDate?: Date;
      }>;
    };
    mentorAssignment: {
      completed: boolean;
      assignedDate?: Date;
      mentor: {
        name: string;
        email: string;
        department: string;
        experience: number;
      };
      buddy: {
        name: string;
        email: string;
        department: string;
      };
      introductionScheduled: boolean;
      introductionDate?: Date;
    };
    trainingSchedule: {
      completed: boolean;
      scheduledDate?: Date;
      trainingSessions: Array<{
        title: string;
        description: string;
        instructor: string;
        date: Date;
        duration: number;
        location: string;
        status: 'scheduled' | 'completed' | 'cancelled';
        completionDate?: Date;
      }>;
    };
    workspaceSetup: {
      completed: boolean;
      assignedDate?: Date;
      completedDate?: Date;
      workspace: {
        location: string;
        deskNumber?: string;
        floor: string;
        building: string;
        amenities: string[];
      };
    };
    firstDayPrep: {
      completed: boolean;
      checklist: Array<{
        item: string;
        completed: boolean;
        completedBy?: string;
        completedDate?: Date;
      }>;
      welcomePackage: {
        prepared: boolean;
        contents: string[];
      };
      scheduleShared: boolean;
    };
  };
  documents: Array<{
    type: string;
    name: string;
    url: string;
    uploadedDate: Date;
    status: 'pending' | 'approved' | 'rejected';
  }>;
  notes: Array<{
    id: string;
    author: string;
    content: string;
    timestamp: Date;
    type: 'general' | 'documentation' | 'orientation' | 'equipment' | 'access' | 'training';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export default function InternOnboardingPage() {
  const [interns, setInterns] = useState<OnboardingIntern[]>([]);
  const [selectedIntern, setSelectedIntern] = useState<OnboardingIntern | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documentation' | 'orientation' | 'equipment' | 'access' | 'training' | 'workspace'>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchOnboardingInterns();
  }, []);

  const fetchOnboardingInterns = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/company/recruitment/interns/onboarding');
      const result = await response.json();

      if (result.success) {
        setInterns(result.data);
      } else {
        setError('Failed to fetch onboarding interns');
      }
    } catch (error) {
      console.error('Error fetching onboarding interns:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOnboardingStatus = async (internId: string, newStatus: string, additionalData?: any) => {
    try {
      const response = await fetch(`/api/company/recruitment/interns/onboarding/${internId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...additionalData })
      });

      const result = await response.json();

      if (result.success) {
        setInterns(prevInterns =>
          prevInterns.map(intern =>
            intern.id === internId ? result.data : intern
          )
        );
        setSelectedIntern(result.data);
        setSuccess(`Onboarding status updated to ${newStatus.replace('_', ' ')}`);
      } else {
        setError(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('An unexpected error occurred');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'documentation': return 'bg-blue-100 text-blue-800';
      case 'orientation': return 'bg-purple-100 text-purple-800';
      case 'equipment_setup': return 'bg-indigo-100 text-indigo-800';
      case 'access_provisioning': return 'bg-cyan-100 text-cyan-800';
      case 'mentor_assignment': return 'bg-teal-100 text-teal-800';
      case 'training_schedule': return 'bg-orange-100 text-orange-800';
      case 'workspace_setup': return 'bg-amber-100 text-amber-800';
      case 'first_day_prep': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'documentation': return <FileText className="h-4 w-4" />;
      case 'orientation': return <Users2 className="h-4 w-4" />;
      case 'equipment_setup': return <Laptop className="h-4 w-4" />;
      case 'access_provisioning': return <Key className="h-4 w-4" />;
      case 'mentor_assignment': return <UserCheck className="h-4 w-4" />;
      case 'training_schedule': return <BookOpen className="h-4 w-4" />;
      case 'workspace_setup': return <Home className="h-4 w-4" />;
      case 'first_day_prep': return <ClipboardList className="h-4 w-4" />;
      case 'active': return <Award className="h-4 w-4" />;
      case 'completed': return <Target className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getAvailableActions = (status: string) => {
    const actionMap: Record<string, Array<{id: string, label: string, type: 'positive' | 'negative' | 'neutral'}>> = {
      'pending': [
        { id: 'start_documentation', label: 'Start Documentation Process', type: 'positive' }
      ],
      'documentation': [
        { id: 'schedule_orientation', label: 'Schedule Orientation', type: 'positive' },
        { id: 'request_documents', label: 'Request Missing Documents', type: 'neutral' }
      ],
      'orientation': [
        { id: 'setup_equipment', label: 'Setup Equipment', type: 'positive' },
        { id: 'reschedule_orientation', label: 'Reschedule Orientation', type: 'neutral' }
      ],
      'equipment_setup': [
        { id: 'provision_access', label: 'Provision System Access', type: 'positive' }
      ],
      'access_provisioning': [
        { id: 'assign_mentor', label: 'Assign Mentor & Buddy', type: 'positive' }
      ],
      'mentor_assignment': [
        { id: 'schedule_training', label: 'Schedule Training Sessions', type: 'positive' }
      ],
      'training_schedule': [
        { id: 'setup_workspace', label: 'Setup Workspace', type: 'positive' }
      ],
      'workspace_setup': [
        { id: 'prepare_first_day', label: 'Prepare First Day', type: 'positive' }
      ],
      'first_day_prep': [
        { id: 'activate_intern', label: 'Activate Internship', type: 'positive' }
      ],
      'active': [
        { id: 'complete_onboarding', label: 'Complete Onboarding', type: 'positive' }
      ]
    };

    return actionMap[status] || [];
  };

  const calculateOverallProgress = (intern: OnboardingIntern) => {
    const steps = [
      intern.onboardingProgress.documentation.completed,
      intern.onboardingProgress.orientation.completed,
      intern.onboardingProgress.equipmentSetup.completed,
      intern.onboardingProgress.accessProvisioning.completed,
      intern.onboardingProgress.mentorAssignment.completed,
      intern.onboardingProgress.trainingSchedule.completed,
      intern.onboardingProgress.workspaceSetup.completed,
      intern.onboardingProgress.firstDayPrep.completed
    ];

    const completedSteps = steps.filter(step => step).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  const filteredInterns = interns.filter(intern => {
    const matchesStatus = filterStatus === 'all' || intern.onboardingStatus === filterStatus;
    const matchesSearch = searchTerm === '' ||
      intern.personalInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.internshipDetails.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.internshipDetails.department.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading intern onboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Intern Onboarding</h1>
                <p className="text-sm text-gray-600">Manage intern onboarding process and documentation</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={fetchOnboardingInterns}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>

              <Link href="/company/recruitment/interns">
                <Button variant="outline">
                  Back to Interns
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search interns by name, position, department, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="documentation">Documentation</option>
            <option value="orientation">Orientation</option>
            <option value="equipment_setup">Equipment Setup</option>
            <option value="access_provisioning">Access Provisioning</option>
            <option value="mentor_assignment">Mentor Assignment</option>
            <option value="training_schedule">Training Schedule</option>
            <option value="workspace_setup">Workspace Setup</option>
            <option value="first_day_prep">First Day Prep</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Interns List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Onboarding Interns ({filteredInterns.length})
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Intern
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredInterns.map(intern => (
                    <div
                      key={intern.id}
                      onClick={() => setSelectedIntern(intern)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedIntern?.id === intern.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{intern.personalInfo.name}</h3>
                          <p className="text-sm text-gray-600">{intern.internshipDetails.position}</p>
                        </div>
                        <Badge className={getStatusColor(intern.onboardingStatus)}>
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(intern.onboardingStatus)}
                            <span>{intern.onboardingStatus.replace('_', ' ')}</span>
                          </span>
                        </Badge>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Onboarding Progress</span>
                          <span>{calculateOverallProgress(intern)}%</span>
                        </div>
                        <Progress value={calculateOverallProgress(intern)} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {intern.personalInfo.email}
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2" />
                          {intern.internshipDetails.department}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Start: {formatDate(intern.internshipDetails.startDate)}
                        </div>
                        <div className="flex items-center">
                          <UserCheck className="h-4 w-4 mr-2" />
                          Mentor: {intern.internshipDetails.mentor}
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredInterns.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No onboarding interns found matching your criteria</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Intern Details */}
          <div>
            {selectedIntern ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Onboarding Details</span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Progress Overview */}
                  <div className="mb-6 p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Overall Progress</h4>
                      <span className="text-sm font-medium text-orange-600">
                        {calculateOverallProgress(selectedIntern)}% Complete
                      </span>
                    </div>
                    <Progress value={calculateOverallProgress(selectedIntern)} className="h-3" />
                  </div>

                  {/* Tabs */}
                  <div className="mb-4">
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-4">
                        {[
                          { id: 'overview', label: 'Overview' },
                          { id: 'documentation', label: 'Documentation' },
                          { id: 'orientation', label: 'Orientation' },
                          { id: 'equipment', label: 'Equipment' },
                          { id: 'access', label: 'Access' },
                          { id: 'training', label: 'Training' },
                          { id: 'workspace', label: 'Workspace' }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              activeTab === tab.id
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </nav>
                    </div>
                  </div>

                  {/* Tab Content */}
                  {activeTab === 'overview' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Intern Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            {selectedIntern.personalInfo.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {selectedIntern.personalInfo.phone}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            {selectedIntern.personalInfo.address}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Internship Details</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Position:</span> {selectedIntern.internshipDetails.position}
                          </div>
                          <div>
                            <span className="font-medium">Department:</span> {selectedIntern.internshipDetails.department}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {selectedIntern.internshipDetails.duration} months
                          </div>
                          <div>
                            <span className="font-medium">Start Date:</span> {formatDate(selectedIntern.internshipDetails.startDate)}
                          </div>
                          <div>
                            <span className="font-medium">End Date:</span> {formatDate(selectedIntern.internshipDetails.endDate)}
                          </div>
                          <div>
                            <span className="font-medium">Stipend:</span> ${selectedIntern.internshipDetails.stipend}/month
                          </div>
                          <div>
                            <span className="font-medium">Work Location:</span> {selectedIntern.internshipDetails.workLocation}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Team Assignment</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Supervisor:</span> {selectedIntern.internshipDetails.supervisor}
                          </div>
                          <div>
                            <span className="font-medium">Mentor:</span> {selectedIntern.internshipDetails.mentor}
                          </div>
                          <div>
                            <span className="font-medium">Buddy:</span> {selectedIntern.internshipDetails.buddy}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Emergency Contact</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Name:</span> {selectedIntern.personalInfo.emergencyContact.name}
                          </div>
                          <div>
                            <span className="font-medium">Relationship:</span> {selectedIntern.personalInfo.emergencyContact.relationship}
                          </div>
                          <div>
                            <span className="font-medium">Phone:</span> {selectedIntern.personalInfo.emergencyContact.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'documentation' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Documentation Status</h4>
                        <Badge className={selectedIntern.onboardingProgress.documentation.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {selectedIntern.onboardingProgress.documentation.completed ? 'Complete' : 'In Progress'}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {selectedIntern.onboardingProgress.documentation.documents.map((doc, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{doc.name}</h5>
                              <Badge className={
                                doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                                doc.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {doc.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              <div>Type: {doc.type}</div>
                              {doc.submittedDate && (
                                <div>Submitted: {formatDate(doc.submittedDate)}</div>
                              )}
                              {doc.approvedDate && (
                                <div>Approved: {formatDate(doc.approvedDate)}</div>
                              )}
                            </div>
                            {doc.url && (
                              <Button variant="outline" size="sm" className="mt-2">
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'orientation' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Orientation Status</h4>
                        <Badge className={selectedIntern.onboardingProgress.orientation.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {selectedIntern.onboardingProgress.orientation.completed ? 'Complete' : 'Pending'}
                        </Badge>
                      </div>

                      {selectedIntern.onboardingProgress.orientation.scheduledDate && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm">
                            <div><span className="font-medium">Scheduled Date:</span> {formatDate(selectedIntern.onboardingProgress.orientation.scheduledDate)}</div>
                            {selectedIntern.onboardingProgress.orientation.completedDate && (
                              <div><span className="font-medium">Completed Date:</span> {formatDate(selectedIntern.onboardingProgress.orientation.completedDate)}</div>
                            )}
                          </div>
                        </div>
                      )}

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Attendees</h5>
                        <div className="flex flex-wrap gap-1">
                          {selectedIntern.onboardingProgress.orientation.attendees.map(attendee => (
                            <Badge key={attendee} variant="outline" className="text-xs">
                              {attendee}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Topics Covered</h5>
                        <div className="space-y-1">
                          {selectedIntern.onboardingProgress.orientation.topics.map(topic => (
                            <div key={topic} className="flex items-center text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              {topic}
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedIntern.onboardingProgress.orientation.feedback && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Feedback</h5>
                          <p className="text-sm text-gray-600">{selectedIntern.onboardingProgress.orientation.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'equipment' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Equipment Setup</h4>
                        <Badge className={selectedIntern.onboardingProgress.equipmentSetup.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {selectedIntern.onboardingProgress.equipmentSetup.completed ? 'Complete' : 'In Progress'}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {selectedIntern.onboardingProgress.equipmentSetup.equipment.map((item, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{item.item}</h5>
                              <Badge className={
                                item.status === 'setup' ? 'bg-green-100 text-green-800' :
                                item.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                                item.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {item.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              {item.serialNumber && (
                                <div>Serial: {item.serialNumber}</div>
                              )}
                              <div>Assigned: {formatDate(item.assignedDate)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available Actions */}
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">Available Actions</h4>
                    <div className="space-y-2">
                      {getAvailableActions(selectedIntern.onboardingStatus).map(action => (
                        <Button
                          key={action.id}
                          variant={action.type === 'positive' ? 'default' : action.type === 'negative' ? 'destructive' : 'outline'}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => updateOnboardingStatus(selectedIntern.id, action.id)}
                        >
                          {action.type === 'positive' && <CheckCircle className="h-4 w-4 mr-2" />}
                          {action.type === 'negative' && <XCircle className="h-4 w-4 mr-2" />}
                          {action.type === 'neutral' && <Clock className="h-4 w-4 mr-2" />}
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select an Intern
                  </h3>
                  <p className="text-gray-600">
                    Choose an intern from the list to view onboarding details and manage their process
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
