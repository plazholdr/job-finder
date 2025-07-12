"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth, withAuth } from '@/contexts/auth-context';
import { ArrowLeft, MapPin, Calendar, DollarSign, Clock, Users, Eye, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import UserProfile from '@/components/UserProfile';
import Link from 'next/link';

interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string;
  location?: string; // Optional since it's not in backend schema
  remoteWork?: boolean; // Optional since it's not in backend schema
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
    certifications: string[];
  };
  salary: {
    minimum: number | null;
    maximum: number | null;
    currency: string;
    negotiable: boolean;
    type: string;
  };
  duration: {
    months: number | null;
    startDate: string | null;
    endDate: string | null;
    flexible: boolean;
  };
  attachments: Array<{
    fileName?: string;
    originalName?: string;
    filename?: string;
    publicUrl?: string;
    url?: string;
    size: number;
    mimeType?: string;
    uploadedAt: string;
  }>;
  status: string;
  views: number;
  applications: number;
  createdAt: string;
  updatedAt: string;
  statusHistory: Array<{
    status: string;
    changedAt: string;
    changedBy: string;
    reason: string;
  }>;
  rejectionReason?: string;
}

function JobViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      if (!token || !id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/jobs/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const jobData = await response.json();
          console.log('Job data received:', jobData);
          setJob(jobData);
        } else {
          setError('Failed to fetch job details');
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        setError('An error occurred while fetching job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [token, id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSalary = (salary: Job['salary']) => {
    if (!salary.minimum) return 'Not specified';
    
    const min = `RM ${salary.minimum.toLocaleString()}`;
    const max = salary.maximum ? ` - RM ${salary.maximum.toLocaleString()}` : '+';
    const period = salary.type === 'monthly' ? '/month' : salary.type === 'yearly' ? '/year' : '/hour';
    const negotiable = salary.negotiable ? ' (negotiable)' : '';
    
    return `${min}${max}${period}${negotiable}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Closed': return 'bg-blue-100 text-blue-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Job Not Found</h1>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-4">{error || 'The job you are looking for does not exist.'}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Job Details</h1>
                <p className="text-gray-600 mt-1">View job listing information</p>
              </div>
            </div>
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{job.title}</CardTitle>
                    <CardDescription className="text-lg mt-2">
                      {job.duration?.months} month internship
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(job.status)}>
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span>
                      {job.remoteWork ? 'Remote' :
                       job.location ||
                       'Location to be specified'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <span>{formatSalary(job.salary)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span>Posted {formatDate(job.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{job.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{job.requirements}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.skills.technical.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Technical Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.technical.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {job.skills.soft.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Soft Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.soft.map((skill, index) => (
                        <Badge key={index} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {job.skills.languages.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.languages.map((language, index) => (
                        <Badge key={index} variant="outline">{language}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Job Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Views</span>
                  </div>
                  <span className="font-medium">{job.views}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Applications</span>
                  </div>
                  <span className="font-medium">{job.applications}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm">{formatDate(job.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm">{formatDate(job.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Attachments */}
            {job.attachments && job.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {job.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {attachment.originalName || attachment.fileName || attachment.filename || attachment.name || 'Unnamed file'}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            console.log('Attachment data:', attachment);
                            const filename = attachment.originalName || attachment.fileName || attachment.filename || attachment.name || 'download';
                            const fileName = attachment.fileName || attachment.filename;

                            console.log('Using fileName for download:', fileName);

                            if (!fileName) {
                              console.error('No fileName found for attachment:', attachment);
                              alert('Unable to download file - no fileName found');
                              return;
                            }

                            try {
                              console.log('Token available:', !!token);
                              console.log('Token length:', token?.length);

                              // Get download URL from backend
                              const encodedFileName = encodeURIComponent(fileName);
                              console.log('Encoded fileName:', encodedFileName);
                              const response = await fetch(`/api/jobs/${job._id}/attachments/${encodedFileName}/download`, {
                                headers: {
                                  'Authorization': `Bearer ${token}`,
                                },
                              });

                              console.log('Download response status:', response.status);

                              if (!response.ok) {
                                const errorData = await response.json();
                                console.error('Download error response:', errorData);
                                throw new Error(errorData.error || 'Failed to get download URL');
                              }

                              const { downloadUrl } = await response.json();

                              // Create a temporary link to download the file
                              const link = document.createElement('a');
                              link.href = downloadUrl;
                              link.download = filename;
                              link.target = '_blank';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            } catch (error) {
                              console.error('Download failed:', error);
                              alert('Failed to download file. Please try again.');
                            }
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(JobViewPage);
