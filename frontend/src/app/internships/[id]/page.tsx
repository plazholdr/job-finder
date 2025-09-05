'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Calendar,
  Clock,
  FileText,
  Download,
  Building2,
  CheckCircle,
  AlertCircle,
  Star,
  MessageSquare,
  Loader2,
  X,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import MainNavigation from '@/components/navigation/MainNavigation';

interface InternshipRecord {
  _id: string;
  userId: string;
  jobId: string;
  companyId: string;
  applicationId: string;
  position: string;
  department?: string;
  description: string;
  location: string;
  workType: string;
  duration?: string;
  stipend?: number;
  startDate: string;
  endDate?: string;
  status: string;
  internshipStatus: string;
  letterOfOffer?: string;
  onboardingMaterialUrl?: string;
  review?: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
  userInfo?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  jobInfo?: {
    title: string;
    department?: string;
    location: string;
  };
  applicationInfo?: {
    submittedAt: string;
    status: string;
  };
}

export default function StudentInternshipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [internship, setInternship] = useState<InternshipRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Complete in advance dialog state
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completeRemark, setCompleteRemark] = useState('');
  const [isSubmittingComplete, setIsSubmittingComplete] = useState(false);

  // Terminate internship dialog state
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [terminateRemark, setTerminateRemark] = useState('');
  const [isSubmittingTerminate, setIsSubmittingTerminate] = useState(false);

  const internshipId = params.id as string;

  useEffect(() => {
    if (internshipId) {
      fetchInternship();
    }
  }, [internshipId]);

  const fetchInternship = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`/api/internships/${internshipId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        console.log('Internship data received:', result.data);
        setInternship(result.data);
      } else {
        setError('Internship record not found');
      }
    } catch (error) {
      console.error('Error fetching internship:', error);
      setError('Failed to load internship details');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format dates safely
  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Helper function to safely render any value
  const safeRender = (value: any) => {
    if (value === null || value === undefined) return 'Not specified';
    if (typeof value === 'object') {
      // If it's an object, try to extract meaningful information
      if (value.months) return `${value.months} months`;
      if (value.weeks) return `${value.weeks} weeks`;
      if (value.duration) return value.duration;
      if (value.value) return value.value;
      return 'Not specified';
    }
    return String(value);
  };

  const handleDownloadOnboardingMaterial = async () => {
    if (!internship?.onboardingMaterialUrl) return;

    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`/api/internships/${internshipId}/onboarding-materials/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `onboarding-materials-${internshipId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setSuccess('Onboarding materials downloaded successfully');
      } else {
        setError('Failed to download onboarding materials');
      }
    } catch (error) {
      console.error('Error downloading onboarding materials:', error);
      setError('Failed to download onboarding materials');
    }
  };

  const handleDownloadOfferLetter = async () => {
    if (!internship?.letterOfOffer || !internship?.applicationId) return;

    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`/api/applications/${internship.applicationId}/offer-letter/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `offer-letter-${internship.applicationId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setSuccess('Offer letter downloaded successfully');
      } else {
        setError('Failed to download offer letter');
      }
    } catch (error) {
      console.error('Error downloading offer letter:', error);
      setError('Failed to download offer letter');
    }
  };

  const handleCompleteInAdvance = async () => {
    if (!internship || !completeRemark.trim()) {
      setError('Please provide a completion remark');
      return;
    }

    try {
      setIsSubmittingComplete(true);
      const token = localStorage.getItem('authToken');

      const requestData = {
        internshipId: internship._id,
        completionRemark: completeRemark.trim(),
        type: 'complete_in_advance'
      };

      console.log('🚀 Submitting complete request:', requestData);
      console.log('🔑 Auth token exists:', !!token);

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      console.log('Complete request response:', result);
      console.log('Response status:', response.status);

      if (result.success) {
        setSuccess('Request to complete internship in advance submitted successfully');
        setShowCompleteDialog(false);
        setCompleteRemark('');
      } else {
        console.error('Request failed:', result);
        setError(result.error || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting complete request:', error);
      setError('Failed to submit request');
    } finally {
      setIsSubmittingComplete(false);
    }
  };

  const handleTerminateInternship = async () => {
    if (!internship || !terminateRemark.trim()) {
      setError('Please provide a termination reason');
      return;
    }

    try {
      setIsSubmittingTerminate(true);
      const token = localStorage.getItem('authToken');

      const requestData = {
        internshipId: internship._id,
        completionRemark: terminateRemark.trim(),
        type: 'terminate'
      };

      console.log('🚀 Submitting terminate request:', requestData);
      console.log('🔑 Auth token exists:', !!token);

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      console.log('Terminate request response:', result);
      console.log('Response status:', response.status);

      if (result.success) {
        setSuccess('Request to terminate internship submitted successfully');
        setShowTerminateDialog(false);
        setTerminateRemark('');
      } else {
        console.error('Request failed:', result);
        setError(result.error || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting terminate request:', error);
      setError('Failed to submit request');
    } finally {
      setIsSubmittingTerminate(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading internship details...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Internship not found</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Completion Congratulations */}
        {internship?.internshipStatus === 'completed' && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Congratulations you have completed the internship!
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Internship Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Internship Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5" />
                    <span>Internship Overview</span>
                  </CardTitle>
                  <Badge
                    className={`${
                      internship.internshipStatus === 'ongoing' || internship.internshipStatus === 'active'
                        ? 'bg-green-100 text-green-800'
                        : internship.internshipStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : internship.internshipStatus === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {safeRender(internship.internshipStatus)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{safeRender(internship.position)}</h3>
                  {internship.department && (
                    <p className="text-gray-600">{safeRender(internship.department)}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{safeRender(internship.location)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-sm capitalize">{safeRender(internship.workType)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {formatDate(internship.startDate)}
                      {internship.endDate && ` - ${formatDate(internship.endDate)}`}
                    </span>
                  </div>
                  {internship.duration && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{safeRender(internship.duration)}</span>
                    </div>
                  )}
                </div>

                {internship.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600 text-sm">{safeRender(internship.description)}</p>
                  </div>
                )}

                {internship.remarks && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                    <p className="text-gray-600 text-sm">{safeRender(internship.remarks)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Documents & Actions */}
          <div className="space-y-6">
            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Documents</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Offer Letter */}
                {internship.letterOfOffer && (
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Offer Letter</p>
                        <p className="text-xs text-gray-600">PDF Document</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadOfferLetter}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Onboarding Materials */}
                {internship.onboardingMaterialUrl && (
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Onboarding Materials</p>
                        <p className="text-xs text-gray-600">PDF Document</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadOnboardingMaterial}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {!internship.letterOfOffer && !internship.onboardingMaterialUrl && (
                  <div className="text-center p-6">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No documents available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Internship Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Internship Started</p>
                      <p className="text-xs text-gray-600">
                        {formatDate(internship.startDate)}
                      </p>
                    </div>
                  </div>

                  {internship.endDate && (
                    <div className="flex items-start space-x-3">
                      <div className="h-2 w-2 bg-blue-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Expected End Date</p>
                        <p className="text-xs text-gray-600">
                          {formatDate(internship.endDate)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-gray-400 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Created</p>
                      <p className="text-xs text-gray-600">
                        {formatDate(internship.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/applications">
                  <Button variant="outline" className="w-full justify-start">
                    <Briefcase className="h-4 w-4 mr-2" />
                    View All Applications
                  </Button>
                </Link>

                <Link href="/jobs">
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="h-4 w-4 mr-2" />
                    Browse More Opportunities
                  </Button>
                </Link>

                {internship.internshipStatus === 'active' || internship.internshipStatus === 'ongoing' ? (
                  <>
                    <Button variant="outline" className="w-full justify-start" disabled>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Supervisor
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => setShowCompleteDialog(true)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete in Advance
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setShowTerminateDialog(true)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Terminate Internship
                    </Button>
                  </>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Complete in Advance Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Complete Internship in Advance</span>
            </DialogTitle>
            <DialogDescription>
              Submit a request to complete your internship before the scheduled end date. Please provide a reason for early completion.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="complete-remark">Completion Remark *</Label>
              <Textarea
                id="complete-remark"
                placeholder="Please explain why you want to complete the internship early..."
                value={completeRemark}
                onChange={(e) => setCompleteRemark(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCompleteDialog(false);
                setCompleteRemark('');
              }}
              disabled={isSubmittingComplete}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteInAdvance}
              disabled={isSubmittingComplete || !completeRemark.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmittingComplete ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terminate Internship Dialog */}
      <Dialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Terminate Internship</span>
            </DialogTitle>
            <DialogDescription>
              Submit a request to terminate your internship. This action requires approval from your company. Please provide a detailed reason.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="terminate-remark">Termination Reason *</Label>
              <Textarea
                id="terminate-remark"
                placeholder="Please explain why you want to terminate the internship..."
                value={terminateRemark}
                onChange={(e) => setTerminateRemark(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTerminateDialog(false);
                setTerminateRemark('');
              }}
              disabled={isSubmittingTerminate}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTerminateInternship}
              disabled={isSubmittingTerminate || !terminateRemark.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmittingTerminate ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
