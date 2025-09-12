"use client";

import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Linkedin,
  Github,
  GraduationCap,
  Briefcase,
  Award,
  FileText,
  ExternalLink,
  User,
  Target,
  TrendingUp,
  BookOpen
} from 'lucide-react';

interface StudentProfileProps {
  user: any;
  isOwnProfile: boolean;
  currentUser: any;
}

export default function StudentProfile({ user, isOwnProfile, currentUser }: StudentProfileProps) {
  const [activeTab, setActiveTab] = useState('about');
  const profile = user.profile || {};
  const student = user.student || {};
  const privacy = user.privacy || {};

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
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              {profile.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-blue-600">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {user.firstName} {user.lastName}
            </h1>
            {student.title && (
              <p className="text-lg text-gray-600 mb-3">{student.title}</p>
            )}
            {profile.bio && (
              <p className="text-gray-700 mb-4">{profile.bio}</p>
            )}

            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {canShowField('location') && profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </div>
              )}
              {canShowField('email') && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
              )}
              {canShowField('phone') && profile.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {profile.phone}
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-4">
              {profile.website && (
                <a 
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600"
                >
                  <Globe className="h-5 w-5" />
                </a>
              )}
              {profile.linkedin && (
                <a 
                  href={profile.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {profile.github && (
                <a 
                  href={profile.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600"
                >
                  <Github className="h-5 w-5" />
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
              <User className="h-4 w-4 inline mr-2" />
              About
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'experience'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Briefcase className="h-4 w-4 inline mr-2" />
              Experience
            </button>
            <button
              onClick={() => setActiveTab('education')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'education'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <GraduationCap className="h-4 w-4 inline mr-2" />
              Education
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'projects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpen className="h-4 w-4 inline mr-2" />
              Projects
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
              {/* Professional Summary */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Summary</h2>
                <div className="prose max-w-none text-gray-700">
                  {profile.bio ? (
                    <p>{profile.bio}</p>
                  ) : (
                    <p className="text-gray-500 italic">No professional summary available.</p>
                  )}
                </div>
              </div>

              {/* Career Objectives */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Career Objectives
                </h2>
                <div className="prose max-w-none text-gray-700">
                  {student.careerObjective ? (
                    <p>{student.careerObjective}</p>
                  ) : (
                    <p className="text-gray-500 italic">No career objectives specified.</p>
                  )}
                </div>
              </div>

              {/* Job Preferences */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Job Preferences
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Job Types</h3>
                    {student.jobPreferences?.jobTypes?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {student.jobPreferences.jobTypes.map((type: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                            {type}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No preferences specified</p>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Preferred Locations</h3>
                    {student.jobPreferences?.locations?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {student.jobPreferences.locations.map((location: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                            {location}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No preferences specified</p>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Remote Work</h3>
                    <span className={`px-2 py-1 text-sm rounded ${
                      student.jobPreferences?.remote
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {student.jobPreferences?.remote ? 'Open to Remote' : 'Prefers On-site'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Expected Salary</h3>
                    <p className="text-gray-700">
                      {student.expectedSalary ? `$${student.expectedSalary.toLocaleString()}` : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Work Experience
              </h2>
              {student.experience && student.experience.length > 0 ? (
                <div className="space-y-6">
                  {student.experience.map((exp: any, index: number) => (
                    <div key={index} className="border-l-2 border-green-200 pl-4">
                      <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                      <p className="text-green-600 font-medium">{exp.company}</p>
                      <p className="text-sm text-gray-600">
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </p>
                      {exp.description && (
                        <p className="text-gray-700 mt-2">{exp.description}</p>
                      )}
                      {exp.achievements && exp.achievements.length > 0 && (
                        <div className="mt-3">
                          <h4 className="font-medium text-gray-900 mb-2">Key Achievements:</h4>
                          <ul className="list-disc list-inside text-gray-700 space-y-1">
                            {exp.achievements.map((achievement: string, achIndex: number) => (
                              <li key={achIndex}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No work experience listed.</p>
              )}
            </div>
          )}

          {/* Education Tab */}
          {activeTab === 'education' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education
              </h2>
              {student.education && student.education.length > 0 ? (
                <div className="space-y-6">
                  {student.education.map((edu: any, index: number) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-4">
                      <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                      <p className="text-blue-600 font-medium">{edu.institution}</p>
                      <p className="text-sm text-gray-600">
                        {edu.startDate} - {edu.endDate || 'Present'}
                      </p>
                      {edu.gpa && (
                        <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>
                      )}
                      {edu.description && (
                        <p className="text-gray-700 mt-2">{edu.description}</p>
                      )}
                      {edu.coursework && edu.coursework.length > 0 && (
                        <div className="mt-3">
                          <h4 className="font-medium text-gray-900 mb-2">Relevant Coursework:</h4>
                          <div className="flex flex-wrap gap-2">
                            {edu.coursework.map((course: string, courseIndex: number) => (
                              <span key={courseIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {course}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No education information listed.</p>
              )}
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Projects & Portfolio
              </h2>
              <div className="space-y-6">
                {/* Sample projects - replace with real data */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900">E-commerce Website</h3>
                  <p className="text-gray-600 text-sm mb-2">Personal Project • 2024</p>
                  <p className="text-gray-700 mb-3">
                    Built a full-stack e-commerce platform with React, Node.js, and MongoDB.
                    Features include user authentication, payment processing, and admin dashboard.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">React</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Node.js</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">MongoDB</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Stripe</span>
                  </div>
                  <div className="flex gap-3">
                    <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <ExternalLink className="h-3 w-3 inline mr-1" />
                      Live Demo
                    </a>
                    <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <Github className="h-3 w-3 inline mr-1" />
                      Source Code
                    </a>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900">Task Management App</h3>
                  <p className="text-gray-600 text-sm mb-2">Team Project • 2023</p>
                  <p className="text-gray-700 mb-3">
                    Collaborated with a team of 4 to develop a task management application
                    with real-time updates and team collaboration features.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Vue.js</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Express</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Socket.io</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">PostgreSQL</span>
                  </div>
                  <div className="flex gap-3">
                    <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <ExternalLink className="h-3 w-3 inline mr-1" />
                      Live Demo
                    </a>
                    <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <Github className="h-3 w-3 inline mr-1" />
                      Source Code
                    </a>
                  </div>
                </div>

                <div className="text-center py-4">
                  <p className="text-gray-500 italic mb-3">Want to see more projects?</p>
                  {student.portfolio ? (
                    <a
                      href={student.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                    >
                      <Globe className="h-4 w-4" />
                      View Full Portfolio
                    </a>
                  ) : (
                    <p className="text-gray-500">No portfolio link available</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Skills */}
          {student.skills && student.skills.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {student.skills.map((skill: string, index: number) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
            </h2>
            <div className="space-y-3">
              {student.resume && (
                <a 
                  href={student.resume} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <FileText className="h-4 w-4" />
                  Resume/CV
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {student.portfolio && (
                <a 
                  href={student.portfolio} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Globe className="h-4 w-4" />
                  Portfolio
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          {/* Certifications */}
          {student.certifications && student.certifications.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certifications
              </h2>
              <div className="space-y-3">
                {student.certifications.map((cert: any, index: number) => (
                  <div key={index}>
                    <h3 className="font-medium text-gray-900">{cert.name}</h3>
                    <p className="text-sm text-gray-600">{cert.issuer}</p>
                    {cert.date && (
                      <p className="text-xs text-gray-500">{cert.date}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
