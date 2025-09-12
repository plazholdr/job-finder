'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Building2,
  Search,
  Filter,
  Save,
  X,
  Calendar,
  MapPin,
  GraduationCap,
  Briefcase,
  Star,
  Clock,
  User,
  FileText
} from 'lucide-react';

interface SearchFilters {
  query: string;
  type: 'applications' | 'jobs' | 'candidates' | 'all';
  status: string[];
  dateRange: {
    start: string;
    end: string;
  };
  skills: string[];
  location: string;
  department: string;
  education: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface SearchResult {
  id: string;
  type: 'application' | 'job' | 'candidate';
  title: string;
  subtitle: string;
  description: string;
  status: string;
  tags: string[];
  metadata: Record<string, any>;
  relevanceScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function AdvancedSearchPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: 'all',
    status: [],
    dateRange: { start: '', end: '' },
    skills: [],
    location: '',
    department: '',
    education: [],
    sortBy: 'relevance',
    sortOrder: 'desc'
  });

  const [results, setResults] = useState<SearchResult[]>([]);
  const [facets, setFacets] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    performSearch();
  }, [filters, pagination.page]);

  const performSearch = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.query) params.append('query', filters.query);
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.status.length > 0) params.append('status', filters.status.join(','));
      if (filters.dateRange.start) params.append('dateStart', filters.dateRange.start);
      if (filters.dateRange.end) params.append('dateEnd', filters.dateRange.end);
      if (filters.skills.length > 0) params.append('skills', filters.skills.join(','));
      if (filters.location) params.append('location', filters.location);
      if (filters.department) params.append('department', filters.department);
      if (filters.education.length > 0) params.append('education', filters.education.join(','));
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const response = await fetch(`/api/company/search?${params}`);
      const result = await response.json();

      if (result.success) {
        setResults(result.data.results.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        })));
        setFacets(result.data.facets);
        setPagination(prev => ({
          ...prev,
          total: result.data.pagination.total,
          totalPages: result.data.pagination.totalPages
        }));
      } else {
        setError(result.error || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const addSkill = (skill: string) => {
    if (skill && !filters.skills.includes(skill)) {
      updateFilter('skills', [...filters.skills, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    updateFilter('skills', filters.skills.filter(s => s !== skill));
  };

  const toggleStatus = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    updateFilter('status', newStatus);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      type: 'all',
      status: [],
      dateRange: { start: '', end: '' },
      skills: [],
      location: '',
      department: '',
      education: [],
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'job':
        return <Briefcase className="h-5 w-5 text-green-500" />;
      case 'candidate':
        return <GraduationCap className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      new: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      interview_scheduled: 'bg-purple-100 text-purple-800',
      hired: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      available: 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

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
                <h1 className="text-xl font-bold text-gray-900">Advanced Search</h1>
                <p className="text-sm text-gray-600">Search across applications, jobs, and candidates</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search applications, jobs, candidates..."
                    value={filters.query}
                    onChange={(e) => updateFilter('query', e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="applications">Applications</SelectItem>
                    <SelectItem value="jobs">Jobs</SelectItem>
                    <SelectItem value="candidates">Candidates</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {(filters.status.length > 0 || filters.skills.length > 0 || filters.location || filters.department) && (
                    <Badge variant="secondary" className="ml-1">
                      {filters.status.length + filters.skills.length + (filters.location ? 1 : 0) + (filters.department ? 1 : 0)}
                    </Badge>
                  )}
                </Button>

                <Button onClick={performSearch} disabled={isLoading}>
                  {isLoading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>

            {/* Active Filters */}
            {(filters.status.length > 0 || filters.skills.length > 0 || filters.location || filters.department) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {filters.status.map(status => (
                  <Badge key={status} variant="secondary" className="flex items-center gap-1">
                    Status: {status}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleStatus(status)} />
                  </Badge>
                ))}
                {filters.skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                  </Badge>
                ))}
                {filters.location && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Location: {filters.location}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('location', '')} />
                  </Badge>
                )}
                {filters.department && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Department: {filters.department}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('department', '')} />
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Advanced Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Status Filter */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Status</Label>
                  <div className="space-y-2">
                    {Object.entries(facets.statuses || {}).map(([status, count]) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={filters.status.includes(status)}
                          onCheckedChange={() => toggleStatus(status)}
                        />
                        <Label htmlFor={`status-${status}`} className="text-sm">
                          {status.replace('_', ' ')} ({count})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <Label htmlFor="location" className="text-sm font-medium mb-3 block">Location</Label>
                  <Input
                    id="location"
                    placeholder="Enter location..."
                    value={filters.location}
                    onChange={(e) => updateFilter('location', e.target.value)}
                  />
                </div>

                {/* Department Filter */}
                <div>
                  <Label htmlFor="department" className="text-sm font-medium mb-3 block">Department</Label>
                  <Input
                    id="department"
                    placeholder="Enter department..."
                    value={filters.department}
                    onChange={(e) => updateFilter('department', e.target.value)}
                  />
                </div>

                {/* Date Range */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Date Range</Label>
                  <div className="space-y-2">
                    <Input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
                    />
                    <Input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Skills</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Add skill..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addSkill((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(facets.skills || {}).slice(0, 10).map(([skill, count]) => (
                        <Badge
                          key={skill}
                          variant={filters.skills.includes(skill) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => filters.skills.includes(skill) ? removeSkill(skill) : addSkill(skill)}
                        >
                          {skill} ({count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Sort By</Label>
                  <div className="space-y-2">
                    <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="date">Date Created</SelectItem>
                        <SelectItem value="updated">Last Updated</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filters.sortOrder} onValueChange={(value) => updateFilter('sortOrder', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Descending</SelectItem>
                        <SelectItem value="asc">Ascending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Facets Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Type Facets */}
                <div>
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</Label>
                  <div className="mt-2 space-y-1">
                    {Object.entries(facets.types || {}).map(([type, count]) => (
                      <button
                        key={type}
                        onClick={() => updateFilter('type', type === filters.type ? 'all' : type)}
                        className={`w-full text-left text-sm px-2 py-1 rounded ${
                          filters.type === type ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                        }`}
                      >
                        {type} ({count})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Skills */}
                <div>
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Popular Skills</Label>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(facets.skills || {}).slice(0, 8).map(([skill, count]) => (
                      <Badge
                        key={skill}
                        variant={filters.skills.includes(skill) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => filters.skills.includes(skill) ? removeSkill(skill) : addSkill(skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results List */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600">
                {pagination.total} results found
                {filters.query && ` for "${filters.query}"`}
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save Search
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Search</DialogTitle>
                    <DialogDescription>
                      Save this search to quickly access it later
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input placeholder="Search name..." />
                    <Input placeholder="Description (optional)..." />
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notifications" />
                      <Label htmlFor="notifications">Get notifications for new results</Label>
                    </div>
                    <Button className="w-full">Save Search</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Searching...</p>
              </div>
            ) : results.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No results found. Try adjusting your search criteria.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <Card key={result.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getResultIcon(result.type)}
                            <h3 className="font-semibold text-lg">{result.title}</h3>
                            {getStatusBadge(result.status)}
                            <div className="flex items-center text-sm text-gray-500">
                              <Star className="h-4 w-4 mr-1" />
                              {(result.relevanceScore * 100).toFixed(0)}% match
                            </div>
                          </div>
                          
                          <p className="text-gray-600 mb-2">{result.subtitle}</p>
                          <p className="text-gray-700 mb-3">{result.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {result.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {result.metadata.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {result.metadata.location}
                              </div>
                            )}
                            {result.metadata.university && (
                              <div className="flex items-center gap-1">
                                <GraduationCap className="h-4 w-4" />
                                {result.metadata.university}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {result.createdAt.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      disabled={pagination.page === 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={pagination.page === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPagination(prev => ({ ...prev, page }))}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
