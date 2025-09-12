'use client';

import React from 'react';
import { ApplicationTimelineEvent } from '@/types/company-job';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  User, 
  Building2,
  Calendar,
  Video,
  FileText
} from 'lucide-react';

interface ApplicationTimelineProps {
  events: ApplicationTimelineEvent[];
  className?: string;
}

export default function ApplicationTimeline({ events, className = '' }: ApplicationTimelineProps) {
  const getEventIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <FileText className="h-4 w-4" />;
      case 'reviewed':
        return <AlertCircle className="h-4 w-4" />;
      case 'interview_scheduled':
        return <Calendar className="h-4 w-4" />;
      case 'interview_completed':
        return <Video className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
      case 'withdrawn':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (status: string, isLatest: boolean) => {
    if (isLatest) {
      switch (status) {
        case 'accepted':
          return 'bg-green-600 text-white';
        case 'rejected':
        case 'withdrawn':
          return 'bg-red-600 text-white';
        case 'interview_scheduled':
        case 'interview_completed':
          return 'bg-purple-600 text-white';
        default:
          return 'bg-blue-600 text-white';
      }
    }
    
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-600';
      case 'rejected':
      case 'withdrawn':
        return 'bg-red-100 text-red-600';
      case 'interview_scheduled':
      case 'interview_completed':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getActorIcon = (actor: string) => {
    switch (actor) {
      case 'company':
        return <Building2 className="h-3 w-3" />;
      case 'intern':
        return <User className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const eventDate = new Date(date);
    const diffInHours = Math.abs(now.getTime() - eventDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return eventDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 24 * 7) {
      return eventDate.toLocaleDateString('en-US', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return eventDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (events.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No timeline events available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {sortedEvents.map((event, index) => {
        const isLatest = index === 0;
        const eventIcon = getEventIcon(event.status);
        const eventColor = getEventColor(event.status, isLatest);
        const actorIcon = getActorIcon(event.actor);

        return (
          <div key={event.id} className="flex space-x-4">
            {/* Timeline Icon */}
            <div className="flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${eventColor}`}>
                {eventIcon}
              </div>
              {index < sortedEvents.length - 1 && (
                <div className="w-px h-12 bg-gray-200 mt-2"></div>
              )}
            </div>

            {/* Event Content */}
            <div className="flex-1 pb-8">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-gray-900">{event.title}</h4>
                <span className="text-sm text-gray-500">
                  {formatDate(event.timestamp)}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-2">{event.description}</p>
              
              {event.actorName && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  {actorIcon}
                  <span>by {event.actorName}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Progress indicator component
interface ApplicationProgressProps {
  status: string;
  className?: string;
}

export function ApplicationProgress({ status, className = '' }: ApplicationProgressProps) {
  const steps = [
    { key: 'applied', label: 'Applied', icon: FileText },
    { key: 'reviewed', label: 'Reviewed', icon: AlertCircle },
    { key: 'interview_scheduled', label: 'Interview', icon: Calendar },
    { key: 'interview_completed', label: 'Completed', icon: Video },
    { key: 'accepted', label: 'Offer', icon: CheckCircle }
  ];

  const getCurrentStepIndex = () => {
    switch (status) {
      case 'applied':
        return 0;
      case 'reviewed':
        return 1;
      case 'interview_scheduled':
        return 2;
      case 'interview_completed':
        return 3;
      case 'accepted':
        return 4;
      case 'rejected':
      case 'withdrawn':
        return -1; // Special case for terminated applications
      default:
        return 0;
    }
  };

  const currentStep = getCurrentStepIndex();
  const isTerminated = currentStep === -1;

  if (isTerminated) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-red-600">
          <XCircle className="h-5 w-5" />
          <span className="font-medium capitalize">{status.replace('_', ' ')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index <= currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${
                isCompleted 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-400'
              }`}>
                <StepIcon className="h-4 w-4" />
              </div>
              <span className={`text-xs mt-2 ${
                isCurrent ? 'text-blue-600 font-medium' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
              
              {index < steps.length - 1 && (
                <div className={`absolute h-px w-full mt-4 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`} style={{ 
                  left: '50%', 
                  right: '-50%',
                  top: '16px',
                  zIndex: -1
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
