'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Upload,
  AlertCircle,
  Eye,
  Download
} from 'lucide-react';

interface CompanyVerification {
  id: string;
  companyId: string;
  companyName: string;
  submittedAt: Date;
  status: 'pending' | 'document_review' | 'compliance_check' | 'admin_review' | 'approved' | 'rejected';
  
  documents: {
    businessLicense: {
      status: 'pending' | 'verified' | 'rejected';
      fileUrl?: string;
      fileName?: string;
      verifiedAt?: Date;
      verifiedBy?: string;
      rejectionReason?: string;
    };
    taxDocument: {
      status: 'pending' | 'verified' | 'rejected';
      fileUrl?: string;
      fileName?: string;
      verifiedAt?: Date;
      verifiedBy?: string;
      rejectionReason?: string;
    };
    incorporationCertificate: {
      status: 'pending' | 'verified' | 'rejected';
      fileUrl?: string;
      fileName?: string;
      verifiedAt?: Date;
      verifiedBy?: string;
      rejectionReason?: string;
    };
    proofOfAddress: {
      status: 'pending' | 'verified' | 'rejected';
      fileUrl?: string;
      fileName?: string;
      verifiedAt?: Date;
      verifiedBy?: string;
      rejectionReason?: string;
    };
  };

  complianceChecks: {
    businessRegistrationValid: boolean;
    taxIdValid: boolean;
    industryCompliant: boolean;
    addressVerified: boolean;
    legalRequirementsMet: boolean;
    checkedAt?: Date;
    checkedBy?: string;
    notes?: string;
  };

  adminReview: {
    status: 'pending' | 'approved' | 'rejected';
    reviewedAt?: Date;
    reviewedBy?: string;
    decision?: 'approve' | 'reject' | 'request_more_info';
    notes?: string;
    rejectionReason?: string;
  };

  timeline: Array<{
    id: string;
    timestamp: Date;
    action: string;
    description: string;
    performedBy: string;
    status: string;
  }>;

  updatedAt: Date;
}

export default function CompanyVerificationPage() {
  const [verification, setVerification] = useState<CompanyVerification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In real app, get company ID from auth
      const response = await fetch('/api/company/verification?companyId=company-1');
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        setVerification(result.data[0]); // Get the latest verification
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
      setError('Failed to load verification status');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      document_review: { color: 'bg-blue-100 text-blue-800', icon: FileText },
      compliance_check: { color: 'bg-purple-100 text-purple-800', icon: AlertCircle },
      admin_review: { color: 'bg-orange-100 text-orange-800', icon: Eye },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Verification Process Found</h3>
            <p className="text-gray-600 mb-4">Your company verification process hasn't been initiated yet.</p>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Start Verification Process
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Company Verification</h1>
        <p className="text-gray-600 mt-2">Track your company verification progress</p>
      </div>

      {/* Status Overview */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Verification Status</CardTitle>
            {getStatusBadge(verification.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Object.values(verification.documents).filter(doc => doc.status === 'verified').length}/4
              </div>
              <div className="text-sm text-gray-600">Documents Verified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {verification.complianceChecks.legalRequirementsMet ? '✓' : '○'}
              </div>
              <div className="text-sm text-gray-600">Compliance Check</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {verification.adminReview.status === 'approved' ? '✓' : '○'}
              </div>
              <div className="text-sm text-gray-600">Admin Approval</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(verification.documents).map(([key, doc]) => (
              <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getDocumentStatusIcon(doc.status)}
                  <div>
                    <div className="font-medium">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                    {doc.fileName && (
                      <div className="text-sm text-gray-600">{doc.fileName}</div>
                    )}
                    {doc.rejectionReason && (
                      <div className="text-sm text-red-600">{doc.rejectionReason}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.fileUrl && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  )}
                  {doc.status === 'rejected' && (
                    <Button size="sm">
                      <Upload className="h-4 w-4 mr-1" />
                      Re-upload
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {verification.timeline.map((entry, index) => (
              <div key={entry.id} className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{entry.description}</p>
                    <time className="text-sm text-gray-500">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </time>
                  </div>
                  <p className="text-sm text-gray-600">
                    Performed by {entry.performedBy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
