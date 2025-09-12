'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star,
  Filter,
  Search,
  Download,
  Settings,
  Bell,
  Users,
  TrendingUp,
  BarChart3,
  Activity
} from 'lucide-react';

interface ApplicationWorkflowData {
  id: string;
  candidateName: string;
  jobTitle: string;
  status: string;
  stage: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedAt: Date;
  lastUpdated: Date;
  screeningScore?: number;
  applicationScore?: number;
  isOnHold: boolean;
  holdReason?: string;
  rejectionReason?: string;
  nextAction?: string;
  assignedTo?: string;
}

interface WorkflowMetrics {
  totalApplications: number;
  pendingScreening: number;
  pendingReview: number;
  onHold: number;
  rejected: number;
  averageProcessingTime: number;
  screeningPassRate: number;
  interviewConversionRate: number;
}

export default function AdvancedWorkflowPage() {
  const [applications, setApplications] = useState<ApplicationWorkflowData[]>([]);
  const [metrics, setMetrics] = useState<WorkflowMetrics | null>(null);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'screening' | 'scoring' | 'holds' | 'notifications'>('overview');

  useEffect(() => {
    fetchWorkflowData();
  }, []);

  const fetchWorkflowData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch applications with workflow data
      const [applicationsRes, metricsRes] = await Promise.all([
        fetch('/api/company/applications?include=workflow'),
        fetch('/api/company/workflow/metrics')
      ]);

      if (applicationsRes.ok && metricsRes.ok) {
        const applicationsData = await applicationsRes.json();
        const metricsData = await metricsRes.json();
        
        setApplications(applicationsData.data || []);
        setMetrics(metricsData.data || null);
      } else {
        setError('Failed to fetch workflow data');
      }
    } catch (error) {
      console.error('Error fetching workflow data:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedApplications.length === 0) return;

    try {
      const response = await fetch('/api/company/applications/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationIds: selectedApplications,
          action,
        }),
      });

      if (response.ok) {
        await fetchWorkflowData();
        setSelectedApplications([]);
        setShowBulkActions(false);
      } else {
        setError('Failed to perform bulk action');
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      setError('An unexpected error occurred');
    }
  };

  const runAutoScreening = async (applicationId: string) => {
    try {
      const response = await fetch('/api/company/applications/auto-screening', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          jobId: 'job-1', // In real app, get from application
          applicationData: {} // In real app, get actual application data
        }),
      });

      if (response.ok) {
        await fetchWorkflowData();
      } else {
        setError('Failed to run auto-screening');
      }
    } catch (error) {
      console.error('Error running auto-screening:', error);
      setError('An unexpected error occurred');
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesStage = filterStage === 'all' || app.stage === filterStage;
    const matchesSearch = searchTerm === '' || 
      app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesStage && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      'submitted': 'bg-blue-100 text-blue-800',
      'screening': 'bg-yellow-100 text-yellow-800',
      'reviewing': 'bg-purple-100 text-purple-800',
      'interview': 'bg-green-100 text-green-800',
      'offer': 'bg-emerald-100 text-emerald-800',
      'rejected': 'bg-red-100 text-red-800',
      'on_hold': 'bg-orange-100 text-orange-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Activity className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workflow data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advanced Workflow Management</h1>
              <p className="mt-2 text-gray-600">Comprehensive application workflow automation and management</p>
            </div>
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Dashboard */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Applications</p>
                  <p className="text-2xl font-semibold text-gray-900">{metrics.totalApplications}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg Processing Time</p>
                  <p className="text-2xl font-semibold text-gray-900">{metrics.averageProcessingTime}d</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Screening Pass Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">{metrics.screeningPassRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Interview Conversion</p>
                  <p className="text-2xl font-semibold text-gray-900">{metrics.interviewConversionRate}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'screening', name: 'Auto-Screening', icon: Filter },
              { id: 'scoring', name: 'Scoring', icon: Star },
              { id: 'holds', name: 'Holds', icon: Pause },
              { id: 'notifications', name: 'Notifications', icon: Bell },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search candidates or jobs..."
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="screening">Screening</option>
                <option value="reviewing">Reviewing</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Stages</option>
                <option value="screening">Screening</option>
                <option value="review">Review</option>
                <option value="interview">Interview</option>
                <option value="final_decision">Final Decision</option>
              </select>
            </div>

            <div className="flex items-end">
              {selectedApplications.length > 0 && (
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Bulk Actions ({selectedApplications.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bulk Actions Panel */}
        {showBulkActions && selectedApplications.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-800">
                {selectedApplications.length} application(s) selected
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleBulkAction('hold')}
                  className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                >
                  Hold
                </button>
                <button
                  onClick={() => setSelectedApplications([])}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedApplications(filteredApplications.map(app => app.id));
                        } else {
                          setSelectedApplications([]);
                        }
                      }}
                      checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scores
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedApplications.includes(application.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedApplications([...selectedApplications, application.id]);
                          } else {
                            setSelectedApplications(selectedApplications.filter(id => id !== application.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{application.candidateName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{application.jobTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                        {application.status.replace('_', ' ')}
                      </span>
                      {application.isOnHold && (
                        <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                          On Hold
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-2">
                        {application.screeningScore && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            S: {application.screeningScore}%
                          </span>
                        )}
                        {application.applicationScore && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            A: {application.applicationScore}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getPriorityIcon(application.priority)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">{application.priority}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(application.lastUpdated).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {application.status === 'submitted' && (
                          <button
                            onClick={() => runAutoScreening(application.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Run Auto-Screening"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        <button className="text-gray-600 hover:text-gray-900" title="View Details">
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <XCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
