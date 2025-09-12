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
  _id: string;
  userId: string;
  companyId: string;
  internshipId: string;
  completionRemark: string;
  type: 'complete_in_advance' | 'terminate';
  status: 'pending' | 'approved' | 'rejected';
  dateCreated: string;
  updatedAt: string;
  processedAt?: string;
  processedBy?: string;
  response?: string;
  // Additional fields we'll populate from related data
  studentInfo?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  internshipInfo?: {
    position: string;
    department: string;
    location: string;
    startDate: string;
    endDate: string;
    workType: string;
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
      const token = localStorage.getItem('authToken');

      if (!token) {
        setError('Authentication required');
        return;
      }

      // Fetch only complete_in_advance requests
      const response = await fetch('/api/requests?type=complete_in_advance', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setRequests(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = (requestId: string) => {
    const request = requests.find(r => r._id === requestId);
    if (request) {
      setSelectedRequest(request);
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
      const token = localStorage.getItem('authToken');

      const requestBody = {
        status: decision === 'approve' ? 'approved' : 'rejected',
        response: decision === 'reject' ? rejectionRemark : adminNotes
      };

      // Add effective date if approving and date is provided
      if (decision === 'approve' && effectiveDate) {
        requestBody.effectiveDate = effectiveDate;
      }

      console.log('📤 Sending decision data:', requestBody);

      const response = await fetch(`/api/requests/${selectedRequest._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`Request ${decision}d successfully`);
        setShowDecisionDialog(false);
        setSelectedRequest(null);
        fetchRequests(); // Refresh the list
      } else {
        setError(result.error || 'Failed to process decision');
      }
    } catch (error) {
      console.error('Error processing decision:', error);
      setError('Failed to process decision');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.toUpperCase()}
      </Badge>
    );
  };



  const filteredRequests = requests.filter(request => {
    if (activeTab === 'all') return true;
    return request.status === activeTab;
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
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
                <Card key={request._id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {request.studentInfo ?
                            `${request.studentInfo.firstName} ${request.studentInfo.lastName}` :
                            'Student Name'
                          }
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {request.internshipInfo?.position || 'Position'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {request.internshipInfo?.department || 'Department'}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {getStatusBadge(request.status)}
                        <Badge className="bg-blue-100 text-blue-800">
                          Early Completion
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Request Type</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {request.type.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Request Date</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(request.dateCreated).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Work Type</p>
                        <p className="text-sm text-gray-600">
                          {request.internshipInfo?.workType || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Location</p>
                        <p className="text-sm text-gray-600">
                          {request.internshipInfo?.location || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Completion Remark</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {request.completionRemark}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewRequest(request._id)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>

                      {request.status === 'pending' && (
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
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {selectedRequest.studentInfo ?
                  `${selectedRequest.studentInfo.firstName} ${selectedRequest.studentInfo.lastName}` :
                  'Student'
                } - Request Details
              </DialogTitle>
              <DialogDescription>
                {selectedRequest.type.replace('_', ' ')} request submitted on{' '}
                {new Date(selectedRequest.dateCreated).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Student Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Student Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {selectedRequest.studentInfo ?
                      `${selectedRequest.studentInfo.firstName} ${selectedRequest.studentInfo.lastName}` :
                      'Not available'
                    }
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedRequest.studentInfo?.email || 'Not available'}
                  </div>
                  <div>
                    <span className="font-medium">Position:</span> {selectedRequest.internshipInfo?.position || 'Not available'}
                  </div>
                  <div>
                    <span className="font-medium">Department:</span> {selectedRequest.internshipInfo?.department || 'Not available'}
                  </div>
                  <div>
                    <span className="font-medium">Work Type:</span> {selectedRequest.internshipInfo?.workType || 'Not available'}
                  </div>
                  <div>
                    <span className="font-medium">Location:</span> {selectedRequest.internshipInfo?.location || 'Not available'}
                  </div>
                </div>
              </div>

              {/* Request Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Request Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Request Type:</span>
                    <p className="mt-1 text-sm capitalize">{selectedRequest.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                  <div>
                    <span className="font-medium">Completion Remark:</span>
                    <p className="mt-1 p-2 bg-gray-50 rounded text-sm">{selectedRequest.completionRemark}</p>
                  </div>
                  {selectedRequest.response && (
                    <div>
                      <span className="font-medium">Company Response:</span>
                      <p className="mt-1 p-2 bg-gray-50 rounded text-sm">{selectedRequest.response}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>
              {selectedRequest.status === 'pending' && (
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
              Review and decide on {selectedRequest?.studentInfo ?
                `${selectedRequest.studentInfo.firstName} ${selectedRequest.studentInfo.lastName}` :
                'student'
              }'s {selectedRequest?.type.replace('_', ' ')} request.
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
