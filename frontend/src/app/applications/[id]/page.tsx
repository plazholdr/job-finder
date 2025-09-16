'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { APPLICATION_STATUS } from '@/constants/constants';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Building2,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Video,
  Phone,
  Users,
  DollarSign,
  Download,
  FileText,
  ExternalLink
} from 'lucide-react';
import { Application, ApplicationTimelineEvent } from '@/types/company-job';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import WithdrawalReasonModal from "@/components/WithdrawalReasonModal";

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);


  const fetchApplicationDetails = useCallback(async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found');
      setApplication(null);
      return;
    }

    const res = await fetch(`/api/applications/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const payload = await res.json();

    const raw = payload?.data ?? payload;
    if (!raw || typeof raw !== 'object') throw new Error('Invalid application payload');

    const idStr = String(raw._id ?? raw.id ?? '');
    const jobIdStr =
      typeof raw.jobId === 'object' && raw.jobId !== null && 'toString' in raw.jobId
        ? String(raw.jobId)
        : String(raw.jobId ?? '');

    const status = String(raw.status ?? 'submitted').toLowerCase();

    const createdAt = raw.createdAt ?? raw.submittedAt ?? new Date().toISOString();
    const updatedAt = raw.updatedAt ?? createdAt;

    const normalized: Application = {
      ...raw,
      id: idStr,
      _id: idStr,       
      jobId: jobIdStr,
      status,
      statusCode: raw.statusCode ?? 0,
      createdAt,
      updatedAt,
      jobInfo: raw.jobInfo ?? raw.job ?? raw.job_data ?? undefined,
      companyInfo: raw.companyInfo ?? raw.company ?? raw.company_data ?? undefined,
    };

    setApplication(normalized);
  } catch (err) {
    console.error('Error fetching application details:', err);
    setApplication(null);
  } finally {
    setLoading(false);
  }
}, [params.id]);


  useEffect(() => {
    if (params.id) {
      fetchApplicationDetails();
    }
  }, [params.id, fetchApplicationDetails]);

  const handleDownloadOfferLetter = async () => {
    if (!application) {
      alert('No application data available');
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        alert('Authentication required');
        return;
      }

      // Use the same pattern as resume downloads - go through API
      const response = await fetch(`/api/applications/${application._id || application.id}/offer-letter`, {
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
        a.download = `offer_letter_${application._id || application.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        console.error('Failed to download offer letter:', errorData);
        alert(errorData.error || 'Failed to download offer letter. Please try again.');
      }

    } catch (error) {
      console.error('Error downloading offer letter:', error);
      alert('Error downloading offer letter. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper function to check if offer has expired
  const isOfferExpired = (offerValidity: string) => {
    if (!offerValidity) return false;
    const validityDate = new Date(offerValidity);
    const currentDate = new Date();
    return currentDate > validityDate;
  };

  // Auto-update expired applications
  useEffect(() => {
    const updateExpiredApplication = async () => {
      if (!application || application.status !== 'pending_acceptance') return;

      if (isOfferExpired(application.offerValidity)) {
        try {
          const token = localStorage.getItem('authToken');
          if (!token) return;

          console.log('Auto-updating expired application to rejected status');
          const response = await fetch(`/api/applications/${application._id || application.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              status: 'rejected',
              reason: 'Offer expired without response'
            }),
          });

          if (response.ok) {
            // Update the local application state instead of reloading
            setApplication(prev => prev ? { ...prev, status: 'rejected' } : null);
          }
        } catch (error) {
          console.error('Error updating expired application:', error);
        }
      }
    };

    // Only run once when application loads and is expired
    if (application && application.status === 'pending_acceptance' && isOfferExpired(application.offerValidity)) {
      updateExpiredApplication();
    }
  }, [application?._id]); // Only depend on application ID to avoid repeated calls

  const handleAction = async (action: string, suppliedReason?: string) => {
    if (!application) return;

    // Show confirmation for decline action
    if (action === 'decline_offer') {
      if (!confirm('Are you sure you want to decline this offer? This action cannot be undone.')) {
        return;
      }
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      // Map actions to status updates
      let status: string | undefined;
      let reason: string | undefined;
      let extra: Record<string, unknown> = {};

      if (action === 'accept_offer') {
        status = 'accepted';
      } else if (action === 'decline_offer') {
        status = 'rejected';
        reason = 'Offer declined by candidate';
        extra.statusCode = APPLICATION_STATUS.DECLINED;

      } else if (action === 'withdraw') {
        status = 'withdrawn';

      
        const withdrawalReason = (suppliedReason ?? '').trim();

      // Send these to the API
      extra.statusCode = APPLICATION_STATUS.WITHDRAWN; // 7
      extra.withdrawalReason = withdrawalReason || undefined; // only send if non-empty
      extra.withdrawalDate = new Date().toISOString();

      // Also set generic `reason` if your service logs it too
      reason = withdrawalReason || 'Application withdrawn by student';
    } else {
        status = action; // For other actions, use as-is
      }

      console.log('Performing action:', action, 'updating status to:', status, 'on application:', application._id || application.id);

      const response = await fetch(`/api/applications/${application._id || application.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          reason,
          ...extra,
        }),
      });

      console.log('Action response status:', response.status);
      const data = await response.json();
      console.log('Action response data:', data);

      if (data.success) {
        console.log('Action successful, updating application data');
        setApplication(data.data);

        // Show specific success messages
        if (action === 'accept_offer') {
        alert('Offer accepted successfully! You will receive a confirmation email shortly.');
        } else if (action === 'decline_offer') {
          alert('Offer declined. Thank you for your consideration.');
        } else if (action === 'withdraw') {
          alert('Application withdrawn.');
        } else {
          alert(`Successfully ${action.replace('_', ' ')}!`);
        }
      } else {
        
      }
    } catch (error) {
      
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'pending':
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'interview_scheduled':
      case 'interview_completed':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-2 border-green-300 font-semibold';
      case 'rejected':
      case 'withdrawn':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
      case 'withdrawn':
        return <XCircle className="h-4 w-4" />;
      case 'interview_scheduled':
      case 'interview_completed':
        return <Video className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!application) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Application not found</h3>
            <p className="text-gray-600 mb-6">
              The application you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link href="/applications">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Applications
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {application.jobInfo?.title || 'Application Details'}
              </h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>{application.companyInfo?.name || 'Unknown Company'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Applied {formatDateShort(application.createdAt || application.submittedAt)}</span>
                </div>
              </div>
            </div>

            <Badge className={`${getStatusColor(application.status)} flex items-center space-x-1`}>
              {getStatusIcon(application.status)}
              <span className="capitalize">
                {application.status === 'accepted'
                  ? 'Offer Accepted'
                  : application.status.replace('_', ' ')
                }
              </span>
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
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
                              event.status === 'submitted' ? 'bg-blue-500' :
                              event.status === 'shortlisted' ? 'bg-yellow-500' :
                              event.status === 'pending_acceptance' ? 'bg-green-500' :
                              event.status === 'accepted' ? 'bg-green-600' :
                              event.status === 'rejected' ? 'bg-red-500' :
                              'bg-gray-400'
                            }`} />
                            {index < application.statusHistory.length - 1 && (
                              <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                            )}
                          </div>

                          {/* Timeline content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900 capitalize">
                                {event.status.replace('_', ' ')}
                              </h4>
                              <time className="text-xs text-gray-500">
                                {formatDate(event.changedAt)}
                              </time>
                            </div>
                            <Badge
                              variant="outline"
                              className={`mt-1 text-xs ${
                                event.status === 'submitted' ? 'border-blue-200 text-blue-700' :
                                event.status === 'shortlisted' ? 'border-yellow-200 text-yellow-700' :
                                event.status === 'pending_acceptance' ? 'border-green-200 text-green-700' :
                                event.status === 'accepted' ? 'border-green-200 text-green-800' :
                                event.status === 'rejected' ? 'border-red-200 text-red-700' :
                                'border-gray-200 text-gray-700'
                              }`}
                            >
                              {event.status === 'submitted' ? 'Application Submitted' :
                               event.status === 'shortlisted' ? 'Shortlisted for Review' :
                               event.status === 'pending_acceptance' ? 'Pending Acceptance' :
                               event.status === 'accepted' ? 'Offer Accepted' :
                               event.status === 'rejected' ? 'Application Rejected' :
                               event.status.charAt(0).toUpperCase() + event.status.slice(1).replace('_', ' ')
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

            {/* Interview Details */}
            {application.interviewDetails && (
              <Card>
                <CardHeader>
                  <CardTitle>Interview Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Type</label>
                        <p className="capitalize">{application.interviewDetails.type}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Duration</label>
                        <p>{application.interviewDetails.duration} minutes</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Date & Time</label>
                        <p>{formatDate(application.interviewDetails.scheduledDate)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Status</label>
                        <Badge variant="outline" className="capitalize">
                          {application.interviewDetails.status}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <label className="text-sm font-medium text-gray-600">Interviewer</label>
                      <div className="mt-1">
                        <p className="font-medium">{application.interviewDetails.interviewer.name}</p>
                        <p className="text-sm text-gray-600">{application.interviewDetails.interviewer.title}</p>
                        <p className="text-sm text-gray-600">{application.interviewDetails.interviewer.email}</p>
                      </div>
                    </div>

                    {application.interviewDetails.meetingLink && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Meeting Link</label>
                        <div className="mt-1">
                          <a
                            href={application.interviewDetails.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                          >
                            <Video className="h-4 w-4" />
                            <span>Join Interview</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    )}

                    {application.interviewDetails.notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Notes</label>
                        <p className="mt-1 text-gray-900">{application.interviewDetails.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Offer Details */}
            {application.offerDetails && (
              <Card>
                <CardHeader>
                  <CardTitle>Offer Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Salary</label>
                        <p className="text-lg font-semibold">
                          ${application.offerDetails.salary}/{application.offerDetails.period}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Duration</label>
                        <p>
                          {formatDateShort(application.offerDetails.startDate)} - {formatDateShort(application.offerDetails.endDate)}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <label className="text-sm font-medium text-gray-600">Benefits</label>
                      <ul className="mt-1 space-y-1">
                        {application.offerDetails.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {application.offerDetails.conditions.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Conditions</label>
                        <ul className="mt-1 space-y-1">
                          {application.offerDetails.conditions.map((condition, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                              <span>{condition}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Handle pending_acceptance status with offer validity check */}
                    {application.status === 'pending_acceptance' && (
                      <div className={`border rounded-lg p-4 ${
                        isOfferExpired(application.offerValidity)
                          ? 'bg-red-50 border-red-200'
                          : 'bg-yellow-50 border-yellow-200'
                      }`}>
                        <div className="flex items-center space-x-2 mb-2">
                          {isOfferExpired(application.offerValidity) ? (
                            <XCircle className="h-5 w-5 text-red-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                          )}
                          <span className={`font-medium ${
                            isOfferExpired(application.offerValidity)
                              ? 'text-red-800'
                              : 'text-yellow-800'
                          }`}>
                            {isOfferExpired(application.offerValidity) ? 'Offer Expired' : 'Response Required'}
                          </span>
                        </div>

                        {application.offerValidity && (
                          <p className={`text-sm mb-4 ${
                            isOfferExpired(application.offerValidity)
                              ? 'text-red-700'
                              : 'text-yellow-700'
                          }`}>
                            {isOfferExpired(application.offerValidity)
                              ? `This offer expired on ${formatDate(application.offerValidity)}`
                              : `Please respond to this offer by ${formatDate(application.offerValidity)}`
                            }
                          </p>
                        )}

                        <div className="flex space-x-3">
                          {isOfferExpired(application.offerValidity) ? (
                            <Button
                              disabled
                              className="bg-red-600 text-white cursor-not-allowed opacity-50"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Rejected (Expired)
                            </Button>
                          ) : (
                            <>
                              <Button
                                onClick={() => handleAction('accept_offer')}
                                disabled={actionLoading}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Accept Offer
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleAction('decline_offer')}
                                disabled={actionLoading}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Decline Offer
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Show rejected expired status */}
                    {application.status === 'rejected' && application.offerValidity && isOfferExpired(application.offerValidity) && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <XCircle className="h-5 w-5 text-red-600" />
                          <span className="font-medium text-red-800">Offer Expired</span>
                        </div>
                        <p className="text-sm mb-4 text-red-700">
                          This offer expired on {formatDate(new Date(application.offerValidity))}
                        </p>
                        <div className="flex space-x-3">
                          <Button
                            disabled
                            className="bg-red-600 text-white cursor-not-allowed opacity-50"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rejected (Expired)
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Original response required section for other statuses */}
                    {application.offerDetails.responseRequired && application.offerDetails.status === 'pending' && application.status !== 'pending_acceptance' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                          <span className="font-medium text-yellow-800">Response Required</span>
                        </div>
                        <p className="text-yellow-700 text-sm mb-4">
                          Please respond to this offer by {formatDate(application.offerDetails.deadline)}
                        </p>
                        <div className="flex space-x-3">
                          <Button
                            onClick={() => handleAction('accept_offer')}
                            disabled={actionLoading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Accept Offer
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleAction('decline_offer')}
                            disabled={actionLoading}
                          >
                            Decline Offer
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Accept Offer Section - Show when status is pending_acceptance */}
            {application.status === 'pending_acceptance' && (
              <Card>
                <CardHeader>
                  <CardTitle>Offer Response Required</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`border rounded-lg p-4 ${
                    isOfferExpired(application.offerValidity)
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      {isOfferExpired(application.offerValidity) ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                      <span className={`font-medium ${
                        isOfferExpired(application.offerValidity)
                          ? 'text-red-800'
                          : 'text-yellow-800'
                      }`}>
                        {isOfferExpired(application.offerValidity) ? 'Offer Expired' : 'Response Required'}
                      </span>
                    </div>

                    {application.offerValidity && (
                      <p className={`text-sm mb-4 ${
                        isOfferExpired(application.offerValidity)
                          ? 'text-red-700'
                          : 'text-yellow-700'
                      }`}>
                        {isOfferExpired(application.offerValidity)
                          ? `This offer expired on ${formatDate(application.offerValidity)}`
                          : `Please respond to this offer by ${formatDate(application.offerValidity)}`
                        }
                      </p>
                    )}

                    <div className="flex space-x-3">
                      {isOfferExpired(application.offerValidity) ? (
                        <Button
                          disabled
                          className="bg-red-600 text-white cursor-not-allowed opacity-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejected (Expired)
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleAction('accept_offer')}
                            disabled={actionLoading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept Offer
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleAction('decline_offer')}
                            disabled={actionLoading}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Decline Offer
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Accepted Offer Section - Show when status is accepted */}
            {application.status === 'accepted' && (
              <Card className="border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    Congratulations! Offer Accepted
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Internship Started!</span>
                    </div>
                    <p className="text-sm mb-4 text-green-700">
                      You have successfully accepted this job offer! Your internship has been created and you can now start your journey with {application.companyName || 'the company'}.
                    </p>
                    <div className="flex space-x-3">
                      <Button
                        disabled
                        className="bg-green-600 text-white cursor-not-allowed opacity-75"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Offer Accepted 
                      </Button>
                      <Button
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-50"
                        onClick={() => router.push('/applications')}
                      >
                        View All Applications
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rejected Offer Section - Show when status is rejected and offer was expired */}
            {application.status === 'rejected' && application.offerValidity && isOfferExpired(application.offerValidity) && (
              <Card>
                <CardHeader>
                  <CardTitle>Offer Expired</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-800">Offer Expired</span>
                    </div>
                    <p className="text-sm mb-4 text-red-700">
                      This offer expired on {formatDate(new Date(application.offerValidity))}
                    </p>
                    <div className="flex space-x-3">
                      <Button
                        disabled
                        className="bg-red-600 text-white cursor-not-allowed opacity-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejected (Expired)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Information */}
            {application.jobInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>Job Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {application.companyInfo?.company?.logo ? (
                          <img
                            src={application.companyInfo.company.logo}
                            alt={`${application.companyInfo.name} logo`}
                            className="h-8 w-8 object-contain"
                          />
                        ) : (
                          <Building2 className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{application.jobInfo.title}</h3>
                        <p className="text-sm text-gray-600">{application.companyInfo?.name}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{application.jobInfo.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          {typeof application.jobInfo.salary === 'object'
                            ? `${application.jobInfo.salary.minimum || 'N/A'} - ${application.jobInfo.salary.maximum || 'N/A'} ${application.jobInfo.salary.currency || ''}`
                            : application.jobInfo.salary || 'N/A'
                          }
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Duration: {
                          typeof application.jobInfo.duration === 'object'
                            ? `${application.jobInfo.duration.months || 'N/A'} months${application.jobInfo.duration.flexible ? ' (flexible)' : ''}`
                            : application.jobInfo.duration || 'N/A'
                        }</span>
                      </div>
                    </div>

                    <Link href={`/jobs/${application.jobId}`}>
                      <Button variant="outline" size="sm" className="w-full mt-8">
                        <FileText className="h-4 w-4 mr-2" />
                        View Job Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Offer Letter Download Button */}
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={handleDownloadOfferLetter}
                    disabled={actionLoading || (application.status !== 'pending_acceptance' && application.status !== 'accepted') || !application.offerLetterUrl}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {(application.status === 'pending_acceptance' || application.status === 'accepted') && application.offerLetterUrl
                      ? 'Download Offer Letter'
                      : 'Download Offer Letter'
                    }
                  </Button>

                  {application.status === 'rejected' && (
                    <p className="text-xs text-gray-500 text-center mt-1">
                      You have rejected this offer.
                    </p>
                  )}

                  {application.statusCode === 0 || application.statusCode === 1 || application.statusCode === 2 || application.statusCode === 3 ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => setShowWithdrawModal(true)}
                      disabled={actionLoading}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Withdraw Application
                    </Button>
                  ) : null}


                  <Link href="/applications">
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Applications
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Application Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Application Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Submitted:</span>
                    <p>{formatDate(application.createdAt || application.submittedAt)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Last Updated:</span>
                    <p>{formatDate(application.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <WithdrawalReasonModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onConfirm={async (reason) => {
          // call your action with the reason captured in the modal
          await handleAction('withdraw', reason);
          setShowWithdrawModal(false);
        }}
        title="Withdraw Application"
        subtitle="This action can’t be undone. You can optionally share a brief reason with the company."
        confirmLabel="Withdraw Application"
        />

    </AppLayout>
  );
}
