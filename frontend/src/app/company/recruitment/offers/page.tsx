"use client"

import React, { useState, useEffect } from 'react';
import {
  Gift,
  DollarSign,
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  Plus,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Eye,
  Edit,
  MoreVertical,
  FileText,
  Download
} from 'lucide-react';

interface Offer {
  id: string;
  companyId: string;
  candidateId: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  position: string;
  department: string;
  candidateName: string;
  
  salary: {
    amount: number;
    currency: string;
    period: 'hour' | 'month' | 'year';
    paySchedule: string;
  };
  
  employment: {
    type: 'internship' | 'full-time' | 'part-time' | 'contract';
    startDate: string;
    endDate?: string;
    duration?: number;
    workLocation: 'remote' | 'hybrid' | 'on-site';
    hoursPerWeek: number;
  };
  
  benefits: string[];
  perks: string[];
  
  expiresAt: string;
  responseDeadline: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired' | 'negotiating';
  sentAt: string;
  respondedAt?: string;
  
  message: string;
  attachments: string[];
  
  contactPerson: {
    name: string;
    title: string;
    email: string;
    phone?: string;
  };
  
  negotiations: Array<{
    id: string;
    from: 'company' | 'candidate';
    message: string;
    proposedChanges: any;
    timestamp: string;
    status: 'pending' | 'accepted' | 'rejected';
  }>;
  
  createdAt: string;
  updatedAt: string;
}

export default function OfferManagement() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, [statusFilter, departmentFilter]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('userType', 'company');
      params.append('userId', 'company-1'); // In real app, get from auth

      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/offers?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setOffers(data.data);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      accepted: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      withdrawn: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      expired: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      negotiating: { color: 'bg-blue-100 text-blue-800', icon: MessageSquare }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const formatSalary = (salary: Offer['salary']) => {
    const { amount, currency, period } = salary;
    const periodText = period === 'hour' ? '/hr' : period === 'month' ? '/mo' : '/yr';
    return `${currency} $${amount}${periodText}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = 
      offer.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || offer.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(offers.map(offer => offer.department))];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Offer Management</h1>
              <p className="text-gray-600 mt-2">Create and manage job offers for candidates</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Offer
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Offers</p>
                <p className="text-2xl font-bold text-gray-900">{offers.length}</p>
              </div>
              <Gift className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {offers.filter(o => o.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-green-600">
                  {offers.filter(o => o.status === 'accepted').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Negotiating</p>
                <p className="text-2xl font-bold text-blue-600">
                  {offers.filter(o => o.status === 'negotiating').length}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="negotiating">Negotiating</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="expired">Expired</option>
            </select>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Offers List */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
              <p className="text-gray-600">Create your first job offer to get started.</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate & Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Compensation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employment Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status & Timeline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOffers.map((offer) => {
                    const daysUntilExpiry = getDaysUntilExpiry(offer.expiresAt);
                    
                    return (
                      <tr key={offer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {offer.candidateName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {offer.jobTitle}
                            </div>
                            <div className="text-xs text-gray-400">
                              {offer.department}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatSalary(offer.salary)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {offer.salary.paySchedule}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">
                            {offer.employment.type}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(offer.employment.startDate)}
                            {offer.employment.endDate && ` - ${formatDate(offer.employment.endDate)}`}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {offer.employment.workLocation} • {offer.employment.hoursPerWeek}h/week
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="mb-2">
                            {getStatusBadge(offer.status)}
                          </div>
                          {offer.status === 'pending' && (
                            <div className={`text-xs ${daysUntilExpiry <= 1 ? 'text-red-600' : daysUntilExpiry <= 3 ? 'text-yellow-600' : 'text-gray-500'}`}>
                              {daysUntilExpiry > 0 ? `${daysUntilExpiry} days left` : 'Expired'}
                            </div>
                          )}
                          {offer.negotiations.length > 0 && (
                            <div className="text-xs text-blue-600">
                              {offer.negotiations.length} negotiation(s)
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              title="View Offer"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="text-gray-600 hover:text-gray-900"
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              className="text-gray-600 hover:text-gray-900"
                              title="Edit Offer"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              className="text-gray-600 hover:text-gray-900"
                              title="More Actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
