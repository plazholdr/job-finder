'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, Search, Building2, MapPin, Globe, Users } from 'lucide-react';
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
      <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Companies</h1>
        <p className="text-gray-600 mb-6">
          Discover companies offering internship opportunities
        </p>

        {/* Search Bar */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 w-16 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={`${company.name} logo`}
                          className="h-12 w-12 object-contain"
                        />
                      ) : (
                        <Building2 className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{company.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {company.nature}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLikeCompany(company.id);
                    }}
                    className="p-2"
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

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {company.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    {company.address}
                  </div>
                  {company.website && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Globe className="h-4 w-4 mr-2" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <Link href={`/companies/${company.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/companies/${company.id}/jobs`}>
                    <Button size="sm">
                      View Jobs
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
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
