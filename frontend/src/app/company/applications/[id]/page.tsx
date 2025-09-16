'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Download,
  Star,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { CandidateApplication } from '@/types/company';
import OfferModal from '@/components/company/OfferModal';
import { APPLICATION_STATUS, APPLICATION_STATUS_LABEL, normalizeApplicationStatus } from '@/constants/constants';


interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const router = useRouter();
  const [application, setApplication] = useState<CandidateApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setApplicationId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  // Resume download function - Check resumeUrl first, then API
  const downloadResume = async () => {
    if (!application) {
      alert('No application data found');
      return;
    }

    try {
      // First try direct resume URL if available
      if (application.resume) {
        console.log('📄 Using direct resume URL:', application.resume);
        const link = document.createElement('a');
        link.href = application.resume;
        link.download = 'resume.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Fallback to API if no direct URL
      if (!application.candidate?.id) {
        alert('No resume found');
        return;
      }

      console.log('📡 Using API download for userId:', application.candidate.id);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/users/${application.candidate.id}/resume/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'resume.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download resume');
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Error downloading resume');
    }
  };

  useEffect(() => {
    if (applicationId) {
      fetchApplication();
    }
  }, [applicationId]);

  const fetchApplication = async () => {
    if (!applicationId) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`/api/company/applications/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();

      if (result.success) {
        setApplication(result.data);
        console.log('📋 Application data:', result.data);
        console.log('🔍 Resume info:', {
          resume: result.data.resume,
          resumeUrl: result.data.resumeUrl,
          candidateId: result.data.candidateId,
          userId: result.data.userId,
          candidate: result.data.candidate
        });
      } else {
        setError(result.error || 'Application not found');
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      setError('Failed to load application');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: number) => {
    if (!application) return;

    try {
      setIsUpdating(true);
      setError(null);

      const token = localStorage.getItem('authToken');

      const response = await fetch(`/api/company/applications/${application.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          reviewerId: 'current-user-id', // TODO: use real user id from auth
          feedback: feedback.trim() || undefined,
          rating: rating || undefined
        }),
      });

      const result = await response.json();

      if (result.success) {
        setApplication(result.data);
        const label = APPLICATION_STATUS_LABEL[newStatus] || 'Updated';
        setSuccess(`Application status updated to ${label}`);
        setFeedback('');
        setRating(0);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to update application');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      setError('Failed to update application');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: number | string) => {
    const code = typeof status === 'number' ? status : normalizeApplicationStatus(status).code;
    switch (code) {
      case APPLICATION_STATUS.NEW: return 'bg-blue-100 text-blue-800';
      case APPLICATION_STATUS.SHORTLISTED: return 'bg-purple-100 text-purple-800';
      case APPLICATION_STATUS.PENDING_ACCEPTANCE: return 'bg-green-100 text-green-800';
      case APPLICATION_STATUS.ACCEPTED: return 'bg-emerald-100 text-emerald-800';
      case APPLICATION_STATUS.REJECTED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStarRating = (currentRating: number, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRatingChange && onRatingChange(star)}
            className={`h-5 w-5 ${
              star <= currentRating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${onRatingChange ? 'hover:text-yellow-400 cursor-pointer' : ''}`}
            disabled={!onRatingChange}
          >
            <Star className="h-full w-full" />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (error && !application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Application Not Found</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/company/applications">
              <Button>Back to Applications</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!application) return null;

  const statusCode = typeof application.status === 'number' ? application.status : normalizeApplicationStatus(application.status).code;
  const statusLabel = APPLICATION_STATUS_LABEL[statusCode] || 'Status';

  return (

    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/company/applications">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Applications
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Application Review</h1>
                <p className="text-sm text-gray-600">{application.candidate?.name || 'Unknown Candidate'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(statusCode)}>
                {statusLabel}
              </Badge>
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Candidate Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Candidate Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-6">
                  <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {application.candidate?.name || 'Unknown Candidate'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <a href={`mailto:${application.candidate?.email || ''}`} className="text-blue-600 hover:underline">
                          {application.candidate?.email || 'No email provided'}
                        </a>
                      </div>
                      {application.candidate?.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          <a href={`tel:${application.candidate.phone}`} className="text-blue-600 hover:underline">
                            {application.candidate.phone}
                          </a>
                        </div>
                      )}
                      {application.candidate?.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {application.candidate.location}
                        </div>
                      )}
                      {application.candidate?.education && (
                        <div className="flex items-center">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          {application.candidate.education}
                        </div>
                      )}
                      {application.candidate?.experience && (
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2" />
                          {application.candidate.experience}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {application.candidate.skills && Array.isArray(application.candidate.skills) && application.candidate.skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {application.candidate.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {typeof skill === 'string' ? skill : String(skill)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cover Letter */}
            {application.coverLetter && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Cover Letter
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {application.coverLetter}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Resume</p>
                        <p className="text-sm text-gray-500">PDF Document</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadResume}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {application.additionalDocuments && Array.isArray(application.additionalDocuments) && application.additionalDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Additional Document {index + 1}</p>
                          <p className="text-sm text-gray-500">PDF Document</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Offer details */}
            {(application.offerLetterUrl || (application as any).offerLetter || application.offerValidity) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Offer details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {((application as any).offerLetter || application.offerLetterUrl) && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Letter of Offer</span>
                        <a
                          className="text-sm text-blue-600 hover:underline"
                          href={(application as any).offerLetter || application.offerLetterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      </div>
                    )}
                    {application.offerValidity && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Offer validity</span>
                        <span className="text-sm text-gray-900">{new Date(application.offerValidity).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Application details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {application.reviewers && Array.isArray(application.reviewers) && application.reviewers.length > 0 ? (
                    application.reviewers.map((reviewer, index) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{reviewer.name || 'Unknown Reviewer'}</p>
                          <p className="text-sm text-gray-600">{reviewer.role || 'Unknown Role'}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={
                            reviewer.status === 'approved' ? 'bg-green-100 text-green-800' :
                            reviewer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {reviewer.status || 'pending'}
                          </Badge>
                          {reviewer.reviewedAt && (
                            <p className="text-sm text-gray-500 mt-1">
                              {reviewer.reviewedAt ? new Date(reviewer.reviewedAt).toLocaleDateString() : 'N/A'}
                            </p>
                          )}
                        </div>
                      </div>
                      {reviewer.rating && (
                        <div className="mb-2">
                          {renderStarRating(reviewer.rating)}
                        </div>
                      )}
                      {reviewer.feedback && (
                        <p className="text-gray-700 text-sm">{reviewer.feedback}</p>
                      )}
                    </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No review history available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* New Application Status */}
                {statusCode === APPLICATION_STATUS.NEW && (
                  <>
                    <Button
                      className="w-full"
                      onClick={() => handleStatusUpdate(APPLICATION_STATUS.SHORTLISTED)}
                      disabled={isUpdating}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Shortlist Candidate
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => handleStatusUpdate(APPLICATION_STATUS.REJECTED)}
                      disabled={isUpdating}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Application
                    </Button>
                  </>
                )}

                {/* Shortlisted Status */}
                {statusCode === APPLICATION_STATUS.SHORTLISTED && (
                  <>
                    <Button
                      className="w-full"
                      onClick={() => setShowOfferModal(true)}
                      disabled={isUpdating}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Offer Position
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => handleStatusUpdate(APPLICATION_STATUS.REJECTED)}
                      disabled={isUpdating}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Application
                    </Button>
                  </>
                )}

                {/* Pending Acceptance Status */}
                {statusCode === APPLICATION_STATUS.PENDING_ACCEPTANCE && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Offer submitted and pending candidate response
                    </p>
                    <div className="text-xs text-gray-500 mb-3">
                      {application.offerValidity && (
                        <p>Valid until: {application.offerValidity ? new Date(application.offerValidity).toLocaleDateString() : 'N/A'}</p>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => handleStatusUpdate(APPLICATION_STATUS.REJECTED)}
                      disabled={isUpdating}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Withdraw offer
                    </Button>
                  </div>
                )}

                {/* Accepted Status */}
                {statusCode === APPLICATION_STATUS.ACCEPTED && (
                  <div className="text-center py-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <p className="text-sm font-medium text-green-800">
                        Candidate has accepted the position
                      </p>
                    </div>
                    <p className="text-xs text-green-600">
                      Application process completed successfully
                    </p>
                  </div>
                )}

                {/* Rejected / Finalized - No actions available */}
                {statusCode === APPLICATION_STATUS.REJECTED && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      Application process completed
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>



            {/* Application Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Application Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {application.statusHistory && application.statusHistory.length > 0 ? (
                  <div className="space-y-4">
                    {application.statusHistory
                      .sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime())
                      .map((event, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          {/* Timeline dot and line */}
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${
                              normalizeApplicationStatus(event.status).code === 0 ? 'bg-blue-500' :
                              normalizeApplicationStatus(event.status).code === 1 ? 'bg-yellow-500' :
                              normalizeApplicationStatus(event.status).code === 2 ? 'bg-green-500' :
                              normalizeApplicationStatus(event.status).code === 3 ? 'bg-green-600' :
                              normalizeApplicationStatus(event.status).code === 4 ? 'bg-red-500' :
                              'bg-gray-400'
                            }`} />
                            {index < (application.statusHistory?.length || 0) - 1 && (
                              <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                            )}
                          </div>

                          {/* Timeline content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900">
                                {APPLICATION_STATUS_LABEL[normalizeApplicationStatus(event.status).code]}
                              </h4>
                              <time className="text-xs text-gray-500">
                                {formatDate(event.changedAt)}
                              </time>
                            </div>
                            <Badge
                              variant="outline"
                              className={`mt-1 text-xs ${
                                normalizeApplicationStatus(event.status).code === 0 ? 'border-blue-200 text-blue-700' :
                                normalizeApplicationStatus(event.status).code === 1 ? 'border-yellow-200 text-yellow-700' :
                                normalizeApplicationStatus(event.status).code === 2 ? 'border-green-200 text-green-700' :
                                normalizeApplicationStatus(event.status).code === 3 ? 'border-green-200 text-green-800' :
                                normalizeApplicationStatus(event.status).code === 4 ? 'border-red-200 text-red-700' :
                                'border-gray-200 text-gray-700'
                              }`}
                            >
                              {normalizeApplicationStatus(event.status).code === 0 ? 'Application Submitted' :
                               normalizeApplicationStatus(event.status).code === 1 ? 'Shortlisted for Review' :
                               normalizeApplicationStatus(event.status).code === 2 ? 'Pending Acceptance' :
                               normalizeApplicationStatus(event.status).code === 3 ? 'Offer Accepted' :
                               normalizeApplicationStatus(event.status).code === 4 ? 'Application Rejected' :
                               APPLICATION_STATUS_LABEL[normalizeApplicationStatus(event.status).code]
                              }
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No timeline events available.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      {application && (
        <OfferModal
          isOpen={showOfferModal}
          onClose={() => setShowOfferModal(false)}
          applicationId={application.id}
          candidateName={application.candidate?.name || 'Unknown Candidate'}
          onSuccess={() => {
            fetchApplication(); // Refresh application data
            setSuccess('Offer submitted successfully!');
            setTimeout(() => setSuccess(null), 3000);
          }}
        />
      )}
    </div>
  );
}
