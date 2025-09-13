"use client"

import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  Building2,
  GraduationCap,
  BarChart3,
  Settings,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  MoreVertical,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  Clock,
  TrendingUp,
  UserCheck,
  UserX,
  FileText,
  Activity
} from 'lucide-react';
import UserProfile from '@/components/UserProfile';
import { withAuth } from '@/contexts/auth-context';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'company' | 'admin';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  company?: {
    name: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
  };
}

interface SystemStats {
  users: {
    students: number;
    companies: number;
    admins: number;
    total: number;
  };
  verification: {
    pending: number;
    verified: number;
  };
  activity: {
    recentRegistrations: number;
    activeUsers: number;
  };
}

interface AdminLog {
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: string;
  details: any;
  timestamp: string;
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [pendingCompanies, setPendingCompanies] = useState<User[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notesByCompany, setNotesByCompany] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchSystemStats();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'companies') {
      fetchPendingCompanies();
    } else if (activeTab === 'logs') {
      fetchAdminLogs();
    }
  }, [activeTab, searchTerm, roleFilter, statusFilter]);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSystemStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

    const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/companies?status=${encodeURIComponent(statusFilter)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setPendingCompanies(data.data);
      }
    } catch (error) {
      console.error('Error fetching pending companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/logs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAdminLogs(data.data);
      }
    } catch (error) {
      console.error('Error fetching admin logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, status: string, reason?: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ status, reason })
      });

      if (response.ok) {
        fetchUsers(); // Refresh the users list
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const verifyCompany = async (companyId: string, status: string, notes?: string) => {
    try {
      setProcessingId(companyId);
      const response = await fetch(`/api/admin/companies/${companyId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ status, notes })
      });

      if (response.ok) {
        fetchPendingCompanies(); // Refresh the pending companies list
        setNotesByCompany((prev) => ({ ...prev, [companyId]: '' }));
      }
    } catch (error) {
      console.error('Error verifying company:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const recentUsers = [
    { key: '1', displayName: 'John Doe', email: 'john@example.com', role: 'student', status: 'pending', joinDate: '2024-01-15', lastActive: '2 hours ago' },
    { key: '2', displayName: 'TechCorp Inc', email: 'hr@techcorp.com', role: 'company', status: 'active', joinDate: '2024-01-10', lastActive: '1 day ago' },
  ];

  const pendingJobs = [
    { id: '1', title: 'Senior Software Engineer', company: 'TechCorp Inc', status: 'pending', posted: '2 hours ago', salary: '$120k-150k' },
    { id: '2', title: 'Data Scientist', company: 'DataWorks', status: 'pending', posted: '1 day ago', salary: '$100k-130k' },
  ];

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student':
        return <GraduationCap className="h-4 w-4" />;
      case 'company':
        return <Building2 className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-purple-600" />
            Admin Panel
          </h1>
        </div>
        <nav className="mt-6">
          <a
            href="#"
            className={`flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 ${
              activeTab === 'overview' ? 'bg-purple-50 text-purple-600' : ''
            }`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 className="h-5 w-5" />
            Overview
          </a>
          <a
            href="#"
            className={`flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 ${
              activeTab === 'users' ? 'bg-purple-50 text-purple-600' : ''
            }`}
            onClick={() => setActiveTab('users')}
          >
            <Users className="h-5 w-5" />
            User Management
          </a>
          <a
            href="#"
            className={`flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 ${
              activeTab === 'jobs' ? 'bg-purple-50 text-purple-600' : ''
            }`}
            onClick={() => setActiveTab('jobs')}
          >
            <Briefcase className="h-5 w-5" />
            Job Approvals
          </a>
          <a
            href="#"
            className={`flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 ${
              activeTab === 'companies' ? 'bg-purple-50 text-purple-600' : ''
            }`}
            onClick={() => setActiveTab('companies')}
          >
            <Building2 className="h-5 w-5" />
            Companies
          </a>
          <a
            href="#"
            className={`flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 ${
              activeTab === 'students' ? 'bg-purple-50 text-purple-600' : ''
            }`}
            onClick={() => setActiveTab('students')}
          >
            <GraduationCap className="h-5 w-5" />
            Students
          </a>
          <a
            href="#"
            className={`flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 ${
              activeTab === 'logs' ? 'bg-purple-50 text-purple-600' : ''
            }`}
            onClick={() => setActiveTab('logs')}
          >
            <Activity className="h-5 w-5" />
            Activity Logs
          </a>
          <a
            href="#"
            className={`flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 ${
              activeTab === 'settings' ? 'bg-purple-50 text-purple-600' : ''
            }`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="h-5 w-5" />
            Settings
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {activeTab === 'overview' && 'Dashboard Overview'}
            {activeTab === 'users' && 'User Management'}
            {activeTab === 'jobs' && 'Job Approvals'}
            {activeTab === 'companies' && 'Company Management'}
            {activeTab === 'students' && 'Student Management'}
            {activeTab === 'settings' && 'System Settings'}
          </h2>
          <UserProfile />
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{systemStats?.users.total || 0}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Students</p>
                        <p className="text-2xl font-bold text-gray-900">{systemStats?.users.students || 0}</p>
                      </div>
                      <GraduationCap className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Companies</p>
                        <p className="text-2xl font-bold text-gray-900">{systemStats?.users.companies || 0}</p>
                      </div>
                      <Building2 className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
                        <p className="text-2xl font-bold text-gray-900">{systemStats?.verification.pending || 0}</p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Verified Companies</p>
                        <p className="text-2xl font-bold text-gray-900">{systemStats?.verification.verified || 0}</p>
                      </div>
                      <UserCheck className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Recent Registrations</p>
                        <p className="text-2xl font-bold text-gray-900">{systemStats?.activity.recentRegistrations || 0}</p>
                        <p className="text-xs text-gray-500">Last 30 days</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Users</p>
                        <p className="text-2xl font-bold text-gray-900">{systemStats?.activity.activeUsers || 0}</p>
                        <p className="text-xs text-gray-500">Last 7 days</p>
                      </div>
                      <Activity className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Admin Users</p>
                        <p className="text-2xl font-bold text-gray-900">{systemStats?.users.admins || 0}</p>
                      </div>
                      <Shield className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Users */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent User Registrations</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentUsers.map((user) => (
                      <div key={user.key} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getRoleIcon(user.role)}
                          <div>
                            <p className="font-medium text-gray-900">{user.displayName}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(user.status)}`}>
                          {user.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pending Job Approvals */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Pending Job Approvals</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {pendingJobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{job.title}</p>
                          <p className="text-sm text-gray-500">{job.company} • {job.salary}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or email"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="h-5 w-5" />
                  Filters
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Join Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Last Active</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.key} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getRoleIcon(user.role)}
                          <div>
                            <div className="font-medium text-gray-900">{user.displayName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-gray-900">{user.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{user.joinDate}</td>
                      <td className="px-6 py-4 text-gray-500">{user.lastActive}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                            <Eye className="h-4 w-4" />
                          </button>
                          {user.status === 'pending' && (
                            <>
                              <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button className="p-1 text-gray-400 hover:bg-gray-50 rounded">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Job Approvals Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search job postings"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="h-5 w-5" />
                  Filters
                </button>
              </div>
            </div>

            {/* Jobs Table */}
            <div className="bg-white rounded-lg shadow">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Job Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Company</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Salary</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Posted</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingJobs.map((job) => (
                    <tr key={job.id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{job.title}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{job.company}</td>
                      <td className="px-6 py-4 text-gray-900">{job.salary}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(job.status)}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{job.posted}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                            <Eye className="h-4 w-4" />
                          </button>
                          {job.status === 'pending' && (
                            <>
                              <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
      <h3 className="text-lg font-semibold text-gray-900">Company Management</h3>
      <p className="text-sm text-gray-500">Browse and manage company registrations by status.</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                    value={statusFilter}
                    onChange={async (e) => {
                      const v = e.target.value;
                      setStatusFilter(v);
                      setLoading(true);
                      try {
                        const res = await fetch(`/api/admin/companies?status=${encodeURIComponent(v)}`, {
                          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                        });
                        const data = await res.json();
                        if (data?.success) setPendingCompanies(data.data);
                      } catch (e) {}
                      setLoading(false);
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                    <option value="suspended">Suspended</option>
                    <option value="all">All</option>
                  </select>
                  <button
                  onClick={fetchPendingCompanies}
                  className="px-3 py-2 text-sm rounded border border-gray-300 hover:bg-gray-50"
                  disabled={loading}
                >
                  Refresh
                  </button>
                </div>
              </div>

        {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
        ) : pendingCompanies.length === 0 ? (
                <div className="text-center py-10">
                  <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No companies found for the selected status.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Company</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Registered</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Notes</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingCompanies.map((c) => (
                        <tr key={c._id} className="border-b last:border-b-0 hover:bg-gray-50 align-top">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{c.company?.name || '—'}</div>
                            <div className="text-xs text-gray-500">ID: {c._id}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-900">{c.email}</td>
                          <td className="px-6 py-4 text-gray-500">{c.createdAt ? new Date(c.createdAt).toLocaleString() : '—'}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(c.company?.verificationStatus || 'pending')}`}>
                              {c.company?.verificationStatus || 'pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              placeholder="Optional notes or reason"
                              className="w-64 max-w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              value={notesByCompany[c._id] || ''}
                              onChange={(e) => setNotesByCompany((prev) => ({ ...prev, [c._id]: e.target.value }))}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <select
                                className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                                defaultValue={c.company?.verificationStatus || 'pending'}
                                onChange={(e) => verifyCompany(c._id, e.target.value, notesByCompany[c._id])}
                                disabled={processingId === c._id}
                              >
                                <option value="verified">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="pending">Pending</option>
                                <option value="suspended">Suspended</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Student Management</h3>
                <p className="text-gray-500">Manage student registrations, profiles, and applications.</p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">System Settings</h3>
                <p className="text-gray-500">Configure system settings, permissions, and platform preferences.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(AdminDashboard);
