'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Minus
} from 'lucide-react';
import Link from 'next/link';

interface EmployeeCandidate {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: Date;
    nationality: string;
  };
  professionalInfo: {
    currentPosition: string;
    experience: number;
    education: string;
    skills: string[];
    certifications: string[];
    expectedSalary: number;
    noticePeriod: number;
  };
  applicationInfo: {
    positionApplied: string;
    applicationDate: Date;
    source: string;
    referredBy?: string;
    coverLetter: string;
    resumeUrl: string;
  };
  recruitmentStatus: 'applied' | 'screening' | 'interview_scheduled' | 'interview_completed' | 'reference_check' | 'offer_pending' | 'offer_accepted' | 'offer_declined' | 'hired' | 'rejected';
  screeningResults?: {
    score: number;
    notes: string;
    screenerName: string;
    screeningDate: Date;
  };
  interviewResults?: Array<{
    round: number;
    type: 'phone' | 'video' | 'in_person' | 'technical';
    interviewerName: string;
    date: Date;
    score: number;
    feedback: string;
    recommendation: 'proceed' | 'reject' | 'hold';
  }>;
  referenceChecks?: Array<{
    referenceName: string;
    relationship: string;
    company: string;
    contactInfo: string;
    feedback: string;
    rating: number;
    verifiedDate: Date;
  }>;
  offerDetails?: {
    position: string;
    salary: number;
    benefits: string[];
    startDate: Date;
    offerDate: Date;
    expiryDate: Date;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
  };
  documents: Array<{
    type: string;
    name: string;
    url: string;
    uploadedDate: Date;
  }>;
  notes: Array<{
    id: string;
    author: string;
    content: string;
    timestamp: Date;
    type: 'general' | 'interview' | 'reference' | 'offer';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export default function EmployeeRecruitmentPage() {
  const [candidates, setCandidates] = useState<EmployeeCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<EmployeeCandidate | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'screening' | 'interviews' | 'references' | 'offers'>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/company/recruitment/employees');
      const result = await response.json();

      if (result.success) {
        setCandidates(result.data);
      } else {
        setError('Failed to fetch candidates');
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCandidateStatus = async (candidateId: string, newStatus: string, additionalData?: any) => {
    try {
      const response = await fetch(`/api/company/recruitment/employees/${candidateId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...additionalData })
      });

      const result = await response.json();

      if (result.success) {
        setCandidates(prevCandidates =>
          prevCandidates.map(candidate =>
            candidate.id === candidateId ? result.data : candidate
          )
        );
        setSelectedCandidate(result.data);
        setSuccess(`Candidate status updated to ${newStatus}`);
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
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'screening': return 'bg-yellow-100 text-yellow-800';
      case 'interview_scheduled': return 'bg-purple-100 text-purple-800';
      case 'interview_completed': return 'bg-indigo-100 text-indigo-800';
      case 'reference_check': return 'bg-orange-100 text-orange-800';
      case 'offer_pending': return 'bg-cyan-100 text-cyan-800';
      case 'offer_accepted': return 'bg-green-100 text-green-800';
      case 'offer_declined': return 'bg-red-100 text-red-800';
      case 'hired': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <FileText className="h-4 w-4" />;
      case 'screening': return <Search className="h-4 w-4" />;
      case 'interview_scheduled': return <Calendar className="h-4 w-4" />;
      case 'interview_completed': return <UserCheck className="h-4 w-4" />;
      case 'reference_check': return <Users className="h-4 w-4" />;
      case 'offer_pending': return <Send className="h-4 w-4" />;
      case 'offer_accepted': return <CheckCircle className="h-4 w-4" />;
      case 'offer_declined': return <XCircle className="h-4 w-4" />;
      case 'hired': return <Award className="h-4 w-4" />;
      case 'rejected': return <Minus className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getAvailableActions = (status: string) => {
    const actionMap: Record<string, Array<{id: string, label: string, type: 'positive' | 'negative' | 'neutral'}>> = {
      'applied': [
        { id: 'start_screening', label: 'Start Screening', type: 'positive' },
        { id: 'reject', label: 'Reject Application', type: 'negative' }
      ],
      'screening': [
        { id: 'schedule_interview', label: 'Schedule Interview', type: 'positive' },
        { id: 'reject', label: 'Reject After Screening', type: 'negative' }
      ],
      'interview_scheduled': [
        { id: 'complete_interview', label: 'Complete Interview', type: 'positive' },
        { id: 'reschedule', label: 'Reschedule Interview', type: 'neutral' },
        { id: 'reject', label: 'Cancel & Reject', type: 'negative' }
      ],
      'interview_completed': [
        { id: 'start_reference_check', label: 'Start Reference Check', type: 'positive' },
        { id: 'schedule_next_round', label: 'Schedule Next Round', type: 'neutral' },
        { id: 'reject', label: 'Reject After Interview', type: 'negative' }
      ],
      'reference_check': [
        { id: 'create_offer', label: 'Create Job Offer', type: 'positive' },
        { id: 'reject', label: 'Reject After References', type: 'negative' }
      ],
      'offer_pending': [
        { id: 'mark_accepted', label: 'Mark Offer Accepted', type: 'positive' },
        { id: 'mark_declined', label: 'Mark Offer Declined', type: 'negative' },
        { id: 'extend_deadline', label: 'Extend Deadline', type: 'neutral' }
      ],
      'offer_accepted': [
        { id: 'complete_hiring', label: 'Complete Hiring Process', type: 'positive' }
      ]
    };

    return actionMap[status] || [];
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesStatus = filterStatus === 'all' || candidate.recruitmentStatus === filterStatus;
    const matchesSearch = searchTerm === '' ||
      candidate.personalInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.applicationInfo.positionApplied.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase());

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
          <p className="text-gray-600">Loading employee recruitment...</p>
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
                <h1 className="text-xl font-bold text-gray-900">Employee Recruitment</h1>
                <p className="text-sm text-gray-600">Manage full-time employee recruitment process</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={fetchCandidates}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>

              <Link href="/company/recruitment">
                <Button variant="outline">
                  Back to Recruitment
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
                placeholder="Search candidates by name, position, or email..."
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
            <option value="applied">Applied</option>
            <option value="screening">Screening</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="interview_completed">Interview Completed</option>
            <option value="reference_check">Reference Check</option>
            <option value="offer_pending">Offer Pending</option>
            <option value="offer_accepted">Offer Accepted</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Candidates List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Employee Candidates ({filteredCandidates.length})
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Candidate
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCandidates.map(candidate => (
                    <div
                      key={candidate.id}
                      onClick={() => setSelectedCandidate(candidate)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedCandidate?.id === candidate.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{candidate.personalInfo.name}</h3>
                          <p className="text-sm text-gray-600">{candidate.applicationInfo.positionApplied}</p>
                        </div>
                        <Badge className={getStatusColor(candidate.recruitmentStatus)}>
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(candidate.recruitmentStatus)}
                            <span>{candidate.recruitmentStatus.replace('_', ' ')}</span>
                          </span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {candidate.personalInfo.email}
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2" />
                          {candidate.professionalInfo.experience} years exp.
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Applied: {formatDate(candidate.applicationInfo.applicationDate)}
                        </div>
                        <div className="flex items-center">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          {candidate.professionalInfo.education}
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredCandidates.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No candidates found matching your criteria</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Candidate Details */}
          <div>
            {selectedCandidate ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Candidate Details</span>
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
                  {/* Tabs */}
                  <div className="mb-4">
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-4">
                        {[
                          { id: 'overview', label: 'Overview' },
                          { id: 'screening', label: 'Screening' },
                          { id: 'interviews', label: 'Interviews' },
                          { id: 'references', label: 'References' },
                          { id: 'offers', label: 'Offers' }
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
                        <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            {selectedCandidate.personalInfo.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {selectedCandidate.personalInfo.phone}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            {selectedCandidate.personalInfo.address}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Professional Information</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Current Position:</span> {selectedCandidate.professionalInfo.currentPosition}
                          </div>
                          <div>
                            <span className="font-medium">Experience:</span> {selectedCandidate.professionalInfo.experience} years
                          </div>
                          <div>
                            <span className="font-medium">Education:</span> {selectedCandidate.professionalInfo.education}
                          </div>
                          <div>
                            <span className="font-medium">Expected Salary:</span> ${selectedCandidate.professionalInfo.expectedSalary.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Notice Period:</span> {selectedCandidate.professionalInfo.noticePeriod} days
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedCandidate.professionalInfo.skills.map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Application Details</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Applied Date:</span> {formatDate(selectedCandidate.applicationInfo.applicationDate)}
                          </div>
                          <div>
                            <span className="font-medium">Source:</span> {selectedCandidate.applicationInfo.source}
                          </div>
                          {selectedCandidate.applicationInfo.referredBy && (
                            <div>
                              <span className="font-medium">Referred By:</span> {selectedCandidate.applicationInfo.referredBy}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                        <div className="space-y-2">
                          {selectedCandidate.documents.map(doc => (
                            <div key={doc.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-gray-400" />
                                <span className="text-sm">{doc.name}</span>
                              </div>
                              <Button variant="outline" size="sm">
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Available Actions */}
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">Available Actions</h4>
                    <div className="space-y-2">
                      {getAvailableActions(selectedCandidate.recruitmentStatus).map(action => (
                        <Button
                          key={action.id}
                          variant={action.type === 'positive' ? 'default' : action.type === 'negative' ? 'destructive' : 'outline'}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => updateCandidateStatus(selectedCandidate.id, action.id)}
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
                    Select a Candidate
                  </h3>
                  <p className="text-gray-600">
                    Choose a candidate from the list to view details and manage their recruitment process
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
