'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchApplicationDetails();
    }
  }, [params.id]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/applications/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setApplication(data.data);
      } else {
        console.error('Failed to fetch application details:', data.error);
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!application) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/applications/${application.id}/pdf`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `application_${application.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to download PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    if (!application) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/applications/${application.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (data.success) {
        setApplication(data.data);
        // Show success message
      } else {
        console.error('Failed to update application:', data.error);
      }
    } catch (error) {
      console.error('Error updating application:', error);
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
        return 'bg-green-100 text-green-800';
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
                {application.job?.title || 'Application Details'}
              </h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>{application.job?.company?.name || application.job?.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Applied {formatDateShort(application.submittedAt)}</span>
                </div>
              </div>
            </div>

            <Badge className={`${getStatusColor(application.status)} flex items-center space-x-1`}>
              {getStatusIcon(application.status)}
              <span className="capitalize">{application.status.replace('_', ' ')}</span>
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
                {application.timeline && application.timeline.length > 0 ? (
                  <div className="space-y-6">
                    {application.timeline
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((event, index) => (
                        <div key={event.id} className="flex space-x-4">
                          <div className="flex flex-col items-center">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {getStatusIcon(event.status)}
                            </div>
                            {index < application.timeline!.length - 1 && (
                              <div className="w-px h-12 bg-gray-200 mt-2"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-8">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-gray-900">{event.title}</h4>
                              <span className="text-sm text-gray-500">
                                {formatDate(event.timestamp)}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                            {event.actorName && (
                              <p className="text-xs text-gray-500">
                                by {event.actorName}
                              </p>
                            )}
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

                    {application.offerDetails.responseRequired && application.offerDetails.status === 'pending' && (
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Information */}
            {application.job && (
              <Card>
                <CardHeader>
                  <CardTitle>Job Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {application.job.logo ? (
                          <img
                            src={application.job.logo}
                            alt={`${application.job.company?.name || application.job.name} logo`}
                            className="h-8 w-8 object-contain"
                          />
                        ) : (
                          <Building2 className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{application.job.title}</h3>
                        <p className="text-sm text-gray-600">{application.job.company?.name || application.job.name}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{application.job.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>{application.job.salaryRange}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Deadline: {formatDateShort(application.job.deadline)}</span>
                      </div>
                    </div>

                    <Link href={`/jobs/${application.job.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
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
                  {/* PDF Download Button */}
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={handleDownloadPDF}
                    disabled={actionLoading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>

                  {application.status === 'applied' || application.status === 'reviewed' ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => handleAction('withdraw')}
                      disabled={actionLoading}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Withdraw Application
                    </Button>
                  ) : null}

                  <Link href="/applications">
                    <Button variant="outline" size="sm" className="w-full">
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
                    <p>{formatDate(application.submittedAt)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Last Updated:</span>
                    <p>{formatDate(application.updatedAt)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Application ID:</span>
                    <p className="font-mono text-xs">{application.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
