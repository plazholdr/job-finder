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
  Minus,
  BookOpen,
  School,
  Timer
} from 'lucide-react';
import Link from 'next/link';

interface InternCandidate {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: Date;
    nationality: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  academicInfo: {
    university: string;
    degree: string;
    major: string;
    year: string;
    gpa: number;
    expectedGraduation: Date;
    academicProjects: Array<{
      title: string;
      description: string;
      technologies: string[];
    }>;
  };
  internshipInfo: {
    positionApplied: string;
    preferredStartDate: Date;
    duration: number; // in months
    availability: 'full-time' | 'part-time';
    workLocation: 'remote' | 'on-site' | 'hybrid';
    applicationDate: Date;
    source: string;
    referredBy?: string;
    coverLetter: string;
    resumeUrl: string;
  };
  recruitmentStatus: 'applied' | 'initial_screening' | 'academic_verification' | 'technical_assessment' | 'interview_scheduled' | 'interview_completed' | 'final_review' | 'offer_pending' | 'offer_accepted' | 'offer_declined' | 'onboarding' | 'active' | 'completed' | 'terminated' | 'rejected';
  screeningResults?: {
    score: number;
    notes: string;
    screenerName: string;
    screeningDate: Date;
    academicVerified: boolean;
  };
  technicalAssessment?: {
    testName: string;
    score: number;
    completedDate: Date;
    timeSpent: number; // in minutes
    feedback: string;
  };
  interviewResults?: Array<{
    round: number;
    type: 'phone' | 'video' | 'in_person' | 'technical' | 'behavioral';
    interviewerName: string;
    date: Date;
    score: number;
    feedback: string;
    recommendation: 'proceed' | 'reject' | 'hold';
  }>;
  offerDetails?: {
    position: string;
    stipend: number;
    duration: number;
    startDate: Date;
    endDate: Date;
    mentorAssigned?: string;
    department: string;
    offerDate: Date;
    expiryDate: Date;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
  };
  onboardingInfo?: {
    startDate: Date;
    mentor: string;
    buddy: string;
    orientation: {
      completed: boolean;
      date?: Date;
    };
    equipmentAssigned: string[];
    accessGranted: string[];
  };
  documents: Array<{
    type: string;
    name: string;
    url: string;
    uploadedDate: Date;
    required: boolean;
  }>;
  notes: Array<{
    id: string;
    author: string;
    content: string;
    timestamp: Date;
    type: 'general' | 'academic' | 'interview' | 'offer' | 'onboarding';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export default function InternRecruitmentPage() {
  const [candidates, setCandidates] = useState<InternCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<InternCandidate | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'academic' | 'assessment' | 'interviews' | 'offers' | 'onboarding'>('overview');
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

      const response = await fetch('/api/company/recruitment/interns');
      const result = await response.json();

      if (result.success) {
        setCandidates(result.data);
      } else {
        setError('Failed to fetch intern candidates');
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
      const response = await fetch(`/api/company/recruitment/interns/${candidateId}/status`, {
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
        setSuccess(`Intern status updated to ${newStatus.replace('_', ' ')}`);
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
      case 'initial_screening': return 'bg-yellow-100 text-yellow-800';
      case 'academic_verification': return 'bg-purple-100 text-purple-800';
      case 'technical_assessment': return 'bg-indigo-100 text-indigo-800';
      case 'interview_scheduled': return 'bg-cyan-100 text-cyan-800';
      case 'interview_completed': return 'bg-teal-100 text-teal-800';
      case 'final_review': return 'bg-orange-100 text-orange-800';
      case 'offer_pending': return 'bg-amber-100 text-amber-800';
      case 'offer_accepted': return 'bg-green-100 text-green-800';
      case 'offer_declined': return 'bg-red-100 text-red-800';
      case 'onboarding': return 'bg-emerald-100 text-emerald-800';
      case 'active': return 'bg-green-200 text-green-900';
      case 'completed': return 'bg-blue-200 text-blue-900';
      case 'terminated': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <FileText className="h-4 w-4" />;
      case 'initial_screening': return <Search className="h-4 w-4" />;
      case 'academic_verification': return <School className="h-4 w-4" />;
      case 'technical_assessment': return <BookOpen className="h-4 w-4" />;
      case 'interview_scheduled': return <Calendar className="h-4 w-4" />;
      case 'interview_completed': return <UserCheck className="h-4 w-4" />;
      case 'final_review': return <Eye className="h-4 w-4" />;
      case 'offer_pending': return <Send className="h-4 w-4" />;
      case 'offer_accepted': return <CheckCircle className="h-4 w-4" />;
      case 'offer_declined': return <XCircle className="h-4 w-4" />;
      case 'onboarding': return <UserPlus className="h-4 w-4" />;
      case 'active': return <Award className="h-4 w-4" />;
      case 'completed': return <Target className="h-4 w-4" />;
      case 'terminated': return <Minus className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getAvailableActions = (status: string) => {
    const actionMap: Record<string, Array<{id: string, label: string, type: 'positive' | 'negative' | 'neutral'}>> = {
      'applied': [
        { id: 'start_screening', label: 'Start Initial Screening', type: 'positive' },
        { id: 'reject', label: 'Reject Application', type: 'negative' }
      ],
      'initial_screening': [
        { id: 'verify_academics', label: 'Verify Academic Records', type: 'positive' },
        { id: 'reject', label: 'Reject After Screening', type: 'negative' }
      ],
      'academic_verification': [
        { id: 'send_assessment', label: 'Send Technical Assessment', type: 'positive' },
        { id: 'reject', label: 'Reject After Verification', type: 'negative' }
      ],
      'technical_assessment': [
        { id: 'schedule_interview', label: 'Schedule Interview', type: 'positive' },
        { id: 'reject', label: 'Reject After Assessment', type: 'negative' }
      ],
      'interview_scheduled': [
        { id: 'complete_interview', label: 'Complete Interview', type: 'positive' },
        { id: 'reschedule', label: 'Reschedule Interview', type: 'neutral' },
        { id: 'reject', label: 'Cancel & Reject', type: 'negative' }
      ],
      'interview_completed': [
        { id: 'final_review', label: 'Start Final Review', type: 'positive' },
        { id: 'schedule_next_round', label: 'Schedule Next Round', type: 'neutral' },
        { id: 'reject', label: 'Reject After Interview', type: 'negative' }
      ],
      'final_review': [
        { id: 'create_offer', label: 'Create Internship Offer', type: 'positive' },
        { id: 'reject', label: 'Reject After Review', type: 'negative' }
      ],
      'offer_pending': [
        { id: 'mark_accepted', label: 'Mark Offer Accepted', type: 'positive' },
        { id: 'mark_declined', label: 'Mark Offer Declined', type: 'negative' },
        { id: 'extend_deadline', label: 'Extend Deadline', type: 'neutral' }
      ],
      'offer_accepted': [
        { id: 'start_onboarding', label: 'Start Onboarding Process', type: 'positive' }
      ],
      'onboarding': [
        { id: 'activate_intern', label: 'Activate Internship', type: 'positive' }
      ],
      'active': [
        { id: 'complete_internship', label: 'Complete Internship', type: 'positive' },
        { id: 'terminate', label: 'Terminate Internship', type: 'negative' }
      ]
    };

    return actionMap[status] || [];
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesStatus = filterStatus === 'all' || candidate.recruitmentStatus === filterStatus;
    const matchesSearch = searchTerm === '' ||
      candidate.personalInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.internshipInfo.positionApplied.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.academicInfo.university.toLowerCase().includes(searchTerm.toLowerCase());

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
          <p className="text-gray-600">Loading intern recruitment...</p>
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
              <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Intern Recruitment</h1>
                <p className="text-sm text-gray-600">Manage internship recruitment and onboarding process</p>
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
                placeholder="Search interns by name, position, university, or email..."
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
            <option value="initial_screening">Initial Screening</option>
            <option value="academic_verification">Academic Verification</option>
            <option value="technical_assessment">Technical Assessment</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="interview_completed">Interview Completed</option>
            <option value="final_review">Final Review</option>
            <option value="offer_pending">Offer Pending</option>
            <option value="offer_accepted">Offer Accepted</option>
            <option value="onboarding">Onboarding</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="terminated">Terminated</option>
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
                    Intern Candidates ({filteredCandidates.length})
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Intern
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
                        selectedCandidate?.id === candidate.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{candidate.personalInfo.name}</h3>
                          <p className="text-sm text-gray-600">{candidate.internshipInfo.positionApplied}</p>
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
                          <School className="h-4 w-4 mr-2" />
                          {candidate.academicInfo.university}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Applied: {formatDate(candidate.internshipInfo.applicationDate)}
                        </div>
                        <div className="flex items-center">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          {candidate.academicInfo.major} - {candidate.academicInfo.year}
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredCandidates.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No intern candidates found matching your criteria</p>
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
                    <span>Intern Details</span>
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
                          { id: 'academic', label: 'Academic' },
                          { id: 'assessment', label: 'Assessment' },
                          { id: 'interviews', label: 'Interviews' },
                          { id: 'offers', label: 'Offers' },
                          { id: 'onboarding', label: 'Onboarding' }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              activeTab === tab.id
                                ? 'border-green-500 text-green-600'
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
                        <h4 className="font-medium text-gray-900 mb-2">Emergency Contact</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Name:</span> {selectedCandidate.personalInfo.emergencyContact.name}
                          </div>
                          <div>
                            <span className="font-medium">Relationship:</span> {selectedCandidate.personalInfo.emergencyContact.relationship}
                          </div>
                          <div>
                            <span className="font-medium">Phone:</span> {selectedCandidate.personalInfo.emergencyContact.phone}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Internship Details</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Position:</span> {selectedCandidate.internshipInfo.positionApplied}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {selectedCandidate.internshipInfo.duration} months
                          </div>
                          <div>
                            <span className="font-medium">Availability:</span> {selectedCandidate.internshipInfo.availability}
                          </div>
                          <div>
                            <span className="font-medium">Work Location:</span> {selectedCandidate.internshipInfo.workLocation}
                          </div>
                          <div>
                            <span className="font-medium">Preferred Start:</span> {formatDate(selectedCandidate.internshipInfo.preferredStartDate)}
                          </div>
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
                                {doc.required && <Badge variant="outline" className="ml-2 text-xs">Required</Badge>}
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

                  {activeTab === 'academic' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Academic Information</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">University:</span> {selectedCandidate.academicInfo.university}
                          </div>
                          <div>
                            <span className="font-medium">Degree:</span> {selectedCandidate.academicInfo.degree}
                          </div>
                          <div>
                            <span className="font-medium">Major:</span> {selectedCandidate.academicInfo.major}
                          </div>
                          <div>
                            <span className="font-medium">Year:</span> {selectedCandidate.academicInfo.year}
                          </div>
                          <div>
                            <span className="font-medium">GPA:</span> {selectedCandidate.academicInfo.gpa}/4.0
                          </div>
                          <div>
                            <span className="font-medium">Expected Graduation:</span> {formatDate(selectedCandidate.academicInfo.expectedGraduation)}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Academic Projects</h4>
                        <div className="space-y-3">
                          {selectedCandidate.academicInfo.academicProjects.map((project, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                              <h5 className="font-medium text-gray-900 mb-1">{project.title}</h5>
                              <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                              <div className="flex flex-wrap gap-1">
                                {project.technologies.map(tech => (
                                  <Badge key={tech} variant="outline" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedCandidate.screeningResults?.academicVerified && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-800">Academic records verified</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'assessment' && (
                    <div className="space-y-4">
                      {selectedCandidate.technicalAssessment ? (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Technical Assessment Results</h4>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Test: {selectedCandidate.technicalAssessment.testName}</span>
                              <Badge className={selectedCandidate.technicalAssessment.score >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {selectedCandidate.technicalAssessment.score}/100
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Completed:</span> {formatDate(selectedCandidate.technicalAssessment.completedDate)}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Time Spent:</span> {selectedCandidate.technicalAssessment.timeSpent} minutes
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Feedback:</span>
                              <p className="mt-1">{selectedCandidate.technicalAssessment.feedback}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No technical assessment completed</p>
                          {selectedCandidate.recruitmentStatus === 'technical_assessment' && (
                            <Button className="mt-4" onClick={() => updateCandidateStatus(selectedCandidate.id, 'interview_scheduled')}>
                              Mark Assessment Complete
                            </Button>
                          )}
                        </div>
                      )}
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
                    Select an Intern
                  </h3>
                  <p className="text-gray-600">
                    Choose an intern candidate from the list to view details and manage their recruitment process
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
