'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Share2,
  TrendingUp,
  Users,
  Briefcase,
  Building2
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import InternManagementInterface from '@/components/intern/InternManagementInterface';

export default function InternManagementPage() {
  const [activeTab, setActiveTab] = useState('ongoing');

  // Mock statistics - in a real app, these would come from API
  const stats = {
    ongoing: 3,
    shared: 8,
    complete: 2,
    terminated: 1,
    totalApplications: 6,
    responseRate: 85,
    averageResponseTime: '5 days'
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'ongoing':
        return <Clock className="h-4 w-4" />;
      case 'shared':
        return <Share2 className="h-4 w-4" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4" />;
      case 'terminated':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  const getTabColor = (tab: string) => {
    switch (tab) {
      case 'ongoing':
        return 'text-blue-600';
      case 'shared':
        return 'text-purple-600';
      case 'complete':
        return 'text-green-600';
      case 'terminated':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Intern Management</h1>
          <p className="text-gray-600">
            Comprehensive view of your internship journey and application management
          </p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ongoing</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.ongoing}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.complete}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Share2 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Saved Items</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.shared}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.responseRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Application Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Total Applications</span>
                  <span className="text-lg font-bold text-gray-900">{stats.totalApplications}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-medium">{Math.round((stats.complete / stats.totalApplications) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(stats.complete / stats.totalApplications) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">In Progress</span>
                    <span className="font-medium">{Math.round((stats.ongoing / stats.totalApplications) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(stats.ongoing / stats.totalApplications) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Companies Applied</span>
                  </div>
                  <span className="font-medium">4</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Interviews</span>
                  </div>
                  <span className="font-medium">2</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Avg. Response</span>
                  </div>
                  <span className="font-medium">{stats.averageResponseTime}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Management Interface */}
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-gray-200 px-6 pt-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger 
                    value="ongoing" 
                    className="flex items-center space-x-2"
                  >
                    <div className={`flex items-center space-x-2 ${getTabColor('ongoing')}`}>
                      {getTabIcon('ongoing')}
                      <span>Ongoing</span>
                      {stats.ongoing > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {stats.ongoing}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="shared" 
                    className="flex items-center space-x-2"
                  >
                    <div className={`flex items-center space-x-2 ${getTabColor('shared')}`}>
                      {getTabIcon('shared')}
                      <span>Shared</span>
                      {stats.shared > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {stats.shared}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="complete" 
                    className="flex items-center space-x-2"
                  >
                    <div className={`flex items-center space-x-2 ${getTabColor('complete')}`}>
                      {getTabIcon('complete')}
                      <span>Complete</span>
                      {stats.complete > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {stats.complete}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="terminated" 
                    className="flex items-center space-x-2"
                  >
                    <div className={`flex items-center space-x-2 ${getTabColor('terminated')}`}>
                      {getTabIcon('terminated')}
                      <span>Terminated</span>
                      {stats.terminated > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {stats.terminated}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="ongoing" className="mt-0">
                  <InternManagementInterface view="ongoing" />
                </TabsContent>

                <TabsContent value="shared" className="mt-0">
                  <InternManagementInterface view="shared" />
                </TabsContent>

                <TabsContent value="complete" className="mt-0">
                  <InternManagementInterface view="complete" />
                </TabsContent>

                <TabsContent value="terminated" className="mt-0">
                  <InternManagementInterface view="terminated" />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
