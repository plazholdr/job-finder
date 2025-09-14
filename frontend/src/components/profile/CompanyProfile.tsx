"use client";

import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Linkedin,
  Building2,
  Users,
  Calendar,
  ExternalLink,
  Briefcase,
  Star,
  Image,
  UserCheck,
  FileText,
  Info
} from 'lucide-react';

interface CompanyProfileProps {
  user: any;
  isOwnProfile: boolean;
  currentUser: any;
}

export default function CompanyProfile({ user, isOwnProfile, currentUser }: CompanyProfileProps) {
  const [activeTab, setActiveTab] = useState('about');
  const profile = user.profile || {};
  const company = user.company || {};
  const privacy = user.privacy || {};

  // Resolve image src: if value is a key (not http URL), route through signed proxy
  const resolveImageSrc = (val?: string | null) => {
    if (!val) return '';
    return /^https?:\/\//i.test(val) ? val : `/api/files/image?key=${encodeURIComponent(val)}`;
  };

  // Check if field should be visible based on privacy settings
  const canShowField = (field: string) => {
    if (isOwnProfile) return true;
    if (privacy.profileVisibility === 'private') return false;
    if (privacy.profileVisibility === 'restricted' && !currentUser) return false;
    
    switch (field) {
      case 'email':
        return privacy.showEmail !== false;
      case 'phone':
        return privacy.showPhone !== false;
      case 'location':
        return privacy.showLocation !== false;
      default:
        return true;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start gap-6">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center">
              {company.logo ? (
                <img 
                  src={resolveImageSrc(company.logo)} 
                  alt={company.name || `${user.firstName} ${user.lastName}`}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              ) : (
                <Building2 className="h-12 w-12 text-blue-600" />
              )}
            </div>
          </div>

          {/* Company Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {company.name || `${user.firstName} ${user.lastName}`}
            </h1>
            {company.industry && (
              <p className="text-lg text-gray-600 mb-3">{company.industry}</p>
            )}
            {company.description && (
              <p className="text-gray-700 mb-4">{company.description}</p>
            )}

            {/* Company Stats */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-4">
              {company.size && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {company.size} employees
                </div>
              )}
              {company.founded && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Founded {company.founded}
                </div>
              )}
              {canShowField('location') && company.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {company.location}
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {canShowField('email') && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
              )}
              {canShowField('phone') && company.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {company.phone}
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-4">
              {company.website && (
                <a 
                  href={company.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600"
                >
                  <Globe className="h-5 w-5" />
                </a>
              )}
              {company.linkedin && (
                <a 
                  href={company.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('about')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'about'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Info className="h-4 w-4 inline mr-2" />
              About
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'jobs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Briefcase className="h-4 w-4 inline mr-2" />
              Jobs ({company.activeJobs || 0})
            </button>
            <button
              onClick={() => setActiveTab('people')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'people'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserCheck className="h-4 w-4 inline mr-2" />
              People ({company.employeeCount || 0})
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'gallery'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Image className="h-4 w-4 inline mr-2" />
              Gallery
            </button>
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Tab */}
          {activeTab === 'about' && (
            <>
              {/* About Company */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About Us</h2>
                <div className="prose max-w-none text-gray-700">
                  {company.about ? (
                    company.about.split('\n').map((paragraph: string, index: number) => (
                      <p key={index} className="mb-3">{paragraph}</p>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No company description available.</p>
                  )}
                </div>
              </div>

              {/* Company Culture */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Culture</h2>
                <div className="prose max-w-none text-gray-700">
                  {company.culture ? (
                    company.culture.split('\n').map((paragraph: string, index: number) => (
                      <p key={index} className="mb-3">{paragraph}</p>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No culture information available.</p>
                  )}
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits & Perks</h2>
                {company.benefits && company.benefits.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {company.benefits.map((benefit: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No benefits information available.</p>
                )}
              </div>

              {/* Office Locations */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Office Locations
                </h2>
                {company.offices && company.offices.length > 0 ? (
                  <div className="space-y-4">
                    {company.offices.map((office: any, index: number) => (
                      <div key={index} className="border-l-2 border-blue-200 pl-4">
                        <h3 className="font-semibold text-gray-900">{office.name}</h3>
                        <p className="text-gray-600">{office.address}</p>
                        {office.description && (
                          <p className="text-sm text-gray-500 mt-1">{office.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No office locations listed.</p>
                )}
              </div>
            </>
          )}

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Current Job Openings
              </h2>
              <div className="space-y-4">
                {/* Sample job listings - replace with real data */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900">Senior Software Engineer</h3>
                  <p className="text-gray-600 text-sm">Full-time • Remote • $80,000 - $120,000</p>
                  <p className="text-gray-700 mt-2">We're looking for an experienced software engineer to join our growing team...</p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">React</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Node.js</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">TypeScript</span>
                  </div>
                  <button className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View Details →
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900">Product Manager</h3>
                  <p className="text-gray-600 text-sm">Full-time • On-site • $90,000 - $130,000</p>
                  <p className="text-gray-700 mt-2">Lead product strategy and work with cross-functional teams...</p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Product Strategy</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Agile</span>
                  </div>
                  <button className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View Details →
                  </button>
                </div>

                <div className="text-center py-8">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    View All Jobs
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* People Tab */}
          {activeTab === 'people' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Our Team
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Sample team members - replace with real data */}
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">JD</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">John Doe</h3>
                  <p className="text-gray-600 text-sm">CEO & Founder</p>
                  <p className="text-gray-500 text-xs mt-1">5+ years experience</p>
                </div>

                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-green-600 font-semibold">JS</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Jane Smith</h3>
                  <p className="text-gray-600 text-sm">CTO</p>
                  <p className="text-gray-500 text-xs mt-1">8+ years experience</p>
                </div>

                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">MB</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Mike Brown</h3>
                  <p className="text-gray-600 text-sm">Lead Developer</p>
                  <p className="text-gray-500 text-xs mt-1">6+ years experience</p>
                </div>
              </div>

              <div className="text-center mt-6">
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  View All Team Members →
                </button>
              </div>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Image className="h-5 w-5" />
                Company Gallery
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Sample images - replace with real data */}
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <Image className="h-8 w-8 text-gray-400" />
                </div>
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <Image className="h-8 w-8 text-gray-400" />
                </div>
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <Image className="h-8 w-8 text-gray-400" />
                </div>
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <Image className="h-8 w-8 text-gray-400" />
                </div>
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <Image className="h-8 w-8 text-gray-400" />
                </div>
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <Image className="h-8 w-8 text-gray-400" />
                </div>
              </div>

              <div className="text-center mt-6">
                <p className="text-gray-500 italic">No images uploaded yet.</p>
                {isOwnProfile && (
                  <button className="mt-2 text-blue-600 hover:text-blue-700 font-medium">
                    Upload Images
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Info</h2>
            <div className="space-y-3">
              {company.industry && (
                <div>
                  <span className="text-sm text-gray-500">Industry</span>
                  <p className="font-medium text-gray-900">{company.industry}</p>
                </div>
              )}
              {company.size && (
                <div>
                  <span className="text-sm text-gray-500">Company Size</span>
                  <p className="font-medium text-gray-900">{company.size} employees</p>
                </div>
              )}
              {company.founded && (
                <div>
                  <span className="text-sm text-gray-500">Founded</span>
                  <p className="font-medium text-gray-900">{company.founded}</p>
                </div>
              )}
              {company.type && (
                <div>
                  <span className="text-sm text-gray-500">Company Type</span>
                  <p className="font-medium text-gray-900">{company.type}</p>
                </div>
              )}
            </div>
          </div>

          {/* Specialties */}
          {company.specialties && company.specialties.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Specialties</h2>
              <div className="flex flex-wrap gap-2">
                {company.specialties.map((specialty: string, index: number) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Current Openings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Current Openings
            </h2>
            <div className="text-center py-4">
              <p className="text-gray-500 mb-3">See available positions</p>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                View Jobs
              </button>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact</h2>
            <div className="space-y-3">
              {company.website && (
                <a 
                  href={company.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Globe className="h-4 w-4" />
                  Company Website
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {company.linkedin && (
                <a 
                  href={company.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn Page
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
