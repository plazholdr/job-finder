'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Building2,
  Zap,
  Settings,
  Play,
  Pause,
  Edit,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Target,
  ArrowRight,
  Filter,
  Mail,
  MessageSquare,
  Calendar,
  Award,
  RefreshCw,
  Activity,
  Bot,
  Workflow,
  Timer,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'status_change' | 'time_based' | 'score_based' | 'manual';
    conditions: Record<string, any>;
  };
  actions: Array<{
    type: 'send_notification' | 'update_status' | 'assign_reviewer' | 'schedule_interview' | 'send_email';
    parameters: Record<string, any>;
  }>;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high';
  executionCount: number;
  lastExecuted?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface AutomationMetrics {
  totalRules: number;
  activeRules: number;
  totalExecutions: number;
  successRate: number;
  timeSaved: number; // in hours
  recentExecutions: Array<{
    id: string;
    ruleName: string;
    status: 'success' | 'failed' | 'pending';
    executedAt: Date;
    applicationId?: string;
    error?: string;
  }>;
}

export default function AutomationPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [metrics, setMetrics] = useState<AutomationMetrics | null>(null);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'metrics' | 'logs'>('rules');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchAutomationData();
  }, []);

  const fetchAutomationData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [rulesRes, metricsRes] = await Promise.all([
        fetch('/api/company/automation/rules'),
        fetch('/api/company/automation/metrics')
      ]);

      const [rulesResult, metricsResult] = await Promise.all([
        rulesRes.json(),
        metricsRes.json()
      ]);

      if (rulesResult.success) setRules(rulesResult.data);
      if (metricsResult.success) setMetrics(metricsResult.data);

    } catch (error) {
      console.error('Error fetching automation data:', error);
      setError('Failed to load automation data');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/company/automation/rules/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });

      const result = await response.json();

      if (result.success) {
        setRules(prevRules =>
          prevRules.map(rule =>
            rule.id === ruleId ? { ...rule, isActive } : rule
          )
        );
        setSuccess(`Rule ${isActive ? 'activated' : 'deactivated'} successfully`);
      } else {
        setError(result.error || 'Failed to update rule');
      }
    } catch (error) {
      console.error('Error toggling rule:', error);
      setError('An unexpected error occurred');
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this automation rule?')) return;

    try {
      const response = await fetch(`/api/company/automation/rules/${ruleId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setRules(prevRules => prevRules.filter(rule => rule.id !== ruleId));
        setSelectedRule(null);
        setSuccess('Rule deleted successfully');
      } else {
        setError(result.error || 'Failed to delete rule');
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
      setError('An unexpected error occurred');
    }
  };

  const executeRule = async (ruleId: string) => {
    try {
      const response = await fetch(`/api/company/automation/rules/${ruleId}/execute`, {
        method: 'POST'
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Rule executed successfully');
        fetchAutomationData(); // Refresh data
      } else {
        setError(result.error || 'Failed to execute rule');
      }
    } catch (error) {
      console.error('Error executing rule:', error);
      setError('An unexpected error occurred');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'status_change': return <ArrowRight className="h-4 w-4" />;
      case 'time_based': return <Clock className="h-4 w-4" />;
      case 'score_based': return <Target className="h-4 w-4" />;
      case 'manual': return <Users className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'send_notification': return <MessageSquare className="h-4 w-4" />;
      case 'update_status': return <ArrowRight className="h-4 w-4" />;
      case 'assign_reviewer': return <Users className="h-4 w-4" />;
      case 'schedule_interview': return <Calendar className="h-4 w-4" />;
      case 'send_email': return <Mail className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
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
          <p className="text-gray-600">Loading automation...</p>
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
                <h1 className="text-xl font-bold text-gray-900">Workflow Automation</h1>
                <p className="text-sm text-gray-600">Automate repetitive tasks and streamline processes</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={fetchAutomationData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>

              <Link href="/company/applications/workflow">
                <Button variant="outline">
                  <Workflow className="h-4 w-4 mr-2" />
                  Workflow Manager
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Metrics Overview */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Rules</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalRules}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bot className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">{metrics.activeRules} active</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Executions</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalExecutions.toLocaleString()}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <BarChart3 className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-blue-600">{metrics.successRate.toFixed(1)}% success rate</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Time Saved</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.timeSaved}h</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Timer className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Clock className="h-4 w-4 text-purple-500 mr-1" />
                  <span className="text-purple-600">This month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Efficiency</p>
                    <p className="text-2xl font-bold text-gray-900">94%</p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Target className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-yellow-600">Process optimization</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'rules', label: 'Automation Rules', icon: Bot },
                { id: 'metrics', label: 'Performance', icon: BarChart3 },
                { id: 'logs', label: 'Execution Logs', icon: Activity }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Rules List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Bot className="h-5 w-5 mr-2" />
                      Automation Rules
                    </CardTitle>
                    <Button onClick={() => setIsCreating(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Rule
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rules.map(rule => (
                      <div
                        key={rule.id}
                        onClick={() => setSelectedRule(rule)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedRule?.id === rule.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getTriggerIcon(rule.trigger.type)}
                            <h3 className="font-medium text-gray-900">{rule.name}</h3>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityColor(rule.priority)}>
                              {rule.priority}
                            </Badge>
                            <Switch
                              checked={rule.isActive}
                              onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{rule.description}</p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span>Trigger: {rule.trigger.type.replace('_', ' ')}</span>
                            <span>Actions: {rule.actions.length}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span>Executed: {rule.executionCount} times</span>
                            {rule.lastExecuted && (
                              <span>Last: {formatDate(rule.lastExecuted)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {rules.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No automation rules found</p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => setIsCreating(true)}
                        >
                          Create your first rule
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rule Details */}
            <div>
              {selectedRule && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Rule Details</CardTitle>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => executeRule(selectedRule.id)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteRule(selectedRule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{selectedRule.name}</h4>
                        <p className="text-sm text-gray-600">{selectedRule.description}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Trigger</h4>
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          {getTriggerIcon(selectedRule.trigger.type)}
                          <span className="text-sm">
                            {selectedRule.trigger.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Actions</h4>
                        <div className="space-y-2">
                          {selectedRule.actions.map((action, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                              {getActionIcon(action.type)}
                              <span className="text-sm">
                                {action.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Priority:</span>
                            <Badge className={`ml-2 ${getPriorityColor(selectedRule.priority)}`}>
                              {selectedRule.priority}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-gray-600">Status:</span>
                            <Badge className={`ml-2 ${selectedRule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {selectedRule.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-gray-600">Executions:</span>
                            <span className="ml-2 font-medium">{selectedRule.executionCount}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Created:</span>
                            <span className="ml-2 text-xs">{formatDate(selectedRule.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Metrics Tab */}
        {activeTab === 'metrics' && metrics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Rule Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rules.slice(0, 5).map(rule => (
                    <div key={rule.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTriggerIcon(rule.trigger.type)}
                        <span className="text-sm font-medium text-gray-700">{rule.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {rule.executionCount} executions
                        </div>
                        <div className="text-xs text-gray-500">
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Executions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.recentExecutions.slice(0, 8).map(execution => (
                    <div key={execution.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          execution.status === 'success' ? 'bg-green-500' :
                          execution.status === 'failed' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`} />
                        <span className="text-sm font-medium text-gray-700">{execution.ruleName}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(execution.executedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && metrics && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Execution Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.recentExecutions.map(execution => (
                  <div key={execution.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      execution.status === 'success' ? 'bg-green-100' :
                      execution.status === 'failed' ? 'bg-red-100' :
                      'bg-yellow-100'
                    }`}>
                      {execution.status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                      {execution.status === 'failed' && <AlertCircle className="h-5 w-5 text-red-600" />}
                      {execution.status === 'pending' && <Clock className="h-5 w-5 text-yellow-600" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900">{execution.ruleName}</h4>
                        <Badge className={
                          execution.status === 'success' ? 'bg-green-100 text-green-800' :
                          execution.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {execution.status}
                        </Badge>
                      </div>

                      <div className="text-sm text-gray-600 mb-2">
                        Executed: {formatDate(execution.executedAt)}
                      </div>

                      {execution.error && (
                        <p className="text-xs text-red-600 mt-1">Error: {execution.error}</p>
                      )}

                      {execution.applicationId && (
                        <Link href={`/company/applications/${execution.applicationId}`}>
                          <Button variant="outline" size="sm" className="mt-2">
                            View Application
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}

                {metrics.recentExecutions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No execution logs found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
