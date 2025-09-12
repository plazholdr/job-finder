'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Pause,
  Play,
  Trash2,
  RotateCcw,
  Eye,
  Download
} from 'lucide-react';

interface BulkOperation {
  id: string;
  type: 'applications' | 'jobs' | 'candidates' | 'invitations';
  action: string;
  targetIds: string[];
  parameters: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  results: {
    successful: number;
    failed: number;
    errors: Array<{
      targetId: string;
      error: string;
    }>;
  };
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
  estimatedDuration?: number;
}

export default function BulkOperationsPage() {
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOperation, setSelectedOperation] = useState<BulkOperation | null>(null);

  useEffect(() => {
    fetchOperations();
    
    // Set up polling for active operations
    const interval = setInterval(() => {
      const hasActiveOperations = operations.some(op => 
        op.status === 'pending' || op.status === 'in_progress'
      );
      if (hasActiveOperations) {
        fetchOperations();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [operations]);

  const fetchOperations = async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      
      const response = await fetch(`/api/company/bulk-operations?${params}`);
      const result = await response.json();

      if (result.success) {
        setOperations(result.data.map((op: any) => ({
          ...op,
          createdAt: new Date(op.createdAt),
          completedAt: op.completedAt ? new Date(op.completedAt) : undefined
        })));
      } else {
        setError(result.error || 'Failed to fetch operations');
      }
    } catch (error) {
      console.error('Error fetching operations:', error);
      setError('Failed to fetch operations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOperationAction = async (operationId: string, action: 'cancel' | 'retry' | 'delete') => {
    try {
      setError(null);
      
      let response;
      if (action === 'delete') {
        response = await fetch(`/api/company/bulk-operations/${operationId}`, {
          method: 'DELETE'
        });
      } else {
        response = await fetch(`/api/company/bulk-operations/${operationId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action })
        });
      }

      const result = await response.json();

      if (result.success) {
        fetchOperations(); // Refresh the list
      } else {
        setError(result.error || `Failed to ${action} operation`);
      }
    } catch (error) {
      console.error(`Error ${action}ing operation:`, error);
      setError(`Failed to ${action} operation`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in_progress':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <Pause className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      in_progress: 'default',
      completed: 'default',
      failed: 'destructive',
      cancelled: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bulk operations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Bulk Operations</h1>
                <p className="text-sm text-gray-600">Manage bulk operations and view history</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operation Type
                </label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="applications">Applications</SelectItem>
                    <SelectItem value="jobs">Jobs</SelectItem>
                    <SelectItem value="candidates">Candidates</SelectItem>
                    <SelectItem value="invitations">Invitations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={fetchOperations} variant="outline">
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Bulk Operations History</CardTitle>
          </CardHeader>
          <CardContent>
            {operations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No bulk operations found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type & Action</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Results</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operations.map((operation) => (
                    <TableRow key={operation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium capitalize">
                            {operation.type} - {operation.action.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {operation.id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(operation.status)}
                          {getStatusBadge(operation.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-24">
                          <Progress value={operation.progress} className="h-2" />
                          <div className="text-xs text-gray-500 mt-1">
                            {operation.progress}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {operation.targetIds.length} items
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-green-600">
                            ✓ {operation.results.successful}
                          </div>
                          {operation.results.failed > 0 && (
                            <div className="text-red-600">
                              ✗ {operation.results.failed}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {operation.createdAt.toLocaleDateString()}
                          <div className="text-gray-500">
                            {operation.createdAt.toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOperation(operation)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Operation Details</DialogTitle>
                                <DialogDescription>
                                  Detailed information about bulk operation {operation.id}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedOperation && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Type</label>
                                      <p className="capitalize">{selectedOperation.type}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Action</label>
                                      <p className="capitalize">{selectedOperation.action.replace('_', ' ')}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Status</label>
                                      <p>{getStatusBadge(selectedOperation.status)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Progress</label>
                                      <p>{selectedOperation.progress}%</p>
                                    </div>
                                  </div>
                                  
                                  {selectedOperation.results.errors.length > 0 && (
                                    <div>
                                      <label className="text-sm font-medium">Errors</label>
                                      <div className="mt-2 max-h-32 overflow-y-auto">
                                        {selectedOperation.results.errors.map((error, index) => (
                                          <div key={index} className="text-sm text-red-600 mb-1">
                                            {error.targetId}: {error.error}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {(operation.status === 'pending' || operation.status === 'in_progress') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOperationAction(operation.id, 'cancel')}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          )}

                          {(operation.status === 'failed' || operation.status === 'cancelled') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOperationAction(operation.id, 'retry')}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}

                          {(operation.status === 'completed' || operation.status === 'failed' || operation.status === 'cancelled') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOperationAction(operation.id, 'delete')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
