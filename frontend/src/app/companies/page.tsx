"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { withAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import {
  Search,
  Filter,
  Building2,
  MapPin,
  Users,
  Globe,
  Star,
  ChevronDown,
  ArrowLeft,
  Briefcase,
  Calendar
} from 'lucide-react';
import UserProfile from '@/components/UserProfile';

interface Company {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  company?: {
    name: string;
    description: string;
    industry: string;
    size: string;
    founded: string;
    headquarters: string;
    website: string;
    logo: string;
    phone?: string;
    registrationNumber?: string;
  };
  activeJobsCount?: number;
}

// Companies are now fetched from backend (includes both real and dummy data)

function CompaniesPage() {
  const { token } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, [token]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/companies', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        // Backend now handles mixing real and dummy companies
        setCompanies(result.data || result);
      } else {
        console.error('Failed to fetch companies');
        setCompanies([]);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = !searchTerm || 
      company.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.company?.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.company?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesIndustry = selectedIndustry === 'all' || 
      company.company?.industry === selectedIndustry;
    
    const matchesSize = selectedSize === 'all' || 
      company.company?.size === selectedSize;

    return matchesSearch && matchesIndustry && matchesSize;
  });

  const industries = [...new Set(companies.map(c => c.company?.industry).filter(Boolean))];
  const sizes = [...new Set(companies.map(c => c.company?.size).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/pages/student-dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Discover Companies</h1>
                <p className="text-gray-600 mt-1">Explore companies and their job opportunities</p>
              </div>
            </div>
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies by name, industry, or description"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-5 w-5" />
                Filters
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Industries</option>
                    {industries.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Sizes</option>
                    {sizes.map(size => (
                      <option key={size} value={size}>{size} employees</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedIndustry('all');
                      setSelectedSize('all');
                      setSearchTerm('');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredCompanies.length} companies
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        {/* Company Listings */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading companies...</p>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCompanies.map((company) => (
              <div key={company._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                      {company.company?.logo ? (
                        <img 
                          src={company.company.logo} 
                          alt={company.company?.name} 
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <Building2 className="h-8 w-8 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {company.company?.name || `${company.firstName} ${company.lastName} Company`}
                      </h3>
                      <p className="text-gray-600">{company.company?.industry || 'Industry not specified'}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-yellow-500">
                    <Star className="h-6 w-6" />
                  </button>
                </div>

                <p className="mt-4 text-gray-700 line-clamp-2">
                  {company.company?.description || 'No description available.'}
                </p>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                  {company.company?.headquarters && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {company.company.headquarters}
                    </span>
                  )}
                  {company.company?.size && (
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {company.company.size} employees
                    </span>
                  )}
                  {company.company?.founded && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Founded {company.company.founded}
                    </span>
                  )}
                  {company.company?.website && (
                    <a 
                      href={company.company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </a>
                  )}
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <div className="flex items-center gap-1 text-green-600">
                    <Briefcase className="h-4 w-4" />
                    <span className="font-medium">{company.activeJobsCount || 0} active jobs</span>
                  </div>
                  <Link
                    href={`/companies/${company._id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Company
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default withAuth(CompaniesPage);
