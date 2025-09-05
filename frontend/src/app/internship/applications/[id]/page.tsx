"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { withAuth } from '@/contexts/auth-context';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Building2,
  MapPin,
  MessageSquare,
  FileText,
  ExternalLink,
  User,
  Star,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import type { InternshipApplication } from '@/types/internship';

function ApplicationDetail() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<InternshipApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Mock data - same as in the list page
  const applications: InternshipApplication[] = [
    {
      id: 'app-1',
      internshipId: '1',
      applicantId: user?.id || '',
      status: 'interview',
      submittedAt: '2024-01-20T10:00:00Z',
      lastUpdated: '2024-01-25T14:30:00Z',
      coverLetter: 'I am excited to apply for the Software Engineering Intern position at TechCorp Inc. With my strong background in computer science and hands-on experience with React, Node.js, and modern web technologies, I am confident I can contribute meaningfully to your development team. I have completed several projects including a full-stack e-commerce application and a real-time chat system, which have given me practical experience in the technologies your team uses daily.',
      interviewSchedule: [
        {
          id: 'int-1',
          type: 'video',
          scheduledDate: '2024-02-01T15:00:00Z',
          duration: 60,
          meetingLink: 'https://zoom.us/j/123456789',
          interviewer: {
            name: 'Sarah Johnson',
            title: 'Engineering Manager',
            email: 'sarah.johnson@techcorp.com'
          },
          status: 'scheduled',
          notes: 'Technical interview focusing on JavaScript and React'
        }
      ],
      feedback: [
        {
          id: 'fb-1',
          stage: 'Application Review',
          feedback: 'Strong technical background and relevant coursework. Good fit for the role.',
          rating: 4,
          providedBy: 'HR Team',
          providedAt: '2024-01-22T09:00:00Z'
        }
      ]
    },
    {
      id: 'app-2',
      internshipId: '2',
      applicantId: user?.id || '',
      status: 'under_review',
      submittedAt: '2024-01-18T16:30:00Z',
      lastUpdated: '2024-01-18T16:30:00Z',
      coverLetter: 'I am passionate about digital marketing and would love to contribute to GrowthCo\'s innovative marketing campaigns. My experience with social media management, content creation, and data analysis makes me an ideal candidate for this position.',
      feedback: []
    },
    {
      id: 'app-3',
      internshipId: '3',
      applicantId: user?.id || '',
      status: 'accepted',
      submittedAt: '2024-01-15T11:15:00Z',
      lastUpdated: '2024-01-28T10:00:00Z',
      coverLetter: 'As a data science student with experience in Python and machine learning, I am excited about the opportunity to work with DataInsights Corp on real-world data problems.',
      feedback: [
        {
          id: 'fb-2',
          stage: 'Final Decision',
          feedback: 'Excellent technical skills and strong analytical thinking. Welcome to the team!',
          rating: 5,
          providedBy: 'Data Science Team Lead',
          providedAt: '2024-01-28T10:00:00Z'
        }
      ],
      offerDetails: {
        salary: 25,
        currency: 'USD',
        period: 'hour',
        startDate: '2024-06-01T09:00:00Z',
        endDate: '2024-08-31T17:00:00Z',
        benefits: ['Health insurance', 'Flexible working hours', 'Learning stipend'],
        conditions: ['Maintain academic standing', 'Complete final project'],
        deadline: '2025-02-15T23:59:59Z',
        responseRequired: true
      }
    },
    {
      id: 'app-4',
      internshipId: '4',
      applicantId: user?.id || '',
      status: 'rejected',
      submittedAt: '2024-01-12T14:20:00Z',
      lastUpdated: '2024-01-26T09:30:00Z',
      coverLetter: 'I am interested in the UX Design Intern position and believe my creative skills and attention to detail would be valuable to your design team.',
      feedback: [
        {
          id: 'fb-3',
          stage: 'Portfolio Review',
          feedback: 'Portfolio shows potential but needs more diverse projects. Encourage to apply again next cycle.',
          rating: 3,
          providedBy: 'Design Team',
          providedAt: '2024-01-26T09:30:00Z'
        }
      ]
    }
  ];

  const internshipDetails = {
    '1': { title: 'Software Engineering Intern', company: 'TechCorp Inc.', location: 'San Francisco, CA' },
    '2': { title: 'Marketing Intern', company: 'GrowthCo', location: 'New York, NY' },
    '3': { title: 'Data Science Intern', company: 'DataInsights Corp', location: 'Austin, TX' },
    '4': { title: 'UX Design Intern', company: 'DesignStudio', location: 'Seattle, WA' }
  };

  useEffect(() => {
    // Find the application by ID
    const foundApp = applications.find(app => app.id === params.id);
    if (foundApp) {
      setApplication(foundApp);
    }
    setLoading(false);
  }, [params.id]);

  const handleAcceptOffer = async () => {
    if (!application) return;
    
    setActionLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update application status
      const updatedApp = {
        ...application,
        status: 'offer_accepted' as any,
        lastUpdated: new Date().toISOString(),
        offerDetails: application.offerDetails ? {
          ...application.offerDetails,
          responseRequired: false
        } : undefined
      };
      
      setApplication(updatedApp);
      alert('Offer accepted successfully! You will receive a confirmation email shortly.');
    } catch (error) {
      alert('Failed to accept offer. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineOffer = async () => {
    if (!application) return;
    
    if (!confirm('Are you sure you want to decline this offer? This action cannot be undone.')) {
      return;
    }
    
    setActionLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update application status
      const updatedApp = {
        ...application,
        status: 'offer_declined' as any,
        lastUpdated: new Date().toISOString(),
        offerDetails: application.offerDetails ? {
          ...application.offerDetails,
          responseRequired: false
        } : undefined
      };
      
      setApplication(updatedApp);
      alert('Offer declined. Thank you for your consideration.');
    } catch (error) {
      alert('Failed to decline offer. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'under_review':
        return <Eye className="h-5 w-5 text-blue-600" />;
      case 'interview':
        return <MessageSquare className="h-5 w-5 text-purple-600" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'offer_accepted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'offer_declined':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
      case 'offer_accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'offer_declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'under_review':
        return 'Under Review';
      case 'interview':
        return 'Interview Scheduled';
      case 'accepted':
        return 'Accepted';
      case 'offer_accepted':
        return 'Offer Accepted';
      case 'rejected':
        return 'Not Selected';
      case 'offer_declined':
        return 'Offer Declined';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Application not found</h3>
          <p className="text-gray-600 mb-6">
            The application you're looking for doesn't exist.
          </p>
          <Link
            href="/internship/applications"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  const internship = internshipDetails[application.internshipId as keyof typeof internshipDetails];
  const hasInterview = application.interviewSchedule && application.interviewSchedule.length > 0;
  const nextInterview = hasInterview ? application.interviewSchedule[0] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/internship/applications"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {internship?.title}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                  {getStatusText(application.status)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {internship?.company}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {internship?.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Applied {new Date(application.submittedAt!).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Letter */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cover Letter</h2>
              <p className="text-gray-700 leading-relaxed">{application.coverLetter}</p>
            </div>

            {/* Interview Details */}
            {hasInterview && nextInterview && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Interview Details</h2>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-purple-900">Date & Time</label>
                      <p className="text-purple-800">{new Date(nextInterview.scheduledDate).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-purple-900">Duration</label>
                      <p className="text-purple-800">{nextInterview.duration} minutes</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-purple-900">Type</label>
                      <p className="text-purple-800 capitalize">{nextInterview.type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-purple-900">Interviewer</label>
                      <p className="text-purple-800">{nextInterview.interviewer.name}</p>
                      <p className="text-sm text-purple-700">{nextInterview.interviewer.title}</p>
                    </div>
                  </div>
                  
                  {nextInterview.notes && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-purple-900">Notes</label>
                      <p className="text-purple-800">{nextInterview.notes}</p>
                    </div>
                  )}
                  
                  {nextInterview.meetingLink && (
                    <div className="mt-4">
                      <a
                        href={nextInterview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Join Meeting
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Feedback */}
            {application.feedback && application.feedback.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Feedback</h2>
                <div className="space-y-4">
                  {application.feedback.map((feedback) => (
                    <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{feedback.stage}</h3>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{feedback.feedback}</p>
                      <div className="text-sm text-gray-500">
                        By {feedback.providedBy} on {new Date(feedback.providedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h3>
              <div className="flex items-center gap-3 mb-4">
                {getStatusIcon(application.status)}
                <span className="font-medium">{getStatusText(application.status)}</span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Submitted:</span>
                  <p>{new Date(application.submittedAt!).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <p>{new Date(application.lastUpdated).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium">Application ID:</span>
                  <p className="font-mono text-xs">{application.id}</p>
                </div>
              </div>
            </div>

            {/* Offer Details */}
            {application.status === 'accepted' && application.offerDetails && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Offer Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Salary</label>
                    <p className="text-lg font-semibold">
                      ${application.offerDetails.salary}/{application.offerDetails.period}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Duration</label>
                    <p>
                      {new Date(application.offerDetails.startDate).toLocaleDateString()} - {new Date(application.offerDetails.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Benefits</label>
                    <ul className="mt-1 space-y-1">
                      {application.offerDetails.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {application.offerDetails.conditions.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Conditions</label>
                      <ul className="mt-1 space-y-1">
                        {application.offerDetails.conditions.map((condition, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm">{condition}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {application.offerDetails.responseRequired && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Response Required</span>
                      </div>
                      <p className="text-yellow-700 text-sm mb-4">
                        Please respond by {new Date(application.offerDetails.deadline).toLocaleDateString()}
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={handleAcceptOffer}
                          disabled={actionLoading}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading ? 'Processing...' : 'Accept Offer'}
                        </button>
                        <button
                          onClick={handleDeclineOffer}
                          disabled={actionLoading}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                          {actionLoading ? 'Processing...' : 'Decline'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ApplicationDetail);
