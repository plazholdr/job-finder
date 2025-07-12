"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Briefcase, GraduationCap, User, Mail, Linkedin, Github, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

interface SearchUser {
  _id: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'company' | 'admin';
  profile: {
    avatar?: string;
    bio?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  student?: {
    skills: string[];
  };
  company?: {
    name: string;
    industry: string;
  };
  privacy?: {
    profileVisibility: string;
  };
}

interface SearchFilters {
  role: string;
  location: string;
  skills: string[];
  industry: string;
}

export default function UserSearchPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [suggestions, setSuggestions] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    role: 'all',
    location: '',
    skills: [],
    industry: '',
  });

  // Load suggestions on page load
  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const response = await fetch('/api/users/suggestions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && filters.role === 'all' && !filters.location && !filters.industry) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (filters.role !== 'all') params.append('role', filters.role);
      if (filters.location) params.append('location', filters.location);
      if (filters.industry) params.append('industry', filters.industry);
      filters.skills.forEach(skill => params.append('skills', skill));

      const response = await fetch(`/api/users/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.data || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const UserCard = ({ user: searchUser }: { user: SearchUser }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            {searchUser.profile?.avatar ? (
              <img
                src={searchUser.profile.avatar}
                alt={`${searchUser.firstName} ${searchUser.lastName}`}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-gray-500" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {searchUser.firstName} {searchUser.lastName}
              </h3>
              <div className="flex items-center space-x-2">
                {searchUser.role === 'student' && (
                  <GraduationCap className="h-4 w-4 text-blue-500" />
                )}
                {searchUser.role === 'company' && (
                  <Briefcase className="h-4 w-4 text-green-500" />
                )}
              </div>
            </div>
            
            {searchUser.role === 'company' && searchUser.company && (
              <p className="text-sm text-gray-600 mt-1">
                {searchUser.company.name} • {searchUser.company.industry}
              </p>
            )}
            
            {searchUser.profile?.location && (
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                {searchUser.profile.location}
              </div>
            )}
            
            {searchUser.profile?.bio && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {searchUser.profile.bio}
              </p>
            )}
            
            {searchUser.student?.skills && searchUser.student.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {searchUser.student.skills.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                  >
                    {skill}
                  </span>
                ))}
                {searchUser.student.skills.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    +{searchUser.student.skills.length - 3} more
                  </span>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                {searchUser.profile?.linkedin && (
                  <a
                    href={searchUser.profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
                {searchUser.profile?.github && (
                  <a
                    href={searchUser.profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                )}
                {searchUser.profile?.website && (
                  <a
                    href={searchUser.profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                )}
              </div>
              
              <Link href={`/profile/${searchUser._id}`}>
                <Button size="sm" variant="outline">
                  View Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover People</h1>
          <p className="text-gray-600">Connect with students, professionals, and companies</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, skills, company, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="company">Companies</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <Input
                    type="text"
                    placeholder="Enter location"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <Input
                    type="text"
                    placeholder="Enter industry"
                    value={filters.industry}
                    onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => setFilters({ role: 'all', location: '', skills: [], industry: '' })}
                    variant="outline"
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-8">
          {searchResults.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Search Results ({searchResults.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.map((user) => (
                  <UserCard key={user._id} user={user} />
                ))}
              </div>
            </div>
          )}

          {suggestions.length > 0 && searchResults.length === 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Suggested for You
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {suggestions.map((user) => (
                  <UserCard key={user._id} user={user} />
                ))}
              </div>
            </div>
          )}

          {searchResults.length === 0 && suggestions.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
