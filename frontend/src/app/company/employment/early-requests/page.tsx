'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  User, 
  Calendar, 
  MapPin, 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Eye,
  MessageSquare,
  History
} from 'lucide-react';

interface EarlyRequest {
  id: string;
  requestType: 'early_completion' | 'early_termination';
  employeeInfo: {
    employeeId: string;
    employeeName: string;
    email: string;
    position: string;
    department: string;
    startDate: Date;
    originalEndDate: Date;
    currentStatus: string;
    supervisor: string;
  };
  requestInfo: {
    requestDate: Date;
    reason: string;
    proposedEndDate: Date;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    additionalNotes?: string;
  };
  requestStatus: 'pending' | 'under_review' | 'approved' | 'rejected' | 'cancelled';
  statusUpdateHistory: Array<{
    status: string;
    updatedBy: string;
    updatedDate: Date;
    notes?: string;
  }>;
  remarkHistory: Array<{
    remark: string;
    addedBy: string;
    addedDate: Date;
    type: string;
  }>;
  reviewContext?: {
    canApprove: boolean;
    daysUntilOriginalEnd: number;
    daysEarlyRequested: number;
    timeInPosition: number;
  };
}

export default function EarlyRequestsPage() {
  const [requests, setRequests] = useState<EarlyRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<EarlyRequest | null>(null);
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [decision, setDecision] = useState<'approve' | 'reject' | ''>('');
  const [rejectionRemark, setRejectionRemark] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/company/employment/early-requests');
      const result = await response.json();

      if (result.success) {
        setRequests(result.data);
      } else {
        setError(result.error || 'Failed to fetch requests');
      }
    } catch (error) {
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/company/employment/early-requests/${requestId}/decision`);
      const result = await response.json();

      if (result.success) {
        setSelectedRequest(result.data);
      } else {
        setError(result.error || 'Failed to fetch request details');
      }
    } catch (error) {
      setError('Failed to fetch request details');
    }
  };

  const handleMakeDecision = () => {
    if (!selectedRequest) return;
    setShowDecisionDialog(true);
    setDecision('');
    setRejectionRemark('');
    setAdminNotes('');
    setEffectiveDate('');
  };

  const submitDecision = async () => {
    if (!selectedRequest || !decision) return;

    if (decision === 'reject' && !rejectionRemark.trim()) {
      setError('Rejection remark is required when rejecting a request');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const response = await fetch(`/api/company/employment/early-requests/${selectedRequest.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          rejectionRemark: decision === 'reject' ? rejectionRemark : undefined,
          adminNotes,
          effectiveDate: effectiveDate || undefined,
          reviewedBy: 'Company Admin' // In real app, get from auth
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`Request ${decision}d successfully`);
        setShowDecisionDialog(false);
        setSelectedRequest(result.data);
        fetchRequests(); // Refresh the list
      } else {
        setError(result.error || 'Failed to process decision');
      }
    } catch (error) {
      setError('Failed to process decision');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      under_review: { color: 'bg-blue-100 text-blue-800', icon: Eye },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
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

  const getUrgencyBadge = (urgency: string) => {
    const urgencyConfig = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={urgencyConfig[urgency as keyof typeof urgencyConfig] || urgencyConfig.medium}>
        {urgency.toUpperCase()}
      </Badge>
    );
  };

  const filteredRequests = requests.filter(request => {
    if (activeTab === 'all') return true;
    return request.requestStatus === activeTab;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading early requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Early Completion/Termination Requests</h1>
          <p className="text-gray-600 mt-2">Review and manage employee early completion and termination requests</p>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="under_review">Under Review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No {activeTab === 'all' ? '' : activeTab} requests found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {request.employeeInfo.employeeName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {request.employeeInfo.position}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {request.employeeInfo.department}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {getStatusBadge(request.requestStatus)}
                        {getUrgencyBadge(request.requestInfo.urgency)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Request Type</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {request.requestType.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Request Date</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(request.requestInfo.requestDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Proposed End Date</p>
                        <p className="text-sm text-gray-600">
                          {new Date(request.requestInfo.proposedEndDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Original End Date</p>
                        <p className="text-sm text-gray-600">
                          {new Date(request.employeeInfo.originalEndDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Reason</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {request.requestInfo.reason}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewRequest(request.id)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                      
                      {request.requestStatus === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            handleMakeDecision();
                          }}
                          className="flex items-center gap-1"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Make Decision
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Request Details Dialog */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {selectedRequest.employeeInfo.employeeName} - Request Details
              </DialogTitle>
              <DialogDescription>
                {selectedRequest.requestType.replace('_', ' ')} request submitted on{' '}
                {new Date(selectedRequest.requestInfo.requestDate).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Employee Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Employee Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {selectedRequest.employeeInfo.employeeName}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedRequest.employeeInfo.email}
                  </div>
                  <div>
                    <span className="font-medium">Position:</span> {selectedRequest.employeeInfo.position}
                  </div>
                  <div>
                    <span className="font-medium">Department:</span> {selectedRequest.employeeInfo.department}
                  </div>
                  <div>
                    <span className="font-medium">Supervisor:</span> {selectedRequest.employeeInfo.supervisor}
                  </div>
                  <div>
                    <span className="font-medium">Current Status:</span> {selectedRequest.employeeInfo.currentStatus}
                  </div>
                </div>
              </div>

              {/* Request Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Request Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Reason:</span>
                    <p className="mt-1 p-2 bg-gray-50 rounded text-sm">{selectedRequest.requestInfo.reason}</p>
                  </div>
                  {selectedRequest.requestInfo.additionalNotes && (
                    <div>
                      <span className="font-medium">Additional Notes:</span>
                      <p className="mt-1 p-2 bg-gray-50 rounded text-sm">{selectedRequest.requestInfo.additionalNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline Information */}
              {selectedRequest.reviewContext && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Timeline Analysis</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedRequest.reviewContext.timeInPosition}
                      </div>
                      <div className="text-blue-800">Days in Position</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded">
                      <div className="text-2xl font-bold text-orange-600">
                        {selectedRequest.reviewContext.daysEarlyRequested}
                      </div>
                      <div className="text-orange-800">Days Early Requested</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedRequest.reviewContext.daysUntilOriginalEnd}
                      </div>
                      <div className="text-green-800">Days Until Original End</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Status History */}
              {selectedRequest.statusUpdateHistory.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Status History
                  </h3>
                  <div className="space-y-2">
                    {selectedRequest.statusUpdateHistory.map((update, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded text-sm">
                        <div className="font-medium">{update.status}</div>
                        <div className="text-gray-600">by {update.updatedBy}</div>
                        <div className="text-gray-500">
                          {new Date(update.updatedDate).toLocaleString()}
                        </div>
                        {update.notes && <div className="text-gray-600">- {update.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>
              {selectedRequest.requestStatus === 'pending' && selectedRequest.reviewContext?.canApprove && (
                <Button onClick={handleMakeDecision}>
                  Make Decision
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Decision Dialog */}
      <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make Decision on Request</DialogTitle>
            <DialogDescription>
              Review and decide on {selectedRequest?.employeeInfo.employeeName}'s{' '}
              {selectedRequest?.requestType.replace('_', ' ')} request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Decision</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={decision === 'approve' ? 'default' : 'outline'}
                  onClick={() => setDecision('approve')}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant={decision === 'reject' ? 'destructive' : 'outline'}
                  onClick={() => setDecision('reject')}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>

            {decision === 'reject' && (
              <div>
                <Label htmlFor="rejectionRemark">Rejection Reason *</Label>
                <Textarea
                  id="rejectionRemark"
                  value={rejectionRemark}
                  onChange={(e) => setRejectionRemark(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="adminNotes">Admin Notes</Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Additional notes or comments..."
                className="mt-1"
              />
            </div>

            {decision === 'approve' && (
              <div>
                <Label htmlFor="effectiveDate">Effective Date (Optional)</Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDecisionDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitDecision}
              disabled={!decision || processing || (decision === 'reject' && !rejectionRemark.trim())}
            >
              {processing ? 'Processing...' : `${decision === 'approve' ? 'Approve' : 'Reject'} Request`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
