'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Eye,
  UserCheck,
  Building2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import MainNavigation from '@/components/navigation/MainNavigation';

interface DashboardStats {
  totalEmployees: number;
  activeInternships: number;
  completedThisMonth: number;
  terminatedThisMonth: number;
}

interface AcceptedEmployee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  position: string;
  jobTitle: string;
  acceptedAt: Date;
  startDate?: Date;
  status: 'accepted' | 'active' | 'completed';
  applicationId: string;
  userId: string;
  jobId: string;
}

export default function EmploymentDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [acceptedEmployees, setAcceptedEmployees] = useState<AcceptedEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Fetch accepted applications for this company
      const applicationsResponse = await fetch('/api/company/applications?status=accepted', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!applicationsResponse.ok) {
        throw new Error('Failed to fetch applications');
      }

      const applicationsResult = await applicationsResponse.json();

      if (applicationsResult.success) {
        const acceptedApps = applicationsResult.data;

        // Transform applications into employee data
        const employees: AcceptedEmployee[] = acceptedApps.map((app: any) => ({
          id: app.id,
          name: app.candidate?.name || 'Unknown',
          email: app.candidate?.email || 'Unknown',
          phone: app.candidate?.phone,
          location: app.candidate?.location,
          position: app.jobTitle || 'Unknown Position',
          jobTitle: app.jobTitle || 'Unknown Position',
          acceptedAt: new Date(app.submittedAt),
          status: 'accepted' as const,
          applicationId: app.id,
          userId: app.candidate?.id || app.userId,
          jobId: app.jobId
        }));

        setAcceptedEmployees(employees);

        // Calculate stats
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const completedThisMonth = employees.filter(emp =>
          emp.status === 'completed' &&
          emp.acceptedAt >= thirtyDaysAgo
        ).length;

        const terminatedThisMonth = 0; // Will be calculated when we have termination data

        setStats({
          totalEmployees: employees.length,
          activeInternships: employees.filter(emp => emp.status === 'accepted').length,
          completedThisMonth,
          terminatedThisMonth
        });

      } else {
        setError('Failed to fetch applications data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavigation />
        <div className="container mx-auto p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />

      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employment Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your accepted employees and internships</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/company/applications">
                <Eye className="h-4 w-4 mr-2" />
                View Applications
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
                Accepted candidates
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.activeInternships || 0}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
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
                Successful completions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Date().toLocaleDateString('en-US', { month: 'short' })}</div>
              <p className="text-xs text-muted-foreground">
                Current period
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Accepted Employees */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            {acceptedEmployees.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No accepted employees yet</p>
                <p className="text-sm text-gray-500">Employees will appear here when candidates accept job offers</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {acceptedEmployees.map((employee) => (
                  <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <GraduationCap className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{employee.name}</h4>
                            <p className="text-sm text-gray-600">{employee.position}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{employee.email}</span>
                        </div>

                        {employee.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{employee.phone}</span>
                          </div>
                        )}

                        {employee.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{employee.location}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>Started: {formatDate(employee.acceptedAt)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={`/company/internships/${employee.userId}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Internship
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/company/applications/${employee.applicationId}`}>
                            <FileText className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

