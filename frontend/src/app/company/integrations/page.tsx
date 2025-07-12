'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Plus,
  Settings,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Zap,
  Database,
  Calendar,
  MessageSquare,
  FileText,
  Shield,
  BarChart3,
  ExternalLink,
  Crown
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'ats' | 'hris' | 'calendar' | 'communication' | 'assessment' | 'background_check' | 'analytics' | 'other';
  provider: string;
  logoUrl: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  isEnabled: boolean;
  isPremium: boolean;
  configuration: any;
  features: string[];
  permissions: string[];
  lastSync?: Date;
  syncStatus?: 'success' | 'failed' | 'in_progress';
  errorMessage?: string;
  usage: {
    apiCalls: number;
    dataTransferred: number;
    lastUsed: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [availableIntegrations, setAvailableIntegrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, [selectedCategory, selectedStatus]);

  const fetchIntegrations = async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      params.append('includeAvailable', 'true');
      
      const response = await fetch(`/api/company/integrations?${params}`);
      const result = await response.json();

      if (result.success) {
        setIntegrations(result.data.map((integration: any) => ({
          ...integration,
          createdAt: new Date(integration.createdAt),
          updatedAt: new Date(integration.updatedAt),
          lastSync: integration.lastSync ? new Date(integration.lastSync) : undefined,
          usage: {
            ...integration.usage,
            lastUsed: new Date(integration.usage.lastUsed)
          }
        })));
        setAvailableIntegrations(result.available || []);
      } else {
        setError(result.error || 'Failed to fetch integrations');
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
      setError('Failed to fetch integrations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIntegrationAction = async (integrationId: string, action: 'enable' | 'disable' | 'sync' | 'delete' | 'configure') => {
    try {
      setError(null);
      
      // In a real app, these would be separate API endpoints
      console.log(`${action} integration:`, integrationId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh integrations
      fetchIntegrations();
    } catch (error) {
      console.error(`Error ${action}ing integration:`, error);
      setError(`Failed to ${action} integration`);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ats':
        return <Database className="h-5 w-5 text-blue-500" />;
      case 'hris':
        return <Building2 className="h-5 w-5 text-green-500" />;
      case 'calendar':
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case 'communication':
        return <MessageSquare className="h-5 w-5 text-orange-500" />;
      case 'assessment':
        return <FileText className="h-5 w-5 text-indigo-500" />;
      case 'background_check':
        return <Shield className="h-5 w-5 text-red-500" />;
      case 'analytics':
        return <BarChart3 className="h-5 w-5 text-yellow-500" />;
      default:
        return <Settings className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: 'default',
      disconnected: 'secondary',
      error: 'destructive',
      pending: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const formatDataSize = (mb: number) => {
    if (mb < 1) return `${Math.round(mb * 1024)} KB`;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading integrations...</p>
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
                <h1 className="text-xl font-bold text-gray-900">Integrations</h1>
                <p className="text-sm text-gray-600">Connect with third-party tools and services</p>
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

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active Integrations</TabsTrigger>
            <TabsTrigger value="available">Available Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="ats">ATS</SelectItem>
                        <SelectItem value="hris">HRIS</SelectItem>
                        <SelectItem value="calendar">Calendar</SelectItem>
                        <SelectItem value="communication">Communication</SelectItem>
                        <SelectItem value="assessment">Assessment</SelectItem>
                        <SelectItem value="background_check">Background Check</SelectItem>
                        <SelectItem value="analytics">Analytics</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
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
                        <SelectItem value="connected">Connected</SelectItem>
                        <SelectItem value="disconnected">Disconnected</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button onClick={fetchIntegrations} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Integrations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {integrations.map((integration) => (
                <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(integration.category)}
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {integration.name}
                            {integration.isPremium && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                          </CardTitle>
                          <p className="text-sm text-gray-600">{integration.provider}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusIcon(integration.status)}
                        {getStatusBadge(integration.status)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm">{integration.description}</p>
                    
                    {/* Error Message */}
                    {integration.status === 'error' && integration.errorMessage && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {integration.errorMessage}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Usage Stats */}
                    {integration.status === 'connected' && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="text-gray-500">API Calls</label>
                          <p className="font-medium">{integration.usage.apiCalls.toLocaleString()}</p>
                        </div>
                        <div>
                          <label className="text-gray-500">Data Transfer</label>
                          <p className="font-medium">{formatDataSize(integration.usage.dataTransferred)}</p>
                        </div>
                        <div>
                          <label className="text-gray-500">Last Sync</label>
                          <p className="font-medium">
                            {integration.lastSync ? integration.lastSync.toLocaleDateString() : 'Never'}
                          </p>
                        </div>
                        <div>
                          <label className="text-gray-500">Sync Status</label>
                          <div className="flex items-center gap-1">
                            {integration.syncStatus === 'success' && <CheckCircle className="h-3 w-3 text-green-500" />}
                            {integration.syncStatus === 'failed' && <XCircle className="h-3 w-3 text-red-500" />}
                            {integration.syncStatus === 'in_progress' && <RefreshCw className="h-3 w-3 text-blue-500 animate-spin" />}
                            <span className="text-xs capitalize">{integration.syncStatus}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                        Features
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {integration.features.slice(0, 3).map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {integration.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{integration.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <div className="flex items-center space-x-2 flex-1">
                        <Switch
                          checked={integration.isEnabled}
                          onCheckedChange={(checked) => 
                            handleIntegrationAction(integration.id, checked ? 'enable' : 'disable')
                          }
                        />
                        <label className="text-sm">Enabled</label>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedIntegration(integration)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{selectedIntegration?.name} Settings</DialogTitle>
                            <DialogDescription>
                              Configure integration settings and permissions
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedIntegration && (
                            <div className="space-y-6">
                              {/* Integration Details */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Provider</label>
                                  <p>{selectedIntegration.provider}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Category</label>
                                  <p className="capitalize">{selectedIntegration.category.replace('_', ' ')}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Status</label>
                                  <p>{getStatusBadge(selectedIntegration.status)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Created</label>
                                  <p>{selectedIntegration.createdAt.toLocaleDateString()}</p>
                                </div>
                              </div>

                              {/* Configuration */}
                              <div>
                                <h3 className="text-lg font-semibold mb-4">Configuration</h3>
                                <div className="space-y-2 text-sm">
                                  {Object.entries(selectedIntegration.configuration).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="font-medium">{key.replace('_', ' ')}:</span>
                                      <span className="text-gray-600">
                                        {typeof value === 'string' && value.includes('*') ? value : String(value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Permissions */}
                              <div>
                                <h3 className="text-lg font-semibold mb-4">Permissions</h3>
                                <div className="grid grid-cols-2 gap-2">
                                  {selectedIntegration.permissions.map((permission) => (
                                    <div key={permission} className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                      <span className="text-sm">{permission.replace('_', ' ')}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex justify-end gap-2 pt-4">
                                <Button
                                  variant="outline"
                                  onClick={() => handleIntegrationAction(selectedIntegration.id, 'sync')}
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Sync Now
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => handleIntegrationAction(selectedIntegration.id, 'configure')}
                                >
                                  <Settings className="h-4 w-4 mr-2" />
                                  Configure
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {integration.status === 'connected' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleIntegrationAction(integration.id, 'sync')}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleIntegrationAction(integration.id, 'delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {integrations.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
                  <p className="text-gray-600 mb-4">
                    Connect with third-party tools to streamline your workflow.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="available" className="space-y-6">
            {/* Available Integrations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {availableIntegrations.map((integration) => (
                <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(integration.category)}
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {integration.name}
                            {integration.isPremium && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                          </CardTitle>
                          <p className="text-sm text-gray-600">{integration.provider}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm">{integration.description}</p>
                    
                    {/* Features */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                        Features
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {integration.features.map((feature: string) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button className="flex-1">
                        <Plus className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
