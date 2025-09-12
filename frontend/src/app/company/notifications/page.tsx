'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Building2,
  Bell,
  Mail,
  MessageSquare,
  Settings,
  Send,
  Eye,
  Edit,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  FileText,
  Calendar,
  Award,
  ThumbsUp,
  ThumbsDown,
  XCircle,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface NotificationTemplate {
  id: string;
  name: string;
  trigger: string;
  type: 'email' | 'sms' | 'in_app';
  subject: string;
  content: string;
  isActive: boolean;
  variables: string[];
  lastUsed?: Date;
  usageCount: number;
}

interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  batchNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: 'immediate' | 'hourly' | 'daily';
}

interface NotificationLog {
  id: string;
  templateId: string;
  templateName: string;
  recipient: {
    id: string;
    name: string;
    email: string;
    type: 'candidate' | 'company';
  };
  type: 'email' | 'sms' | 'in_app';
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  sentAt: Date;
  deliveredAt?: Date;
  applicationId?: string;
  error?: string;
}

export default function NotificationsPage() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'templates' | 'settings' | 'logs'>('templates');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchNotificationData();
  }, []);

  const fetchNotificationData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch notification templates, settings, and logs
      const [templatesRes, settingsRes, logsRes] = await Promise.all([
        fetch('/api/company/notifications/templates'),
        fetch('/api/company/notifications/settings'),
        fetch('/api/company/notifications/logs')
      ]);

      const [templatesResult, settingsResult, logsResult] = await Promise.all([
        templatesRes.json(),
        settingsRes.json(),
        logsRes.json()
      ]);

      if (templatesResult.success) setTemplates(templatesResult.data);
      if (settingsResult.success) setSettings(settingsResult.data);
      if (logsResult.success) setLogs(logsResult.data);

    } catch (error) {
      console.error('Error fetching notification data:', error);
      setError('Failed to load notification data');
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplate = async (template: Partial<NotificationTemplate>) => {
    try {
      const method = template.id ? 'PUT' : 'POST';
      const url = template.id
        ? `/api/company/notifications/templates/${template.id}`
        : '/api/company/notifications/templates';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(template.id ? 'Template updated successfully' : 'Template created successfully');
        fetchNotificationData();
        setIsEditing(false);
        setIsCreating(false);
        setSelectedTemplate(null);
      } else {
        setError(result.error || 'Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      setError('An unexpected error occurred');
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`/api/company/notifications/templates/${templateId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Template deleted successfully');
        fetchNotificationData();
        setSelectedTemplate(null);
      } else {
        setError(result.error || 'Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      setError('An unexpected error occurred');
    }
  };

  const updateSettings = async (newSettings: NotificationSettings) => {
    try {
      const response = await fetch('/api/company/notifications/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });

      const result = await response.json();

      if (result.success) {
        setSettings(newSettings);
        setSuccess('Settings updated successfully');
      } else {
        setError(result.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('An unexpected error occurred');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Send className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'application_submitted': return <FileText className="h-4 w-4" />;
      case 'application_accepted': return <CheckCircle className="h-4 w-4" />;
      case 'application_rejected': return <XCircle className="h-4 w-4" />;
      case 'interview_scheduled': return <Calendar className="h-4 w-4" />;
      case 'interview_completed': return <Users className="h-4 w-4" />;
      case 'offer_extended': return <Award className="h-4 w-4" />;
      case 'offer_accepted': return <ThumbsUp className="h-4 w-4" />;
      case 'offer_declined': return <ThumbsDown className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
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
          <p className="text-gray-600">Loading notifications...</p>
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
                <h1 className="text-xl font-bold text-gray-900">Notification Management</h1>
                <p className="text-sm text-gray-600">Configure automated notifications and templates</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={fetchNotificationData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>

              <Link href="/company/applications">
                <Button variant="outline">
                  Back to Applications
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

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'templates', label: 'Templates', icon: FileText },
                { id: 'settings', label: 'Settings', icon: Settings },
                { id: 'logs', label: 'Activity Logs', icon: Eye }
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

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Template List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Notification Templates
                    </CardTitle>
                    <Button onClick={() => setIsCreating(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Template
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {templates.map(template => (
                      <div
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getTriggerIcon(template.trigger)}
                            <h3 className="font-medium text-gray-900">{template.name}</h3>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={template.isActive ? "default" : "secondary"}>
                              {template.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {template.type.toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          Trigger: {template.trigger.replace('_', ' ')}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Used {template.usageCount} times</span>
                          {template.lastUsed && (
                            <span>Last used: {formatDate(template.lastUsed)}</span>
                          )}
                        </div>
                      </div>
                    ))}

                    {templates.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No notification templates found</p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => setIsCreating(true)}
                        >
                          Create your first template
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Template Editor */}
            <div>
              {(selectedTemplate || isCreating) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{isCreating ? 'Create Template' : 'Edit Template'}</span>
                      <div className="flex space-x-2">
                        {selectedTemplate && !isCreating && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsEditing(!isEditing)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteTemplate(selectedTemplate.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TemplateEditor
                      template={selectedTemplate}
                      isEditing={isEditing || isCreating}
                      onSave={saveTemplate}
                      onCancel={() => {
                        setIsEditing(false);
                        setIsCreating(false);
                        setSelectedTemplate(null);
                      }}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && settings && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Channel Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Channels</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Email Notifications</p>
                          <p className="text-sm text-gray-600">Send notifications via email</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.emailEnabled}
                        onCheckedChange={(checked) =>
                          updateSettings({ ...settings, emailEnabled: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <MessageSquare className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">SMS Notifications</p>
                          <p className="text-sm text-gray-600">Send notifications via SMS</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.smsEnabled}
                        onCheckedChange={(checked) =>
                          updateSettings({ ...settings, smsEnabled: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Bell className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">In-App Notifications</p>
                          <p className="text-sm text-gray-600">Show notifications in the application</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.inAppEnabled}
                        onCheckedChange={(checked) =>
                          updateSettings({ ...settings, inAppEnabled: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Settings */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notification Frequency
                      </label>
                      <select
                        value={settings.frequency}
                        onChange={(e) =>
                          updateSettings({ ...settings, frequency: e.target.value as any })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="immediate">Immediate</option>
                        <option value="hourly">Hourly Digest</option>
                        <option value="daily">Daily Digest</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Batch Notifications</p>
                        <p className="text-sm text-gray-600">Group similar notifications together</p>
                      </div>
                      <Switch
                        checked={settings.batchNotifications}
                        onCheckedChange={(checked) =>
                          updateSettings({ ...settings, batchNotifications: checked })
                        }
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-gray-900">Quiet Hours</p>
                          <p className="text-sm text-gray-600">Pause notifications during specified hours</p>
                        </div>
                        <Switch
                          checked={settings.quietHours.enabled}
                          onCheckedChange={(checked) =>
                            updateSettings({
                              ...settings,
                              quietHours: { ...settings.quietHours, enabled: checked }
                            })
                          }
                        />
                      </div>

                      {settings.quietHours.enabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Time
                            </label>
                            <Input
                              type="time"
                              value={settings.quietHours.start}
                              onChange={(e) =>
                                updateSettings({
                                  ...settings,
                                  quietHours: { ...settings.quietHours, start: e.target.value }
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              End Time
                            </label>
                            <Input
                              type="time"
                              value={settings.quietHours.end}
                              onChange={(e) =>
                                updateSettings({
                                  ...settings,
                                  quietHours: { ...settings.quietHours, end: e.target.value }
                                })
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Logs Tab */}
        {activeTab === 'logs' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Notification Activity Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs.map(log => (
                  <div key={log.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {getStatusIcon(log.status)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900">{log.templateName}</h4>
                        <Badge className={getStatusColor(log.status)}>
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(log.status)}
                            <span>{log.status}</span>
                          </span>
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        Sent to: {log.recipient.name} ({log.recipient.email})
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Type: {log.type.toUpperCase()}</span>
                        <span>Sent: {formatDate(log.sentAt)}</span>
                        {log.deliveredAt && (
                          <span>Delivered: {formatDate(log.deliveredAt)}</span>
                        )}
                      </div>

                      {log.error && (
                        <p className="text-xs text-red-600 mt-1">Error: {log.error}</p>
                      )}
                    </div>

                    {log.applicationId && (
                      <Link href={`/company/applications/${log.applicationId}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}

                {logs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No notification logs found</p>
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

// Template Editor Component
interface TemplateEditorProps {
  template: NotificationTemplate | null;
  isEditing: boolean;
  onSave: (template: Partial<NotificationTemplate>) => void;
  onCancel: () => void;
}

function TemplateEditor({ template, isEditing, onSave, onCancel }: TemplateEditorProps) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    trigger: template?.trigger || 'application_submitted',
    type: template?.type || 'email' as const,
    subject: template?.subject || '',
    content: template?.content || '',
    isActive: template?.isActive ?? true
  });

  const triggerOptions = [
    { value: 'application_submitted', label: 'Application Submitted' },
    { value: 'application_accepted', label: 'Application Accepted' },
    { value: 'application_rejected', label: 'Application Rejected' },
    { value: 'interview_scheduled', label: 'Interview Scheduled' },
    { value: 'interview_completed', label: 'Interview Completed' },
    { value: 'offer_extended', label: 'Offer Extended' },
    { value: 'offer_accepted', label: 'Offer Accepted' },
    { value: 'offer_declined', label: 'Offer Declined' }
  ];

  const availableVariables = [
    '{{candidate_name}}',
    '{{candidate_email}}',
    '{{job_title}}',
    '{{company_name}}',
    '{{interview_date}}',
    '{{interview_time}}',
    '{{offer_amount}}',
    '{{application_date}}'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...template,
      ...formData,
      variables: availableVariables
    });
  };

  if (!isEditing && template) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-900 mb-2">{template.name}</h3>
          <p className="text-sm text-gray-600">
            Trigger: {template.trigger.replace('_', ' ')}
          </p>
          <p className="text-sm text-gray-600">
            Type: {template.type.toUpperCase()}
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-1">Subject:</h4>
          <p className="text-sm text-gray-600">{template.subject}</p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-1">Content:</h4>
          <div className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded">
            {template.content}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-1">Available Variables:</h4>
          <div className="flex flex-wrap gap-1">
            {template.variables.map(variable => (
              <Badge key={variable} variant="outline" className="text-xs">
                {variable}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Template Name
        </label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter template name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Trigger Event
        </label>
        <select
          value={formData.trigger}
          onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          required
        >
          {triggerOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notification Type
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          required
        >
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="in_app">In-App</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject Line
        </label>
        <Input
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Enter subject line"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message Content
        </label>
        <Textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Enter message content..."
          rows={6}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Available Variables
        </label>
        <div className="flex flex-wrap gap-1 mb-2">
          {availableVariables.map(variable => (
            <button
              key={variable}
              type="button"
              onClick={() => {
                const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                if (textarea) {
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const newContent = formData.content.substring(0, start) + variable + formData.content.substring(end);
                  setFormData({ ...formData, content: newContent });
                }
              }}
              className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              {variable}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
          <span className="text-sm text-gray-700">Active</span>
        </div>

        <div className="flex space-x-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>
    </form>
  );
}
