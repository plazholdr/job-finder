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
  Percent,
  Crown,
  Layers,
  Network,
  GitBranch,
  Compass,
  Lightbulb,
  Telescope,
  Map
} from 'lucide-react';
import Link from 'next/link';

interface AdvancedEmployee {
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
    tenure: number;
  };
  advancedStatus: 'high_performer' | 'leadership_track' | 'succession_candidate' | 'retention_risk' | 'promotion_ready' | 'critical_talent';
  advancedManagement: {
    talentAssessment: {
      potentialRating: number;
      performanceRating: number;
      leadershipCapability: number;
      technicalExpertise: number;
      culturalFit: number;
      innovationIndex: number;
      riskProfile: 'low' | 'medium' | 'high';
      marketValue: number;
      replaceability: 'easy' | 'moderate' | 'difficult' | 'irreplaceable';
    };
    successionPlanning: {
      isSuccessor: boolean;
      successorFor: string[];
      readinessLevel: 'ready_now' | 'ready_1_year' | 'ready_2_years' | 'development_needed';
      developmentGaps: string[];
      successorCandidates: Array<{
        employeeId: string;
        name: string;
        readiness: string;
        probability: number;
      }>;
      criticalRoles: string[];
    };
    leadershipDevelopment: {
      currentProgram?: string;
      completedPrograms: string[];
      leadershipStyle: string;
      coachingAssigned: boolean;
      coach?: string;
      mentoringOthers: string[];
      leadershipCompetencies: Array<{
        competency: string;
        currentLevel: number;
        targetLevel: number;
        priority: 'high' | 'medium' | 'low';
      }>;
    };
    strategicProjects: {
      currentProjects: Array<{
        id: string;
        name: string;
        role: 'lead' | 'contributor' | 'advisor';
        strategicImportance: 'critical' | 'high' | 'medium';
        visibility: 'executive' | 'senior_management' | 'department';
        impact: string;
        timeline: string;
        budget?: number;
      }>;
      pastImpact: Array<{
        project: string;
        outcome: string;
        businessValue: number;
        recognition: string;
      }>;
    };
    retentionStrategy: {
      flightRisk: 'low' | 'medium' | 'high' | 'critical';
      retentionFactors: string[];
      satisfactionScore: number;
      engagementScore: number;
      lastStayInterview: Date;
      nextStayInterview: Date;
      retentionActions: Array<{
        action: string;
        timeline: string;
        owner: string;
        status: 'planned' | 'in_progress' | 'completed';
      }>;
      competitorOffers: Array<{
        company: string;
        role: string;
        compensation: number;
        date: Date;
        outcome: 'declined' | 'considering' | 'accepted';
      }>;
    };
    compensationStrategy: {
      currentSalary: number;
      marketPercentile: number;
      equityValue: number;
      totalCompensation: number;
      lastIncrease: Date;
      nextReview: Date;
      benchmarkData: {
        marketMin: number;
        marketMax: number;
        marketMedian: number;
        internalEquity: number;
      };
      retentionPackage?: {
        salaryIncrease: number;
        bonusAmount: number;
        equityGrant: number;
        effectiveDate: Date;
      };
    };
    innovationContribution: {
      patents: number;
      publications: number;
      innovations: Array<{
        title: string;
        description: string;
        impact: string;
        date: Date;
        recognition?: string;
      }>;
      thoughtLeadership: Array<{
        type: 'conference' | 'article' | 'blog' | 'podcast' | 'interview';
        title: string;
        venue: string;
        date: Date;
        audience: number;
      }>;
    };
  };
  documents: Array<{
    type: string;
    name: string;
    url: string;
    uploadedDate: Date;
    category: 'talent_assessment' | 'succession' | 'leadership' | 'compensation' | 'confidential';
    confidential: boolean;
  }>;
  notes: Array<{
    id: string;
    author: string;
    content: string;
    timestamp: Date;
    type: 'talent_review' | 'succession' | 'retention' | 'compensation' | 'strategic';
    confidential: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export default function AdvancedEmployeePage() {
  const [employees, setEmployees] = useState<AdvancedEmployee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<AdvancedEmployee | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'talent' | 'succession' | 'leadership' | 'retention' | 'compensation' | 'innovation'>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchAdvancedEmployees();
  }, []);

  const fetchAdvancedEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/company/employees/advanced');
      const result = await response.json();

      if (result.success) {
        setEmployees(result.data);
      } else {
        setError('Failed to fetch advanced employees');
      }
    } catch (error) {
      console.error('Error fetching advanced employees:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmployeeAction = async (employeeId: string, action: string, additionalData?: any) => {
    try {
      const response = await fetch(`/api/company/employees/advanced/${employeeId}/action`, {
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
        setSuccess(`Action completed: ${action.replace('_', ' ')}`);
      } else {
        setError(result.error || 'Failed to update employee');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      setError('An unexpected error occurred');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high_performer': return 'bg-green-100 text-green-800';
      case 'leadership_track': return 'bg-blue-100 text-blue-800';
      case 'succession_candidate': return 'bg-purple-100 text-purple-800';
      case 'retention_risk': return 'bg-red-100 text-red-800';
      case 'promotion_ready': return 'bg-yellow-100 text-yellow-800';
      case 'critical_talent': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'high_performer': return <Award className="h-4 w-4" />;
      case 'leadership_track': return <Crown className="h-4 w-4" />;
      case 'succession_candidate': return <Layers className="h-4 w-4" />;
      case 'retention_risk': return <AlertCircle className="h-4 w-4" />;
      case 'promotion_ready': return <TrendingUp className="h-4 w-4" />;
      case 'critical_talent': return <Star className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailableActions = (employee: AdvancedEmployee) => {
    const actions = [
      { id: 'conduct_talent_review', label: 'Conduct Talent Review', type: 'positive' as const },
      { id: 'update_succession_plan', label: 'Update Succession Plan', type: 'neutral' as const },
      { id: 'assign_strategic_project', label: 'Assign Strategic Project', type: 'positive' as const },
      { id: 'schedule_stay_interview', label: 'Schedule Stay Interview', type: 'neutral' as const },
      { id: 'review_compensation', label: 'Review Compensation', type: 'neutral' as const },
      { id: 'nominate_leadership_program', label: 'Nominate for Leadership Program', type: 'positive' as const }
    ];

    // Add conditional actions based on status
    if (employee.advancedStatus === 'retention_risk') {
      actions.push({ id: 'create_retention_plan', label: 'Create Retention Plan', type: 'negative' as const });
    }

    if (employee.advancedStatus === 'promotion_ready') {
      actions.push({ id: 'initiate_promotion', label: 'Initiate Promotion Process', type: 'positive' as const });
    }

    if (employee.advancedManagement.successionPlanning.isSuccessor) {
      actions.push({ id: 'accelerate_development', label: 'Accelerate Development', type: 'positive' as const });
    }

    return actions;
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesStatus = filterStatus === 'all' || employee.advancedStatus === filterStatus;
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
          <RefreshCw className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading advanced employee management...</p>
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
              <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Advanced Employee Management</h1>
                <p className="text-sm text-gray-600">Talent assessment, succession planning, and strategic development</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={fetchAdvancedEmployees}>
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
            <option value="all">All Talent Categories</option>
            <option value="high_performer">High Performer</option>
            <option value="leadership_track">Leadership Track</option>
            <option value="succession_candidate">Succession Candidate</option>
            <option value="retention_risk">Retention Risk</option>
            <option value="promotion_ready">Promotion Ready</option>
            <option value="critical_talent">Critical Talent</option>
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
                    Advanced Talent Pool ({filteredEmployees.length})
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Talent Pool
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
                        selectedEmployee?.id === employee.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{employee.personalInfo.name}</h3>
                          <p className="text-sm text-gray-600">{employee.personalInfo.position}</p>
                          <p className="text-xs text-gray-500">ID: {employee.personalInfo.employeeId} • {employee.personalInfo.tenure} years</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge className={getStatusColor(employee.advancedStatus)}>
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(employee.advancedStatus)}
                              <span>{employee.advancedStatus.replace('_', ' ')}</span>
                            </span>
                          </Badge>
                          <Badge className={getRiskColor(employee.advancedManagement.retentionStrategy.flightRisk)}>
                            Flight Risk: {employee.advancedManagement.retentionStrategy.flightRisk}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
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
                          <DollarSign className="h-4 w-4 mr-2" />
                          {employee.advancedManagement.compensationStrategy.marketPercentile}th percentile
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="font-bold text-blue-600">{employee.advancedManagement.talentAssessment.potentialRating}/5</div>
                          <div className="text-gray-600">Potential</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-bold text-green-600">{employee.advancedManagement.talentAssessment.performanceRating}/5</div>
                          <div className="text-gray-600">Performance</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <div className="font-bold text-purple-600">{employee.advancedManagement.talentAssessment.leadershipCapability}/5</div>
                          <div className="text-gray-600">Leadership</div>
                        </div>
                        <div className="text-center p-2 bg-orange-50 rounded">
                          <div className="font-bold text-orange-600">{employee.advancedManagement.talentAssessment.innovationIndex}/5</div>
                          <div className="text-gray-600">Innovation</div>
                        </div>
                      </div>

                      {employee.advancedManagement.successionPlanning.isSuccessor && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
                          <div className="flex items-center text-sm text-yellow-800">
                            <Crown className="h-4 w-4 mr-2" />
                            <span>Successor for: {employee.advancedManagement.successionPlanning.successorFor.join(', ')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {filteredEmployees.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No advanced employees found matching your criteria</p>
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
                    <span>Advanced Talent Profile</span>
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
                  {/* Talent Overview */}
                  <div className="mb-6 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Talent Assessment</h4>
                      <Badge className={getStatusColor(selectedEmployee.advancedStatus)}>
                        {selectedEmployee.advancedStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Market Value:</span> ${selectedEmployee.advancedManagement.talentAssessment.marketValue.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Replaceability:</span> {selectedEmployee.advancedManagement.talentAssessment.replaceability}
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="mb-4">
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-4">
                        {[
                          { id: 'overview', label: 'Overview' },
                          { id: 'talent', label: 'Talent Assessment' },
                          { id: 'succession', label: 'Succession' },
                          { id: 'leadership', label: 'Leadership' },
                          { id: 'retention', label: 'Retention' },
                          { id: 'compensation', label: 'Compensation' },
                          { id: 'innovation', label: 'Innovation' }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              activeTab === tab.id
                                ? 'border-green-500 text-green-600'
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
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {selectedEmployee.personalInfo.tenure} years tenure
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Talent Metrics</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-blue-50 rounded-lg text-center">
                            <div className="text-2xl font-bold text-blue-600">{selectedEmployee.advancedManagement.talentAssessment.potentialRating}/5</div>
                            <div className="text-sm text-gray-600">Potential Rating</div>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg text-center">
                            <div className="text-2xl font-bold text-green-600">{selectedEmployee.advancedManagement.talentAssessment.performanceRating}/5</div>
                            <div className="text-sm text-gray-600">Performance Rating</div>
                          </div>
                          <div className="p-3 bg-purple-50 rounded-lg text-center">
                            <div className="text-2xl font-bold text-purple-600">{selectedEmployee.advancedManagement.talentAssessment.leadershipCapability}/5</div>
                            <div className="text-sm text-gray-600">Leadership Capability</div>
                          </div>
                          <div className="p-3 bg-orange-50 rounded-lg text-center">
                            <div className="text-2xl font-bold text-orange-600">{selectedEmployee.advancedManagement.talentAssessment.innovationIndex}/5</div>
                            <div className="text-sm text-gray-600">Innovation Index</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Strategic Impact</h4>
                        <div className="space-y-2">
                          {selectedEmployee.advancedManagement.strategicProjects.currentProjects.map((project, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <h5 className="font-medium text-gray-900">{project.name}</h5>
                                <Badge className={
                                  project.strategicImportance === 'critical' ? 'bg-red-100 text-red-800' :
                                  project.strategicImportance === 'high' ? 'bg-orange-100 text-orange-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }>
                                  {project.strategicImportance}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600">
                                <div>Role: {project.role} • Visibility: {project.visibility}</div>
                                <div>Timeline: {project.timeline}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Retention Status</h4>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Flight Risk:</span>
                            <Badge className={getRiskColor(selectedEmployee.advancedManagement.retentionStrategy.flightRisk)}>
                              {selectedEmployee.advancedManagement.retentionStrategy.flightRisk}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Satisfaction:</span> {selectedEmployee.advancedManagement.retentionStrategy.satisfactionScore}/10
                            </div>
                            <div>
                              <span className="font-medium">Engagement:</span> {selectedEmployee.advancedManagement.retentionStrategy.engagementScore}/10
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'talent' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Comprehensive Assessment</h4>
                        <div className="space-y-3">
                          {[
                            { label: 'Potential Rating', value: selectedEmployee.advancedManagement.talentAssessment.potentialRating, max: 5 },
                            { label: 'Performance Rating', value: selectedEmployee.advancedManagement.talentAssessment.performanceRating, max: 5 },
                            { label: 'Leadership Capability', value: selectedEmployee.advancedManagement.talentAssessment.leadershipCapability, max: 5 },
                            { label: 'Technical Expertise', value: selectedEmployee.advancedManagement.talentAssessment.technicalExpertise, max: 5 },
                            { label: 'Cultural Fit', value: selectedEmployee.advancedManagement.talentAssessment.culturalFit, max: 5 },
                            { label: 'Innovation Index', value: selectedEmployee.advancedManagement.talentAssessment.innovationIndex, max: 5 }
                          ].map((metric, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm font-medium">{metric.label}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${(metric.value / metric.max) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">{metric.value}/{metric.max}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Market Analysis</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">${selectedEmployee.advancedManagement.talentAssessment.marketValue.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Market Value</div>
                          </div>
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <div className="text-lg font-bold text-purple-600 capitalize">{selectedEmployee.advancedManagement.talentAssessment.replaceability}</div>
                            <div className="text-sm text-gray-600">Replaceability</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Risk Profile</h4>
                        <div className="p-3 rounded-lg" style={{
                          backgroundColor: selectedEmployee.advancedManagement.talentAssessment.riskProfile === 'low' ? '#f0f9ff' :
                                          selectedEmployee.advancedManagement.talentAssessment.riskProfile === 'medium' ? '#fffbeb' : '#fef2f2'
                        }}>
                          <Badge className={getRiskColor(selectedEmployee.advancedManagement.talentAssessment.riskProfile)}>
                            {selectedEmployee.advancedManagement.talentAssessment.riskProfile.toUpperCase()} RISK
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'succession' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Succession Status</h4>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Is Successor:</span>
                            <Badge className={selectedEmployee.advancedManagement.successionPlanning.isSuccessor ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {selectedEmployee.advancedManagement.successionPlanning.isSuccessor ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                          {selectedEmployee.advancedManagement.successionPlanning.isSuccessor && (
                            <>
                              <div className="mb-2">
                                <span className="font-medium">Successor For:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {selectedEmployee.advancedManagement.successionPlanning.successorFor.map(role => (
                                    <Badge key={role} variant="outline" className="text-xs">
                                      {role}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium">Readiness Level:</span>
                                <Badge className={
                                  selectedEmployee.advancedManagement.successionPlanning.readinessLevel === 'ready_now' ? 'bg-green-100 text-green-800' :
                                  selectedEmployee.advancedManagement.successionPlanning.readinessLevel === 'ready_1_year' ? 'bg-blue-100 text-blue-800' :
                                  selectedEmployee.advancedManagement.successionPlanning.readinessLevel === 'ready_2_years' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-orange-100 text-orange-800'
                                }>
                                  {selectedEmployee.advancedManagement.successionPlanning.readinessLevel.replace('_', ' ')}
                                </Badge>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {selectedEmployee.advancedManagement.successionPlanning.developmentGaps.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Development Gaps</h4>
                          <div className="space-y-2">
                            {selectedEmployee.advancedManagement.successionPlanning.developmentGaps.map((gap, index) => (
                              <div key={index} className="p-2 bg-orange-50 rounded border-l-4 border-orange-400">
                                <span className="text-sm text-orange-800">{gap}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedEmployee.advancedManagement.successionPlanning.successorCandidates.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Successor Candidates</h4>
                          <div className="space-y-2">
                            {selectedEmployee.advancedManagement.successionPlanning.successorCandidates.map((candidate, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div>
                                  <div className="font-medium text-sm">{candidate.name}</div>
                                  <div className="text-xs text-gray-600">ID: {candidate.employeeId}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium">{candidate.probability}% probability</div>
                                  <div className="text-xs text-gray-600">{candidate.readiness}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
                          onClick={() => updateEmployeeAction(selectedEmployee.id, action.id)}
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
                    Choose an employee from the talent pool to view advanced analytics and strategic planning
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
