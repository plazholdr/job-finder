import { NextRequest, NextResponse } from 'next/server';

interface BulkActionRequest {
  applicationIds: string[];
  action: 'approve' | 'reject' | 'hold' | 'resume' | 'schedule_interview' | 'send_notification' | 'update_priority' | 'assign_reviewer';
  data?: {
    // For reject action
    rejectionReasons?: Array<{
      reasonId: string;
      customNotes?: string;
    }>;
    feedback?: {
      internal: string;
      candidate?: string;
    };
    
    // For hold action
    holdReasons?: Array<{
      reasonId: string;
      customNotes?: string;
    }>;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    expectedResumeDate?: string;
    
    // For interview scheduling
    interviewType?: 'video' | 'phone' | 'in_person';
    interviewerId?: string;
    
    // For notifications
    templateId?: string;
    customMessage?: string;
    
    // For assignment
    reviewerId?: string;
    
    // Common fields
    notes?: string;
    performedBy?: string;
  };
}

interface BulkActionResult {
  success: boolean;
  processed: number;
  failed: number;
  results: Array<{
    applicationId: string;
    success: boolean;
    error?: string;
    data?: any;
  }>;
  summary: {
    action: string;
    totalRequested: number;
    successfullyProcessed: number;
    failedProcessing: number;
    errors: string[];
  };
}

// Mock applications data
const mockApplications = [
  { id: 'app-1', status: 'submitted', stage: 'screening', candidateId: 'candidate-1', jobId: 'job-1' },
  { id: 'app-2', status: 'reviewing', stage: 'review', candidateId: 'candidate-2', jobId: 'job-1' },
  { id: 'app-3', status: 'submitted', stage: 'screening', candidateId: 'candidate-3', jobId: 'job-2' },
  { id: 'app-4', status: 'interview_scheduled', stage: 'interview', candidateId: 'candidate-4', jobId: 'job-1' },
  { id: 'app-5', status: 'on_hold', stage: 'review', candidateId: 'candidate-5', jobId: 'job-2' },
];

