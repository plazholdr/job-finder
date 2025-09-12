'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  ArrowRight, 
  User, 
  FileText, 
  Calendar,
  Award,
  Handshake
} from 'lucide-react';

interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  position: { x: number; y: number };
}

interface WorkflowConnection {
  from: string;
  to: string;
  label?: string;
  condition?: string;
}

interface WorkflowVisualizationProps {
  currentStage: string;
  completedStages: string[];
  applicationData?: any;
}

export default function WorkflowVisualization({ 
  currentStage, 
  completedStages, 
  applicationData 
}: WorkflowVisualizationProps) {
  
  // Define workflow stages based on the diagram
  const workflowStages: WorkflowStage[] = [
    {
      id: 'submitted',
      name: 'Application Submitted',
      description: 'New application received',
      icon: <FileText className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      position: { x: 0, y: 0 }
    },
    {
      id: 'first_level_review',
      name: 'First Level Review',
      description: 'Initial screening by HR',
      icon: <User className="h-4 w-4" />,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      position: { x: 1, y: 0 }
    },
    {
      id: 'pending_acceptance',
      name: 'Pending Acceptance',
      description: 'Awaiting acceptance decision',
      icon: <Clock className="h-4 w-4" />,
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      position: { x: 2, y: 0 }
    },
    {
      id: 'accepted',
      name: 'Accepted',
      description: 'Application accepted for review',
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'bg-green-100 text-green-800 border-green-200',
      position: { x: 3, y: 0 }
    },
    {
      id: 'shortlisted',
      name: 'Shortlisted',
      description: 'Candidate shortlisted',
      icon: <Award className="h-4 w-4" />,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      position: { x: 4, y: 0 }
    },
    {
      id: 'interview_scheduled',
      name: 'Interview Scheduled',
      description: 'Interview appointment set',
      icon: <Calendar className="h-4 w-4" />,
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      position: { x: 0, y: 1 }
    },
    {
      id: 'interview_completed',
      name: 'Interview Completed',
      description: 'Interview process finished',
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      position: { x: 1, y: 1 }
    },
    {
      id: 'offer_extended',
      name: 'Offer Extended',
      description: 'Job offer sent to candidate',
      icon: <Handshake className="h-4 w-4" />,
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      position: { x: 2, y: 1 }
    },
    {
      id: 'offer_accepted',
      name: 'Offer Accepted',
      description: 'Candidate accepted offer',
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'bg-green-200 text-green-900 border-green-300',
      position: { x: 3, y: 1 }
    },
    {
      id: 'offer_declined',
      name: 'Offer Declined',
      description: 'Candidate declined offer',
      icon: <XCircle className="h-4 w-4" />,
      color: 'bg-red-100 text-red-800 border-red-200',
      position: { x: 4, y: 1 }
    },
    {
      id: 'rejected',
      name: 'Rejected',
      description: 'Application rejected',
      icon: <XCircle className="h-4 w-4" />,
      color: 'bg-red-200 text-red-900 border-red-300',
      position: { x: 2, y: 2 }
    }
  ];

  // Define connections between stages
  const connections: WorkflowConnection[] = [
    { from: 'submitted', to: 'first_level_review', label: 'Start Review' },
    { from: 'first_level_review', to: 'pending_acceptance', label: 'Meets Requirements', condition: 'Yes' },
    { from: 'first_level_review', to: 'rejected', label: 'Does Not Meet Requirements', condition: 'No' },
    { from: 'pending_acceptance', to: 'accepted', label: 'Accept', condition: 'Approve' },
    { from: 'pending_acceptance', to: 'rejected', label: 'Reject', condition: 'Decline' },
    { from: 'accepted', to: 'shortlisted', label: 'Shortlist', condition: 'Qualified' },
    { from: 'accepted', to: 'rejected', label: 'Reject', condition: 'Not Qualified' },
    { from: 'shortlisted', to: 'interview_scheduled', label: 'Schedule Interview' },
    { from: 'interview_scheduled', to: 'interview_completed', label: 'Complete Interview' },
    { from: 'interview_completed', to: 'offer_extended', label: 'Extend Offer', condition: 'Successful' },
    { from: 'interview_completed', to: 'rejected', label: 'Reject', condition: 'Unsuccessful' },
    { from: 'offer_extended', to: 'offer_accepted', label: 'Accept Offer' },
    { from: 'offer_extended', to: 'offer_declined', label: 'Decline Offer' }
  ];

  const getStageStatus = (stageId: string) => {
    if (completedStages.includes(stageId)) return 'completed';
    if (stageId === currentStage) return 'current';
    return 'pending';
  };

  const getStageStyle = (stage: WorkflowStage, status: string) => {
    const baseStyle = "relative p-4 rounded-lg border-2 transition-all duration-200 min-h-[100px] flex flex-col justify-center items-center text-center";
    
    switch (status) {
      case 'completed':
        return `${baseStyle} ${stage.color} opacity-75 scale-95`;
      case 'current':
        return `${baseStyle} ${stage.color} ring-2 ring-blue-500 ring-offset-2 shadow-lg scale-105`;
      case 'pending':
        return `${baseStyle} bg-gray-50 text-gray-400 border-gray-200 opacity-50`;
      default:
        return `${baseStyle} ${stage.color}`;
    }
  };

  const renderStage = (stage: WorkflowStage) => {
    const status = getStageStatus(stage.id);
    
    return (
      <div
        key={stage.id}
        className={getStageStyle(stage, status)}
        style={{
          gridColumn: stage.position.x + 1,
          gridRow: stage.position.y + 1
        }}
      >
        <div className="flex items-center justify-center mb-2">
          {status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600 mr-1" />}
          {status === 'current' && <Clock className="h-4 w-4 text-blue-600 mr-1" />}
          {stage.icon}
        </div>
        <h4 className="font-medium text-sm mb-1">{stage.name}</h4>
        <p className="text-xs opacity-75">{stage.description}</p>
        
        {status === 'current' && (
          <div className="absolute -top-2 -right-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    );
  };

  const renderConnection = (connection: WorkflowConnection) => {
    const fromStage = workflowStages.find(s => s.id === connection.from);
    const toStage = workflowStages.find(s => s.id === connection.to);
    
    if (!fromStage || !toStage) return null;

    // Calculate connection line position and style
    const isHorizontal = fromStage.position.y === toStage.position.y;
    const isVertical = fromStage.position.x === toStage.position.x;
    
    if (isHorizontal) {
      const startX = Math.min(fromStage.position.x, toStage.position.x);
      const y = fromStage.position.y;
      
      return (
        <div
          key={`${connection.from}-${connection.to}`}
          className="absolute flex items-center justify-center"
          style={{
            left: `${(startX + 0.8) * 200}px`,
            top: `${y * 120 + 50}px`,
            width: '40px',
            height: '2px',
            backgroundColor: '#e5e7eb'
          }}
        >
          <ArrowRight className="h-3 w-3 text-gray-400" />
        </div>
      );
    }
    
    return null;
  };

  const renderDecisionPoint = (stageId: string) => {
    const decisionStages = ['first_level_review', 'pending_acceptance', 'accepted', 'interview_completed'];
    
    if (!decisionStages.includes(stageId)) return null;
    
    const stage = workflowStages.find(s => s.id === stageId);
    if (!stage) return null;
    
    return (
      <div
        key={`decision-${stageId}`}
        className="absolute w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900"
        style={{
          left: `${stage.position.x * 200 + 90}px`,
          top: `${stage.position.y * 120 + 90}px`
        }}
      >
        ?
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Workflow Progress</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-gray-600">Completed</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-gray-600">Current</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded mr-1"></div>
              <span className="text-gray-600">Pending</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <div 
            className="relative"
            style={{ 
              width: '1000px', 
              height: '400px',
              minWidth: '100%'
            }}
          >
            {/* Grid for stages */}
            <div 
              className="grid gap-4"
              style={{
                gridTemplateColumns: 'repeat(5, 200px)',
                gridTemplateRows: 'repeat(3, 120px)'
              }}
            >
              {workflowStages.map(renderStage)}
            </div>

            {/* Connections */}
            {connections.map(renderConnection)}

            {/* Decision points */}
            {workflowStages.map(stage => renderDecisionPoint(stage.id))}
          </div>
        </div>

        {/* Current Stage Details */}
        {currentStage && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Current Stage</h4>
            <div className="flex items-center">
              <Badge className="bg-blue-100 text-blue-800 mr-2">
                {workflowStages.find(s => s.id === currentStage)?.name || currentStage}
              </Badge>
              <span className="text-blue-700 text-sm">
                {workflowStages.find(s => s.id === currentStage)?.description}
              </span>
            </div>
          </div>
        )}

        {/* Progress Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>Progress: {completedStages.length} of {workflowStages.length} stages completed</span>
          <div className="w-48 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedStages.length / workflowStages.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
