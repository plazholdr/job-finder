'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Users,
  GraduationCap,
  ChevronRight,
  ArrowLeft,
  BookOpen,
  DollarSign,
  Clock,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface Program {
  id: string;
  universityId: string;
  name: string;
  faculty: string;
  level: 'undergraduate' | 'graduate' | 'doctoral';
  degree: string;
  duration: number;
  description: string;
  requirements: string[];
  tuition: {
    inState?: number;
    outOfState?: number;
    international?: number;
  };
  candidatesCount: number;
  isActive: boolean;
  createdAt: Date;
}

interface University {
  id: string;
  name: string;
  location: string;
  logo: string;
}

export default function ProgramsPage() {
  const params = useParams();
  const router = useRouter();
  const universityId = params.id as string;

  const [university, setUniversity] = useState<University | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique faculties for filter dropdown
  const uniqueFaculties = Array.from(new Set(programs.map(p => p.faculty))).sort();

  useEffect(() => {
    fetchUniversityInfo();
    fetchPrograms();
  }, [universityId, searchTerm, facultyFilter, levelFilter]);

  const fetchUniversityInfo = async () => {
    try {
      // In a real app, you'd have a university details endpoint
      // For now, we'll use mock data
      setUniversity({
        id: universityId,
        name: 'University of California, Berkeley',
        location: 'Berkeley, CA',
        logo: '/api/placeholder/64/64'
      });
    } catch (error) {
      console.error('Error fetching university info:', error);
    }
  };

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (facultyFilter) params.append('faculty', facultyFilter);
      if (levelFilter !== 'all') params.append('level', levelFilter);

      const response = await fetch(`/api/universities/${universityId}/programs?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setPrograms(data.data);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFacultyFilter('');
    setLevelFilter('all');
  };

  const formatTuition = (tuition: Program['tuition']) => {
    if (tuition.inState && tuition.outOfState) {
      return `$${tuition.inState.toLocaleString()} - $${tuition.outOfState.toLocaleString()}`;
    } else if (tuition.international) {
      return `$${tuition.international.toLocaleString()}`;
    }
    return 'Contact for pricing';
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'undergraduate':
        return 'bg-green-100 text-green-800';
      case 'graduate':
        return 'bg-blue-100 text-blue-800';
      case 'doctoral':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'undergraduate':
        return 'Undergraduate';
      case 'graduate':
        return 'Graduate';
      case 'doctoral':
        return 'Doctoral';
      default:
        return level;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Universities
            </button>
          </div>

          {university && (
            <div className="flex items-center gap-4">
              <img
                src={university.logo}
                alt={`${university.name} logo`}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{university.name}</h1>
                <p className="text-gray-600">Academic Programs</p>
              </div>
            </div>
          )}
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
                  placeholder="Search programs by name, faculty, or description..."
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Faculty/School</label>
                  <select
                    value={facultyFilter}
                    onChange={(e) => setFacultyFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Faculties</option>
                    {uniqueFaculties.map((faculty) => (
                      <option key={faculty} value={faculty}>{faculty}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Program Level</label>
                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Levels</option>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="graduate">Graduate</option>
                    <option value="doctoral">Doctoral</option>
                  </select>
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
                {programs.length} {programs.length === 1 ? 'program' : 'programs'} found
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {programs.map((program) => (
                <ProgramCard key={program.id} program={program} universityId={universityId} />
              ))}
            </div>

            {programs.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ProgramCard({ program, universityId }: { program: Program; universityId: string }) {
  return (
    <Link href={`/company/recruitment/universities/${universityId}/programs/${program.id}/candidates`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-900 text-lg">{program.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(program.level)}`}>
                  {getLevelLabel(program.level)}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{program.faculty}</p>
              <p className="text-gray-500 text-sm">{program.degree}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{program.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{program.duration} years</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{program.candidatesCount} candidates</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{formatTuition(program.tuition)}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-blue-600">
              View Candidates
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