export async function POST(request: NextRequest) {
  try {
    const bulkRequest: BulkActionRequest = await request.json();

    // Validate request
    const validation = validateBulkRequest(bulkRequest);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error
        },
        { status: 400 }
      );
    }

    // Process bulk action
    const result = await processBulkAction(bulkRequest);

    return NextResponse.json({
      success: result.success,
      data: result,
      message: `Bulk ${bulkRequest.action} completed. ${result.processed} successful, ${result.failed} failed.`
    });

  } catch (error) {
    console.error('Error processing bulk action:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

function validateBulkRequest(request: BulkActionRequest): { valid: boolean; error?: string } {
  if (!request.applicationIds || !Array.isArray(request.applicationIds) || request.applicationIds.length === 0) {
    return { valid: false, error: 'Application IDs are required and must be a non-empty array' };
  }

  if (request.applicationIds.length > 100) {
    return { valid: false, error: 'Maximum 100 applications can be processed in a single bulk action' };
  }

  const validActions = ['approve', 'reject', 'hold', 'resume', 'schedule_interview', 'send_notification', 'update_priority', 'assign_reviewer'];
  if (!validActions.includes(request.action)) {
    return { valid: false, error: `Invalid action. Must be one of: ${validActions.join(', ')}` };
  }

  // Action-specific validation
  switch (request.action) {
    case 'reject':
      if (!request.data?.rejectionReasons || request.data.rejectionReasons.length === 0) {
        return { valid: false, error: 'Rejection reasons are required for reject action' };
      }
      break;
    
    case 'hold':
      if (!request.data?.holdReasons || request.data.holdReasons.length === 0) {
        return { valid: false, error: 'Hold reasons are required for hold action' };
      }
      break;
    
    case 'schedule_interview':
      if (!request.data?.interviewType || !request.data?.interviewerId) {
        return { valid: false, error: 'Interview type and interviewer ID are required for schedule interview action' };
      }
      break;
    
    case 'send_notification':
      if (!request.data?.templateId) {
        return { valid: false, error: 'Template ID is required for send notification action' };
      }
      break;
    
    case 'assign_reviewer':
      if (!request.data?.reviewerId) {
        return { valid: false, error: 'Reviewer ID is required for assign reviewer action' };
      }
      break;
  }

  return { valid: true };
}

async function processBulkAction(request: BulkActionRequest): Promise<BulkActionResult> {
  const results: BulkActionResult['results'] = [];
  const errors: string[] = [];
  let processed = 0;
  let failed = 0;

  for (const applicationId of request.applicationIds) {
    try {
      const application = mockApplications.find(app => app.id === applicationId);
      
      if (!application) {
        results.push({
          applicationId,
          success: false,
          error: 'Application not found'
        });
        failed++;
        errors.push(`Application ${applicationId} not found`);
        continue;
      }

      // Process individual action
      const actionResult = await processIndividualAction(application, request.action, request.data);
      
      results.push({
        applicationId,
        success: actionResult.success,
        error: actionResult.error,
        data: actionResult.data
      });

      if (actionResult.success) {
        processed++;
      } else {
        failed++;
        if (actionResult.error) {
          errors.push(`${applicationId}: ${actionResult.error}`);
        }
      }

    } catch (error) {
      results.push({
        applicationId,
        success: false,
        error: 'Unexpected error occurred'
      });
      failed++;
      errors.push(`${applicationId}: Unexpected error`);
    }
  }

  return {
    success: processed > 0,
    processed,
    failed,
    results,
    summary: {
      action: request.action,
      totalRequested: request.applicationIds.length,
      successfullyProcessed: processed,
      failedProcessing: failed,
      errors: errors.slice(0, 10) // Limit to first 10 errors
    }
  };
}

async function processIndividualAction(
  application: any, 
  action: string, 
  data?: any
): Promise<{ success: boolean; error?: string; data?: any }> {
  
  switch (action) {
    case 'approve':
      return await processApprove(application, data);
    
    case 'reject':
      return await processReject(application, data);
    
    case 'hold':
      return await processHold(application, data);
    
    case 'resume':
      return await processResume(application, data);
    
    case 'schedule_interview':
      return await processScheduleInterview(application, data);
    
    case 'send_notification':
      return await processSendNotification(application, data);
    
    case 'update_priority':
      return await processUpdatePriority(application, data);
    
    case 'assign_reviewer':
      return await processAssignReviewer(application, data);
    
    default:
      return { success: false, error: 'Unknown action' };
  }
}

async function processApprove(application: any, data?: any) {
  // Validate current status
  if (!['submitted', 'reviewing'].includes(application.status)) {
    return { success: false, error: `Cannot approve application with status: ${application.status}` };
  }

  // Update application status
  application.status = 'approved';
  application.stage = 'interview';
  application.lastUpdated = new Date();

  // In real implementation, you would:
  // 1. Update database
  // 2. Send notification to candidate
  // 3. Log workflow action
  // 4. Trigger next workflow step

  return { 
    success: true, 
    data: { 
      newStatus: application.status,
      newStage: application.stage 
    } 
  };
}

async function processReject(application: any, data?: any) {
  // Create rejection record
  const rejectionData = {
    applicationId: application.id,
    jobId: application.jobId,
    candidateId: application.candidateId,
    rejectionReasons: data?.rejectionReasons || [],
    stage: application.stage,
    feedback: data?.feedback || { internal: '', candidate: '' },
    rejectedBy: data?.performedBy || 'bulk-action-user'
  };

  // Call rejection API
  try {
    const response = await fetch('/api/company/applications/rejection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rejectionData)
    });

    if (response.ok) {
      application.status = 'rejected';
      application.lastUpdated = new Date();
      return { success: true, data: { newStatus: 'rejected' } };
    } else {
      const error = await response.json();
      return { success: false, error: error.error || 'Failed to reject application' };
    }
  } catch (error) {
    return { success: false, error: 'Failed to process rejection' };
  }
}

async function processHold(application: any, data?: any) {
  // Validate current status
  if (application.status === 'on_hold') {
    return { success: false, error: 'Application is already on hold' };
  }

  const holdData = {
    applicationId: application.id,
    jobId: application.jobId,
    candidateId: application.candidateId,
    holdReasons: data?.holdReasons || [],
    stage: application.stage,
    priority: data?.priority || 'medium',
    expectedResumeDate: data?.expectedResumeDate,
    notes: { internal: data?.notes || '' }
  };

  // Call hold API
  try {
    const response = await fetch('/api/company/applications/hold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(holdData)
    });

    if (response.ok) {
      application.status = 'on_hold';
      application.lastUpdated = new Date();
      return { success: true, data: { newStatus: 'on_hold' } };
    } else {
      const error = await response.json();
      return { success: false, error: error.error || 'Failed to place application on hold' };
    }
  } catch (error) {
    return { success: false, error: 'Failed to process hold' };
  }
}

async function processResume(application: any, data?: any) {
  if (application.status !== 'on_hold') {
    return { success: false, error: 'Application is not on hold' };
  }

  // In real implementation, call hold API to resume
  application.status = 'reviewing';
  application.lastUpdated = new Date();

  return { success: true, data: { newStatus: 'reviewing' } };
}

async function processScheduleInterview(application: any, data?: any) {
  if (!['approved', 'reviewing'].includes(application.status)) {
    return { success: false, error: `Cannot schedule interview for application with status: ${application.status}` };
  }

  // In real implementation, call interview scheduling API
  application.status = 'interview_scheduled';
  application.stage = 'interview';
  application.lastUpdated = new Date();

  return { success: true, data: { newStatus: 'interview_scheduled' } };
}

async function processSendNotification(application: any, data?: any) {
  // In real implementation, call notification API
  return { success: true, data: { notificationSent: true } };
}

async function processUpdatePriority(application: any, data?: any) {
  if (!data?.priority) {
    return { success: false, error: 'Priority is required' };
  }

  // In real implementation, update application priority
  application.priority = data.priority;
  application.lastUpdated = new Date();

  return { success: true, data: { newPriority: data.priority } };
}

async function processAssignReviewer(application: any, data?: any) {
  if (!data?.reviewerId) {
    return { success: false, error: 'Reviewer ID is required' };
  }

  // In real implementation, assign reviewer to application
  application.assignedTo = data.reviewerId;
  application.lastUpdated = new Date();

  return { success: true, data: { assignedTo: data.reviewerId } };
}
