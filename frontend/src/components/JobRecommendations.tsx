"use client";

import React, { useState, useEffect } from 'react';
import { 
  Star, 
  TrendingUp, 
  MapPin, 
  Building2, 
  DollarSign, 
  Clock, 
  Briefcase,
  Bookmark,
  ExternalLink,
  RefreshCw,
  Target,
  Zap,
  Award
} from 'lucide-react';
import Link from 'next/link';

interface JobRecommendation {
  id: string;
  title: string;
  company: {
    name: string;
    logo: string;
  };
  location: string;
  type: string;
  salary: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  posted: string;
  description: string;
  skills: string[];
  matchScore: number;
  matchReasons: string[];
  remote: boolean;
  experienceLevel: string;
}

interface JobRecommendationsProps {
  user: any;
  onSaveJob?: (jobId: string) => void;
  savedJobs?: string[];
}

export default function JobRecommendations({ user, onSaveJob, savedJobs = [] }: JobRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const generateRecommendations = () => {
    // Mock recommendation algorithm based on user profile
    const userSkills = user?.student?.skills || [];
    const userPreferences = user?.student?.jobPreferences || {};
    const userLocation = user?.profile?.location || '';

    const mockRecommendations: JobRecommendation[] = [
      {
        id: '1',
        title: 'Senior React Developer',
        company: {
          name: 'TechFlow Inc.',
          logo: '/api/placeholder/40/40'
        },
        location: 'San Francisco, CA',
        type: 'Full-time',
        salary: {
          min: 130000,
          max: 180000,
          currency: 'USD',
          period: 'year'
        },
        posted: '2024-01-20',
        description: 'Join our team to build cutting-edge web applications using React and modern JavaScript...',
        skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
        matchScore: 95,
        matchReasons: [
          'Strong match with your React skills',
          'Salary matches your expectations',
          'Located in your preferred area',
          'Company size aligns with preferences'
        ],
        remote: true,
        experienceLevel: 'Senior Level'
      },
      {
        id: '2',
        title: 'Full Stack Engineer',
        company: {
          name: 'InnovateLab',
          logo: '/api/placeholder/40/40'
        },
        location: 'Remote',
        type: 'Full-time',
        salary: {
          min: 110000,
          max: 150000,
          currency: 'USD',
          period: 'year'
        },
        posted: '2024-01-18',
        description: 'Work on exciting projects using modern tech stack including React, Node.js, and cloud technologies...',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        matchScore: 88,
        matchReasons: [
          'Perfect skill match with JavaScript and React',
          'Remote work option available',
          'Growing startup environment',
          'Competitive compensation'
        ],
        remote: true,
        experienceLevel: 'Mid Level'
      },
      {
        id: '3',
        title: 'Frontend Developer',
        company: {
          name: 'DesignCorp',
          logo: '/api/placeholder/40/40'
        },
        location: 'New York, NY',
        type: 'Full-time',
        salary: {
          min: 95000,
          max: 130000,
          currency: 'USD',
          period: 'year'
        },
        posted: '2024-01-16',
        description: 'Create beautiful and responsive user interfaces using React and modern CSS frameworks...',
        skills: ['React', 'CSS', 'JavaScript', 'Figma'],
        matchScore: 82,
        matchReasons: [
          'Strong React experience match',
          'UI/UX focus aligns with interests',
          'Established company with growth opportunities',
          'Good work-life balance'
        ],
        remote: false,
        experienceLevel: 'Mid Level'
      },
      {
        id: '4',
        title: 'Software Engineer Intern',
        company: {
          name: 'NextGen Solutions',
          logo: '/api/placeholder/40/40'
        },
        location: 'Austin, TX',
        type: 'Internship',
        salary: {
          min: 25,
          max: 35,
          currency: 'USD',
          period: 'hour'
        },
        posted: '2024-01-15',
        description: 'Great opportunity for students to gain hands-on experience with modern web technologies...',
        skills: ['JavaScript', 'React', 'Git', 'HTML/CSS'],
        matchScore: 75,
        matchReasons: [
          'Perfect for gaining experience',
          'Technologies match your skillset',
          'Mentorship opportunities',
          'Potential for full-time offer'
        ],
        remote: true,
        experienceLevel: 'Entry Level'
      }
    ];

    // Sort by match score
    return mockRecommendations.sort((a, b) => b.matchScore - a.matchScore);
  };

  const refreshRecommendations = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRecommendations(generateRecommendations());
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => {
      setRecommendations(generateRecommendations());
      setLoading(false);
    }, 500);
  }, [user]);

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getMatchScoreIcon = (score: number) => {
    if (score >= 90) return <Zap className="h-4 w-4" />;
    if (score >= 80) return <Target className="h-4 w-4" />;
    if (score >= 70) return <Award className="h-4 w-4" />;
    return <TrendingUp className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recommended for You</h2>
              <p className="text-gray-600">Jobs that match your skills and preferences</p>
            </div>
          </div>
          <button
            onClick={refreshRecommendations}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-6">
        {recommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Yet</h3>
            <p className="text-gray-600 mb-4">
              Complete your profile to get personalized job recommendations.
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Complete Profile
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {recommendations.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <img 
                      src={job.company.logo} 
                      alt={job.company.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link 
                            href={`/jobs/${job.id}`}
                            className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {job.title}
                          </Link>
                          <div className="flex items-center gap-4 mt-1 text-gray-600">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {job.company.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {job.type}
                            </span>
                            {job.remote && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                Remote
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(job.matchScore)}`}>
                            {getMatchScoreIcon(job.matchScore)}
                            {job.matchScore}% match
                          </div>
                          {onSaveJob && (
                            <button
                              onClick={() => onSaveJob(job.id)}
                              className={`p-2 rounded-lg ${
                                savedJobs.includes(job.id)
                                  ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                              }`}
                            >
                              <Bookmark className={`h-5 w-5 ${savedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="mt-3 text-gray-700 line-clamp-2">{job.description}</p>

                      {/* Match Reasons */}
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Why this matches you:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                          {job.matchReasons.slice(0, 4).map((reason, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              {reason}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {job.skills.slice(0, 4).map((skill, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{job.skills.length - 4} more
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1 text-lg font-semibold text-gray-900">
                            <DollarSign className="h-4 w-4" />
                            ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                            <span className="text-sm text-gray-600">/{job.salary.period}</span>
                          </span>
                          <span className="text-gray-500 flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Posted {new Date(job.posted).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Link 
                            href={`/jobs/${job.id}`}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View Details
                          </Link>
                          <Link 
                            href={`/jobs/${job.id}`}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
