"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { withAuth } from '@/contexts/auth-context';
import {
  Search,
  Filter,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Briefcase,
  Star,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  Calendar,
  Users,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import type { InternshipOpportunity } from '@/types/internship';

function InternshipOpportunities() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    type: [] as string[],
    location: [] as string[],
    industry: [] as string[],
    remote: false
  });
  const [savedOpportunities, setSavedOpportunities] = useState<string[]>([]);

  // Mock internship opportunities data
  const opportunities: InternshipOpportunity[] = [
    {
      id: '1',
      title: 'Software Engineering Intern',
      company: {
        id: 'tech-corp',
        name: 'TechCorp Inc.',
        logo: '/api/placeholder/40/40',
        industry: 'Technology',
        size: '100-500 employees',
        location: 'San Francisco, CA',
        website: 'https://techcorp.com',
        description: 'Leading technology company focused on innovation'
      },
      location: 'San Francisco, CA',
      type: 'paid',
      duration: {
        weeks: 12,
        hoursPerWeek: 40,
        startDate: '2024-06-01',
        endDate: '2024-08-23',
        isFlexible: true
      },
      compensation: {
        amount: 25,
        currency: 'USD',
        period: 'hour'
      },
      description: 'Join our engineering team to work on cutting-edge web applications using React, Node.js, and cloud technologies. You\'ll collaborate with senior developers on real projects that impact thousands of users.',
      requirements: [
        'Currently enrolled in Computer Science or related field',
        'Basic knowledge of JavaScript and web development',
        'Strong problem-solving skills',
        'Excellent communication abilities'
      ],
      responsibilities: [
        'Develop and maintain web applications',
        'Participate in code reviews and team meetings',
        'Write clean, efficient, and well-documented code',
        'Collaborate with cross-functional teams'
      ],
      benefits: [
        'Mentorship from senior engineers',
        'Flexible working hours',
        'Professional development opportunities',
        'Networking events'
      ],
      skills: ['JavaScript', 'React', 'Node.js', 'Git', 'HTML/CSS'],
      qualifications: ['Computer Science student', 'GPA 3.0+'],
      applicationDeadline: '2024-04-15',
      postedDate: '2024-01-15',
      remote: true,
      hybrid: true,
      applicationsCount: 45,
      viewsCount: 234,
      status: 'active',
      contactPerson: {
        name: 'Sarah Johnson',
        title: 'Engineering Manager',
        email: 'sarah.johnson@techcorp.com'
      }
    },
    {
      id: '2',
      title: 'Marketing Intern',
      company: {
        id: 'growth-co',
        name: 'GrowthCo',
        logo: '/api/placeholder/40/40',
        industry: 'Marketing',
        size: '50-100 employees',
        location: 'New York, NY',
        website: 'https://growthco.com',
        description: 'Digital marketing agency helping brands grow online'
      },
      location: 'New York, NY',
      type: 'paid',
      duration: {
        weeks: 10,
        hoursPerWeek: 30,
        startDate: '2024-06-15',
        endDate: '2024-08-23',
        isFlexible: false
      },
      compensation: {
        amount: 18,
        currency: 'USD',
        period: 'hour'
      },
      description: 'Gain hands-on experience in digital marketing, social media management, and content creation. Work with real clients and learn from industry experts.',
      requirements: [
        'Marketing, Communications, or Business major',
        'Social media savvy',
        'Creative mindset',
        'Basic design skills preferred'
      ],
      responsibilities: [
        'Create social media content',
        'Assist with campaign development',
        'Analyze marketing metrics',
        'Support client communications'
      ],
      benefits: [
        'Portfolio development',
        'Industry networking',
        'Skill development workshops',
        'Potential for full-time offer'
      ],
      skills: ['Social Media', 'Content Creation', 'Analytics', 'Adobe Creative Suite'],
      qualifications: ['Marketing student', 'Portfolio required'],
      applicationDeadline: '2024-04-20',
      postedDate: '2024-01-20',
      remote: false,
      hybrid: true,
      applicationsCount: 32,
      viewsCount: 156,
      status: 'active'
    },
    {
      id: '3',
      title: 'Data Science Intern',
      company: {
        id: 'data-insights',
        name: 'DataInsights Corp',
        logo: '/api/placeholder/40/40',
        industry: 'Technology',
        size: '200-500 employees',
        location: 'Austin, TX',
        website: 'https://datainsights.com',
        description: 'Data analytics and machine learning solutions provider'
      },
      location: 'Austin, TX',
      type: 'paid',
      duration: {
        weeks: 16,
        hoursPerWeek: 40,
        startDate: '2024-05-20',
        endDate: '2024-09-13',
        isFlexible: true
      },
      compensation: {
        amount: 30,
        currency: 'USD',
        period: 'hour'
      },
      description: 'Work with our data science team to build machine learning models and analyze large datasets. Perfect opportunity to apply your statistical knowledge to real-world problems.',
      requirements: [
        'Statistics, Data Science, or Computer Science major',
        'Python programming experience',
        'Knowledge of statistics and machine learning',
        'SQL experience preferred'
      ],
      responsibilities: [
        'Build and test machine learning models',
        'Analyze large datasets',
        'Create data visualizations',
        'Present findings to stakeholders'
      ],
      benefits: [
        'Access to cutting-edge tools',
        'Mentorship from PhD data scientists',
        'Conference attendance opportunities',
        'Research publication potential'
      ],
      skills: ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Tableau'],
      qualifications: ['Data Science student', 'Python proficiency'],
      applicationDeadline: '2024-04-10',
      postedDate: '2024-01-10',
      remote: true,
      hybrid: false,
      applicationsCount: 67,
      viewsCount: 289,
      status: 'active'
    }
  ];

  const handleSaveOpportunity = (opportunityId: string) => {
    setSavedOpportunities(prev => 
      prev.includes(opportunityId) 
        ? prev.filter(id => id !== opportunityId)
        : [...prev, opportunityId]
    );
  };

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opportunity.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opportunity.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedFilters.type.length === 0 || selectedFilters.type.includes(opportunity.type);
    const matchesLocation = selectedFilters.location.length === 0 || 
                           selectedFilters.location.some(loc => opportunity.location.includes(loc));
    const matchesIndustry = selectedFilters.industry.length === 0 || 
                           selectedFilters.industry.includes(opportunity.company.industry);
    const matchesRemote = !selectedFilters.remote || opportunity.remote;

    return matchesSearch && matchesType && matchesLocation && matchesIndustry && matchesRemote;
  });

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/internship"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Internship Opportunities</h1>
              <p className="mt-2 text-gray-600">
                Discover internships that match your skills and interests
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search internships, companies, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Quick Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFilters(prev => ({ ...prev, remote: !prev.remote }))}
                className={`px-4 py-2 rounded-lg border ${
                  selectedFilters.remote 
                    ? 'bg-blue-100 border-blue-300 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700'
                } hover:bg-blue-50`}
              >
                Remote
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="h-4 w-4" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredOpportunities.length} opportunities found
            </h2>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Most Recent</option>
              <option>Best Match</option>
              <option>Highest Paid</option>
              <option>Deadline Soon</option>
            </select>
          </div>

          {/* Opportunity Cards */}
          <div className="space-y-4">
            {filteredOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <img
                        src={opportunity.company.logo}
                        alt={opportunity.company.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              {opportunity.title}
                            </h3>
                            <p className="text-lg text-gray-700 mb-2">{opportunity.company.name}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {opportunity.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {opportunity.duration.weeks} weeks
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                ${opportunity.compensation?.amount}/{opportunity.compensation?.period}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                opportunity.type === 'paid' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {opportunity.type === 'paid' ? 'Paid' : 'Unpaid'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleSaveOpportunity(opportunity.id)}
                            className="p-2 text-gray-400 hover:text-blue-600"
                          >
                            {savedOpportunities.includes(opportunity.id) ? (
                              <BookmarkCheck className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Bookmark className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        
                        <p className="text-gray-700 mb-4 line-clamp-2">
                          {opportunity.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {opportunity.skills.slice(0, 5).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                          {opportunity.skills.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                              +{opportunity.skills.length - 5} more
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {opportunity.applicationsCount} applicants
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Apply by {new Date(opportunity.applicationDeadline).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/internship/opportunities/${opportunity.id}`}
                              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              View Details
                            </Link>
                            <Link
                              href={`/internship/apply/${opportunity.id}`}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              Apply Now
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(InternshipOpportunities);
