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
  Monitor,
  Trophy,
  ThumbsUp,
  MessageSquare,
  Presentation,
  FileCheck,
  Award as Certificate,
  Handshake,
  Network
} from 'lucide-react';
import Link from 'next/link';

interface CompletingIntern {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    university: string;
    major: string;
    year: string;
  };
  internshipDetails: {
    position: string;
    department: string;
    startDate: Date;
    endDate: Date;
    duration: number;
    mentor: string;
    supervisor: string;
    projects: string[];
  };
  completionStatus: 'active' | 'pre_completion' | 'project_review' | 'performance_evaluation' | 'exit_interview' | 'documentation_finalization' | 'certificate_generation' | 'alumni_network' | 'completed' | 'extended';
  completionProgress: {
    projectReview: {
      completed: boolean;
      completedDate?: Date;
      projects: Array<{
        title: string;
        description: string;
        technologies: string[];
        deliverables: Array<{
          name: string;
          type: 'document' | 'code' | 'presentation' | 'demo';
          url?: string;
          status: 'pending' | 'submitted' | 'reviewed' | 'approved';
          submittedDate?: Date;
          reviewedDate?: Date;
          feedback?: string;
          score?: number;
        }>;
        overallScore?: number;
        feedback?: string;
        reviewedBy?: string;
        reviewedDate?: Date;
      }>;
    };
    performanceEvaluation: {
      completed: boolean;
      completedDate?: Date;
      evaluations: Array<{
        evaluatorName: string;
        evaluatorRole: string;
        evaluationDate: Date;
        categories: Array<{
          category: string;
          score: number;
          maxScore: number;
          feedback: string;
        }>;
        overallScore: number;
        strengths: string[];
        areasForImprovement: string[];
        recommendations: string;
        futureOpportunities?: string;
      }>;
      selfEvaluation?: {
        completedDate: Date;
        learnings: string[];
        achievements: string[];
        challenges: string[];
        feedback: string;
        careerGoals: string[];
      };
    };
    exitInterview: {
      completed: boolean;
      scheduledDate?: Date;
      completedDate?: Date;
      interviewer: string;
      feedback: {
        overallExperience: number;
        mentorshipQuality: number;
        projectRelevance: number;
        learningOpportunities: number;
        workEnvironment: number;
        recommendToOthers: boolean;
        suggestions: string;
        highlights: string[];
        improvements: string[];
      };
      futureInterest: {
        fullTimePosition: boolean;
        futureInternship: boolean;
        referrals: boolean;
        stayInTouch: boolean;
      };
    };
    documentationFinalization: {
      completed: boolean;
      completedDate?: Date;
      documents: Array<{
        name: string;
        type: 'timesheet' | 'expense_report' | 'equipment_return' | 'access_revocation' | 'final_report' | 'knowledge_transfer';
        status: 'pending' | 'submitted' | 'approved' | 'completed';
        submittedDate?: Date;
        approvedDate?: Date;
        notes?: string;
      }>;
      equipmentReturned: boolean;
      accessRevoked: boolean;
      finalPaymentProcessed: boolean;
    };
    certificateGeneration: {
      completed: boolean;
      generatedDate?: Date;
      certificate: {
        type: 'completion' | 'excellence' | 'outstanding_performance';
        templateUsed: string;
        signedBy: string[];
        deliveryMethod: 'email' | 'physical' | 'both';
        deliveredDate?: Date;
        customizations?: string[];
      };
      recommendations: Array<{
        type: 'linkedin' | 'letter' | 'reference';
        requestedBy: string;
        providedBy: string;
        status: 'requested' | 'drafted' | 'approved' | 'delivered';
        content?: string;
        deliveredDate?: Date;
      }>;
    };
    alumniNetwork: {
      completed: boolean;
      enrolledDate?: Date;
      alumniProfile: {
        created: boolean;
        profileUrl?: string;
        permissions: {
          contactInfo: boolean;
          careerUpdates: boolean;
          mentorship: boolean;
          events: boolean;
        };
      };
      networking: {
        introductions: string[];
        events: string[];
        mentorshipOpportunities: string[];
      };
      futureEngagement: {
        ambassadorProgram: boolean;
        mentorshipProgram: boolean;
        recruitmentEvents: boolean;
        guestSpeaking: boolean;
      };
    };
  };
  documents: Array<{
    type: string;
    name: string;
    url: string;
    uploadedDate: Date;
    status: 'pending' | 'approved' | 'completed';
  }>;
  notes: Array<{
    id: string;
    author: string;
    content: string;
    timestamp: Date;
    type: 'general' | 'project' | 'performance' | 'exit' | 'documentation' | 'alumni';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export default function InternCompletionPage() {
  const [interns, setInterns] = useState<CompletingIntern[]>([]);
  const [selectedIntern, setSelectedIntern] = useState<CompletingIntern | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'evaluation' | 'exit' | 'documentation' | 'certificate' | 'alumni'>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchCompletingInterns();
  }, []);

  const fetchCompletingInterns = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/company/recruitment/interns/completion');
      const result = await response.json();

      if (result.success) {
        setInterns(result.data);
      } else {
        setError('Failed to fetch completing interns');
      }
    } catch (error) {
      console.error('Error fetching completing interns:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCompletionStatus = async (internId: string, newStatus: string, additionalData?: any) => {
    try {
      const response = await fetch(`/api/company/recruitment/interns/completion/${internId}/status`, {
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
        setSuccess(`Completion status updated to ${newStatus.replace('_', ' ')}`);
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
      case 'active': return 'bg-green-100 text-green-800';
      case 'pre_completion': return 'bg-blue-100 text-blue-800';
      case 'project_review': return 'bg-purple-100 text-purple-800';
      case 'performance_evaluation': return 'bg-indigo-100 text-indigo-800';
      case 'exit_interview': return 'bg-cyan-100 text-cyan-800';
      case 'documentation_finalization': return 'bg-teal-100 text-teal-800';
      case 'certificate_generation': return 'bg-orange-100 text-orange-800';
      case 'alumni_network': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'extended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Award className="h-4 w-4" />;
      case 'pre_completion': return <Clock className="h-4 w-4" />;
  case 'project_review': return <Presentation className="h-4 w-4" />;
      case 'performance_evaluation': return <Trophy className="h-4 w-4" />;
      case 'exit_interview': return <MessageSquare className="h-4 w-4" />;
      case 'documentation_finalization': return <FileCheck className="h-4 w-4" />;
  case 'certificate_generation': return <Certificate className="h-4 w-4" />;
      case 'alumni_network': return <Network className="h-4 w-4" />;
      case 'completed': return <Target className="h-4 w-4" />;
      case 'extended': return <Timer className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getAvailableActions = (status: string) => {
    const actionMap: Record<string, Array<{id: string, label: string, type: 'positive' | 'negative' | 'neutral'}>> = {
      'active': [
        { id: 'start_completion', label: 'Start Completion Process', type: 'positive' },
        { id: 'extend_internship', label: 'Extend Internship', type: 'neutral' }
      ],
      'pre_completion': [
        { id: 'review_projects', label: 'Review Projects', type: 'positive' }
      ],
      'project_review': [
        { id: 'conduct_evaluation', label: 'Conduct Performance Evaluation', type: 'positive' }
      ],
      'performance_evaluation': [
        { id: 'schedule_exit_interview', label: 'Schedule Exit Interview', type: 'positive' }
      ],
      'exit_interview': [
        { id: 'finalize_documentation', label: 'Finalize Documentation', type: 'positive' }
      ],
      'documentation_finalization': [
        { id: 'generate_certificate', label: 'Generate Certificate', type: 'positive' }
      ],
      'certificate_generation': [
        { id: 'enroll_alumni', label: 'Enroll in Alumni Network', type: 'positive' }
      ],
      'alumni_network': [
        { id: 'complete_internship', label: 'Complete Internship', type: 'positive' }
      ]
    };

    return actionMap[status] || [];
  };

  const calculateOverallProgress = (intern: CompletingIntern) => {
    const steps = [
      intern.completionProgress.projectReview.completed,
      intern.completionProgress.performanceEvaluation.completed,
      intern.completionProgress.exitInterview.completed,
      intern.completionProgress.documentationFinalization.completed,
      intern.completionProgress.certificateGeneration.completed,
      intern.completionProgress.alumniNetwork.completed
    ];

    const completedSteps = steps.filter(step => step).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  const filteredInterns = interns.filter(intern => {
    const matchesStatus = filterStatus === 'all' || intern.completionStatus === filterStatus;
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
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading intern completion...</p>
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
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Intern Completion</h1>
                <p className="text-sm text-gray-600">Manage intern completion process and alumni transition</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={fetchCompletingInterns}>
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
            <option value="active">Active</option>
            <option value="pre_completion">Pre-Completion</option>
            <option value="project_review">Project Review</option>
            <option value="performance_evaluation">Performance Evaluation</option>
            <option value="exit_interview">Exit Interview</option>
            <option value="documentation_finalization">Documentation Finalization</option>
            <option value="certificate_generation">Certificate Generation</option>
            <option value="alumni_network">Alumni Network</option>
            <option value="completed">Completed</option>
            <option value="extended">Extended</option>
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
                    Completing Interns ({filteredInterns.length})
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
                        selectedIntern?.id === intern.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{intern.personalInfo.name}</h3>
                          <p className="text-sm text-gray-600">{intern.internshipDetails.position}</p>
                        </div>
                        <Badge className={getStatusColor(intern.completionStatus)}>
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(intern.completionStatus)}
                            <span>{intern.completionStatus.replace('_', ' ')}</span>
                          </span>
                        </Badge>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Completion Progress</span>
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
                          End: {formatDate(intern.internshipDetails.endDate)}
                        </div>
                        <div className="flex items-center">
                          <School className="h-4 w-4 mr-2" />
                          {intern.personalInfo.university}
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredInterns.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No completing interns found matching your criteria</p>
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
                    <span>Completion Details</span>
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
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Completion Progress</h4>
                      <span className="text-sm font-medium text-blue-600">
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
                          { id: 'projects', label: 'Projects' },
                          { id: 'evaluation', label: 'Evaluation' },
                          { id: 'exit', label: 'Exit Interview' },
                          { id: 'documentation', label: 'Documentation' },
                          { id: 'certificate', label: 'Certificate' },
                          { id: 'alumni', label: 'Alumni' }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
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
                            <School className="h-4 w-4 mr-2 text-gray-400" />
                            {selectedIntern.personalInfo.university}
                          </div>
                          <div className="flex items-center">
                            <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                            {selectedIntern.personalInfo.major} - {selectedIntern.personalInfo.year}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Internship Summary</h4>
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
                            <span className="font-medium">Mentor:</span> {selectedIntern.internshipDetails.mentor}
                          </div>
                          <div>
                            <span className="font-medium">Supervisor:</span> {selectedIntern.internshipDetails.supervisor}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Projects Worked On</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedIntern.internshipDetails.projects.map(project => (
                            <Badge key={project} variant="outline" className="text-xs">
                              {project}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Completion Checklist</h4>
                        <div className="space-y-2">
                          {[
                            { key: 'projectReview', label: 'Project Review', completed: selectedIntern.completionProgress.projectReview.completed },
                            { key: 'performanceEvaluation', label: 'Performance Evaluation', completed: selectedIntern.completionProgress.performanceEvaluation.completed },
                            { key: 'exitInterview', label: 'Exit Interview', completed: selectedIntern.completionProgress.exitInterview.completed },
                            { key: 'documentationFinalization', label: 'Documentation Finalization', completed: selectedIntern.completionProgress.documentationFinalization.completed },
                            { key: 'certificateGeneration', label: 'Certificate Generation', completed: selectedIntern.completionProgress.certificateGeneration.completed },
                            { key: 'alumniNetwork', label: 'Alumni Network Enrollment', completed: selectedIntern.completionProgress.alumniNetwork.completed }
                          ].map(item => (
                            <div key={item.key} className="flex items-center text-sm">
                              {item.completed ? (
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              ) : (
                                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                              )}
                              <span className={item.completed ? 'text-green-700' : 'text-gray-600'}>
                                {item.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'projects' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Project Review Status</h4>
                        <Badge className={selectedIntern.completionProgress.projectReview.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {selectedIntern.completionProgress.projectReview.completed ? 'Complete' : 'In Progress'}
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        {selectedIntern.completionProgress.projectReview.projects.map((project, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium text-gray-900">{project.title}</h5>
                              {project.overallScore && (
                                <Badge className="bg-blue-100 text-blue-800">
                                  Score: {project.overallScore}/100
                                </Badge>
                              )}
                            </div>

                            <p className="text-sm text-gray-600 mb-3">{project.description}</p>

                            <div className="mb-3">
                              <h6 className="font-medium text-gray-900 mb-1">Technologies Used</h6>
                              <div className="flex flex-wrap gap-1">
                                {project.technologies.map(tech => (
                                  <Badge key={tech} variant="outline" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="mb-3">
                              <h6 className="font-medium text-gray-900 mb-2">Deliverables</h6>
                              <div className="space-y-2">
                                {project.deliverables.map((deliverable, delIndex) => (
                                  <div key={delIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex items-center">
                                      <FileText className="h-4 w-4 mr-2 text-gray-400" />
                                      <span className="text-sm">{deliverable.name}</span>
                                      <Badge variant="outline" className="ml-2 text-xs">
                                        {deliverable.type}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Badge className={
                                        deliverable.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        deliverable.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                                        deliverable.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                      }>
                                        {deliverable.status}
                                      </Badge>
                                      {deliverable.score && (
                                        <span className="text-xs text-gray-600">{deliverable.score}/100</span>
                                      )}
                                      {deliverable.url && (
                                        <Button variant="outline" size="sm">
                                          <Download className="h-3 w-3" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {project.feedback && (
                              <div>
                                <h6 className="font-medium text-gray-900 mb-1">Feedback</h6>
                                <p className="text-sm text-gray-600">{project.feedback}</p>
                                {project.reviewedBy && project.reviewedDate && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Reviewed by {project.reviewedBy} on {formatDate(project.reviewedDate)}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'evaluation' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Performance Evaluation</h4>
                        <Badge className={selectedIntern.completionProgress.performanceEvaluation.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {selectedIntern.completionProgress.performanceEvaluation.completed ? 'Complete' : 'Pending'}
                        </Badge>
                      </div>

                      {selectedIntern.completionProgress.performanceEvaluation.evaluations.map((evaluation, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h5 className="font-medium text-gray-900">{evaluation.evaluatorName}</h5>
                              <p className="text-sm text-gray-600">{evaluation.evaluatorRole}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-600">{evaluation.overallScore}/100</div>
                              <div className="text-xs text-gray-500">{formatDate(evaluation.evaluationDate)}</div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h6 className="font-medium text-gray-900 mb-2">Category Scores</h6>
                              <div className="space-y-2">
                                {evaluation.categories.map((category, catIndex) => (
                                  <div key={catIndex} className="flex items-center justify-between">
                                    <span className="text-sm">{category.category}</span>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-24 bg-gray-200 rounded-full h-2">
                                        <div
                                          className="bg-blue-600 h-2 rounded-full"
                                          style={{ width: `${(category.score / category.maxScore) * 100}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-sm font-medium">{category.score}/{category.maxScore}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h6 className="font-medium text-gray-900 mb-1">Strengths</h6>
                              <ul className="text-sm text-gray-600 list-disc list-inside">
                                {evaluation.strengths.map((strength, strIndex) => (
                                  <li key={strIndex}>{strength}</li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h6 className="font-medium text-gray-900 mb-1">Areas for Improvement</h6>
                              <ul className="text-sm text-gray-600 list-disc list-inside">
                                {evaluation.areasForImprovement.map((area, areaIndex) => (
                                  <li key={areaIndex}>{area}</li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h6 className="font-medium text-gray-900 mb-1">Recommendations</h6>
                              <p className="text-sm text-gray-600">{evaluation.recommendations}</p>
                            </div>

                            {evaluation.futureOpportunities && (
                              <div>
                                <h6 className="font-medium text-gray-900 mb-1">Future Opportunities</h6>
                                <p className="text-sm text-gray-600">{evaluation.futureOpportunities}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {selectedIntern.completionProgress.performanceEvaluation.selfEvaluation && (
                        <div className="p-4 border rounded-lg bg-blue-50">
                          <h5 className="font-medium text-gray-900 mb-3">Self Evaluation</h5>
                          <div className="space-y-3 text-sm">
                            <div>
                              <h6 className="font-medium">Key Learnings</h6>
                              <ul className="list-disc list-inside text-gray-600">
                                {selectedIntern.completionProgress.performanceEvaluation.selfEvaluation.learnings.map((learning, index) => (
                                  <li key={index}>{learning}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h6 className="font-medium">Achievements</h6>
                              <ul className="list-disc list-inside text-gray-600">
                                {selectedIntern.completionProgress.performanceEvaluation.selfEvaluation.achievements.map((achievement, index) => (
                                  <li key={index}>{achievement}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h6 className="font-medium">Career Goals</h6>
                              <ul className="list-disc list-inside text-gray-600">
                                {selectedIntern.completionProgress.performanceEvaluation.selfEvaluation.careerGoals.map((goal, index) => (
                                  <li key={index}>{goal}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Available Actions */}
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">Available Actions</h4>
                    <div className="space-y-2">
                      {getAvailableActions(selectedIntern.completionStatus).map(action => (
                        <Button
                          key={action.id}
                          variant={action.type === 'positive' ? 'default' : action.type === 'negative' ? 'destructive' : 'outline'}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => updateCompletionStatus(selectedIntern.id, action.id)}
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
                    Choose an intern from the list to view completion details and manage their transition process
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
