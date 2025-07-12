'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  Users, 
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Send,
  Eye,
  FileText,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Star,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Pause,
  Play
} from 'lucide-react';
import Link from 'next/link';
import { CandidateApplication, ApplicationWorkflowAction } from '@/types/company';

export default function ApplicationWorkflowPage() {
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<CandidateApplication | null>(null);
  const [workflowAction, setWorkflowAction] = useState<ApplicationWorkflowAction | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/company/applications/workflow');
      const result = await response.json();
      if (result.success) {
        setApplications(result.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'pending_acceptance': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'reviewing': return 'bg-purple-100 text-purple-800';
      case 'shortlisted': return 'bg-indigo-100 text-indigo-800';
      case 'interview_scheduled': return 'bg-cyan-100 text-cyan-800';
      case 'interview_completed': return 'bg-teal-100 text-teal-800';
      case 'offer_extended': return 'bg-emerald-100 text-emerald-800';
      case 'offer_accepted': return 'bg-green-200 text-green-900';
      case 'offer_declined': return 'bg-orange-100 text-orange-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      case 'on_hold': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <FileText className="h-4 w-4" />;
      case 'pending_acceptance': return <Clock className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'reviewing': return <Eye className="h-4 w-4" />;
      case 'shortlisted': return <Star className="h-4 w-4" />;
      case 'interview_scheduled': return <Calendar className="h-4 w-4" />;
      case 'interview_completed': return <CheckCircle className="h-4 w-4" />;
      case 'offer_extended': return <Send className="h-4 w-4" />;
      case 'offer_accepted': return <ThumbsUp className="h-4 w-4" />;
      case 'offer_declined': return <ThumbsDown className="h-4 w-4" />;
      case 'withdrawn': return <RotateCcw className="h-4 w-4" />;
      case 'on_hold': return <Pause className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getAvailableActions = (status: string): ApplicationWorkflowAction[] => {
    const actionMap: Record<string, ApplicationWorkflowAction[]> = {
      'submitted': [
        { id: 'accept', label: 'Accept Application', type: 'positive', nextStatus: 'pending_acceptance' },
        { id: 'reject', label: 'Reject Application', type: 'negative', nextStatus: 'rejected' },
        { id: 'hold', label: 'Put on Hold', type: 'neutral', nextStatus: 'on_hold' }
      ],
      'pending_acceptance': [
        { id: 'start_review', label: 'Start Review Process', type: 'positive', nextStatus: 'reviewing' },
        { id: 'reject', label: 'Reject Application', type: 'negative', nextStatus: 'rejected' }
      ],
      'reviewing': [
        { id: 'shortlist', label: 'Shortlist Candidate', type: 'positive', nextStatus: 'shortlisted' },
        { id: 'reject', label: 'Reject Application', type: 'negative', nextStatus: 'rejected' },
        { id: 'hold', label: 'Put on Hold', type: 'neutral', nextStatus: 'on_hold' }
      ],
      'shortlisted': [
        { id: 'schedule_interview', label: 'Schedule Interview', type: 'positive', nextStatus: 'interview_scheduled' },
        { id: 'reject', label: 'Reject Application', type: 'negative', nextStatus: 'rejected' }
      ],
      'interview_scheduled': [
        { id: 'complete_interview', label: 'Mark Interview Complete', type: 'positive', nextStatus: 'interview_completed' },
        { id: 'reschedule', label: 'Reschedule Interview', type: 'neutral', nextStatus: 'interview_scheduled' },
        { id: 'cancel', label: 'Cancel Interview', type: 'negative', nextStatus: 'rejected' }
      ],
      'interview_completed': [
        { id: 'extend_offer', label: 'Extend Job Offer', type: 'positive', nextStatus: 'offer_extended' },
        { id: 'reject', label: 'Reject Application', type: 'negative', nextStatus: 'rejected' },
        { id: 'second_interview', label: 'Schedule Second Interview', type: 'neutral', nextStatus: 'interview_scheduled' }
      ],
      'offer_extended': [
        { id: 'offer_accepted', label: 'Mark Offer Accepted', type: 'positive', nextStatus: 'offer_accepted' },
        { id: 'offer_declined', label: 'Mark Offer Declined', type: 'negative', nextStatus: 'offer_declined' },
        { id: 'extend_deadline', label: 'Extend Offer Deadline', type: 'neutral', nextStatus: 'offer_extended' }
      ],
      'on_hold': [
        { id: 'resume_review', label: 'Resume Review', type: 'positive', nextStatus: 'reviewing' },
        { id: 'reject', label: 'Reject Application', type: 'negative', nextStatus: 'rejected' }
      ]
    };

    return actionMap[status] || [];
  };

  const handleWorkflowAction = async () => {
    if (!selectedApplication || !workflowAction || isProcessing) return;

    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch('/api/company/applications/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: selectedApplication.id,
          action: workflowAction.id,
          newStatus: workflowAction.nextStatus,
          notes: actionNotes.trim() || undefined,
          performedBy: 'current-user' // In real app, get from auth
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`Application ${workflowAction.label.toLowerCase()} successfully!`);
        
        // Update local state
        setApplications(prevApps =>
          prevApps.map(app =>
            app.id === selectedApplication.id ? result.data : app
          )
        );
        
        setSelectedApplication(result.data);
        setWorkflowAction(null);
        setActionNotes('');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to process application');
      }
    } catch (error) {
      console.error('Error processing application:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Group applications by status for pipeline view
  const applicationsByStatus = applications.reduce((acc, app) => {
    if (!acc[app.status]) {
      acc[app.status] = [];
    }
    acc[app.status].push(app);
    return acc;
  }, {} as Record<string, CandidateApplication[]>);

  const statusOrder = [
    'submitted',
    'pending_acceptance', 
    'reviewing',
    'shortlisted',
    'interview_scheduled',
    'interview_completed',
    'offer_extended',
    'offer_accepted',
    'rejected',
    'on_hold'
  ];

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
                <h1 className="text-xl font-bold text-gray-900">Application Workflow</h1>
                <p className="text-sm text-gray-600">Manage application pipeline and status transitions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/company/applications">
                <Button variant="outline">
                  Back to Applications
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pipeline Overview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Application Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {statusOrder.map(status => {
                    const statusApplications = applicationsByStatus[status] || [];
                    if (statusApplications.length === 0) return null;

                    return (
                      <div key={status} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(status)}>
                              <span className="flex items-center space-x-1">
                                {getStatusIcon(status)}
                                <span>{status.replace('_', ' ').toUpperCase()}</span>
                              </span>
                            </Badge>
                            <span className="text-sm text-gray-500">
                              ({statusApplications.length} applications)
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {statusApplications.map(application => (
                            <div
                              key={application.id}
                              onClick={() => setSelectedApplication(application)}
                              className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                                selectedApplication?.id === application.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {application.candidate.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {application.candidate.email}
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedApplication(application);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="text-xs text-gray-500">
                                <p>Applied: {formatDate(application.submittedAt)}</p>
                                <p>Updated: {formatDate(application.lastUpdated)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Application Details & Actions */}
          <div className="space-y-6">
            {selectedApplication ? (
              <>
                {/* Application Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Application Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {selectedApplication.candidate.name}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {selectedApplication.candidate.email}
                        </div>
                        {selectedApplication.candidate.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            {selectedApplication.candidate.phone}
                          </div>
                        )}
                        {selectedApplication.candidate.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {selectedApplication.candidate.location}
                          </div>
                        )}
                        {selectedApplication.candidate.education && (
                          <div className="flex items-center">
                            <GraduationCap className="h-4 w-4 mr-2" />
                            {selectedApplication.candidate.education}
                          </div>
                        )}
                        {selectedApplication.candidate.experience && (
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-2" />
                            {selectedApplication.candidate.experience}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Current Status:</span>
                        <Badge className={getStatusColor(selectedApplication.status)}>
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(selectedApplication.status)}
                            <span>{selectedApplication.status.replace('_', ' ')}</span>
                          </span>
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link href={`/company/applications/${selectedApplication.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Workflow Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ArrowRight className="h-5 w-5 mr-2" />
                      Available Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {getAvailableActions(selectedApplication.status).map(action => (
                      <Button
                        key={action.id}
                        variant={workflowAction?.id === action.id ? "default" : "outline"}
                        className={`w-full justify-start ${
                          action.type === 'positive' ? 'border-green-200 hover:bg-green-50' :
                          action.type === 'negative' ? 'border-red-200 hover:bg-red-50' :
                          'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => setWorkflowAction(action)}
                      >
                        {action.type === 'positive' && <CheckCircle className="h-4 w-4 mr-2" />}
                        {action.type === 'negative' && <XCircle className="h-4 w-4 mr-2" />}
                        {action.type === 'neutral' && <Clock className="h-4 w-4 mr-2" />}
                        {action.label}
                      </Button>
                    ))}

                    {workflowAction && (
                      <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium text-gray-900 mb-3">
                          {workflowAction.label}
                        </h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Notes (optional)
                            </label>
                            <Textarea
                              value={actionNotes}
                              onChange={(e) => setActionNotes(e.target.value)}
                              placeholder="Add any notes about this action..."
                              rows={3}
                            />
                          </div>

                          <div className="flex space-x-3">
                            <Button
                              onClick={handleWorkflowAction}
                              disabled={isProcessing}
                              className="flex-1"
                            >
                              {isProcessing ? 'Processing...' : 'Confirm Action'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setWorkflowAction(null);
                                setActionNotes('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select an Application
                  </h3>
                  <p className="text-gray-600">
                    Choose an application from the pipeline to view details and available actions
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
