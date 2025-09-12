"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Users,
  Calendar,
  ExternalLink,
  Star,
  Briefcase,
  DollarSign,
  Clock,
  Globe,
  Mail,
  Phone,
  Award,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

interface CompanyDetails {
  id: string;
  name: string;
  logo: string;
  coverImage?: string;
  industry: string;
  size: string;
  founded: string;
  headquarters: string;
  website: string;
  email?: string;
  phone?: string;
  description: string;
  mission?: string;
  values: string[];
  benefits: string[];
  culture: string;
  rating: number;
  reviewCount: number;
  jobs: CompanyJob[];
  stats: {
    employees: string;
    locations: number;
    openPositions: number;
    avgSalary: string;
  };
}

interface CompanyJob {
  id: string;
  title: string;
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
  experienceLevel: string;
  remote: boolean;
}

export default function CompanyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'culture'>('overview');

  const companyId = params.companyId as string;

  useEffect(() => {
    // Mock company data - replace with actual API call
    const mockCompany: CompanyDetails = {
      id: companyId,
      name: "TechCorp Inc.",
      logo: "/api/placeholder/120/120",
      coverImage: "/api/placeholder/800/300",
      industry: "Technology",
      size: "100-500 employees",
      founded: "2015",
      headquarters: "San Francisco, CA",
      website: "https://techcorp.com",
      email: "careers@techcorp.com",
      phone: "+1 (555) 123-4567",
      description: "TechCorp is a leading technology company focused on building innovative solutions for the modern world. We specialize in cloud computing, artificial intelligence, and enterprise software solutions that help businesses transform and scale.",
      mission: "To empower businesses worldwide with cutting-edge technology solutions that drive growth and innovation.",
      values: [
        "Innovation First",
        "Customer Success",
        "Team Collaboration",
        "Continuous Learning",
        "Ethical Leadership"
      ],
      benefits: [
        "Comprehensive health, dental, and vision insurance",
        "401(k) with company matching up to 6%",
        "Unlimited PTO policy",
        "Professional development budget ($2,000/year)",
        "Flexible work arrangements",
        "Stock options",
        "Free meals and snacks",
        "Gym membership reimbursement",
        "Mental health support",
        "Parental leave"
      ],
      culture: "At TechCorp, we believe in fostering a culture of innovation, collaboration, and continuous learning. Our diverse team of passionate professionals works together to solve complex challenges and create meaningful impact for our customers.",
      rating: 4.5,
      reviewCount: 127,
      stats: {
        employees: "350+",
        locations: 5,
        openPositions: 12,
        avgSalary: "$125k"
      },
      jobs: [
        {
          id: "1",
          title: "Senior Frontend Developer",
          location: "San Francisco, CA",
          type: "Full-time",
          salary: {
            min: 120000,
            max: 180000,
            currency: "USD",
            period: "year"
          },
          posted: "2024-01-15",
          description: "We are looking for a talented Senior Frontend Developer to join our growing team...",
          skills: ["React", "TypeScript", "Redux"],
          experienceLevel: "Senior Level",
          remote: true
        },
        {
          id: "2",
          title: "Product Manager",
          location: "San Francisco, CA",
          type: "Full-time",
          salary: {
            min: 140000,
            max: 200000,
            currency: "USD",
            period: "year"
          },
          posted: "2024-01-12",
          description: "Join our product team to drive the vision and strategy for our core platform...",
          skills: ["Product Strategy", "Analytics", "Agile"],
          experienceLevel: "Mid Level",
          remote: false
        },
        {
          id: "3",
          title: "DevOps Engineer",
          location: "Remote",
          type: "Full-time",
          salary: {
            min: 110000,
            max: 160000,
            currency: "USD",
            period: "year"
          },
          posted: "2024-01-10",
          description: "Help us scale our infrastructure and improve our deployment processes...",
          skills: ["AWS", "Docker", "Kubernetes"],
          experienceLevel: "Mid Level",
          remote: true
        }
      ]
    };

    // Simulate API call delay
    setTimeout(() => {
      setCompany(mockCompany);
      setLoading(false);
    }, 500);
  }, [companyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Company Not Found</h1>
          <p className="text-gray-600 mb-8">The company you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/pages/student-dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/pages/student-dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
        </div>
      </div>

      {/* Cover Image */}
      {company.coverImage && (
        <div className="h-64 bg-gradient-to-r from-blue-600 to-purple-600 relative">
          <img
            src={company.coverImage}
            alt={`${company.name} cover`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>
      )}

      {/* Company Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow -mt-16 relative z-10 p-6">
          <div className="flex items-start gap-6">
            <img
              src={company.logo}
              alt={company.name}
              className="w-24 h-24 rounded-lg object-cover border-4 border-white shadow-lg"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
                  <div className="flex items-center gap-4 text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {company.industry}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {company.size}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {company.headquarters}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Founded {company.founded}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(company.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {company.rating} ({company.reviewCount} reviews)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </a>
                  )}
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Follow Company
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{company.stats.employees}</div>
            <div className="text-sm text-gray-600">Employees</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{company.stats.locations}</div>
            <div className="text-sm text-gray-600">Locations</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{company.stats.openPositions}</div>
            <div className="text-sm text-gray-600">Open Positions</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{company.stats.avgSalary}</div>
            <div className="text-sm text-gray-600">Avg Salary</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: Building2 },
                { id: 'jobs', label: `Jobs (${company.jobs.length})`, icon: Briefcase },
                { id: 'culture', label: 'Culture & Benefits', icon: Award }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About {company.name}</h2>
                  <p className="text-gray-700 leading-relaxed">{company.description}</p>
                </div>

                {company.mission && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Mission</h3>
                    <p className="text-gray-700 leading-relaxed">{company.mission}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Values</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {company.values.map((value, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-gray-900 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {company.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <a href={`mailto:${company.email}`} className="text-blue-600 hover:text-blue-700">
                          {company.email}
                        </a>
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <a href={`tel:${company.phone}`} className="text-blue-600 hover:text-blue-700">
                          {company.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {company.website}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Open Positions</h2>
                  <span className="text-gray-600">{company.jobs.length} positions available</span>
                </div>

                <div className="space-y-4">
                  {company.jobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {job.title}
                          </Link>
                          <div className="mt-2 flex items-center gap-4 text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {job.type}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              {job.experienceLevel}
                            </span>
                            {job.remote && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                Remote
                              </span>
                            )}
                          </div>

                          <p className="mt-3 text-gray-700 line-clamp-2">{job.description}</p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {job.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
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
                            <Link
                              href={`/jobs/${job.id}`}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Culture & Benefits Tab */}
            {activeTab === 'culture' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Culture</h2>
                  <p className="text-gray-700 leading-relaxed">{company.culture}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits & Perks</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {company.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-900">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
