'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Search, Building2, MapPin, Globe, Briefcase, SlidersHorizontal } from 'lucide-react';
import { Company, CompanyFilters, LikedCompany } from '@/types/company-job';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useRouter } from 'next/navigation';

function normalizeCompany(c: any) {
  const pickName = () => {
    const candidates: Array<string | undefined> = [
      typeof c.name === 'string' ? c.name : undefined,
      typeof c.company?.name === 'string' ? c.company.name : undefined,
      typeof c.profile?.name === 'string' ? c.profile.name : undefined,
      [c.firstName, c.lastName].filter(Boolean).join(' ') || undefined,
    ];
    for (const v of candidates) {
      if (v && v.toString().trim().length > 0) return v.toString().trim();
    }
    return 'Company';
  };

  return {
    id: c.id ?? c._id ?? c.companyId,
    name: pickName(),
    logo: c.logo ?? c.logoUrl ?? c.company?.logo ?? c.profile?.logo ?? c.logo?.url ?? '',
    description: c.description ?? c.about ?? c.company?.description ?? '',
    nature: c.nature ?? c.type ?? c.industry ?? 'Company',
    address: c.address ?? c.company?.headquarters ?? c.profile?.location ?? 'Location not specified',
    website: c.website ?? c.site ?? c.links?.website ?? '',
    activeJobsCount: c.activeJobsCount ?? c.jobsCount ?? c.openingsCount,
  };
}


export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [likedCompanies, setLikedCompanies] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<CompanyFilters>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [salaryMin, setSalaryMin] = useState<string>('');
  const [salaryMax, setSalaryMax] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('latest');

  useEffect(() => {
    fetchCompanies();
    fetchLikedCompanies();
  }, [filters, selectedIndustry, selectedLocation, salaryMin, salaryMax, sortBy]);

  const fetchCompanies = async () => {
      try {
        setLoading(true);

        // If sorting by liked companies, fetch liked companies instead
        if (sortBy === 'liked') {
          const token = localStorage.getItem('authToken');
          if (!token) {
            // Redirect to login page if not authenticated
            router.push('/auth/login');
            setLoading(false);
            return;
          }

          const res = await fetch('/api/companies/liked?includeCompanyDetails=true', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const raw = await res.json();

          if (raw.success) {
            const list = Array.isArray(raw.data) ? raw.data : [];
            // Transform liked companies data to match company structure
            const normalized = list.map((likedCompany: any) => {
              const company = likedCompany.company;
              return normalizeCompany({
                ...company,
                id: company._id,
                name: company.company?.name || `${company.firstName} ${company.lastName}`,
                description: company.company?.description || '',
                nature: company.company?.industry || 'Company',
                address: company.company?.headquarters || '',
                website: company.company?.website || '',
                logo: company.company?.logo || '',
                activeJobsCount: 0 // Will be populated if needed
              });
            });
            setCompanies(normalized);
          } else {
            setCompanies([]);
          }
          setLoading(false);
          return;
        }

        // Regular company fetching logic
        const queryParams = new URLSearchParams();

        // Search filter
        if (filters.search || searchTerm) {
          queryParams.append('search', filters.search || searchTerm);
        }

        // Industry filter
        if (selectedIndustry && selectedIndustry !== 'all') {
          queryParams.append('industry', selectedIndustry);
        }

        // Location filter
        if (selectedLocation && selectedLocation !== 'all') {
          queryParams.append('location', selectedLocation);
        }

        // Salary range filter
        if (salaryMin) queryParams.append('salaryMin', salaryMin);
        if (salaryMax) queryParams.append('salaryMax', salaryMax);

        // Sorting
        if (sortBy === 'latest') {
          queryParams.append('$sort', JSON.stringify({ createdAt: -1 }));
        } else if (sortBy === 'name') {
          queryParams.append('$sort', JSON.stringify({ 'company.name': 1 }));
        }

        const res = await fetch(`/api/companies?${queryParams.toString()}`);
        const raw = await res.json();
        const list = Array.isArray(raw) ? raw : (raw.data ?? raw.results ?? raw.items ?? []);
        const normalized = list.map(normalizeCompany);

        setCompanies(normalized);
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
    };


  const fetchLikedCompanies = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return; // Skip if not authenticated
      }

      const res = await fetch('/api/companies/liked', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const raw = await res.json();

      if (raw.success) {
        const list = Array.isArray(raw.data) ? raw.data : [];
        const likedIds = new Set<string>(
          list.map((x: any) => String(x.companyId ?? x.id ?? x._id))
        );
        setLikedCompanies(likedIds);
      }
    } catch (error) {
      console.error('Error fetching liked companies:', error);
    }
  };


  const handleLikeCompany = async (companyId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        // Redirect to login page if not authenticated
        router.push('/auth/login');
        return;
      }

      const isLiked = likedCompanies.has(companyId);
      const method = isLiked ? 'DELETE' : 'POST';

      const response = await fetch('/api/companies/like', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ companyId }),
      });

      if (response.status === 401) {
        router.push('/auth/login');
        return;
      }

      if (response.ok) {
        const newLikedCompanies = new Set(likedCompanies);
        if (isLiked) {
          newLikedCompanies.delete(companyId);
        } else {
          newLikedCompanies.add(companyId);
        }
        setLikedCompanies(newLikedCompanies);

        // If currently viewing liked companies, refresh the list
        if (sortBy === 'liked') {
          fetchCompanies();
        }
      } else {
        console.error('Failed to toggle like. HTTP', response.status);
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

          {/* Advanced Filters */}
          <div className="max-w-6xl mx-auto mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedIndustry('all');
                    setSelectedLocation('all');
                    setSalaryMin('');
                    setSalaryMax('');
                    setSortBy('latest');
                    setSearchTerm('');
                    setFilters({});
                  }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Industry Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nature of Business
                  </label>
                  <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Consulting">Consulting</SelectItem>
                      <SelectItem value="Media">Media</SelectItem>
                      <SelectItem value="Non-profit">Non-profit</SelectItem>
                      <SelectItem value="Government">Government</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="Kuala Lumpur">Kuala Lumpur</SelectItem>
                      <SelectItem value="Selangor">Selangor</SelectItem>
                      <SelectItem value="Penang">Penang</SelectItem>
                      <SelectItem value="Johor">Johor</SelectItem>
                      <SelectItem value="Sabah">Sabah</SelectItem>
                      <SelectItem value="Sarawak">Sarawak</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Salary Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Salary (RM)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 1000"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Salary (RM)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 5000"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest</SelectItem>
                      <SelectItem value="name">Company Name</SelectItem>
                      <SelectItem value="jobs">Most Jobs</SelectItem>
                      <SelectItem value="liked">Liked Companies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
