'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  Mail,
  Phone,
  ExternalLink,
  ArrowLeft,
  User,
  GraduationCap,
  Briefcase,
  Star,
  Clock,
  CheckCircle,
  Send
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface ProgramCandidate {
  id: string;
  universityId: string;
  programId: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    avatar?: string;
  };
  academicInfo: {
    year: string;
    gpa: number;
    expectedGraduation: Date;
    major: string;
    specialization?: string;
  };
  internshipPreferences: {
    startDate: Date;
    endDate: Date;
    duration: number;
    preferredLocations: string[];
    salaryRange: {
      min: number;
      max: number;
      currency: string;
    };
    workType: 'remote' | 'on-site' | 'hybrid';
    availability: 'full-time' | 'part-time';
  };
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  status: 'available' | 'interviewing' | 'hired' | 'unavailable';
  profileCompleteness: number;
  lastActive: Date;
  createdAt: Date;
}

export default function CandidatesPage() {
  const params = useParams();
  const router = useRouter();
  const { id: universityId, programId } = params;

  const [candidates, setCandidates] = useState<ProgramCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Filters
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [minSalaryFilter, setMinSalaryFilter] = useState('');
  const [maxSalaryFilter, setMaxSalaryFilter] = useState('');
  const [workTypeFilter, setWorkTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, [universityId, programId, startDateFilter, endDateFilter, locationFilter, minSalaryFilter, maxSalaryFilter, workTypeFilter, statusFilter]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (startDateFilter) params.append('startDate', startDateFilter);
      if (endDateFilter) params.append('endDate', endDateFilter);
      if (locationFilter) params.append('location', locationFilter);
      if (minSalaryFilter) params.append('minSalary', minSalaryFilter);
      if (maxSalaryFilter) params.append('maxSalary', maxSalaryFilter);
      if (workTypeFilter !== 'all') params.append('workType', workTypeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/universities/${universityId}/programs/${programId}/candidates?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setCandidates(data.data);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidates(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === candidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(candidates.map(c => c.id));
    }
  };

  const clearFilters = () => {
    setStartDateFilter('');
    setEndDateFilter('');
    setLocationFilter('');
    setMinSalaryFilter('');
    setMaxSalaryFilter('');
    setWorkTypeFilter('all');
    setStatusFilter('all');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'interviewing':
        return 'bg-yellow-100 text-yellow-800';
      case 'hired':
        return 'bg-blue-100 text-blue-800';
      case 'unavailable':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'interviewing':
        return 'Interviewing';
      case 'hired':
        return 'Hired';
      case 'unavailable':
        return 'Unavailable';
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
              Back to Programs
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Program Candidates</h1>
              <p className="text-gray-600">Browse and invite candidates for internship opportunities</p>
            </div>

            {selectedCandidates.length > 0 && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Send className="h-5 w-5" />
                Send Invitations ({selectedCandidates.length})
              </button>
            )}
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
                  placeholder="Search candidates by name, skills, or location..."
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
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="Preferred location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Work Type</label>
                  <select
                    value={workTypeFilter}
                    onChange={(e) => setWorkTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="remote">Remote</option>
                    <option value="on-site">On-site</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Salary ($/hr)</label>
                  <input
                    type="number"
                    placeholder="Min salary..."
                    value={minSalaryFilter}
                    onChange={(e) => setMinSalaryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Salary ($/hr)</label>
                  <input
                    type="number"
                    placeholder="Max salary..."
                    value={maxSalaryFilter}
                    onChange={(e) => setMaxSalaryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="available">Available</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="hired">Hired</option>
                    <option value="unavailable">Unavailable</option>
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
              <div className="flex items-center gap-4">
                <p className="text-gray-600">
                  {candidates.length} {candidates.length === 1 ? 'candidate' : 'candidates'} found
                </p>
                {candidates.length > 0 && (
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.length === candidates.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Select All
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {candidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  isSelected={selectedCandidates.includes(candidate.id)}
                  onSelect={() => handleSelectCandidate(candidate.id)}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  formatDate={formatDate}
                />
              ))}
            </div>

            {candidates.length === 0 && (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          selectedCandidates={selectedCandidates}
          onClose={() => setShowInviteModal(false)}
          onSent={() => {
            setShowInviteModal(false);
            setSelectedCandidates([]);
          }}
        />
      )}
    </div>
  );
}

function CandidateCard({
  candidate,
  isSelected,
  onSelect,
  getStatusColor,
  getStatusLabel,
  formatDate
}: {
  candidate: ProgramCandidate;
  isSelected: boolean;
  onSelect: () => void;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  formatDate: (date: Date) => string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />

          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={candidate.personalInfo.avatar || '/api/placeholder/48/48'}
                  alt={candidate.personalInfo.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{candidate.personalInfo.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {candidate.academicInfo.year} • GPA: {candidate.academicInfo.gpa}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {candidate.personalInfo.location}
                    </div>
                  </div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                {getStatusLabel(candidate.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Internship Period</div>
                <div className="text-sm text-gray-600">
                  {formatDate(candidate.internshipPreferences.startDate)} - {formatDate(candidate.internshipPreferences.endDate)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Preferred Locations</div>
                <div className="text-sm text-gray-600">
                  {candidate.internshipPreferences.preferredLocations.slice(0, 2).join(', ')}
                  {candidate.internshipPreferences.preferredLocations.length > 2 && ` +${candidate.internshipPreferences.preferredLocations.length - 2} more`}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Salary Range</div>
                <div className="text-sm text-gray-600">
                  ${candidate.internshipPreferences.salaryRange.min}-${candidate.internshipPreferences.salaryRange.max}/hr
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Work Type</div>
                <div className="text-sm text-gray-600 capitalize">
                  {candidate.internshipPreferences.workType} • {candidate.internshipPreferences.availability}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Skills</div>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.slice(0, 6).map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                    {skill}
                  </span>
                ))}
                {candidate.skills.length > 6 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                    +{candidate.skills.length - 6} more
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {candidate.personalInfo.email}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Last active {formatDate(candidate.lastActive)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-500">
                  Profile {candidate.profileCompleteness}% complete
                </div>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${candidate.profileCompleteness}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InviteModal({
  selectedCandidates,
  onClose,
  onSent
}: {
  selectedCandidates: string[];
  onClose: () => void;
  onSent: () => void;
}) {
  const [position, setPosition] = useState('');
  const [message, setMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [stipend, setStipend] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    try {
      setSending(true);

      // Send invitations to all selected candidates
      const invitationPromises = selectedCandidates.map(candidateId =>
        fetch('/api/company/invitations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            candidateId,
            universityId: 'univ-1', // In real app, get from context
            programId: 'prog-1', // In real app, get from context
            position,
            message,
            internshipDetails: {
              startDate: new Date(startDate),
              endDate: new Date(endDate),
              duration: Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)),
              location,
              workType: 'hybrid',
              stipend: parseInt(stipend),
              currency: 'USD'
            },
            requirements: [],
            benefits: [],
            contactPerson: {
              name: 'Sarah Wilson',
              email: 'sarah.wilson@company.com',
              phone: '+1 (555) 123-4567',
              title: 'HR Manager'
            }
          })
        })
      );

      await Promise.all(invitationPromises);
      onSent();
    } catch (error) {
      console.error('Error sending invitations:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Send Invitations ({selectedCandidates.length} candidates)
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position Title</label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g., Software Engineering Intern"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Personal Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a personalized message to the candidates..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., San Francisco, CA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Stipend ($)</label>
                <input
                  type="number"
                  value={stipend}
                  onChange={(e) => setStipend(e.target.value)}
                  placeholder="e.g., 5000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !position || !message || !startDate || !endDate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Invitations
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
