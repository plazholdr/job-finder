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
  Smile,
  AlertTriangle,
  Info
} from 'lucide-react';
import Link from 'next/link';

interface EarlyCompletionRequest {
  id: string;
  requestInfo: {
    requestType: 'early_completion' | 'early_termination';
    requestDate: Date;
    requestedBy: string;
    requestedByRole: 'employee' | 'manager' | 'hr' | 'admin';
    urgency: 'low' | 'medium' | 'high' | 'critical';
    reason: string;
    proposedDate: Date;
    currentEndDate: Date;
    daysDifference: number;
  };
  employeeInfo: {
    name: string;
    email: string;
    phone: string;
    employeeId: string;
    department: string;
    position: string;
    manager: string;
    startDate: Date;
    currentStatus: 'active' | 'on_leave' | 'notice_period' | 'suspended';
    employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
    location: string;
  };
  jobDetails: {
    jobTitle: string;
    jobDescription: string;
    responsibilities: string[];
    requirements: string[];
    department: string;
    reportingManager: string;
    workLocation: string;
    contractType: string;
    salaryRange: string;
  };
  applicationDetails: {
    applicationId: string;
    applicationDate: Date;
    applicationStatus: string;
    interviewStages: Array<{
      stage: string;
      date: Date;
      interviewer: string;
      result: string;
      feedback: string;
    }>;
    offerDetails: {
      offerDate: Date;
      startDate: Date;
      salary: number;
      benefits: string[];
      acceptanceDate: Date;
    };
  };
  onboardingMaterials: {
    documentsProvided: Array<{
      document: string;
      providedDate: Date;
      status: 'pending' | 'completed' | 'verified';
    }>;
    trainingCompleted: Array<{
      training: string;
      completedDate: Date;
      score?: number;
      certificate?: string;
    }>;
    equipmentAssigned: Array<{
      item: string;
      serialNumber: string;
      assignedDate: Date;
      condition: string;
    }>;
    accessGranted: Array<{
      system: string;
      accessLevel: string;
      grantedDate: Date;
      status: 'active' | 'suspended' | 'revoked';
    }>;
  };
  statusUpdateHistory: Array<{
    date: Date;
    previousStatus: string;
    newStatus: string;
    updatedBy: string;
    reason: string;
    notes?: string;
  }>;
  remarkHistory: Array<{
    id: string;
    date: Date;
    author: string;
    type: 'general' | 'performance' | 'disciplinary' | 'achievement' | 'concern';
    remark: string;
    confidential: boolean;
    attachments?: string[];
  }>;
  requestStatus: 'pending' | 'under_review' | 'approved' | 'rejected' | 'withdrawn';
  reviewInfo: {
    reviewedBy?: string;
    reviewedDate?: Date;
    decision?: 'approve' | 'reject';
    rejectionReason?: string;
    adminNotes?: string;
    followUpRequired?: boolean;
    followUpDate?: Date;
  };
  documents: Array<{
    type: string;
    name: string;
    url: string;
    uploadedDate: Date;
    category: 'request' | 'supporting' | 'approval' | 'rejection';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export default function EarlyCompletionRequestPage() {
  const [requests, setRequests] = useState<EarlyCompletionRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<EarlyCompletionRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'job' | 'application' | 'onboarding' | 'history' | 'remarks'>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionType, setDecisionType] = useState<'approve' | 'reject' | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');

  useEffect(() => {
    fetchEarlyCompletionRequests();
  }, []);

  const fetchEarlyCompletionRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/company/requests/early-completion');
      const result = await response.json();

      if (result.success) {
        setRequests(result.data);
      } else {
        setError('Failed to fetch early completion requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecision = async (requestId: string, decision: 'approve' | 'reject', notes: string) => {
    try {
      const response = await fetch(`/api/company/requests/early-completion/${requestId}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, notes })
      });

      const result = await response.json();

      if (result.success) {
        setRequests(prevRequests =>
          prevRequests.map(request =>
            request.id === requestId ? result.data : request
          )
        );
        setSelectedRequest(result.data);
        setSuccess(`Request ${decision}d successfully`);
        setShowDecisionModal(false);
        setDecisionNotes('');
        setDecisionType(null);
      } else {
        setError(result.error || 'Failed to process decision');
      }
    } catch (error) {
      console.error('Error processing decision:', error);
      setError('An unexpected error occurred');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'under_review': return <Eye className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'withdrawn': return <Minus className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'early_completion': return 'bg-blue-100 text-blue-800';
      case 'early_termination': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.requestStatus === filterStatus;
    const matchesType = filterType === 'all' || request.requestInfo.requestType === filterType;
    const matchesSearch = searchTerm === '' ||
      request.employeeInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employeeInfo.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employeeInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employeeInfo.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employeeInfo.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
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
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading early completion requests...</p>
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
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Early Completion/Termination Requests</h1>
                <p className="text-sm text-gray-600">Review and manage employee early completion and termination requests</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={fetchEarlyCompletionRequests}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>

              <Link href="/company/dashboard">
                <Button variant="outline">
                  Back to Dashboard
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
                placeholder="Search by employee name, position, department, or employee ID..."
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
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            <option value="all">All Types</option>
            <option value="early_completion">Early Completion</option>
            <option value="early_termination">Early Termination</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Requests List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ClipboardList className="h-5 w-5 mr-2" />
                    Early Completion/Termination Requests ({filteredRequests.length})
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRequests.map(request => (
                    <div
                      key={request.id}
                      onClick={() => setSelectedRequest(request)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedRequest?.id === request.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{request.employeeInfo.name}</h3>
                          <p className="text-sm text-gray-600">{request.employeeInfo.position}</p>
                          <p className="text-xs text-gray-500">ID: {request.employeeInfo.employeeId}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge className={getStatusColor(request.requestStatus)}>
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(request.requestStatus)}
                              <span>{request.requestStatus.replace('_', ' ')}</span>
                            </span>
                          </Badge>
                          <Badge className={getTypeColor(request.requestInfo.requestType)}>
                            {request.requestInfo.requestType.replace('_', ' ')}
                          </Badge>
                          <Badge className={getUrgencyColor(request.requestInfo.urgency)}>
                            {request.requestInfo.urgency}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {request.employeeInfo.email}
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2" />
                          {request.employeeInfo.department}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Requested: {formatDate(request.requestInfo.requestDate)}
                        </div>
                        <div className="flex items-center">
                          <Timer className="h-4 w-4 mr-2" />
                          {request.requestInfo.daysDifference} days early
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Reason:</span> {request.requestInfo.reason}
                        </p>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                          <span>Requested by: {request.requestInfo.requestedBy} ({request.requestInfo.requestedByRole})</span>
                          <span>Proposed date: {formatDate(request.requestInfo.proposedDate)}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No early completion/termination requests found matching your criteria</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Request Details */}
          <div>
            {selectedRequest ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Request Details</span>
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
                  {/* Request Overview */}
                  <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Request Status</h4>
                      <Badge className={getStatusColor(selectedRequest.requestStatus)}>
                        {selectedRequest.requestStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Type:</span> {selectedRequest.requestInfo.requestType.replace('_', ' ')}
                      </div>
                      <div>
                        <span className="font-medium">Urgency:</span> {selectedRequest.requestInfo.urgency}
                      </div>
                    </div>
                  </div>

                  {/* Decision Buttons */}
                  {selectedRequest.requestStatus === 'pending' || selectedRequest.requestStatus === 'under_review' ? (
                    <div className="mb-6 flex space-x-3">
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setDecisionType('approve');
                          setShowDecisionModal(true);
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept Request
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => {
                          setDecisionType('reject');
                          setShowDecisionModal(true);
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Request
                      </Button>
                    </div>
                  ) : null}

                  {/* Tabs */}
                  <div className="mb-4">
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-4">
                        {[
                          { id: 'overview', label: 'Overview' },
                          { id: 'job', label: 'Job Details' },
                          { id: 'application', label: 'Application' },
                          { id: 'onboarding', label: 'Onboarding' },
                          { id: 'history', label: 'Status History' },
                          { id: 'remarks', label: 'Remarks' }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              activeTab === tab.id
                                ? 'border-indigo-500 text-indigo-600'
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
                            {selectedRequest.employeeInfo.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {selectedRequest.employeeInfo.phone}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            {selectedRequest.employeeInfo.location}
                          </div>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                            {selectedRequest.employeeInfo.department} - {selectedRequest.employeeInfo.position}
                          </div>
                          <div className="flex items-center">
                            <UserCheck className="h-4 w-4 mr-2 text-gray-400" />
                            Manager: {selectedRequest.employeeInfo.manager}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            Start Date: {formatDate(selectedRequest.employeeInfo.startDate)}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Request Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Request Type:</span>
                            <Badge className={getTypeColor(selectedRequest.requestInfo.requestType)}>
                              {selectedRequest.requestInfo.requestType.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Urgency:</span>
                            <Badge className={getUrgencyColor(selectedRequest.requestInfo.urgency)}>
                              {selectedRequest.requestInfo.urgency}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Requested By:</span>
                            <span>{selectedRequest.requestInfo.requestedBy} ({selectedRequest.requestInfo.requestedByRole})</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Request Date:</span>
                            <span>{formatDate(selectedRequest.requestInfo.requestDate)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Current End Date:</span>
                            <span>{formatDate(selectedRequest.requestInfo.currentEndDate)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Proposed Date:</span>
                            <span>{formatDate(selectedRequest.requestInfo.proposedDate)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Days Difference:</span>
                            <span className="text-orange-600 font-medium">{selectedRequest.requestInfo.daysDifference} days early</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Reason for Request</h4>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{selectedRequest.requestInfo.reason}</p>
                        </div>
                      </div>

                      {selectedRequest.reviewInfo.reviewedBy && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Review Information</h4>
                          <div className="p-3 bg-gray-50 rounded-lg space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Reviewed By:</span>
                              <span>{selectedRequest.reviewInfo.reviewedBy}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Review Date:</span>
                              <span>{selectedRequest.reviewInfo.reviewedDate ? formatDate(selectedRequest.reviewInfo.reviewedDate) : 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Decision:</span>
                              <Badge className={selectedRequest.reviewInfo.decision === 'approve' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {selectedRequest.reviewInfo.decision}
                              </Badge>
                            </div>
                            {selectedRequest.reviewInfo.rejectionReason && (
                              <div>
                                <span className="font-medium">Rejection Reason:</span>
                                <p className="text-gray-600 mt-1">{selectedRequest.reviewInfo.rejectionReason}</p>
                              </div>
                            )}
                            {selectedRequest.reviewInfo.adminNotes && (
                              <div>
                                <span className="font-medium">Admin Notes:</span>
                                <p className="text-gray-600 mt-1">{selectedRequest.reviewInfo.adminNotes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'job' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Job Information</h4>
                        <div className="space-y-3">
                          <div>
                            <span className="font-medium text-sm">Job Title:</span>
                            <p className="text-sm text-gray-600">{selectedRequest.jobDetails.jobTitle}</p>
                          </div>
                          <div>
                            <span className="font-medium text-sm">Job Description:</span>
                            <p className="text-sm text-gray-600">{selectedRequest.jobDetails.jobDescription}</p>
                          </div>
                          <div>
                            <span className="font-medium text-sm">Department:</span>
                            <p className="text-sm text-gray-600">{selectedRequest.jobDetails.department}</p>
                          </div>
                          <div>
                            <span className="font-medium text-sm">Reporting Manager:</span>
                            <p className="text-sm text-gray-600">{selectedRequest.jobDetails.reportingManager}</p>
                          </div>
                          <div>
                            <span className="font-medium text-sm">Work Location:</span>
                            <p className="text-sm text-gray-600">{selectedRequest.jobDetails.workLocation}</p>
                          </div>
                          <div>
                            <span className="font-medium text-sm">Contract Type:</span>
                            <p className="text-sm text-gray-600">{selectedRequest.jobDetails.contractType}</p>
                          </div>
                          <div>
                            <span className="font-medium text-sm">Salary Range:</span>
                            <p className="text-sm text-gray-600">{selectedRequest.jobDetails.salaryRange}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Responsibilities</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {selectedRequest.jobDetails.responsibilities.map((responsibility, index) => (
                            <li key={index}>{responsibility}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {selectedRequest.jobDetails.requirements.map((requirement, index) => (
                            <li key={index}>{requirement}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'application' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Application Summary</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Application ID:</span>
                            <p className="text-gray-600">{selectedRequest.applicationDetails.applicationId}</p>
                          </div>
                          <div>
                            <span className="font-medium">Application Date:</span>
                            <p className="text-gray-600">{formatDate(selectedRequest.applicationDetails.applicationDate)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Application Status:</span>
                            <p className="text-gray-600">{selectedRequest.applicationDetails.applicationStatus}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Interview Stages</h4>
                        <div className="space-y-3">
                          {selectedRequest.applicationDetails.interviewStages.map((stage, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-900">{stage.stage}</h5>
                                <Badge className={stage.result === 'passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                  {stage.result}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600">
                                <div>Date: {formatDate(stage.date)}</div>
                                <div>Interviewer: {stage.interviewer}</div>
                                <div>Feedback: {stage.feedback}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Offer Details</h4>
                        <div className="p-3 bg-gray-50 rounded-lg space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">Offer Date:</span>
                            <span>{formatDate(selectedRequest.applicationDetails.offerDetails.offerDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Start Date:</span>
                            <span>{formatDate(selectedRequest.applicationDetails.offerDetails.startDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Salary:</span>
                            <span>${selectedRequest.applicationDetails.offerDetails.salary.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Acceptance Date:</span>
                            <span>{formatDate(selectedRequest.applicationDetails.offerDetails.acceptanceDate)}</span>
                          </div>
                          <div>
                            <span className="font-medium">Benefits:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedRequest.applicationDetails.offerDetails.benefits.map(benefit => (
                                <Badge key={benefit} variant="outline" className="text-xs">
                                  {benefit}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a Request
                  </h3>
                  <p className="text-gray-600">
                    Choose a request from the list to view details and make a decision
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Decision Modal */}
        {showDecisionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {decisionType === 'approve' ? 'Accept Request' : 'Reject Request'}
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {decisionType === 'approve' ? 'Approval Notes' : 'Rejection Reason'}
                </label>
                <Textarea
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder={decisionType === 'approve' ? 'Add any notes for approval...' : 'Provide reason for rejection...'}
                  rows={4}
                  required={decisionType === 'reject'}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDecisionModal(false);
                    setDecisionNotes('');
                    setDecisionType(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className={`flex-1 ${decisionType === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                  onClick={() => {
                    if (selectedRequest && decisionType) {
                      handleDecision(selectedRequest.id, decisionType, decisionNotes);
                    }
                  }}
                  disabled={decisionType === 'reject' && !decisionNotes.trim()}
                >
                  {decisionType === 'approve' ? 'Accept' : 'Reject'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
