'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Building2, Users, Heart, Eye, Filter, SortAsc, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/layout/PageLayout';
import AppHeader from '@/components/layout/AppHeader';


// Resolve image src from possible S3 key or full URL
const resolveImageSrc = (val?: string | null) => {
  if (!val) return '/api/placeholder/64/64' as any;
  return /^https?:\/\//i.test(val) ? (val as any) : `/api/files/image?key=${encodeURIComponent(val as string)}`;
};

interface Company {
  id: string;
  name: string;
  description: string;
  nature: string;
  logo: string;
  email: string;
  address: string;
  phoneNumber: string;
  website: string;
  activeJobsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CompanyFilters {
  search: string;
  nature: string;
  size: string;
  location: string;
  sortBy: 'name' | 'salary' | 'latest';
}


  // Normalize backend/adapter responses into a unified Company shape
  function normalizeCompany(c: any): Company {
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
      address: c.address ?? [c.city, c.state, c.country].filter(Boolean).join(', '),
      website: c.website ?? c.site ?? c.links?.website ?? '',
      email: c.email ?? c.company?.email ?? '',
      phoneNumber: c.phoneNumber ?? c.phone ?? c.company?.phone ?? '',
      activeJobsCount: c.activeJobsCount ?? c.jobsCount ?? c.openingsCount ?? 0,
      createdAt: c.createdAt ?? c.meta?.createdAt ?? new Date().toISOString(),
      updatedAt: c.updatedAt ?? c.meta?.updatedAt ?? new Date().toISOString(),
    };
  }

export default function UnloggedInternDashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CompanyFilters>({
    search: '',
    nature: '',
    size: '',
    location: '',
    sortBy: 'name'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const router = useRouter();

  // Fetch companies
  useEffect(() => {
    fetchCompanies();
  }, [filters]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (filters.search) queryParams.append('search', filters.search);
      if (filters.nature) queryParams.append('nature', filters.nature);
      if (filters.size) queryParams.append('size', filters.size);
      if (filters.location) queryParams.append('location', filters.location);

      const res = await fetch(`/api/companies?${queryParams.toString()}`);
      const raw = await res.json();

      // Support both direct backend shape and adapter shape
      const list = Array.isArray(raw) ? raw : (raw.data ?? raw.results ?? raw.items ?? []);
      let sortedCompanies: Company[] = list.map(normalizeCompany);

      // Apply sorting
      switch (filters.sortBy) {
        case 'name':
          sortedCompanies.sort((a: Company, b: Company) => a.name.localeCompare(b.name));
          break;
        case 'latest':
          sortedCompanies.sort((a: Company, b: Company) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          break;
        case 'salary':
          // For now, sort by active jobs count as proxy for salary range
          sortedCompanies.sort((a: Company, b: Company) => b.activeJobsCount - a.activeJobsCount);
          break;
      }

      setCompanies(sortedCompanies);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof CompanyFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const requireLogin = (action: string) => {
    // Show login prompt for actions that require authentication
    const confirmed = confirm(`You need to login to ${action}. Would you like to login now?`);
    if (confirmed) {
      router.push('/auth/login');
    }
  };

  const handleCompanyClick = (companyId: string) => {
    // Allow viewing company details without login
    router.push(`/companies/${companyId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Dream <span className="text-blue-600">Internship</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover amazing companies offering internship opportunities. Browse, search, and connect with top employers.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search companies, industries, or locations..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 px-6"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      {showFilters && (
        <section className="bg-white border-b border-gray-200 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <select
                  value={filters.nature}
                  onChange={(e) => handleFilterChange('nature', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">All Industries</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                <select
                  value={filters.size}
                  onChange={(e) => handleFilterChange('size', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">All Sizes</option>
                  <option value="startup">Startup (1-50)</option>
                  <option value="medium">Medium (51-200)</option>
                  <option value="large">Large (200+)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <Input
                  placeholder="Enter location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value as 'name' | 'salary' | 'latest')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="name">Company Name</option>
                  <option value="latest">Latest Posts</option>
                  <option value="salary">Most Opportunities</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">{companies.length}+</div>
              <div className="text-gray-600">Companies</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {companies.reduce((sum, company) => sum + company.activeJobsCount, 0)}+
              </div>
              <div className="text-gray-600">Active Positions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-gray-600">Industries</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Companies Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {companies.length} Companies Found
            </h2>
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`h-8 px-3 transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                      : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`h-8 px-3 transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                      : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Grid
                </Button>
              </div>

              {/* Sort Info */}
              <div className="flex items-center gap-2">
                <SortAsc className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Sorted by {filters.sortBy === 'name' ? 'Name' : filters.sortBy === 'latest' ? 'Latest Posts' : 'Opportunities'}
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}>
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-32"></div>
                        <div className="h-3 bg-gray-300 rounded w-24"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-300 rounded"></div>
                      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}>
              {companies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  viewMode={viewMode}
                  onViewDetails={() => handleCompanyClick(company.id)}
                  onLike={() => requireLogin('save companies')}
                  onApply={() => requireLogin('apply to jobs')}
                />
              ))}
            </div>
          )}

          {!loading && companies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Internship Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who found their dream internships through our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Create Account
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-100">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 rounded-lg p-2">
                  <span className="text-white font-bold text-sm">JF</span>
                </div>
                <span className="ml-3 text-xl font-bold">JobFinder</span>
              </div>
              <p className="text-gray-400 text-sm">
                Connecting talented students with amazing internship opportunities.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Students</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/jobs" className="hover:text-white">Browse Jobs</Link></li>
                <li><Link href="/companies" className="hover:text-white">Explore Companies</Link></li>
                <li><Link href="/auth/register" className="hover:text-white">Create Profile</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Companies</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/auth/register?type=company" className="hover:text-white">Post Jobs</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Sales</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 JobFinder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Company Card Component
interface CompanyCardProps {
  company: Company;
  viewMode: 'list' | 'grid';
  onViewDetails: () => void;
  onLike: () => void;
  onApply: () => void;
}

function CompanyCard({ company, viewMode, onViewDetails, onLike, onApply }: CompanyCardProps) {
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
        <CardContent className="p-6" onClick={onViewDetails}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                {company.logo && company.logo !== '/api/placeholder/64/64' ? (
                  <img
                    src={resolveImageSrc(company.logo)}
                    alt={company.name}
                    className="w-full h-full rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-xl">
                    {company.name.charAt(0)}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors truncate">
                    {company.name}
                  </CardTitle>
                  <Badge variant="secondary" className="flex-shrink-0">
                    {company.nature}
                  </Badge>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {company.description}
                </p>

                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{company.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span>{company.activeJobsCount} active positions</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onLike();
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Heart className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails();
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onApply();
                }}
              >
                Apply Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (original design)
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              {company.logo && company.logo !== '/api/placeholder/64/64' ? (
                <img
                  src={resolveImageSrc(company.logo)}
                  alt={company.name}
                  className="w-full h-full rounded-lg object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {company.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                {company.name}
              </CardTitle>
              <Badge variant="secondary" className="mt-1">
                {company.nature}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onLike();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent onClick={onViewDetails}>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {company.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            {company.address}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            {company.activeJobsCount} active positions
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onApply();
            }}
          >
            Apply Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
