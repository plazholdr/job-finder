'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  User,
  Users,
  AlertCircle,
  CheckCircle,
  Save
} from 'lucide-react';
import Link from 'next/link';
import { CandidateApplication } from '@/types/company';

interface InterviewForm {
  applicationId: string;
  type: 'video' | 'phone' | 'in_person';
  scheduledAt: string;
  duration: number;
  interviewerId: string;
  location?: string;
  meetingLink?: string;
  notes?: string;
  agenda?: string;
}

export default function ScheduleInterviewPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [interviewers, setInterviewers] = useState<any[]>([]);
  const [formData, setFormData] = useState<InterviewForm>({
    applicationId: '',
    type: 'video',
    scheduledAt: '',
    duration: 60,
    interviewerId: '',
    location: '',
    meetingLink: '',
    notes: '',
    agenda: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
    fetchInterviewers();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/company/applications?status=shortlisted');
      const result = await response.json();
      if (result.success) {
        setApplications(result.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchInterviewers = async () => {
    try {
      const response = await fetch('/api/company/team');
      const result = await response.json();
      if (result.success) {
        setInterviewers(result.data);
      }
    } catch (error) {
      console.error('Error fetching interviewers:', error);
      // Mock data for demo
      setInterviewers([
        { id: 'user-1', name: 'Sarah Johnson', title: 'HR Manager' },
        { id: 'user-2', name: 'Mike Chen', title: 'Senior Developer' },
        { id: 'user-3', name: 'Lisa Wang', title: 'Engineering Manager' },
        { id: 'user-4', name: 'David Kim', title: 'Product Manager' }
      ]);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.applicationId) {
      setError('Please select a candidate');
      return false;
    }
    if (!formData.scheduledAt) {
      setError('Please select a date and time');
      return false;
    }
    if (!formData.interviewerId) {
      setError('Please select an interviewer');
      return false;
    }
    if (formData.type === 'video' && !formData.meetingLink) {
      setError('Meeting link is required for video interviews');
      return false;
    }
    if (formData.type === 'in_person' && !formData.location) {
      setError('Location is required for in-person interviews');
      return false;
    }
    if (formData.duration < 15 || formData.duration > 180) {
      setError('Duration must be between 15 and 180 minutes');
      return false;
    }

    // Check if the scheduled time is in the future
    const scheduledDate = new Date(formData.scheduledAt);
    if (scheduledDate <= new Date()) {
      setError('Interview must be scheduled for a future date and time');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch('/api/company/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Interview scheduled successfully!');
        setTimeout(() => {
          router.push('/company/interviews');
        }, 2000);
      } else {
        setError(result.error || 'Failed to schedule interview');
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedApplication = () => {
    return applications.find(app => app.id === formData.applicationId);
  };

  const getSelectedInterviewer = () => {
    return interviewers.find(interviewer => interviewer.id === formData.interviewerId);
  };

  // Generate default meeting link for video interviews
  const generateMeetingLink = () => {
    const meetingId = Math.random().toString(36).substring(2, 15);
    return `https://meet.company.com/interview-${meetingId}`;
  };

  // Set default meeting link when video type is selected
  useEffect(() => {
    if (formData.type === 'video' && !formData.meetingLink) {
      handleInputChange('meetingLink', generateMeetingLink());
    }
  }, [formData.type]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/company/interviews">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Interviews
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Schedule Interview</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Candidate Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Select Candidate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="applicationId">Candidate *</Label>
                <select
                  id="applicationId"
                  value={formData.applicationId}
                  onChange={(e) => handleInputChange('applicationId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select a candidate...</option>
                  {applications.map(application => (
                    <option key={application.id} value={application.id}>
                      {application.candidate.name} - {application.candidate.email}
                    </option>
                  ))}
                </select>
              </div>

              {getSelectedApplication() && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Selected Candidate</h4>
                  <div className="text-sm text-blue-800">
                    <p><strong>Name:</strong> {getSelectedApplication()?.candidate.name}</p>
                    <p><strong>Email:</strong> {getSelectedApplication()?.candidate.email}</p>
                    <p><strong>Education:</strong> {getSelectedApplication()?.candidate.education}</p>
                    <p><strong>Experience:</strong> {getSelectedApplication()?.candidate.experience}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interview Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Interview Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="type">Interview Type *</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="video">Video Call</option>
                    <option value="phone">Phone Call</option>
                    <option value="in_person">In Person</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 60)}
                    min="15"
                    max="180"
                    step="15"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="scheduledAt">Date and Time *</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="interviewerId">Interviewer *</Label>
                <select
                  id="interviewerId"
                  value={formData.interviewerId}
                  onChange={(e) => handleInputChange('interviewerId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select an interviewer...</option>
                  {interviewers.map(interviewer => (
                    <option key={interviewer.id} value={interviewer.id}>
                      {interviewer.name} - {interviewer.title}
                    </option>
                  ))}
                </select>
              </div>

              {getSelectedInterviewer() && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Selected Interviewer</h4>
                  <div className="text-sm text-green-800">
                    <p><strong>Name:</strong> {getSelectedInterviewer()?.name}</p>
                    <p><strong>Title:</strong> {getSelectedInterviewer()?.title}</p>
                  </div>
                </div>
              )}

              {/* Conditional fields based on interview type */}
              {formData.type === 'video' && (
                <div>
                  <Label htmlFor="meetingLink">Meeting Link *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="meetingLink"
                      value={formData.meetingLink}
                      onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                      placeholder="https://meet.company.com/interview-room"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleInputChange('meetingLink', generateMeetingLink())}
                    >
                      Generate
                    </Button>
                  </div>
                </div>
              )}

              {formData.type === 'in_person' && (
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Office address or meeting room"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="agenda">Interview Agenda</Label>
                <Textarea
                  id="agenda"
                  value={formData.agenda}
                  onChange={(e) => handleInputChange('agenda', e.target.value)}
                  placeholder="Outline what will be covered in the interview..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional information or special instructions..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Link href="/company/interviews">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Schedule Interview
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
