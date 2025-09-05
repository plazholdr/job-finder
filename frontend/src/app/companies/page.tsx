'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, Search, Building2, MapPin, Globe, Users, Briefcase } from 'lucide-react';
import { Company, CompanyFilters, LikedCompany } from '@/types/company-job';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [likedCompanies, setLikedCompanies] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<CompanyFilters>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCompanies();
    fetchLikedCompanies();
  }, [filters]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.nature?.length) queryParams.append('nature', filters.nature.join(','));
      if (filters.location?.length) queryParams.append('location', filters.location.join(','));

      const response = await fetch(`/api/companies?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setCompanies(data.data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedCompanies = async () => {
    try {
      const response = await fetch('/api/companies/liked');
      const data = await response.json();

      if (data.success) {
        const likedIds = new Set(data.data.map((liked: LikedCompany) => liked.companyId));
        setLikedCompanies(likedIds);
      }
    } catch (error) {
      console.error('Error fetching liked companies:', error);
    }
  };

  const handleLikeCompany = async (companyId: string) => {
    try {
      const isLiked = likedCompanies.has(companyId);
      const method = isLiked ? 'DELETE' : 'POST';

      const response = await fetch('/api/companies/like', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId }),
      });

      if (response.ok) {
        const newLikedCompanies = new Set(likedCompanies);
        if (isLiked) {
          newLikedCompanies.delete(companyId);
        } else {
          newLikedCompanies.add(companyId);
        }
        setLikedCompanies(newLikedCompanies);
      }
    } catch (error) {
      console.error('Error toggling company like:', error);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Companies</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing companies offering internship opportunities and find your perfect match
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search companies by name, industry, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
              <Button onClick={handleSearch} size="lg" className="px-8 h-12 rounded-xl">
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Companies Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="h-20 w-20 bg-gray-200 rounded-2xl mb-6 mx-auto"></div>
                  <div className="h-5 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or check back later for new companies.</p>
            <Button onClick={() => {
              setSearchTerm('');
              setFilters({});
              fetchCompanies();
            }} variant="outline">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {companies.map((company) => (
              <Link key={company.id} href={`/companies/${company.id}`}>
                <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border-0 shadow-lg bg-white">
                  <CardContent className="p-8 text-center">
                    <div className="relative mb-6">
                      <div className="h-20 w-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={`${company.name} logo`}
                            className="h-12 w-12 object-contain"
                          />
                        ) : (
                          <Building2 className="h-10 w-10 text-blue-600" />
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleLikeCompany(company.id);
                        }}
                        className="absolute -top-2 -right-2 p-2 rounded-full bg-white shadow-md hover:shadow-lg"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            likedCompanies.has(company.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-gray-400'
                          }`}
                        />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {company.name}
                      </h3>
                      <Badge variant="secondary" className="text-xs px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
                        {company.nature}
                      </Badge>
                    </div>

                    <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {company.description}
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="truncate">{company.address}</span>
                      </div>
                      {company.activeJobsCount !== undefined && (
                        <div className="flex items-center justify-center text-sm text-green-600 font-medium">
                          <Briefcase className="h-4 w-4 mr-2" />
                          {company.activeJobsCount} Active Jobs
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Button
                        variant="default"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-xl group-hover:bg-blue-700 transition-colors"
                      >
                        View Company
                      </Button>
                      {company.website && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(company.website, '_blank');
                          }}
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Visit Website
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

      {!loading && companies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}
      </div>
    </AppLayout>
  );
}
