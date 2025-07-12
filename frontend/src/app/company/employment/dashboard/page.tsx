'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  FileText,
  Calendar,
  Activity,
  BarChart3,
  Eye,
  ArrowRight,
  UserCheck,
  UserX
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalEmployees: number;
  activeInternships: number;
  pendingRequests: number;
  completedThisMonth: number;
  terminatedThisMonth: number;
  averageProcessingTime: number;
  requestsByStatus: Record<string, number>;
  requestsByType: Record<string, number>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    actor: string;
  }>;
}

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  count: number;
  averageTime: number; // in hours
}

export default function EmploymentDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedTimeframe]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch employment status data
      const statusResponse = await fetch('/api/company/employment/status');
      const statusResult = await statusResponse.json();

      // Fetch early requests data
      const requestsResponse = await fetch('/api/company/employment/early-requests');
      const requestsResult = await requestsResponse.json();

      if (statusResult.success && requestsResult.success) {
        const employees = statusResult.data;
        const requests = requestsResult.data;

        // Calculate stats
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const completedThisMonth = employees.filter((emp: any) => 
          emp.currentStatus === 'completed' && 
          emp.actualEndDate && 
          new Date(emp.actualEndDate) >= thirtyDaysAgo
        ).length;

        const terminatedThisMonth = employees.filter((emp: any) => 
          emp.currentStatus === 'terminated' && 
          emp.actualEndDate && 
          new Date(emp.actualEndDate) >= thirtyDaysAgo
        ).length;

        const requestsByStatus = requests.reduce((acc: any, req: any) => {
          acc[req.requestStatus] = (acc[req.requestStatus] || 0) + 1;
          return acc;
        }, {});

        const requestsByType = requests.reduce((acc: any, req: any) => {
          acc[req.requestType] = (acc[req.requestType] || 0) + 1;
          return acc;
        }, {});

        // Calculate average processing time
        const completedRequests = requests.filter((req: any) => 
          ['approved', 'rejected'].includes(req.requestStatus)
        );
        const avgProcessingTime = completedRequests.length > 0 
          ? completedRequests.reduce((sum: number, req: any) => {
              const created = new Date(req.createdAt);
              const updated = new Date(req.updatedAt);
              return sum + (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
            }, 0) / completedRequests.length
          : 0;

        // Mock recent activity
        const recentActivity = [
          {
            id: '1',
            type: 'request_submitted',
            description: 'John Smith submitted early completion request',
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            actor: 'John Smith'
          },
          {
            id: '2',
            type: 'request_approved',
            description: 'Sarah Johnson\'s early termination request approved',
            timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000),
            actor: 'Company Admin'
          },
          {
            id: '3',
            type: 'status_updated',
            description: 'Mike Wilson\'s employment status updated to completed',
            timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000),
            actor: 'HR System'
          }
        ];

        setStats({
          totalEmployees: employees.length,
          activeInternships: employees.filter((emp: any) => emp.currentStatus === 'active').length,
          pendingRequests: requestsByStatus.pending || 0,
          completedThisMonth,
          terminatedThisMonth,
          averageProcessingTime: Math.round(avgProcessingTime * 100) / 100,
          requestsByStatus,
          requestsByType,
          recentActivity
        });

        // Mock workflow steps data
        setWorkflowSteps([
          {
            id: 'view_request',
            name: 'View Employee Details',
            description: 'Company admin reviews employee information and request details',
            status: 'completed',
            count: 15,
            averageTime: 0.5
          },
          {
            id: 'admin_decision',
            name: 'Admin Decision',
            description: 'Company admin accepts or rejects the request',
            status: 'in_progress',
            count: 8,
            averageTime: 2.5
          },
          {
            id: 'status_update',
            name: 'Status Update',
            description: 'Employment status updated accordingly',
            status: 'pending',
            count: 3,
            averageTime: 0.25
          }
        ]);

      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (error) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'request_submitted':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'request_approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'request_rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'status_updated':
        return <Activity className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'pending':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employment Management Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor early completion and termination requests workflow</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/company/employment/early-requests">
              <Eye className="h-4 w-4 mr-2" />
              View All Requests
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEmployees || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeInternships || 0} active internships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingRequests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting admin decision
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed This Month</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.completedThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">
              Early completions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageProcessingTime || 0}h</div>
            <p className="text-xs text-muted-foreground">
              From submission to decision
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflow Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Early Request Workflow
            </CardTitle>
            <CardDescription>
              Current status of the early completion/termination workflow steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workflowSteps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStepStatusIcon(step.status)}
                    <div className="text-sm font-medium">{step.name}</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-600 mb-1">{step.description}</div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{step.count} requests</span>
                      <span>Avg: {step.averageTime}h</span>
                    </div>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates on early completion and termination requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span>by {activity.actor}</span>
                      <span>•</span>
                      <span>{new Date(activity.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Requests by Status</CardTitle>
            <CardDescription>Distribution of request statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats?.requestsByStatus || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requests by Type</CardTitle>
            <CardDescription>Early completion vs termination requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats?.requestsByType || {}).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for employment management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
              <Link href="/company/employment/early-requests?status=pending">
                <Clock className="h-6 w-6" />
                <span>Review Pending Requests</span>
                <span className="text-xs text-gray-500">{stats?.pendingRequests || 0} pending</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
              <Link href="/company/employment/status">
                <Users className="h-6 w-6" />
                <span>Manage Employment Status</span>
                <span className="text-xs text-gray-500">{stats?.activeInternships || 0} active</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
              <Link href="/company/employment/reports">
                <BarChart3 className="h-6 w-6" />
                <span>View Reports</span>
                <span className="text-xs text-gray-500">Analytics & insights</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
