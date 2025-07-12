'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Users,
  GraduationCap,
  Building2,
  ExternalLink,
  ChevronRight,
  SortAsc,
  SortDesc,
  Grid,
  List
} from 'lucide-react';
import Link from 'next/link';

interface University {
  id: string;
  name: string;
  location: string;
  type: 'public' | 'private';
  established: number;
  website: string;
  logo: string;
  description: string;
  ranking: number;
  studentCount: number;
  facultyCount: number;
  programsCount: number;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
}

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchUniversities();
  }, [searchTerm, typeFilter, locationFilter, sortBy, sortOrder]);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (locationFilter) params.append('location', locationFilter);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await fetch(`/api/universities?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setUniversities(data.data);
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setLocationFilter('');
    setSortBy('name');
    setSortOrder('asc');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Universities</h1>
              <p className="text-gray-600 mt-1">Browse universities and explore their programs</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search universities by name, location, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="Filter by location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="name">Name</option>
                      <option value="ranking">Ranking</option>
                      <option value="studentCount">Student Count</option>
                      <option value="established">Established</option>
                    </select>
                    <button
                      onClick={() => handleSort(sortBy)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      {sortOrder === 'asc' ? <SortAsc className="h-5 w-5" /> : <SortDesc className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                {universities.length} {universities.length === 1 ? 'university' : 'universities'} found
              </p>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {universities.map((university) => (
                  <UniversityCard key={university.id} university={university} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {universities.map((university) => (
                  <UniversityListItem key={university.id} university={university} />
                ))}
              </div>
            )}

            {universities.length === 0 && (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No universities found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function UniversityCard({ university }: { university: University }) {
  return (
    <Link href={`/company/recruitment/universities/${university.id}/programs`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={university.logo}
                alt={`${university.name} logo`}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{university.name}</h3>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <MapPin className="h-4 w-4" />
                  {university.location}
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{university.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{university.studentCount.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Students</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{university.programsCount}</div>
              <div className="text-xs text-gray-500">Programs</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              university.type === 'public' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {university.type === 'public' ? 'Public' : 'Private'}
            </span>
            <span className="text-sm text-gray-500">Rank #{university.ranking}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function UniversityListItem({ university }: { university: University }) {
  return (
    <Link href={`/company/recruitment/universities/${university.id}/programs`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={university.logo}
              alt={`${university.name} logo`}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">{university.name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {university.location}
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {university.type === 'public' ? 'Public' : 'Private'}
                </div>
                <div>Rank #{university.ranking}</div>
              </div>
              <p className="text-gray-600 text-sm">{university.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{university.studentCount.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Students</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{university.programsCount}</div>
              <div className="text-xs text-gray-500">Programs</div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </Link>
  );
}
