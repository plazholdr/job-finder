'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  AlertCircle,
  Building,
  Calendar,
  User
} from 'lucide-react';

interface CompanyVerification {
  id: string;
  companyId: string;
  companyName: string;
  submittedAt: Date;
  status: 'pending' | 'document_review' | 'compliance_check' | 'admin_review' | 'approved' | 'rejected';
  
  documents: {
    businessLicense: { status: 'pending' | 'verified' | 'rejected'; fileName?: string; };
    taxDocument: { status: 'pending' | 'verified' | 'rejected'; fileName?: string; };
    incorporationCertificate: { status: 'pending' | 'verified' | 'rejected'; fileName?: string; };
    proofOfAddress: { status: 'pending' | 'verified' | 'rejected'; fileName?: string; };
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

  updatedAt: Date;
}

export default function AdminCompanyVerificationsPage() {
  const [verifications, setVerifications] = useState<CompanyVerification[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<CompanyVerification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchVerifications();
  }, [filterStatus]);

  const fetchVerifications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/company/verification?status=${filterStatus}`);
      const result = await response.json();

      if (result.success) {
        setVerifications(result.data);
      } else {
        setError('Failed to load verifications');
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
      setError('Failed to load verifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecision = async (verificationId: string, decision: 'approve' | 'reject', stage: string) => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch(`/api/company/verification/${verificationId}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision,
          stage,
          notes: decisionNotes.trim() || undefined,
          rejectionReason: decision === 'reject' ? rejectionReason.trim() : undefined
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update the verification in the list
        setVerifications(prev => 
          prev.map(v => v.id === verificationId ? result.data : v)
        );
        
        // Update selected verification if it's the same one
        if (selectedVerification?.id === verificationId) {
          setSelectedVerification(result.data);
        }

        // Clear form
        setDecisionNotes('');
        setRejectionReason('');
        
        // Show success message
        alert(`Verification ${decision}d successfully`);
      } else {
        setError(result.error || 'Failed to process decision');
      }
    } catch (error) {
      console.error('Error processing decision:', error);
      setError('Failed to process decision');
    } finally {
      setIsProcessing(false);
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

  const getDocumentProgress = (documents: CompanyVerification['documents']) => {
    const total = Object.keys(documents).length;
    const verified = Object.values(documents).filter(doc => doc.status === 'verified').length;
    return `${verified}/${total}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Company Verifications</h1>
        <p className="text-gray-600 mt-2">Review and approve company registration requests</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="mb-6">
        <div className="flex gap-2">
          {['all', 'pending', 'document_review', 'compliance_check', 'admin_review'].map(status => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
            >
              {status.replace('_', ' ').toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verifications List */}
        <div className="space-y-4">
          {verifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Verifications Found</h3>
                <p className="text-gray-600">No company verifications match the current filter.</p>
              </CardContent>
            </Card>
          ) : (
            verifications.map((verification) => (
              <Card 
                key={verification.id} 
                className={`cursor-pointer transition-colors ${
                  selectedVerification?.id === verification.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedVerification(verification)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{verification.companyName}</h3>
                      <p className="text-sm text-gray-600">ID: {verification.companyId}</p>
                    </div>
                    {getStatusBadge(verification.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span>Documents: {getDocumentProgress(verification.documents)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(verification.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Verification Details */}
        <div>
          {selectedVerification ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedVerification.companyName}</span>
                  {getStatusBadge(selectedVerification.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Documents Status */}
                <div>
                  <h4 className="font-medium mb-3">Documents</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedVerification.documents).map(([key, doc]) => (
                      <div key={key} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <Badge variant={doc.status === 'verified' ? 'default' : 
                                      doc.status === 'rejected' ? 'destructive' : 'secondary'}>
                          {doc.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compliance Status */}
                <div>
                  <h4 className="font-medium mb-3">Compliance Checks</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Business Registration</span>
                      <span>{selectedVerification.complianceChecks.businessRegistrationValid ? '✓' : '○'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ID Valid</span>
                      <span>{selectedVerification.complianceChecks.taxIdValid ? '✓' : '○'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Industry Compliant</span>
                      <span>{selectedVerification.complianceChecks.industryCompliant ? '✓' : '○'}</span>
                    </div>
                  </div>
                </div>

                {/* Decision Section */}
                {selectedVerification.status === 'admin_review' && (
                  <div>
                    <h4 className="font-medium mb-3">Admin Decision</h4>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Add notes for your decision..."
                        value={decisionNotes}
                        onChange={(e) => setDecisionNotes(e.target.value)}
                      />
                      
                      <Textarea
                        placeholder="Rejection reason (if rejecting)..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDecision(selectedVerification.id, 'approve', 'admin_review')}
                          disabled={isProcessing}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDecision(selectedVerification.id, 'reject', 'admin_review')}
                          disabled={isProcessing}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Verification</h3>
                <p className="text-gray-600">Choose a company verification from the list to review details.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
