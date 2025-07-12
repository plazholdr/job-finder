'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Building2,
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Star,
  Download,
  Upload,
  Send,
  UserCheck,
  Award,
  Target,
  TrendingUp,
  RefreshCw,
  Plus,
  Minus,
  BookOpen,
  School,
  Timer,
  Laptop,
  Key,
  Shield,
  Coffee,
  Users2,
  ClipboardList,
  Settings,
  Home,
  Monitor,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Zap,
  Rocket,
  Brain,
  Heart,
  MessageCircle,
  Calendar as CalendarIcon,
  DollarSign,
  Percent
} from 'lucide-react';
import Link from 'next/link';

interface OngoingEmployee {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    employeeId: string;
    department: string;
    position: string;
    manager: string;
    startDate: Date;
    location: string;
  };
  employmentDetails: {
    employmentType: 'full-time' | 'part-time' | 'contract' | 'temporary';
    workArrangement: 'on-site' | 'remote' | 'hybrid';
    salary: number;
    benefits: string[];
    reportingStructure: {
      directManager: string;
      skipLevelManager: string;
      teamMembers: string[];
      directReports: string[];
    };
  };
  performanceStatus: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement' | 'unsatisfactory' | 'under_review';
  ongoingManagement: {
    performanceTracking: {
      currentPeriod: string;
      lastReviewDate: Date;
      nextReviewDate: Date;
      overallRating: number;
      goals: Array<{
        id: string;
        title: string;
        description: string;
        category: 'performance' | 'development' | 'project' | 'skill';
        priority: 'high' | 'medium' | 'low';
        status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
        targetDate: Date;
        progress: number;
        metrics: string[];
        feedback: string;
      }>;
      keyMetrics: Array<{
        metric: string;
        value: number;
        target: number;
        trend: 'up' | 'down' | 'stable';
        period: string;
      }>;
    };
    careerDevelopment: {
      careerPath: string;
      currentLevel: string;
      nextLevel: string;
      skillGaps: string[];
      developmentPlan: Array<{
        skill: string;
        currentLevel: number;
        targetLevel: number;
        timeline: string;
        resources: string[];
        mentor?: string;
      }>;
      trainingCompleted: Array<{
        course: string;
        completedDate: Date;
        score?: number;
        certification?: string;
      }>;
      trainingScheduled: Array<{
        course: string;
        scheduledDate: Date;
        duration: string;
        provider: string;
        cost?: number;
      }>;
    };
    projectAssignments: {
      currentProjects: Array<{
        id: string;
        name: string;
        role: string;
        startDate: Date;
        endDate?: Date;
        status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
        priority: 'high' | 'medium' | 'low';
        progress: number;
        teamSize: number;
        budget?: number;
        stakeholders: string[];
      }>;
      pastProjects: Array<{
        id: string;
        name: string;
        role: string;
        duration: string;
        outcome: string;
        rating: number;
        learnings: string[];
      }>;
    };
    feedback: {
      managerFeedback: Array<{
        date: Date;
        type: 'formal' | 'informal' | 'one_on_one' | 'performance_review';
        feedback: string;
        actionItems: string[];
        followUpDate?: Date;
      }>;
      peerFeedback: Array<{
        date: Date;
        reviewer: string;
        feedback: string;
        rating: number;
        anonymous: boolean;
      }>;
      selfAssessment: Array<{
        date: Date;
        period: string;
        strengths: string[];
        improvements: string[];
        goals: string[];
        satisfaction: number;
      }>;
    };
    recognition: {
      awards: Array<{
        title: string;
        date: Date;
        category: 'performance' | 'innovation' | 'leadership' | 'teamwork' | 'customer_service';
        description: string;
        value?: number;
      }>;
      achievements: Array<{
        title: string;
        date: Date;
        description: string;
        impact: string;
        recognition: string;
      }>;
      nominations: Array<{
        award: string;
        nominatedBy: string;
        date: Date;
        status: 'pending' | 'approved' | 'declined';
      }>;
    };
    wellbeing: {
      workLifeBalance: {
        rating: number;
        hoursWorked: number;
        overtimeHours: number;
        vacationDaysTaken: number;
        vacationDaysRemaining: number;
        sickDaysTaken: number;
      };
      engagement: {
        score: number;
        lastSurveyDate: Date;
        factors: Array<{
        factor: string;
        score: number;
        trend: 'improving' | 'declining' | 'stable';
        }>;
      };
      support: {
        mentorAssigned: boolean;
        mentorName?: string;
        coachingProgram: boolean;
        wellnessPrograms: string[];
        accommodations: string[];
      };
    };
  };
  documents: Array<{
    type: string;
    name: string;
    url: string;
    uploadedDate: Date;
    category: 'performance' | 'development' | 'project' | 'personal';
  }>;
  notes: Array<{
    id: string;
    author: string;
    content: string;
    timestamp: Date;
    type: 'performance' | 'development' | 'project' | 'general' | 'confidential';
    confidential: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export default function OngoingEmployeePage() {
  const [employees, setEmployees] = useState<OngoingEmployee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<OngoingEmployee | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'development' | 'projects' | 'feedback' | 'recognition' | 'wellbeing'>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchOngoingEmployees();
  }, []);

  const fetchOngoingEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/company/employees/ongoing');
      const result = await response.json();

      if (result.success) {
        setEmployees(result.data);
      } else {
        setError('Failed to fetch ongoing employees');
      }
    } catch (error) {
      console.error('Error fetching ongoing employees:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmployeeStatus = async (employeeId: string, action: string, additionalData?: any) => {
    try {
      const response = await fetch(`/api/company/employees/ongoing/${employeeId}/action`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...additionalData })
      });

      const result = await response.json();

      if (result.success) {
        setEmployees(prevEmployees =>
          prevEmployees.map(employee =>
            employee.id === employeeId ? result.data : employee
          )
        );
        setSelectedEmployee(result.data);
        setSuccess(`Employee action completed: ${action.replace('_', ' ')}`);
      } else {
        setError(result.error || 'Failed to update employee');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      setError('An unexpected error occurred');
    }
  };

  const getPerformanceColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'satisfactory': return 'bg-yellow-100 text-yellow-800';
      case 'needs_improvement': return 'bg-orange-100 text-orange-800';
      case 'unsatisfactory': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <Award className="h-4 w-4" />;
      case 'good': return <TrendingUp className="h-4 w-4" />;
      case 'satisfactory': return <Target className="h-4 w-4" />;
      case 'needs_improvement': return <AlertCircle className="h-4 w-4" />;
      case 'unsatisfactory': return <XCircle className="h-4 w-4" />;
      case 'under_review': return <Eye className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getAvailableActions = (employee: OngoingEmployee) => {
    const actions = [
      { id: 'schedule_review', label: 'Schedule Performance Review', type: 'positive' as const },
      { id: 'update_goals', label: 'Update Goals', type: 'neutral' as const },
      { id: 'assign_project', label: 'Assign to Project', type: 'positive' as const },
      { id: 'schedule_training', label: 'Schedule Training', type: 'positive' as const },
      { id: 'provide_feedback', label: 'Provide Feedback', type: 'neutral' as const },
      { id: 'recognize_achievement', label: 'Recognize Achievement', type: 'positive' as const },
      { id: 'update_development_plan', label: 'Update Development Plan', type: 'neutral' as const }
    ];

    // Add conditional actions based on performance status
    if (employee.performanceStatus === 'needs_improvement' || employee.performanceStatus === 'unsatisfactory') {
      actions.push({ id: 'create_pip', label: 'Create Performance Improvement Plan', type: 'negative' as const });
    }

    if (employee.performanceStatus === 'excellent' || employee.performanceStatus === 'good') {
      actions.push({ id: 'consider_promotion', label: 'Consider for Promotion', type: 'positive' as const });
    }

    return actions;
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesStatus = filterStatus === 'all' || employee.performanceStatus === filterStatus;
    const matchesSearch = searchTerm === '' ||
      employee.personalInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.personalInfo.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.personalInfo.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.personalInfo.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading ongoing employees...</p>
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
              <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Ongoing Employee Management</h1>
                <p className="text-sm text-gray-600">Manage employee performance, development, and career growth</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={fetchOngoingEmployees}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>

              <Link href="/company/employees">
                <Button variant="outline">
                  Back to Employees
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

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search employees by name, position, department, or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            <option value="all">All Performance Levels</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="satisfactory">Satisfactory</option>
            <option value="needs_improvement">Needs Improvement</option>
            <option value="unsatisfactory">Unsatisfactory</option>
            <option value="under_review">Under Review</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Employees List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Ongoing Employees ({filteredEmployees.length})
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Employee
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEmployees.map(employee => (
                    <div
                      key={employee.id}
                      onClick={() => setSelectedEmployee(employee)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedEmployee?.id === employee.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{employee.personalInfo.name}</h3>
                          <p className="text-sm text-gray-600">{employee.personalInfo.position}</p>
                          <p className="text-xs text-gray-500">ID: {employee.personalInfo.employeeId}</p>
                        </div>
                        <Badge className={getPerformanceColor(employee.performanceStatus)}>
                          <span className="flex items-center space-x-1">
                            {getPerformanceIcon(employee.performanceStatus)}
                            <span>{employee.performanceStatus.replace('_', ' ')}</span>
                          </span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {employee.personalInfo.email}
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2" />
                          {employee.personalInfo.department}
                        </div>
                        <div className="flex items-center">
                          <UserCheck className="h-4 w-4 mr-2" />
                          Manager: {employee.personalInfo.manager}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Started: {formatDate(employee.personalInfo.startDate)}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <BarChart3 className="h-4 w-4 mr-1 text-blue-500" />
                            <span>Rating: {employee.ongoingManagement.performanceTracking.overallRating}/5</span>
                          </div>
                          <div className="flex items-center">
                            <Target className="h-4 w-4 mr-1 text-green-500" />
                            <span>Goals: {employee.ongoingManagement.performanceTracking.goals.filter(g => g.status === 'completed').length}/{employee.ongoingManagement.performanceTracking.goals.length}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Next Review: {formatDate(employee.ongoingManagement.performanceTracking.nextReviewDate)}
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredEmployees.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No ongoing employees found matching your criteria</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employee Details */}
          <div>
            {selectedEmployee ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Employee Details</span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Performance Overview */}
                  <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Performance Overview</h4>
                      <Badge className={getPerformanceColor(selectedEmployee.performanceStatus)}>
                        {selectedEmployee.performanceStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Overall Rating:</span> {selectedEmployee.ongoingManagement.performanceTracking.overallRating}/5
                      </div>
                      <div>
                        <span className="font-medium">Next Review:</span> {formatDate(selectedEmployee.ongoingManagement.performanceTracking.nextReviewDate)}
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="mb-4">
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-4">
                        {[
                          { id: 'overview', label: 'Overview' },
                          { id: 'performance', label: 'Performance' },
                          { id: 'development', label: 'Development' },
                          { id: 'projects', label: 'Projects' },
                          { id: 'feedback', label: 'Feedback' },
                          { id: 'recognition', label: 'Recognition' },
                          { id: 'wellbeing', label: 'Wellbeing' }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              activeTab === tab.id
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </nav>
                    </div>
                  </div>

                  {/* Tab Content */}
                  {activeTab === 'overview' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Employee Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            {selectedEmployee.personalInfo.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {selectedEmployee.personalInfo.phone}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            {selectedEmployee.personalInfo.location}
                          </div>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                            {selectedEmployee.personalInfo.department} - {selectedEmployee.personalInfo.position}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Employment Details</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Employment Type:</span> {selectedEmployee.employmentDetails.employmentType.replace('_', ' ')}
                          </div>
                          <div>
                            <span className="font-medium">Work Arrangement:</span> {selectedEmployee.employmentDetails.workArrangement.replace('_', ' ')}
                          </div>
                          <div>
                            <span className="font-medium">Salary:</span> ${selectedEmployee.employmentDetails.salary.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Start Date:</span> {formatDate(selectedEmployee.personalInfo.startDate)}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Reporting Structure</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Direct Manager:</span> {selectedEmployee.employmentDetails.reportingStructure.directManager}
                          </div>
                          <div>
                            <span className="font-medium">Skip Level Manager:</span> {selectedEmployee.employmentDetails.reportingStructure.skipLevelManager}
                          </div>
                          <div>
                            <span className="font-medium">Direct Reports:</span> {selectedEmployee.employmentDetails.reportingStructure.directReports.length}
                          </div>
                          <div>
                            <span className="font-medium">Team Size:</span> {selectedEmployee.employmentDetails.reportingStructure.teamMembers.length}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedEmployee.employmentDetails.benefits.map(benefit => (
                            <Badge key={benefit} variant="outline" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'performance' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg text-center">
                          <div className="text-2xl font-bold text-blue-600">{selectedEmployee.ongoingManagement.performanceTracking.overallRating}</div>
                          <div className="text-sm text-gray-600">Overall Rating</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {selectedEmployee.ongoingManagement.performanceTracking.goals.filter(g => g.status === 'completed').length}/
                            {selectedEmployee.ongoingManagement.performanceTracking.goals.length}
                          </div>
                          <div className="text-sm text-gray-600">Goals Completed</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Current Goals</h4>
                        <div className="space-y-3">
                          {selectedEmployee.ongoingManagement.performanceTracking.goals.map(goal => (
                            <div key={goal.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-900">{goal.title}</h5>
                                <div className="flex items-center space-x-2">
                                  <Badge className={
                                    goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }>
                                    {goal.priority}
                                  </Badge>
                                  <Badge className={
                                    goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    goal.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                    goal.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }>
                                    {goal.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                              <div className="flex items-center justify-between text-sm">
                                <span>Progress: {goal.progress}%</span>
                                <span>Due: {formatDate(goal.targetDate)}</span>
                              </div>
                              <Progress value={goal.progress} className="h-2 mt-2" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Key Metrics</h4>
                        <div className="space-y-2">
                          {selectedEmployee.ongoingManagement.performanceTracking.keyMetrics.map((metric, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm font-medium">{metric.metric}</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">{metric.value}/{metric.target}</span>
                                <Badge className={
                                  metric.trend === 'up' ? 'bg-green-100 text-green-800' :
                                  metric.trend === 'down' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }>
                                  {metric.trend}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'development' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Career Path</h4>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm space-y-1">
                            <div><span className="font-medium">Current Level:</span> {selectedEmployee.ongoingManagement.careerDevelopment.currentLevel}</div>
                            <div><span className="font-medium">Next Level:</span> {selectedEmployee.ongoingManagement.careerDevelopment.nextLevel}</div>
                            <div><span className="font-medium">Career Path:</span> {selectedEmployee.ongoingManagement.careerDevelopment.careerPath}</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Development Plan</h4>
                        <div className="space-y-3">
                          {selectedEmployee.ongoingManagement.careerDevelopment.developmentPlan.map((plan, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-900">{plan.skill}</h5>
                                <span className="text-sm text-gray-600">{plan.timeline}</span>
                              </div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm">Current: {plan.currentLevel}/10</span>
                                <span className="text-sm">Target: {plan.targetLevel}/10</span>
                              </div>
                              <Progress value={(plan.currentLevel / plan.targetLevel) * 100} className="h-2 mb-2" />
                              {plan.mentor && (
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium">Mentor:</span> {plan.mentor}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Training History</h4>
                        <div className="space-y-2">
                          {selectedEmployee.ongoingManagement.careerDevelopment.trainingCompleted.map((training, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                              <div>
                                <div className="font-medium text-sm">{training.course}</div>
                                <div className="text-xs text-gray-600">Completed: {formatDate(training.completedDate)}</div>
                              </div>
                              {training.score && (
                                <Badge className="bg-green-100 text-green-800">
                                  Score: {training.score}%
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Available Actions */}
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">Available Actions</h4>
                    <div className="space-y-2">
                      {getAvailableActions(selectedEmployee).map(action => (
                        <Button
                          key={action.id}
                          variant={action.type === 'positive' ? 'default' : action.type === 'negative' ? 'destructive' : 'outline'}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => updateEmployeeStatus(selectedEmployee.id, action.id)}
                        >
                          {action.type === 'positive' && <CheckCircle className="h-4 w-4 mr-2" />}
                          {action.type === 'negative' && <XCircle className="h-4 w-4 mr-2" />}
                          {action.type === 'neutral' && <Clock className="h-4 w-4 mr-2" />}
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select an Employee
                  </h3>
                  <p className="text-gray-600">
                    Choose an employee from the list to view details and manage their ongoing development
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
