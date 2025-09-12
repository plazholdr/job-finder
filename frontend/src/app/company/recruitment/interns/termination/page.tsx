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
  UserMinus,
  AlertTriangle,
  FileX,
  LogOut,
  CreditCard,
  Package,
  Lock
} from 'lucide-react';
import Link from 'next/link';

interface TerminatingIntern {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    university: string;
    major: string;
    year: string;
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
    originalEndDate: Date;
    terminationDate: Date;
    duration: number;
    mentor: string;
    supervisor: string;
    projects: string[];
  };
  terminationInfo: {
    reason: 'performance' | 'misconduct' | 'policy_violation' | 'personal_reasons' | 'company_restructure' | 'mutual_agreement' | 'other';
    initiatedBy: 'intern' | 'company' | 'mutual';
    noticePeriod: number;
    lastWorkingDay: Date;
    severityLevel: 'low' | 'medium' | 'high' | 'critical';
    documentation: string;
    approvedBy: string;
    approvalDate: Date;
  };
  terminationStatus: 'initiated' | 'notice_period' | 'documentation_review' | 'equipment_return' | 'access_revocation' | 'final_settlement' | 'exit_interview' | 'knowledge_transfer' | 'legal_clearance' | 'completed';
  terminationProgress: {
    documentationReview: {
      completed: boolean;
      completedDate?: Date;
      documents: Array<{
        name: string;
        type: 'incident_report' | 'performance_review' | 'warning_letter' | 'termination_letter' | 'legal_document' | 'other';
        status: 'pending' | 'reviewed' | 'approved' | 'rejected';
        reviewedBy?: string;
        reviewedDate?: Date;
        comments?: string;
        url?: string;
      }>;
      legalReview: {
        required: boolean;
        completed: boolean;
        reviewedBy?: string;
        reviewedDate?: Date;
        clearance: boolean;
        notes?: string;
      };
    };
    equipmentReturn: {
      completed: boolean;
      completedDate?: Date;
      equipment: Array<{
        item: string;
        serialNumber?: string;
        assignedDate: Date;
        returnDate?: Date;
        condition: 'good' | 'fair' | 'damaged' | 'missing';
        notes?: string;
        returnedTo?: string;
      }>;
      totalItems: number;
      returnedItems: number;
      damagedItems: number;
      missingItems: number;
    };
    accessRevocation: {
      completed: boolean;
      completedDate?: Date;
      systems: Array<{
        system: string;
        accessLevel: string;
        revokedDate?: Date;
        revokedBy?: string;
        status: 'active' | 'revoked' | 'suspended';
        notes?: string;
      }>;
      physicalAccess: {
        badgeDeactivated: boolean;
        keysReturned: boolean;
        parkingRevoked: boolean;
        deactivatedDate?: Date;
        deactivatedBy?: string;
      };
    };
    finalSettlement: {
      completed: boolean;
      completedDate?: Date;
      payroll: {
        finalPayPeriod: Date;
        outstandingHours: number;
        overtimeHours: number;
        unpaidExpenses: number;
        deductions: number;
        finalAmount: number;
        paymentDate?: Date;
        paymentMethod: 'direct_deposit' | 'check' | 'cash';
        processed: boolean;
      };
      benefits: {
        healthInsurance: {
          endDate: Date;
          cobraEligible: boolean;
          notified: boolean;
        };
        otherBenefits: string[];
      };
    };
    exitInterview: {
      completed: boolean;
      scheduledDate?: Date;
      completedDate?: Date;
      interviewer: string;
      feedback: {
        reasonForLeaving: string;
        workEnvironment: number;
        managementSupport: number;
        learningOpportunities: number;
        workLifeBalance: number;
        wouldRecommend: boolean;
        suggestions: string;
        positiveAspects: string[];
        improvementAreas: string[];
      };
      confidential: boolean;
    };
    knowledgeTransfer: {
      completed: boolean;
      completedDate?: Date;
      transferItems: Array<{
        item: string;
        type: 'project_handover' | 'documentation' | 'contacts' | 'passwords' | 'files' | 'other';
        transferredTo: string;
        transferDate?: Date;
        status: 'pending' | 'in_progress' | 'completed';
        notes?: string;
      }>;
      handoverMeeting: {
        scheduled: boolean;
        date?: Date;
        attendees: string[];
        completed: boolean;
        notes?: string;
      };
    };
    legalClearance: {
      completed: boolean;
      completedDate?: Date;
      agreements: Array<{
        type: 'nda' | 'non_compete' | 'intellectual_property' | 'confidentiality' | 'other';
        status: 'active' | 'terminated' | 'modified';
        expiryDate?: Date;
        notes?: string;
      }>;
      liabilities: Array<{
        type: string;
        description: string;
        resolved: boolean;
        resolutionDate?: Date;
        notes?: string;
      }>;
      clearanceGiven: boolean;
      clearanceBy?: string;
      clearanceDate?: Date;
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
    type: 'general' | 'legal' | 'hr' | 'equipment' | 'access' | 'settlement';
    confidential: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export default function InternTerminationPage() {
  const [interns, setInterns] = useState<TerminatingIntern[]>([]);
  const [selectedIntern, setSelectedIntern] = useState<TerminatingIntern | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documentation' | 'equipment' | 'access' | 'settlement' | 'exit' | 'transfer' | 'legal'>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchTerminatingInterns();
  }, []);

  const fetchTerminatingInterns = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/company/recruitment/interns/termination');
      const result = await response.json();

      if (result.success) {
        setInterns(result.data);
      } else {
        setError('Failed to fetch terminating interns');
      }
    } catch (error) {
      console.error('Error fetching terminating interns:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const updateTerminationStatus = async (internId: string, newStatus: string, additionalData?: any) => {
    try {
      const response = await fetch(`/api/company/recruitment/interns/termination/${internId}/status`, {
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
        setSuccess(`Termination status updated to ${newStatus.replace('_', ' ')}`);
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
      case 'initiated': return 'bg-red-100 text-red-800';
      case 'notice_period': return 'bg-orange-100 text-orange-800';
      case 'documentation_review': return 'bg-yellow-100 text-yellow-800';
      case 'equipment_return': return 'bg-blue-100 text-blue-800';
      case 'access_revocation': return 'bg-purple-100 text-purple-800';
      case 'final_settlement': return 'bg-indigo-100 text-indigo-800';
      case 'exit_interview': return 'bg-cyan-100 text-cyan-800';
      case 'knowledge_transfer': return 'bg-teal-100 text-teal-800';
      case 'legal_clearance': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'initiated': return <AlertTriangle className="h-4 w-4" />;
      case 'notice_period': return <Clock className="h-4 w-4" />;
      case 'documentation_review': return <FileText className="h-4 w-4" />;
      case 'equipment_return': return <Package className="h-4 w-4" />;
      case 'access_revocation': return <Lock className="h-4 w-4" />;
      case 'final_settlement': return <CreditCard className="h-4 w-4" />;
      case 'exit_interview': return <Users2 className="h-4 w-4" />;
      case 'knowledge_transfer': return <Send className="h-4 w-4" />;
      case 'legal_clearance': return <Shield className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'performance': return 'bg-orange-100 text-orange-800';
      case 'misconduct': return 'bg-red-100 text-red-800';
      case 'policy_violation': return 'bg-red-100 text-red-800';
      case 'personal_reasons': return 'bg-blue-100 text-blue-800';
      case 'company_restructure': return 'bg-purple-100 text-purple-800';
      case 'mutual_agreement': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailableActions = (status: string) => {
    const actionMap: Record<string, Array<{id: string, label: string, type: 'positive' | 'negative' | 'neutral'}>> = {
      'initiated': [
        { id: 'start_notice_period', label: 'Start Notice Period', type: 'positive' },
        { id: 'cancel_termination', label: 'Cancel Termination', type: 'neutral' }
      ],
      'notice_period': [
        { id: 'review_documentation', label: 'Review Documentation', type: 'positive' }
      ],
      'documentation_review': [
        { id: 'initiate_equipment_return', label: 'Initiate Equipment Return', type: 'positive' }
      ],
      'equipment_return': [
        { id: 'revoke_access', label: 'Revoke System Access', type: 'positive' }
      ],
      'access_revocation': [
        { id: 'process_settlement', label: 'Process Final Settlement', type: 'positive' }
      ],
      'final_settlement': [
        { id: 'schedule_exit_interview', label: 'Schedule Exit Interview', type: 'positive' }
      ],
      'exit_interview': [
        { id: 'initiate_knowledge_transfer', label: 'Initiate Knowledge Transfer', type: 'positive' }
      ],
      'knowledge_transfer': [
        { id: 'legal_clearance', label: 'Legal Clearance Review', type: 'positive' }
      ],
      'legal_clearance': [
        { id: 'complete_termination', label: 'Complete Termination', type: 'positive' }
      ]
    };

    return actionMap[status] || [];
  };

  const calculateOverallProgress = (intern: TerminatingIntern) => {
    const steps = [
      intern.terminationProgress.documentationReview.completed,
      intern.terminationProgress.equipmentReturn.completed,
      intern.terminationProgress.accessRevocation.completed,
      intern.terminationProgress.finalSettlement.completed,
      intern.terminationProgress.exitInterview.completed,
      intern.terminationProgress.knowledgeTransfer.completed,
      intern.terminationProgress.legalClearance.completed
    ];

    const completedSteps = steps.filter(step => step).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  const filteredInterns = interns.filter(intern => {
    const matchesStatus = filterStatus === 'all' || intern.terminationStatus === filterStatus;
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
          <RefreshCw className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading intern terminations...</p>
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
              <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Intern Termination</h1>
                <p className="text-sm text-gray-600">Manage intern termination process and exit procedures</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={fetchTerminatingInterns}>
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
            <option value="initiated">Initiated</option>
            <option value="notice_period">Notice Period</option>
            <option value="documentation_review">Documentation Review</option>
            <option value="equipment_return">Equipment Return</option>
            <option value="access_revocation">Access Revocation</option>
            <option value="final_settlement">Final Settlement</option>
            <option value="exit_interview">Exit Interview</option>
            <option value="knowledge_transfer">Knowledge Transfer</option>
            <option value="legal_clearance">Legal Clearance</option>
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
                    Terminating Interns ({filteredInterns.length})
                  </div>
                  <Button size="sm" variant="destructive">
                    <Plus className="h-4 w-4 mr-2" />
                    Initiate Termination
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
                        selectedIntern?.id === intern.id ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{intern.personalInfo.name}</h3>
                          <p className="text-sm text-gray-600">{intern.internshipDetails.position}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge className={getStatusColor(intern.terminationStatus)}>
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(intern.terminationStatus)}
                              <span>{intern.terminationStatus.replace('_', ' ')}</span>
                            </span>
                          </Badge>
                          <Badge className={getReasonColor(intern.terminationInfo.reason)}>
                            {intern.terminationInfo.reason.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Termination Progress</span>
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
                          Last Day: {formatDate(intern.terminationInfo.lastWorkingDay)}
                        </div>
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          <Badge className={getSeverityColor(intern.terminationInfo.severityLevel)}>
                            {intern.terminationInfo.severityLevel}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredInterns.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No terminating interns found matching your criteria</p>
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
                    <span>Termination Details</span>
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
                  <div className="mb-6 p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Termination Progress</h4>
                      <span className="text-sm font-medium text-red-600">
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
                          { id: 'equipment', label: 'Equipment' },
                          { id: 'access', label: 'Access' },
                          { id: 'settlement', label: 'Settlement' },
                          { id: 'exit', label: 'Exit Interview' },
                          { id: 'transfer', label: 'Knowledge Transfer' },
                          { id: 'legal', label: 'Legal' }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              activeTab === tab.id
                                ? 'border-red-500 text-red-600'
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
                        <h4 className="font-medium text-gray-900 mb-2">Termination Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Reason:</span>
                            <Badge className={getReasonColor(selectedIntern.terminationInfo.reason)}>
                              {selectedIntern.terminationInfo.reason.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Initiated By:</span>
                            <span>{selectedIntern.terminationInfo.initiatedBy}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Severity:</span>
                            <Badge className={getSeverityColor(selectedIntern.terminationInfo.severityLevel)}>
                              {selectedIntern.terminationInfo.severityLevel}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Notice Period:</span>
                            <span>{selectedIntern.terminationInfo.noticePeriod} days</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Last Working Day:</span>
                            <span>{formatDate(selectedIntern.terminationInfo.lastWorkingDay)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Approved By:</span>
                            <span>{selectedIntern.terminationInfo.approvedBy}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Approval Date:</span>
                            <span>{formatDate(selectedIntern.terminationInfo.approvalDate)}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Documentation</h4>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">{selectedIntern.terminationInfo.documentation}</p>
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

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Termination Checklist</h4>
                        <div className="space-y-2">
                          {[
                            { key: 'documentationReview', label: 'Documentation Review', completed: selectedIntern.terminationProgress.documentationReview.completed },
                            { key: 'equipmentReturn', label: 'Equipment Return', completed: selectedIntern.terminationProgress.equipmentReturn.completed },
                            { key: 'accessRevocation', label: 'Access Revocation', completed: selectedIntern.terminationProgress.accessRevocation.completed },
                            { key: 'finalSettlement', label: 'Final Settlement', completed: selectedIntern.terminationProgress.finalSettlement.completed },
                            { key: 'exitInterview', label: 'Exit Interview', completed: selectedIntern.terminationProgress.exitInterview.completed },
                            { key: 'knowledgeTransfer', label: 'Knowledge Transfer', completed: selectedIntern.terminationProgress.knowledgeTransfer.completed },
                            { key: 'legalClearance', label: 'Legal Clearance', completed: selectedIntern.terminationProgress.legalClearance.completed }
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

                  {activeTab === 'documentation' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Documentation Review</h4>
                        <Badge className={selectedIntern.terminationProgress.documentationReview.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {selectedIntern.terminationProgress.documentationReview.completed ? 'Complete' : 'In Progress'}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {selectedIntern.terminationProgress.documentationReview.documents.map((doc, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{doc.name}</h5>
                              <Badge className={
                                doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                                doc.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                                doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {doc.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              <div>Type: {doc.type.replace('_', ' ')}</div>
                              {doc.reviewedBy && (
                                <div>Reviewed by: {doc.reviewedBy}</div>
                              )}
                              {doc.reviewedDate && (
                                <div>Reviewed: {formatDate(doc.reviewedDate)}</div>
                              )}
                              {doc.comments && (
                                <div className="mt-2">
                                  <span className="font-medium">Comments:</span>
                                  <p className="text-sm">{doc.comments}</p>
                                </div>
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

                      {selectedIntern.terminationProgress.documentationReview.legalReview.required && (
                        <div className="p-4 border rounded-lg bg-amber-50">
                          <h5 className="font-medium text-gray-900 mb-2">Legal Review</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span>Status:</span>
                              <Badge className={selectedIntern.terminationProgress.documentationReview.legalReview.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                {selectedIntern.terminationProgress.documentationReview.legalReview.completed ? 'Complete' : 'Pending'}
                              </Badge>
                            </div>
                            {selectedIntern.terminationProgress.documentationReview.legalReview.reviewedBy && (
                              <div>
                                <span className="font-medium">Reviewed by:</span> {selectedIntern.terminationProgress.documentationReview.legalReview.reviewedBy}
                              </div>
                            )}
                            {selectedIntern.terminationProgress.documentationReview.legalReview.notes && (
                              <div>
                                <span className="font-medium">Notes:</span>
                                <p className="text-sm">{selectedIntern.terminationProgress.documentationReview.legalReview.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'equipment' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Equipment Return</h4>
                        <Badge className={selectedIntern.terminationProgress.equipmentReturn.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {selectedIntern.terminationProgress.equipmentReturn.completed ? 'Complete' : 'In Progress'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{selectedIntern.terminationProgress.equipmentReturn.totalItems}</div>
                          <div className="text-sm text-gray-600">Total Items</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{selectedIntern.terminationProgress.equipmentReturn.returnedItems}</div>
                          <div className="text-sm text-gray-600">Returned</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">{selectedIntern.terminationProgress.equipmentReturn.damagedItems}</div>
                          <div className="text-sm text-gray-600">Damaged</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">{selectedIntern.terminationProgress.equipmentReturn.missingItems}</div>
                          <div className="text-sm text-gray-600">Missing</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {selectedIntern.terminationProgress.equipmentReturn.equipment.map((item, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{item.item}</h5>
                              <Badge className={
                                item.condition === 'good' ? 'bg-green-100 text-green-800' :
                                item.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                                item.condition === 'damaged' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {item.condition}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              {item.serialNumber && (
                                <div>Serial: {item.serialNumber}</div>
                              )}
                              <div>Assigned: {formatDate(item.assignedDate)}</div>
                              {item.returnDate && (
                                <div>Returned: {formatDate(item.returnDate)}</div>
                              )}
                              {item.returnedTo && (
                                <div>Returned to: {item.returnedTo}</div>
                              )}
                              {item.notes && (
                                <div className="mt-1">
                                  <span className="font-medium">Notes:</span> {item.notes}
                                </div>
                              )}
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
                      {getAvailableActions(selectedIntern.terminationStatus).map(action => (
                        <Button
                          key={action.id}
                          variant={action.type === 'positive' ? 'default' : action.type === 'negative' ? 'destructive' : 'outline'}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => updateTerminationStatus(selectedIntern.id, action.id)}
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
                    Choose an intern from the list to view termination details and manage their exit process
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
