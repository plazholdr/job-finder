'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Building2,
  Plus,
  Edit,
  Copy,
  Trash2,
  Play,
  Pause,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Settings,
  Eye
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'review' | 'interview' | 'assessment' | 'approval' | 'notification' | 'custom';
  order: number;
  isRequired: boolean;
  estimatedDuration: number;
  assignedRoles: string[];
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'internship' | 'full_time' | 'contract' | 'custom';
  isDefault: boolean;
  isActive: boolean;
  steps: WorkflowStep[];
  settings: {
    allowParallelSteps: boolean;
    autoAdvance: boolean;
    requireApproval: boolean;
    notificationSettings: {
      emailEnabled: boolean;
      smsEnabled: boolean;
      inAppEnabled: boolean;
    };
  };
  metadata: {
    totalSteps: number;
    estimatedDuration: number;
    successRate?: number;
    usageCount: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
}

export default function WorkflowTemplatesPage() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory]);

  const fetchTemplates = async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      
      const response = await fetch(`/api/company/workflow-templates?${params}`);
      const result = await response.json();

      if (result.success) {
        setTemplates(result.data.map((template: any) => ({
          ...template,
          createdAt: new Date(template.createdAt),
          updatedAt: new Date(template.updatedAt),
          lastUsed: template.lastUsed ? new Date(template.lastUsed) : undefined
        })));
      } else {
        setError(result.error || 'Failed to fetch templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('Failed to fetch templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateAction = async (templateId: string, action: 'activate' | 'deactivate' | 'duplicate' | 'delete') => {
    try {
      setError(null);
      
      // In a real app, these would be separate API endpoints
      console.log(`${action} template:`, templateId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh templates
      fetchTemplates();
    } catch (error) {
      console.error(`Error ${action}ing template:`, error);
      setError(`Failed to ${action} template`);
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      internship: 'bg-blue-100 text-blue-800',
      full_time: 'bg-green-100 text-green-800',
      contract: 'bg-purple-100 text-purple-800',
      custom: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={colors[category as keyof typeof colors]}>
        {category.replace('_', ' ')}
      </Badge>
    );
  };

  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case 'review':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'interview':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'assessment':
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case 'approval':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'notification':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours}h`;
    return `${Math.round(hours / 24)}d`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workflow templates...</p>
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
                <h1 className="text-xl font-bold text-gray-900">Workflow Templates</h1>
                <p className="text-sm text-gray-600">Manage and customize hiring workflows</p>
              </div>
            </div>

            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
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
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={fetchTemplates} variant="outline">
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                    {getCategoryBadge(template.category)}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {template.isActive ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <Play className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Pause className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">{template.description}</p>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-400" />
                    <span>{template.metadata.totalSteps} steps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{formatDuration(template.metadata.estimatedDuration)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span>{template.metadata.usageCount} uses</span>
                  </div>
                  {template.metadata.successRate && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-gray-400" />
                      <span>{template.metadata.successRate}% success</span>
                    </div>
                  )}
                </div>

                {/* Steps Preview */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Workflow Steps
                  </label>
                  <div className="space-y-1">
                    {template.steps.slice(0, 3).map((step, index) => (
                      <div key={step.id} className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">{index + 1}.</span>
                        {getStepTypeIcon(step.type)}
                        <span className="truncate">{step.name}</span>
                      </div>
                    ))}
                    {template.steps.length > 3 && (
                      <div className="text-xs text-gray-500 pl-6">
                        +{template.steps.length - 3} more steps
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{selectedTemplate?.name}</DialogTitle>
                        <DialogDescription>
                          {selectedTemplate?.description}
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedTemplate && (
                        <div className="space-y-6">
                          {/* Template Info */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Category</label>
                              <p>{getCategoryBadge(selectedTemplate.category)}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Status</label>
                              <p>{selectedTemplate.isActive ? 'Active' : 'Inactive'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Total Steps</label>
                              <p>{selectedTemplate.metadata.totalSteps}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Estimated Duration</label>
                              <p>{formatDuration(selectedTemplate.metadata.estimatedDuration)}</p>
                            </div>
                          </div>

                          {/* Workflow Steps */}
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Workflow Steps</h3>
                            <div className="space-y-4">
                              {selectedTemplate.steps.map((step, index) => (
                                <Card key={step.id}>
                                  <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                                        {index + 1}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          {getStepTypeIcon(step.type)}
                                          <h4 className="font-medium">{step.name}</h4>
                                          {step.isRequired && (
                                            <Badge variant="outline" className="text-xs">Required</Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                                        <div className="flex flex-wrap gap-2 text-xs">
                                          <span className="bg-gray-100 px-2 py-1 rounded">
                                            {formatDuration(step.estimatedDuration)}
                                          </span>
                                          {step.assignedRoles.map(role => (
                                            <span key={role} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                              {role.replace('_', ' ')}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>

                          {/* Settings */}
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Settings</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <label className="font-medium">Parallel Steps</label>
                                <p>{selectedTemplate.settings.allowParallelSteps ? 'Enabled' : 'Disabled'}</p>
                              </div>
                              <div>
                                <label className="font-medium">Auto Advance</label>
                                <p>{selectedTemplate.settings.autoAdvance ? 'Enabled' : 'Disabled'}</p>
                              </div>
                              <div>
                                <label className="font-medium">Require Approval</label>
                                <p>{selectedTemplate.settings.requireApproval ? 'Yes' : 'No'}</p>
                              </div>
                              <div>
                                <label className="font-medium">Notifications</label>
                                <div className="flex gap-1">
                                  {selectedTemplate.settings.notificationSettings.emailEnabled && (
                                    <Badge variant="outline" className="text-xs">Email</Badge>
                                  )}
                                  {selectedTemplate.settings.notificationSettings.smsEnabled && (
                                    <Badge variant="outline" className="text-xs">SMS</Badge>
                                  )}
                                  {selectedTemplate.settings.notificationSettings.inAppEnabled && (
                                    <Badge variant="outline" className="text-xs">In-App</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTemplateAction(template.id, 'duplicate')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTemplateAction(template.id, template.isActive ? 'deactivate' : 'activate')}
                  >
                    {template.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>

                  {!template.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTemplateAction(template.id, 'delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {templates.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workflow templates found</h3>
              <p className="text-gray-600 mb-4">
                Create your first workflow template to streamline your hiring process.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Template Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Workflow Template</DialogTitle>
              <DialogDescription>
                Create a new workflow template to standardize your hiring process.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Template creation form would go here. This would include:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Template name and description</li>
                <li>Category selection</li>
                <li>Step configuration with drag-and-drop ordering</li>
                <li>Role assignments and permissions</li>
                <li>Automation rules and conditions</li>
                <li>Notification settings</li>
              </ul>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowCreateDialog(false)}>
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
