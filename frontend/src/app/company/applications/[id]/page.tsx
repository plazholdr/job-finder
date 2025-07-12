'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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

interface ApplicationDetailPageProps {
  params: { id: string };
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

  useEffect(() => {
    fetchApplication();
  }, [params.id]);

  const fetchApplication = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/company/applications/${params.id}`);
      const result = await response.json();

      if (result.success) {
        setApplication(result.data);
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

  const handleStatusUpdate = async (newStatus: string) => {
    if (!application) return;

    try {
      setIsUpdating(true);
      setError(null);

      const response = await fetch('/api/company/applications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: application.id,
          status: newStatus,
          reviewerId: 'current-user-id', // In real app, get from auth
          feedback: feedback.trim() || undefined,
          rating: rating || undefined
        }),
      });

      const result = await response.json();

      if (result.success) {
        setApplication(result.data);
        setSuccess(`Application status updated to ${newStatus.replace('_', ' ')}`);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-purple-100 text-purple-800';
      case 'interview_scheduled': return 'bg-indigo-100 text-indigo-800';
      case 'interview_completed': return 'bg-cyan-100 text-cyan-800';
      case 'offer_extended': return 'bg-green-100 text-green-800';
      case 'offer_accepted': return 'bg-emerald-100 text-emerald-800';
      case 'offer_declined': return 'bg-orange-100 text-orange-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
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
                <p className="text-sm text-gray-600">{application.candidate.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(application.status)}>
                {application.status.replace('_', ' ')}
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
                      {application.candidate.name}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <a href={`mailto:${application.candidate.email}`} className="text-blue-600 hover:underline">
                          {application.candidate.email}
                        </a>
                      </div>
                      {application.candidate.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          <a href={`tel:${application.candidate.phone}`} className="text-blue-600 hover:underline">
                            {application.candidate.phone}
                          </a>
                        </div>
                      )}
                      {application.candidate.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {application.candidate.location}
                        </div>
                      )}
                      {application.candidate.education && (
                        <div className="flex items-center">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          {application.candidate.education}
                        </div>
                      )}
                      {application.candidate.experience && (
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2" />
                          {application.candidate.experience}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {application.candidate.skills && application.candidate.skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {application.candidate.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
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
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {application.additionalDocuments && application.additionalDocuments.map((doc, index) => (
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

            {/* Review History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Review History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {application.reviewers.map((reviewer, index) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{reviewer.name}</p>
                          <p className="text-sm text-gray-600">{reviewer.role}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={
                            reviewer.status === 'approved' ? 'bg-green-100 text-green-800' :
                            reviewer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {reviewer.status}
                          </Badge>
                          {reviewer.reviewedAt && (
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(reviewer.reviewedAt).toLocaleDateString()}
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
                  ))}
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
                <Button
                  className="w-full"
                  onClick={() => handleStatusUpdate('shortlisted')}
                  disabled={isUpdating || application.status === 'shortlisted'}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Shortlist Candidate
                </Button>
                
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleStatusUpdate('interview_scheduled')}
                  disabled={isUpdating || application.status === 'interview_scheduled'}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Interview
                </Button>
                
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={isUpdating || application.status === 'rejected'}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Application
                </Button>
              </CardContent>
            </Card>

            {/* Add Review */}
            <Card>
              <CardHeader>
                <CardTitle>Add Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  {renderStarRating(rating, setRating)}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback
                  </label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Add your review comments..."
                    rows={4}
                  />
                </div>
                
                <Button
                  className="w-full"
                  onClick={() => handleStatusUpdate('reviewing')}
                  disabled={isUpdating || (!feedback.trim() && rating === 0)}
                >
                  {isUpdating ? 'Saving...' : 'Save Review'}
                </Button>
              </CardContent>
            </Card>

            {/* Application Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Application Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Application Submitted</p>
                      <p className="text-xs text-gray-500">
                        {new Date(application.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {application.reviewedAt && (
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 bg-yellow-600 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Review Started</p>
                        <p className="text-xs text-gray-500">
                          {new Date(application.reviewedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="text-xs text-gray-500">
                        {new Date(application.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
