'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  Users, 
  Building2,
  Calendar,
  TrendingUp,
  Award,
  Briefcase,
  ArrowRight,
  Star
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';

interface HiredIntern {
  id: string;
  applicationId: string;
  name: string;
  position: string;
  company: string;
  startDate: Date;
  status: 'onboarding' | 'active' | 'completed';
  progress: number;
  mentor: string;
  department: string;
}

export default function HiringPage() {
  const [hiredInterns, setHiredInterns] = useState<HiredIntern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHiredInterns();
  }, []);

  const fetchHiredInterns = async () => {
    try {
      setLoading(true);
      
      // Mock data - in a real app, this would come from API
      const mockHiredInterns: HiredIntern[] = [
        {
          id: 'hired-1',
          applicationId: 'app-2',
          name: 'John Doe',
          position: 'Environmental Research Intern',
          company: 'Green Energy Inc',
          startDate: new Date('2024-06-01'),
          status: 'onboarding',
          progress: 75,
          mentor: 'Dr. Lisa Park',
          department: 'Research & Development'
        },
        {
          id: 'hired-2',
          applicationId: 'app-5',
          name: 'John Doe',
          position: 'Software Development Intern',
          company: 'TechCorp Solutions',
          startDate: new Date('2024-05-15'),
          status: 'active',
          progress: 100,
          mentor: 'Sarah Johnson',
          department: 'Engineering'
        }
      ];
      
      setHiredInterns(mockHiredInterns);
    } catch (error) {
      console.error('Error fetching hired interns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: HiredIntern['status']) => {
    switch (status) {
      case 'onboarding':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: HiredIntern['status']) => {
    switch (status) {
      case 'onboarding':
        return <Clock className="h-4 w-4" />;
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'completed':
        return <Award className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUpcomingMilestones = () => {
    return [
      {
        id: '1',
        title: 'Complete IT Setup',
        date: new Date('2024-06-03'),
        type: 'onboarding',
        intern: 'Environmental Research Intern'
      },
      {
        id: '2',
        title: 'First Project Review',
        date: new Date('2024-06-15'),
        type: 'milestone',
        intern: 'Software Development Intern'
      },
      {
        id: '3',
        title: 'Mid-term Evaluation',
        date: new Date('2024-07-15'),
        type: 'evaluation',
        intern: 'Environmental Research Intern'
      }
    ];
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hiring & Onboarding</h1>
          <p className="text-gray-600">
            Manage your internship journey from offer acceptance to completion
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Internships</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {hiredInterns.filter(i => i.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Onboarding</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {hiredInterns.filter(i => i.status === 'onboarding').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {hiredInterns.filter(i => i.status === 'completed').length}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">95%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Internships */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Internships</span>
                  <Badge variant="secondary">
                    {hiredInterns.length} total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hiredInterns.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No internships yet</h3>
                    <p className="text-gray-600 mb-4">
                      Once you receive and accept job offers, they'll appear here.
                    </p>
                    <Link href="/jobs">
                      <Button>
                        Browse Jobs
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hiredInterns.map((intern) => (
                      <div key={intern.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{intern.position}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center space-x-1">
                                <Building2 className="h-4 w-4" />
                                <span>{intern.company}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>Started {formatDate(intern.startDate)}</span>
                              </span>
                            </div>
                          </div>
                          
                          <Badge className={`${getStatusColor(intern.status)} flex items-center space-x-1`}>
                            {getStatusIcon(intern.status)}
                            <span className="capitalize">{intern.status}</span>
                          </Badge>
                        </div>
                        
                        {intern.status === 'onboarding' && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Onboarding Progress</span>
                              <span className="font-medium">{intern.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${intern.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{intern.mentor}</span>
                            </span>
                            <span>{intern.department}</span>
                          </div>
                          
                          <Link href={`/hiring/${intern.applicationId}`}>
                            <Button variant="outline" size="sm">
                              View Details
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Milestones */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getUpcomingMilestones().map((milestone) => (
                    <div key={milestone.id} className="flex items-start space-x-3">
                      <div className="h-2 w-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{milestone.title}</p>
                        <p className="text-xs text-gray-600">{milestone.intern}</p>
                        <p className="text-xs text-gray-500">{formatDate(milestone.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/applications">
                    <Button variant="outline" className="w-full justify-start">
                      <Briefcase className="h-4 w-4 mr-2" />
                      View Applications
                    </Button>
                  </Link>
                  
                  <Link href="/jobs">
                    <Button variant="outline" className="w-full justify-start">
                      <Star className="h-4 w-4 mr-2" />
                      Browse Jobs
                    </Button>
                  </Link>
                  
                  <Link href="/companies">
                    <Button variant="outline" className="w-full justify-start">
                      <Building2 className="h-4 w-4 mr-2" />
                      Explore Companies
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <a href="#" className="block text-blue-600 hover:text-blue-800">
                    Internship Handbook
                  </a>
                  <a href="#" className="block text-blue-600 hover:text-blue-800">
                    Career Development Guide
                  </a>
                  <a href="#" className="block text-blue-600 hover:text-blue-800">
                    Networking Tips
                  </a>
                  <a href="#" className="block text-blue-600 hover:text-blue-800">
                    Professional Skills Training
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
