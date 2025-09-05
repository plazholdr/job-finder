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
  Upload,
  X,
  Loader2
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

export default function InternshipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [internship, setInternship] = useState<InternshipRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload onboarding materials state
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Complete internship state
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completeReview, setCompleteReview] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  // Terminate internship state
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [terminateReason, setTerminateReason] = useState('');
  const [isTerminating, setIsTerminating] = useState(false);

  const [success, setSuccess] = useState<string | null>(null);

  const userId = params.userId as string;

  useEffect(() => {
    if (userId) {
      fetchInternship();
    }
  }, [userId]);

  const fetchInternship = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`/api/internships?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success && result.data.length > 0) {
        // Get the first internship for this user (should be only one per company)
        setInternship(result.data[0]);
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

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'Not specified';
    if (typeof value === 'object') {
      // Handle duration object specifically
      if (value.months !== undefined) {
        const months = value.months || 0;
        const startDate = value.startDate;
        const endDate = value.endDate;
        const flexible = value.flexible;

        let durationText = '';
        if (months > 0) {
          durationText = `${months} month${months > 1 ? 's' : ''}`;
        }
        if (flexible) {
          durationText += ' (flexible)';
        }
        return durationText || 'Not specified';
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed for onboarding materials');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUploadOnboardingMaterials = async () => {
    if (!selectedFile || !internship) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`/api/internships/${internship._id}/upload-onboarding`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const uploadedFile = await response.json();

      setSuccess('Onboarding materials uploaded successfully!');
      setShowUploadDialog(false);
      setSelectedFile(null);
      fetchInternship(); // Refresh data
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Onboarding materials upload error:', error);
      setError('Failed to upload onboarding materials. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCompleteInternship = async () => {
    if (!internship || !completeReview.trim()) return;

    setIsCompleting(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`/api/internships/${internship._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          internshipStatus: 'completed',
          review: completeReview,
          endDate: new Date().toISOString()
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Internship completed successfully!');
        setShowCompleteDialog(false);
        setCompleteReview('');
        fetchInternship(); // Refresh data
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to complete internship');
      }
    } catch (error) {
      console.error('Error completing internship:', error);
      setError('Failed to complete internship');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleTerminateInternship = async () => {
    if (!internship || !terminateReason.trim()) return;

    setIsTerminating(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`/api/internships/${internship._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          internshipStatus: 'terminated',
          remarks: terminateReason,
          endDate: new Date().toISOString()
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Internship terminated successfully!');
        setShowTerminateDialog(false);
        setTerminateReason('');
        fetchInternship(); // Refresh data
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to terminate internship');
      }
    } catch (error) {
      console.error('Error terminating internship:', error);
      setError('Failed to terminate internship');
    } finally {
      setIsTerminating(false);
    }
  };

  const handleDownloadOfferLetter = async () => {
    try {
      if (!internship?.applicationId) {
        setError('Application ID not found');
        return;
      }

      console.log('🔍 Downloading offer letter for application:', internship.applicationId);
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
        a.style.display = 'none';
        a.href = url;
        a.download = `offer-letter-${internship.applicationId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to download offer letter');
      }
    } catch (error) {
      console.error('❌ Error downloading offer letter:', error);
      setError('Failed to download offer letter');
    }
  };

  const handleDownloadOnboardingMaterials = async () => {
    try {
      if (!internship?._id) {
        setError('Internship ID not found');
        return;
      }

      console.log('🔍 Downloading onboarding materials for internship:', internship._id);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`/api/internships/${internship._id}/onboarding-materials/download`, {
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
        a.download = `onboarding-materials-${internship._id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to download onboarding materials');
      }
    } catch (error) {
      console.error('❌ Error downloading onboarding materials:', error);
      setError('Failed to download onboarding materials');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavigation />
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading internship details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavigation />
        <div className="container mx-auto p-6">
          <Alert className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Internship not found'}
            </AlertDescription>
          </Alert>
          <div className="text-center mt-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Success Message */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {formatValue(internship.userInfo?.firstName)} {formatValue(internship.userInfo?.lastName)}
              </h1>
              <p className="text-gray-600">{formatValue(internship.position)} Internship</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={getStatusColor(formatValue(internship.internshipStatus))}>
              {formatValue(internship.internshipStatus).charAt(0).toUpperCase() + formatValue(internship.internshipStatus).slice(1)}
            </Badge>

            {/* Action Buttons - only show if internship is ongoing */}
            {formatValue(internship.internshipStatus) === 'ongoing' && (
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowCompleteDialog(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Complete Internship
                </Button>
                <Button
                  onClick={() => setShowTerminateDialog(true)}
                  variant="destructive"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-1" />
                  Terminate Internship
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Intern Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Intern Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{formatValue(internship.userInfo?.email)}</p>
                    </div>
                  </div>
                  
                  {internship.userInfo?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Phone</p>
                        <p className="text-sm text-gray-600">{formatValue(internship.userInfo.phone)}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Location</p>
                      <p className="text-sm text-gray-600">{formatValue(internship.location)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Work Type</p>
                      <p className="text-sm text-gray-600 capitalize">{formatValue(internship.workType)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Internship Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Internship Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Position</h4>
                  <p className="text-gray-600">{formatValue(internship.position)}</p>
                </div>
                
                {internship.department && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Department</h4>
                    <p className="text-gray-600">{formatValue(internship.department)}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{formatValue(internship.description)}</p>
                </div>
                
                {internship.remarks && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Remarks</h4>
                    <p className="text-gray-600">{formatValue(internship.remarks)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Start Date</p>
                    <p className="text-sm text-gray-600">{formatDate(internship.startDate)}</p>
                  </div>
                </div>
                
                {internship.endDate && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">End Date</p>
                      <p className="text-sm text-gray-600">{formatDate(internship.endDate)}</p>
                    </div>
                  </div>
                )}
                
                {internship.duration && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Duration</p>
                      <p className="text-sm text-gray-600">{formatValue(internship.duration)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {internship.letterOfOffer && (
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm flex-1">Offer Letter</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownloadOfferLetter}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {internship.onboardingMaterialUrl ? (
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm flex-1">Onboarding Materials</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownloadOnboardingMaterials}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2 border rounded border-dashed">
                    <Upload className="h-4 w-4 text-blue-500" />
                    <span className="text-sm flex-1 text-blue-600">Upload Onboarding Materials</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowUploadDialog(true)}
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Upload Onboarding Materials Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload Onboarding Materials
            </DialogTitle>
            <DialogDescription>
              Upload PDF documents for the intern's onboarding process.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="onboarding-file">Select PDF File</Label>
              <div className="mt-2">
                <input
                  type="file"
                  id="onboarding-file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('onboarding-file')?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose PDF File
                </Button>
              </div>
              {selectedFile && (
                <div className="mt-2 p-2 bg-gray-50 rounded border">
                  <p className="text-sm text-gray-700">
                    Selected: {selectedFile.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUploadDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadOnboardingMaterials}
              disabled={!selectedFile || isUploading}
            >
              {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Internship Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Complete Internship
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this internship as completed? Please provide a review of the intern's performance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="complete-review">Performance Review</Label>
              <Textarea
                id="complete-review"
                placeholder="Write a review of the intern's performance, achievements, and overall contribution..."
                value={completeReview}
                onChange={(e) => setCompleteReview(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCompleteInternship}
              disabled={!completeReview.trim() || isCompleting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCompleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isCompleting ? 'Completing...' : 'Complete Internship'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terminate Internship Dialog */}
      <Dialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <X className="h-5 w-5 mr-2 text-red-600" />
              Terminate Internship
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to terminate this internship? Please provide a reason for termination.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="terminate-reason">Reason for Termination</Label>
              <Textarea
                id="terminate-reason"
                placeholder="Provide the reason for terminating this internship..."
                value={terminateReason}
                onChange={(e) => setTerminateReason(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTerminateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleTerminateInternship}
              disabled={!terminateReason.trim() || isTerminating}
              variant="destructive"
            >
              {isTerminating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isTerminating ? 'Terminating...' : 'Terminate Internship'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
