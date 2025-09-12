'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Building2,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Target,
  Award,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';
import Link from 'next/link';

interface AnalyticsData {
  overview: {
    totalApplications: number;
    totalApplicationsChange: number;
    activeJobs: number;
    activeJobsChange: number;
    averageTimeToHire: number;
    timeToHireChange: number;
    offerAcceptanceRate: number;
    acceptanceRateChange: number;
  };
  pipeline: {
    stages: Array<{
      name: string;
      count: number;
      percentage: number;
      averageTime: number;
      conversionRate: number;
    }>;
  };
  trends: {
    applications: Array<{
      date: string;
      count: number;
    }>;
    hires: Array<{
      date: string;
      count: number;
    }>;
  };
  performance: {
    topJobs: Array<{
      id: string;
      title: string;
      applications: number;
      hires: number;
      conversionRate: number;
    }>;
    timeMetrics: {
      averageTimeByStage: Record<string, number>;
      bottlenecks: Array<{
        stage: string;
        averageTime: number;
        impact: 'high' | 'medium' | 'low';
      }>;
    };
  };
  demographics: {
    byEducation: Record<string, number>;
    byExperience: Record<string, number>;
    byLocation: Record<string, number>;
  };
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('applications');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/company/analytics?timeRange=${selectedTimeRange}`);
      const result = await response.json();

      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch(`/api/company/analytics/export?timeRange=${selectedTimeRange}&format=csv`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${selectedTimeRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatDuration = (days: number) => {
    if (days < 1) return `${Math.round(days * 24)}h`;
    return `${Math.round(days)}d`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
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
                <h1 className="text-xl font-bold text-gray-900">Analytics & Insights</h1>
                <p className="text-sm text-gray-600">Track hiring performance and pipeline metrics</p>
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

              <Button variant="outline" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Button variant="outline" onClick={fetchAnalyticsData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>

              <Link href="/company/applications/dashboard">
                <Button>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
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

        {analyticsData && (
          <>
            {/* Overview Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Applications</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analyticsData.overview.totalApplications.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    {getChangeIcon(analyticsData.overview.totalApplicationsChange)}
                    <span className={`ml-1 ${getChangeColor(analyticsData.overview.totalApplicationsChange)}`}>
                      {Math.abs(analyticsData.overview.totalApplicationsChange)}% from last period
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analyticsData.overview.activeJobs}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    {getChangeIcon(analyticsData.overview.activeJobsChange)}
                    <span className={`ml-1 ${getChangeColor(analyticsData.overview.activeJobsChange)}`}>
                      {Math.abs(analyticsData.overview.activeJobsChange)}% from last period
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Time to Hire</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatDuration(analyticsData.overview.averageTimeToHire)}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    {getChangeIcon(analyticsData.overview.timeToHireChange)}
                    <span className={`ml-1 ${getChangeColor(analyticsData.overview.timeToHireChange)}`}>
                      {Math.abs(analyticsData.overview.timeToHireChange)}% from last period
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Offer Acceptance</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatPercentage(analyticsData.overview.offerAcceptanceRate)}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Award className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    {getChangeIcon(analyticsData.overview.acceptanceRateChange)}
                    <span className={`ml-1 ${getChangeColor(analyticsData.overview.acceptanceRateChange)}`}>
                      {Math.abs(analyticsData.overview.acceptanceRateChange)}% from last period
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Pipeline Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Application Pipeline Funnel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.pipeline.stages.map((stage, index) => (
                      <div key={stage.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              index === 0 ? 'bg-blue-500' :
                              index === 1 ? 'bg-green-500' :
                              index === 2 ? 'bg-yellow-500' :
                              index === 3 ? 'bg-purple-500' :
                              'bg-gray-500'
                            }`} />
                            <span className="font-medium text-gray-900">{stage.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {stage.count} ({formatPercentage(stage.percentage)})
                            </div>
                            <div className="text-xs text-gray-500">
                              Avg: {formatDuration(stage.averageTime)}
                            </div>
                          </div>
                        </div>
                        <Progress value={stage.percentage} className="h-2" />
                        {stage.conversionRate > 0 && (
                          <div className="text-xs text-gray-500">
                            {formatPercentage(stage.conversionRate)} conversion rate
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Jobs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Top Performing Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.performance.topJobs.map((job, index) => (
                      <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-orange-500' :
                            'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{job.title}</h4>
                            <p className="text-sm text-gray-600">
                              {job.applications} applications • {job.hires} hires
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPercentage(job.conversionRate)}
                          </div>
                          <div className="text-xs text-gray-500">conversion</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Time Metrics and Bottlenecks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Average Time by Stage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analyticsData.performance.timeMetrics.averageTimeByStage).map(([stage, time]) => (
                      <div key={stage} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.min((time / 10) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">
                            {formatDuration(time)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Process Bottlenecks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.performance.timeMetrics.bottlenecks.map((bottleneck, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            bottleneck.impact === 'high' ? 'bg-red-500' :
                            bottleneck.impact === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`} />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {bottleneck.stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Taking {formatDuration(bottleneck.averageTime)} on average
                            </p>
                          </div>
                        </div>
                        <Badge variant={
                          bottleneck.impact === 'high' ? 'destructive' :
                          bottleneck.impact === 'medium' ? 'default' :
                          'secondary'
                        }>
                          {bottleneck.impact} impact
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Demographics Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    By Education Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.demographics.byEducation)
                      .sort(([,a], [,b]) => b - a)
                      .map(([education, count]) => {
                        const total = Object.values(analyticsData.demographics.byEducation).reduce((a, b) => a + b, 0);
                        const percentage = (count / total) * 100;
                        return (
                          <div key={education} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-gray-700">{education}</span>
                              <span className="text-gray-600">{count} ({formatPercentage(percentage)})</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    By Experience Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.demographics.byExperience)
                      .sort(([,a], [,b]) => b - a)
                      .map(([experience, count]) => {
                        const total = Object.values(analyticsData.demographics.byExperience).reduce((a, b) => a + b, 0);
                        const percentage = (count / total) * 100;
                        return (
                          <div key={experience} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-gray-700">{experience}</span>
                              <span className="text-gray-600">{count} ({formatPercentage(percentage)})</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    By Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.demographics.byLocation)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5) // Show top 5 locations
                      .map(([location, count]) => {
                        const total = Object.values(analyticsData.demographics.byLocation).reduce((a, b) => a + b, 0);
                        const percentage = (count / total) * 100;
                        return (
                          <div key={location} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-gray-700">{location}</span>
                              <span className="text-gray-600">{count} ({formatPercentage(percentage)})</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
