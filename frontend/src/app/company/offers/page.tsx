'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  FileText, 
  Plus,
  Search,
  Filter,
  User,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  MoreHorizontal,
  Send,
  Download,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { JobOffer } from '@/types/company';

export default function CompanyOffersPage() {
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<JobOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    filterOffers();
  }, [offers, searchTerm, statusFilter, jobFilter]);

  const fetchOffers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/company/offers');
      const result = await response.json();

      if (result.success) {
        setOffers(result.data);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOffers = () => {
    let filtered = [...offers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(offer =>
        offer.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(offer => offer.status === statusFilter);
    }

    // Job filter
    if (jobFilter !== 'all') {
      filtered = filtered.filter(offer => offer.jobId === jobFilter);
    }

    setFilteredOffers(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-purple-100 text-purple-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="h-4 w-4" />;
      case 'pending_approval': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'declined': return <XCircle className="h-4 w-4" />;
      case 'expired': return <AlertCircle className="h-4 w-4" />;
      case 'withdrawn': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = async (offerId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/company/offers/${offerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const result = await response.json();
        setOffers(prevOffers =>
          prevOffers.map(offer =>
            offer.id === offerId ? result.data : offer
          )
        );
      }
    } catch (error) {
      console.error('Error updating offer status:', error);
    }
  };

  const formatSalary = (offer: JobOffer) => {
    const { salary } = offer;
    return `$${salary.amount.toLocaleString()} ${salary.currency}/${salary.period}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpiringSoon = (expiresAt: Date) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 3 && daysUntilExpiry > 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading offers...</p>
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
                <h1 className="text-xl font-bold text-gray-900">Job Offers</h1>
                <p className="text-sm text-gray-600">Manage job offers and hiring decisions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/company/dashboard">
                <Button variant="outline">
                  Back to Dashboard
                </Button>
              </Link>
              <Link href="/company/offers/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Offer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    placeholder="Search by candidate name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="sent">Sent</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                  <option value="expired">Expired</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>

                <select
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Jobs</option>
                  <option value="job-1">Software Engineering Intern</option>
                  <option value="job-2">Marketing Intern</option>
                  <option value="job-3">Data Science Intern</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Offers</p>
                  <p className="text-3xl font-bold text-gray-900">{offers.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {offers.filter(offer => offer.status === 'pending_approval' || offer.status === 'sent').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Accepted</p>
                  <p className="text-3xl font-bold text-green-600">
                    {offers.filter(offer => offer.status === 'accepted').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {offers.filter(offer => 
                      offer.status === 'sent' && isExpiringSoon(offer.expiresAt)
                    ).length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Offers List */}
        <div className="space-y-6">
          {filteredOffers.length > 0 ? (
            filteredOffers.map((offer) => (
              <Card key={offer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {offer.candidate.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {offer.candidate.email}
                            </span>
                            <span className="flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              {offer.jobTitle}
                            </span>
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {formatSalary(offer)}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Start: {formatDate(offer.startDate)}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Created: {formatDate(offer.createdAt)}</span>
                            {offer.sentAt && (
                              <span>Sent: {formatDate(offer.sentAt)}</span>
                            )}
                            {offer.status === 'sent' && (
                              <span className={isExpiringSoon(offer.expiresAt) ? 'text-orange-600 font-medium' : ''}>
                                Expires: {formatDate(offer.expiresAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge className={getStatusColor(offer.status)}>
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(offer.status)}
                              <span>{offer.status.replace('_', ' ')}</span>
                            </span>
                          </Badge>
                          {offer.status === 'sent' && isExpiringSoon(offer.expiresAt) && (
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                              Expiring Soon
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Benefits Preview */}
                      {offer.benefits && offer.benefits.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Benefits:</p>
                          <div className="flex flex-wrap gap-2">
                            {offer.benefits.slice(0, 3).map((benefit, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {benefit}
                              </Badge>
                            ))}
                            {offer.benefits.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{offer.benefits.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Application ID: {offer.applicationId}</span>
                          {offer.approvedBy && (
                            <>
                              <span>•</span>
                              <span>Approved by: {offer.approvedBy.name}</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link href={`/company/offers/${offer.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                          
                          {(offer.status === 'draft' || offer.status === 'pending_approval') && (
                            <Link href={`/company/offers/${offer.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            </Link>
                          )}

                          <div className="relative group">
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <div className="py-1">
                                {offer.status === 'draft' && (
                                  <button
                                    onClick={() => handleStatusUpdate(offer.id, 'pending_approval')}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Send className="h-4 w-4 mr-2" />
                                    Submit for Approval
                                  </button>
                                )}
                                
                                {offer.status === 'pending_approval' && (
                                  <>
                                    <button
                                      onClick={() => handleStatusUpdate(offer.id, 'approved')}
                                      className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleStatusUpdate(offer.id, 'draft')}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Request Changes
                                    </button>
                                  </>
                                )}
                                
                                {offer.status === 'approved' && (
                                  <button
                                    onClick={() => handleStatusUpdate(offer.id, 'sent')}
                                    className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                                  >
                                    <Send className="h-4 w-4 mr-2" />
                                    Send to Candidate
                                  </button>
                                )}
                                
                                <button
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download PDF
                                </button>
                                
                                {(offer.status === 'draft' || offer.status === 'pending_approval') && (
                                  <button
                                    onClick={() => handleStatusUpdate(offer.id, 'withdrawn')}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Withdraw Offer
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No offers found</h3>
                <p className="text-gray-600 mb-6">
                  {offers.length === 0 
                    ? "No job offers have been created yet." 
                    : "No offers match your current filters."
                  }
                </p>
                {offers.length === 0 && (
                  <Link href="/company/offers/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Offer
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
