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
  LogOut,
  Archive,
  FileCheck,
  Package,
  Lock,
  CreditCard,
  MessageSquare,
  Handshake,
  Network,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Frown,
  Smile
} from 'lucide-react';
import Link from 'next/link';

interface ClosedEmployee {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    employeeId: string;
    department: string;
    position: string;
    manager: string;
    startDate: Date;
    endDate: Date;
    tenure: number;
    location: string;
  };
  closureInfo: {
    reason: 'resignation' | 'termination' | 'retirement' | 'layoff' | 'end_of_contract' | 'mutual_agreement' | 'death' | 'other';
    initiatedBy: 'employee' | 'company' | 'mutual';
    noticePeriod: number;
    lastWorkingDay: Date;
    finalPayDate: Date;
    rehireEligible: boolean;
    closureCategory: 'voluntary' | 'involuntary' | 'neutral';
    documentation: string;
    approvedBy: string;
    approvalDate: Date;
  };
  closureStatus: 'initiated' | 'notice_period' | 'knowledge_transfer' | 'equipment_return' | 'access_revocation' | 'final_settlement' | 'exit_interview' | 'documentation_complete' | 'alumni_transition' | 'closed';
  closureProgress: {
    knowledgeTransfer: {
      completed: boolean;
      completedDate?: Date;
      transferItems: Array<{
        item: string;
        type: 'project_handover' | 'documentation' | 'contacts' | 'passwords' | 'files' | 'processes' | 'other';
        transferredTo: string;
        transferDate?: Date;
        status: 'pending' | 'in_progress' | 'completed' | 'verified';
        priority: 'high' | 'medium' | 'low';
        notes?: string;
      }>;
      handoverMeetings: Array<{
        date: Date;
        attendees: string[];
        topics: string[];
        completed: boolean;
        notes?: string;
      }>;
      documentationStatus: 'incomplete' | 'in_progress' | 'complete' | 'verified';
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
        value?: number;
        notes?: string;
        returnedTo?: string;
        verified: boolean;
      }>;
      totalValue: number;
      damagedValue: number;
      missingValue: number;
      deductionAmount: number;
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
        verificationRequired: boolean;
        verified: boolean;
      }>;
      physicalAccess: {
        badgeDeactivated: boolean;
        keysReturned: boolean;
        parkingRevoked: boolean;
        facilityAccessRemoved: boolean;
        deactivatedDate?: Date;
        deactivatedBy?: string;
        verified: boolean;
      };
    };
    finalSettlement: {
      completed: boolean;
      completedDate?: Date;
      payroll: {
        finalPayPeriod: Date;
        regularHours: number;
        overtimeHours: number;
        vacationPayout: number;
        sickLeavePayout: number;
        bonusPayout: number;
        expenseReimbursement: number;
        deductions: number;
        grossAmount: number;
        netAmount: number;
        paymentDate?: Date;
        paymentMethod: 'direct_deposit' | 'check' | 'wire_transfer';
        processed: boolean;
      };
      benefits: {
        healthInsuranceEndDate: Date;
        cobraEligible: boolean;
        cobraNotified: boolean;
        retirementPlanStatus: string;
        stockOptionsStatus: string;
        otherBenefits: Array<{
          benefit: string;
          endDate: Date;
          action: string;
        }>;
      };
      taxes: {
        w2Prepared: boolean;
        taxDocumentsProvided: boolean;
        finalTaxCalculated: boolean;
      };
    };
    exitInterview: {
      completed: boolean;
      scheduledDate?: Date;
      completedDate?: Date;
      interviewer: string;
      format: 'in_person' | 'video' | 'phone' | 'written';
      feedback: {
        overallSatisfaction: number;
        reasonForLeaving: string;
        workEnvironment: number;
        managementSupport: number;
        careerDevelopment: number;
        compensation: number;
        workLifeBalance: number;
        wouldRecommend: boolean;
        wouldReturn: boolean;
        suggestions: string;
        positiveAspects: string[];
        improvementAreas: string[];
      };
      confidential: boolean;
      followUpRequired: boolean;
    };
    documentationComplete: {
      completed: boolean;
      completedDate?: Date;
      documents: Array<{
        name: string;
        type: 'termination_letter' | 'final_payslip' | 'benefits_summary' | 'cobra_notice' | 'reference_letter' | 'nda_reminder' | 'other';
        status: 'pending' | 'generated' | 'sent' | 'acknowledged';
        sentDate?: Date;
        acknowledgedDate?: Date;
        deliveryMethod: 'email' | 'physical' | 'portal';
      }>;
      legalClearance: {
        required: boolean;
        completed: boolean;
        clearedBy?: string;
        clearedDate?: Date;
        notes?: string;
      };
    };
    alumniTransition: {
      completed: boolean;
      completedDate?: Date;
      alumniProgram: {
        eligible: boolean;
        enrolled: boolean;
        enrollmentDate?: Date;
        alumniId?: string;
      };
      networking: {
        linkedinConnectionMaintained: boolean;
        professionalReferences: Array<{
          referenceType: 'linkedin' | 'written' | 'verbal';
          providedBy: string;
          providedDate: Date;
          content?: string;
        }>;
        futureOpportunities: {
          rehireInterest: boolean;
          consultingOpportunities: boolean;
          referralProgram: boolean;
          eventInvitations: boolean;
        };
      };
      feedback: {
        companyRating: number;
        npsScore: number;
        testimonial?: string;
        publicReviewPermission: boolean;
      };
    };
  };
  performanceSummary: {
    overallRating: number;
    achievements: string[];
    contributions: string[];
    finalProjects: string[];
    recognitions: Array<{
      title: string;
      date: Date;
      description: string;
    }>;
  };
  documents: Array<{
    type: string;
    name: string;
    url: string;
    uploadedDate: Date;
    category: 'closure' | 'legal' | 'hr' | 'payroll' | 'benefits';
    confidential: boolean;
  }>;
  notes: Array<{
    id: string;
    author: string;
    content: string;
    timestamp: Date;
    type: 'closure' | 'legal' | 'hr' | 'manager' | 'confidential';
    confidential: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export default function ClosedEmployeePage() {
  const [employees, setEmployees] = useState<ClosedEmployee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<ClosedEmployee | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'transfer' | 'equipment' | 'access' | 'settlement' | 'exit' | 'documentation' | 'alumni'>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterReason, setFilterReason] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchClosedEmployees();
  }, []);

  const fetchClosedEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/company/employees/closed');
      const result = await response.json();

      if (result.success) {
        setEmployees(result.data);
      } else {
        setError('Failed to fetch closed employees');
      }
    } catch (error) {
      console.error('Error fetching closed employees:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const updateClosureStatus = async (employeeId: string, action: string, additionalData?: any) => {
    try {
      const response = await fetch(`/api/company/employees/closed/${employeeId}/action`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...additionalData })
      });

      const result = await response.json();

      if (result.success) {
        setEmployees(prevEmployees =>
          prevEmployees.map(employee =>
            employee.id === employeeId ? result.data : employee
          )
        );
        setSelectedEmployee(result.data);
        setSuccess(`Action completed: ${action.replace('_', ' ')}`);
      } else {
        setError(result.error || 'Failed to update employee');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      setError('An unexpected error occurred');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'initiated': return 'bg-blue-100 text-blue-800';
      case 'notice_period': return 'bg-yellow-100 text-yellow-800';
      case 'knowledge_transfer': return 'bg-purple-100 text-purple-800';
      case 'equipment_return': return 'bg-orange-100 text-orange-800';
      case 'access_revocation': return 'bg-red-100 text-red-800';
      case 'final_settlement': return 'bg-indigo-100 text-indigo-800';
      case 'exit_interview': return 'bg-cyan-100 text-cyan-800';
      case 'documentation_complete': return 'bg-teal-100 text-teal-800';
      case 'alumni_transition': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'initiated': return <Clock className="h-4 w-4" />;
      case 'notice_period': return <Calendar className="h-4 w-4" />;
      case 'knowledge_transfer': return <Send className="h-4 w-4" />;
      case 'equipment_return': return <Package className="h-4 w-4" />;
      case 'access_revocation': return <Lock className="h-4 w-4" />;
      case 'final_settlement': return <CreditCard className="h-4 w-4" />;
      case 'exit_interview': return <MessageSquare className="h-4 w-4" />;
      case 'documentation_complete': return <FileCheck className="h-4 w-4" />;
      case 'alumni_transition': return <Network className="h-4 w-4" />;
      case 'closed': return <Archive className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'resignation': return 'bg-blue-100 text-blue-800';
      case 'termination': return 'bg-red-100 text-red-800';
      case 'retirement': return 'bg-green-100 text-green-800';
      case 'layoff': return 'bg-orange-100 text-orange-800';
      case 'end_of_contract': return 'bg-purple-100 text-purple-800';
      case 'mutual_agreement': return 'bg-yellow-100 text-yellow-800';
      case 'death': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailableActions = (employee: ClosedEmployee) => {
    const actions = [];

    switch (employee.closureStatus) {
      case 'initiated':
        actions.push({ id: 'start_knowledge_transfer', label: 'Start Knowledge Transfer', type: 'positive' as const });
        break;
      case 'knowledge_transfer':
        actions.push({ id: 'initiate_equipment_return', label: 'Initiate Equipment Return', type: 'positive' as const });
        break;
      case 'equipment_return':
        actions.push({ id: 'revoke_access', label: 'Revoke Access', type: 'positive' as const });
        break;
      case 'access_revocation':
        actions.push({ id: 'process_final_settlement', label: 'Process Final Settlement', type: 'positive' as const });
        break;
      case 'final_settlement':
        actions.push({ id: 'schedule_exit_interview', label: 'Schedule Exit Interview', type: 'positive' as const });
        break;
      case 'exit_interview':
        actions.push({ id: 'complete_documentation', label: 'Complete Documentation', type: 'positive' as const });
        break;
      case 'documentation_complete':
        actions.push({ id: 'alumni_transition', label: 'Alumni Transition', type: 'positive' as const });
        break;
      case 'alumni_transition':
        actions.push({ id: 'close_employee', label: 'Close Employee Record', type: 'positive' as const });
        break;
    }

    // Always available actions
    actions.push(
      { id: 'add_note', label: 'Add Note', type: 'neutral' as const },
      { id: 'generate_report', label: 'Generate Report', type: 'neutral' as const }
    );

    return actions;
  };

  const calculateOverallProgress = (employee: ClosedEmployee) => {
    const steps = [
      employee.closureProgress.knowledgeTransfer.completed,
      employee.closureProgress.equipmentReturn.completed,
      employee.closureProgress.accessRevocation.completed,
      employee.closureProgress.finalSettlement.completed,
      employee.closureProgress.exitInterview.completed,
      employee.closureProgress.documentationComplete.completed,
      employee.closureProgress.alumniTransition.completed
    ];

    const completedSteps = steps.filter(step => step).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesStatus = filterStatus === 'all' || employee.closureStatus === filterStatus;
    const matchesReason = filterReason === 'all' || employee.closureInfo.reason === filterReason;
    const matchesSearch = searchTerm === '' ||
      employee.personalInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.personalInfo.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.personalInfo.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.personalInfo.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesReason && matchesSearch;
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
          <p className="text-gray-600">Loading closed employees...</p>
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
                <h1 className="text-xl font-bold text-gray-900">Closed Employee Management</h1>
                <p className="text-sm text-gray-600">Manage employee closure process and alumni transition</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={fetchClosedEmployees}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>

              <Link href="/company/employees">
                <Button variant="outline">
                  Back to Employees
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
                placeholder="Search employees by name, position, department, or employee ID..."
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
            <option value="knowledge_transfer">Knowledge Transfer</option>
            <option value="equipment_return">Equipment Return</option>
            <option value="access_revocation">Access Revocation</option>
            <option value="final_settlement">Final Settlement</option>
            <option value="exit_interview">Exit Interview</option>
            <option value="documentation_complete">Documentation Complete</option>
            <option value="alumni_transition">Alumni Transition</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={filterReason}
            onChange={(e) => setFilterReason(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            <option value="all">All Reasons</option>
            <option value="resignation">Resignation</option>
            <option value="termination">Termination</option>
            <option value="retirement">Retirement</option>
            <option value="layoff">Layoff</option>
            <option value="end_of_contract">End of Contract</option>
            <option value="mutual_agreement">Mutual Agreement</option>
            <option value="death">Death</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Employees List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Closed Employees ({filteredEmployees.length})
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEmployees.map(employee => (
                    <div
                      key={employee.id}
                      onClick={() => setSelectedEmployee(employee)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedEmployee?.id === employee.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{employee.personalInfo.name}</h3>
                          <p className="text-sm text-gray-600">{employee.personalInfo.position}</p>
                          <p className="text-xs text-gray-500">ID: {employee.personalInfo.employeeId} • {employee.personalInfo.tenure} years</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge className={getStatusColor(employee.closureStatus)}>
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(employee.closureStatus)}
                              <span>{employee.closureStatus.replace('_', ' ')}</span>
                            </span>
                          </Badge>
                          <Badge className={getReasonColor(employee.closureInfo.reason)}>
                            {employee.closureInfo.reason.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Closure Progress</span>
                          <span>{calculateOverallProgress(employee)}%</span>
                        </div>
                        <Progress value={calculateOverallProgress(employee)} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {employee.personalInfo.email}
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2" />
                          {employee.personalInfo.department}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          End: {formatDate(employee.personalInfo.endDate)}
                        </div>
                        <div className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Rehire: {employee.closureInfo.rehireEligible ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredEmployees.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No closed employees found matching your criteria</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employee Details */}
          <div>
            {selectedEmployee ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Closure Details</span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Closure Overview */}
                  <div className="mb-6 p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Closure Progress</h4>
                      <span className="text-sm font-medium text-orange-600">
                        {calculateOverallProgress(selectedEmployee)}% Complete
                      </span>
                    </div>
                    <Progress value={calculateOverallProgress(selectedEmployee)} className="h-3" />
                  </div>

                  {/* Tabs */}
                  <div className="mb-4">
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-4">
                        {[
                          { id: 'overview', label: 'Overview' },
                          { id: 'transfer', label: 'Knowledge Transfer' },
                          { id: 'equipment', label: 'Equipment' },
                          { id: 'access', label: 'Access' },
                          { id: 'settlement', label: 'Settlement' },
                          { id: 'exit', label: 'Exit Interview' },
                          { id: 'documentation', label: 'Documentation' },
                          { id: 'alumni', label: 'Alumni' }
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
                        <h4 className="font-medium text-gray-900 mb-2">Employee Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            {selectedEmployee.personalInfo.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {selectedEmployee.personalInfo.phone}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            {selectedEmployee.personalInfo.location}
                          </div>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                            {selectedEmployee.personalInfo.department} - {selectedEmployee.personalInfo.position}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {selectedEmployee.personalInfo.tenure} years tenure
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Closure Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Reason:</span>
                            <Badge className={getReasonColor(selectedEmployee.closureInfo.reason)}>
                              {selectedEmployee.closureInfo.reason.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Initiated By:</span>
                            <span>{selectedEmployee.closureInfo.initiatedBy}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Category:</span>
                            <Badge className={
                              selectedEmployee.closureInfo.closureCategory === 'voluntary' ? 'bg-green-100 text-green-800' :
                              selectedEmployee.closureInfo.closureCategory === 'involuntary' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {selectedEmployee.closureInfo.closureCategory}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Notice Period:</span>
                            <span>{selectedEmployee.closureInfo.noticePeriod} days</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Last Working Day:</span>
                            <span>{formatDate(selectedEmployee.closureInfo.lastWorkingDay)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Final Pay Date:</span>
                            <span>{formatDate(selectedEmployee.closureInfo.finalPayDate)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Rehire Eligible:</span>
                            <Badge className={selectedEmployee.closureInfo.rehireEligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {selectedEmployee.closureInfo.rehireEligible ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Performance Summary</h4>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Overall Rating:</span>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <span>{selectedEmployee.performanceSummary.overallRating}/5</span>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Key Achievements:</span>
                              <ul className="list-disc list-inside text-gray-600 mt-1">
                                {selectedEmployee.performanceSummary.achievements.map((achievement, index) => (
                                  <li key={index}>{achievement}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="font-medium">Final Projects:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedEmployee.performanceSummary.finalProjects.map(project => (
                                  <Badge key={project} variant="outline" className="text-xs">
                                    {project}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Closure Checklist</h4>
                        <div className="space-y-2">
                          {[
                            { key: 'knowledgeTransfer', label: 'Knowledge Transfer', completed: selectedEmployee.closureProgress.knowledgeTransfer.completed },
                            { key: 'equipmentReturn', label: 'Equipment Return', completed: selectedEmployee.closureProgress.equipmentReturn.completed },
                            { key: 'accessRevocation', label: 'Access Revocation', completed: selectedEmployee.closureProgress.accessRevocation.completed },
                            { key: 'finalSettlement', label: 'Final Settlement', completed: selectedEmployee.closureProgress.finalSettlement.completed },
                            { key: 'exitInterview', label: 'Exit Interview', completed: selectedEmployee.closureProgress.exitInterview.completed },
                            { key: 'documentationComplete', label: 'Documentation Complete', completed: selectedEmployee.closureProgress.documentationComplete.completed },
                            { key: 'alumniTransition', label: 'Alumni Transition', completed: selectedEmployee.closureProgress.alumniTransition.completed }
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

                  {activeTab === 'transfer' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Knowledge Transfer Status</h4>
                        <Badge className={selectedEmployee.closureProgress.knowledgeTransfer.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {selectedEmployee.closureProgress.knowledgeTransfer.completed ? 'Complete' : 'In Progress'}
                        </Badge>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Transfer Items</h5>
                        <div className="space-y-3">
                          {selectedEmployee.closureProgress.knowledgeTransfer.transferItems.map((item, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h6 className="font-medium text-gray-900">{item.item}</h6>
                                <div className="flex items-center space-x-2">
                                  <Badge className={
                                    item.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }>
                                    {item.priority}
                                  </Badge>
                                  <Badge className={
                                    item.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                    item.status === 'verified' ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-800'
                                  }>
                                    {item.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-sm text-gray-600">
                                <div>Type: {item.type.replace('_', ' ')}</div>
                                <div>Transferred to: {item.transferredTo}</div>
                                {item.transferDate && (
                                  <div>Transfer date: {formatDate(item.transferDate)}</div>
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

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Handover Meetings</h5>
                        <div className="space-y-2">
                          {selectedEmployee.closureProgress.knowledgeTransfer.handoverMeetings.map((meeting, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{formatDate(meeting.date)}</span>
                                <Badge className={meeting.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                  {meeting.completed ? 'Completed' : 'Scheduled'}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600">
                                <div>Attendees: {meeting.attendees.join(', ')}</div>
                                <div>Topics: {meeting.topics.join(', ')}</div>
                                {meeting.notes && (
                                  <div className="mt-1">Notes: {meeting.notes}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'settlement' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Final Settlement</h4>
                        <Badge className={selectedEmployee.closureProgress.finalSettlement.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {selectedEmployee.closureProgress.finalSettlement.completed ? 'Complete' : 'Processing'}
                        </Badge>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Payroll Summary</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">${selectedEmployee.closureProgress.finalSettlement.payroll.grossAmount.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Gross Amount</div>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="text-lg font-bold text-green-600">${selectedEmployee.closureProgress.finalSettlement.payroll.netAmount.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Net Amount</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Payment Breakdown</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Regular Hours ({selectedEmployee.closureProgress.finalSettlement.payroll.regularHours}h):</span>
                            <span>${(selectedEmployee.closureProgress.finalSettlement.payroll.regularHours * 50).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Overtime Hours ({selectedEmployee.closureProgress.finalSettlement.payroll.overtimeHours}h):</span>
                            <span>${(selectedEmployee.closureProgress.finalSettlement.payroll.overtimeHours * 75).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Vacation Payout:</span>
                            <span>${selectedEmployee.closureProgress.finalSettlement.payroll.vacationPayout.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Bonus Payout:</span>
                            <span>${selectedEmployee.closureProgress.finalSettlement.payroll.bonusPayout.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Expense Reimbursement:</span>
                            <span>${selectedEmployee.closureProgress.finalSettlement.payroll.expenseReimbursement.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>Deductions:</span>
                            <span>-${selectedEmployee.closureProgress.finalSettlement.payroll.deductions.toLocaleString()}</span>
                          </div>
                          <hr />
                          <div className="flex justify-between font-medium">
                            <span>Net Payment:</span>
                            <span>${selectedEmployee.closureProgress.finalSettlement.payroll.netAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Benefits Status</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Health Insurance End Date:</span>
                            <span>{formatDate(selectedEmployee.closureProgress.finalSettlement.benefits.healthInsuranceEndDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>COBRA Eligible:</span>
                            <Badge className={selectedEmployee.closureProgress.finalSettlement.benefits.cobraEligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {selectedEmployee.closureProgress.finalSettlement.benefits.cobraEligible ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Retirement Plan:</span>
                            <span>{selectedEmployee.closureProgress.finalSettlement.benefits.retirementPlanStatus}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Stock Options:</span>
                            <span>{selectedEmployee.closureProgress.finalSettlement.benefits.stockOptionsStatus}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Available Actions */}
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">Available Actions</h4>
                    <div className="space-y-2">
                      {getAvailableActions(selectedEmployee).map(action => (
                        <Button
                          key={action.id}
                          variant={action.type === 'positive' ? 'default' : action.type === 'negative' ? 'destructive' : 'outline'}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => updateClosureStatus(selectedEmployee.id, action.id)}
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
                    Select an Employee
                  </h3>
                  <p className="text-gray-600">
                    Choose an employee from the list to view closure details and manage their offboarding process
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
