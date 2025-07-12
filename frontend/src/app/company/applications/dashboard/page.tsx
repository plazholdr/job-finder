'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Users, 
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Target,
  Award,
  UserCheck,
  FileText,
  MessageSquare,
  Send,
  ThumbsUp,
  ThumbsDown,
  Pause,
  Play,
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';
import { CandidateApplication } from '@/types/company';

interface ApplicationMetrics {
  total: number;
  byStatus: Record<string, number>;
  conversionRates: Record<string, number>;
  averageTimeInStage: Record<string, number>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    applicationId: string;
    candidateName: string;
  }>;
}

export default function ApplicationDashboardPage() {
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [metrics, setMetrics] = useState<ApplicationMetrics | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedTimeRange]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch applications
      const appsResponse = await fetch('/api/company/applications/workflow');
      const appsResult = await appsResponse.json();

      if (appsResult.success) {
        setApplications(appsResult.data);
        calculateMetrics(appsResult.data);
      } else {
        setError('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMetrics = (apps: CandidateApplication[]) => {
    const statusCounts = apps.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate conversion rates (simplified)
    const conversionRates = {
      'submitted_to_accepted': statusCounts['pending_acceptance'] ? 
        (statusCounts['pending_acceptance'] / statusCounts['submitted']) * 100 : 0,
      'reviewing_to_shortlisted': statusCounts['shortlisted'] ? 
        (statusCounts['shortlisted'] / (statusCounts['reviewing'] + statusCounts['shortlisted'])) * 100 : 0,
      'interview_to_offer': statusCounts['offer_extended'] ? 
        (statusCounts['offer_extended'] / statusCounts['interview_completed']) * 100 : 0,
      'offer_to_acceptance': statusCounts['offer_accepted'] ? 
        (statusCounts['offer_accepted'] / statusCounts['offer_extended']) * 100 : 0
    };

    // Mock average time in stage (in real app, calculate from workflow history)
    const averageTimeInStage = {
      'submitted': 2.5,
      'pending_acceptance': 1.8,
      'reviewing': 4.2,
      'shortlisted': 3.1,
      'interview_scheduled': 5.5,
      'interview_completed': 2.8,
      'offer_extended': 7.2
    };

    // Generate recent activity from workflow history
    const recentActivity = apps
      .filter(app => app.workflowHistory && app.workflowHistory.length > 0)
      .flatMap(app => 
        app.workflowHistory!.slice(-2).map(log => ({
          id: log.id,
          type: log.action,
          description: `${log.action.replace('_', ' ')} - ${app.candidate.name}`,
          timestamp: log.timestamp,
          applicationId: app.id,
          candidateName: app.candidate.name
        }))
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    setMetrics({
      total: apps.length,
      byStatus: statusCounts,
      conversionRates,
      averageTimeInStage,
      recentActivity
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'pending_acceptance': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'reviewing': return 'bg-purple-100 text-purple-800';
      case 'shortlisted': return 'bg-indigo-100 text-indigo-800';
      case 'interview_scheduled': return 'bg-cyan-100 text-cyan-800';
      case 'interview_completed': return 'bg-teal-100 text-teal-800';
      case 'offer_extended': return 'bg-emerald-100 text-emerald-800';
      case 'offer_accepted': return 'bg-green-200 text-green-900';
      case 'offer_declined': return 'bg-orange-100 text-orange-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      case 'on_hold': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <FileText className="h-4 w-4" />;
      case 'pending_acceptance': return <Clock className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'reviewing': return <Eye className="h-4 w-4" />;
      case 'shortlisted': return <Award className="h-4 w-4" />;
      case 'interview_scheduled': return <Calendar className="h-4 w-4" />;
      case 'interview_completed': return <UserCheck className="h-4 w-4" />;
      case 'offer_extended': return <Send className="h-4 w-4" />;
      case 'offer_accepted': return <ThumbsUp className="h-4 w-4" />;
      case 'offer_declined': return <ThumbsDown className="h-4 w-4" />;
      case 'withdrawn': return <RotateCcw className="h-4 w-4" />;
      case 'on_hold': return <Pause className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
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
                <h1 className="text-xl font-bold text-gray-900">Application Dashboard</h1>
                <p className="text-sm text-gray-600">Monitor application pipeline and performance metrics</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              
              <Button variant="outline" onClick={fetchDashboardData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              
              <Link href="/company/applications/workflow">
                <Button>
                  <Target className="h-4 w-4 mr-2" />
                  Workflow Manager
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.total || 0}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(metrics?.byStatus['reviewing'] || 0) + (metrics?.byStatus['shortlisted'] || 0)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-yellow-600">Avg 4.2 days in review</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Offers Extended</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.byStatus['offer_extended'] || 0}</p>
                </div>
                <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Send className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">
                  {metrics?.conversionRates['offer_to_acceptance']?.toFixed(1) || 0}% acceptance rate
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Successful Hires</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.byStatus['offer_accepted'] || 0}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Award className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-blue-600">Quality hires</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pipeline Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Pipeline Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(metrics?.byStatus || {}).map(([status, count]) => {
                  const percentage = metrics?.total ? (count / metrics.total) * 100 : 0;
                  
                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(status)}>
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(status)}
                              <span>{status.replace('_', ' ')}</span>
                            </span>
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {count} ({percentage.toFixed(1)}%)
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.recentActivity.slice(0, 8).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                    <Link href={`/company/applications/${activity.applicationId}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                ))}
                
                {(!metrics?.recentActivity || metrics.recentActivity.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Funnel */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Conversion Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Applications</h3>
                <p className="text-2xl font-bold text-blue-600">{metrics?.byStatus['submitted'] || 0}</p>
                <p className="text-sm text-gray-500">Submitted</p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Under Review</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {(metrics?.byStatus['reviewing'] || 0) + (metrics?.byStatus['pending_acceptance'] || 0)}
                </p>
                <p className="text-sm text-gray-500">
                  {metrics?.conversionRates['submitted_to_accepted']?.toFixed(1) || 0}% conversion
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-8 w-8 text-cyan-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Interviews</h3>
                <p className="text-2xl font-bold text-cyan-600">
                  {(metrics?.byStatus['interview_scheduled'] || 0) + (metrics?.byStatus['interview_completed'] || 0)}
                </p>
                <p className="text-sm text-gray-500">
                  {metrics?.conversionRates['reviewing_to_shortlisted']?.toFixed(1) || 0}% from review
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Hired</h3>
                <p className="text-2xl font-bold text-green-600">{metrics?.byStatus['offer_accepted'] || 0}</p>
                <p className="text-sm text-gray-500">
                  {metrics?.conversionRates['offer_to_acceptance']?.toFixed(1) || 0}% offer acceptance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
