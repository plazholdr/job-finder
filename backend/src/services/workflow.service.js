const logger = require('../logger');

class WorkflowService {
  constructor(applicationModel, notificationService) {
    this.applicationModel = applicationModel;
    this.notificationService = notificationService;
    
    // Define workflow stages and transitions based on the diagram
    this.workflowStages = {
      // Initial submission
      'submitted': {
        name: 'New Application',
        description: 'Application has been submitted and is awaiting initial review',
        allowedTransitions: ['first_level_review', 'rejected'],
        autoActions: ['notify_company', 'assign_reviewer'],
        requiredFields: []
      },
      
      // First level review
      'first_level_review': {
        name: 'First Level Review',
        description: 'Application is under initial review by HR/Recruiter',
        allowedTransitions: ['pending_acceptance', 'rejected'],
        autoActions: ['create_review_task'],
        requiredFields: ['reviewer_assigned']
      },
      
      // Pending acceptance
      'pending_acceptance': {
        name: 'Pending Acceptance',
        description: 'Application passed first review, awaiting acceptance decision',
        allowedTransitions: ['accepted', 'rejected'],
        autoActions: ['notify_hiring_manager'],
        requiredFields: ['first_review_completed']
      },
      
      // Accepted for further review
      'accepted': {
        name: 'Accepted',
        description: 'Application accepted, moving to detailed review process',
        allowedTransitions: ['shortlisted', 'rejected'],
        autoActions: ['start_detailed_review', 'collect_additional_info'],
        requiredFields: ['acceptance_reason']
      },
      
      // Shortlisted
      'shortlisted': {
        name: 'Shortlisted',
        description: 'Candidate shortlisted for interview process',
        allowedTransitions: ['interview_scheduled', 'rejected'],
        autoActions: ['prepare_interview_materials', 'notify_interviewers'],
        requiredFields: ['shortlist_reason']
      },
      
      // Interview scheduled
      'interview_scheduled': {
        name: 'Interview Scheduled',
        description: 'Interview has been scheduled with the candidate',
        allowedTransitions: ['interview_completed', 'interview_rescheduled', 'rejected'],
        autoActions: ['send_interview_invitation', 'create_calendar_event'],
        requiredFields: ['interview_details']
      },
      
      // Interview completed
      'interview_completed': {
        name: 'Interview Completed',
        description: 'Interview process completed, awaiting decision',
        allowedTransitions: ['offer_extended', 'rejected', 'additional_interview'],
        autoActions: ['collect_interview_feedback', 'schedule_decision_meeting'],
        requiredFields: ['interview_feedback']
      },
      
      // Offer extended
      'offer_extended': {
        name: 'Offer Extended',
        description: 'Job offer has been extended to candidate',
        allowedTransitions: ['offer_accepted', 'offer_declined', 'offer_negotiation'],
        autoActions: ['send_offer_letter', 'set_response_deadline'],
        requiredFields: ['offer_details']
      },
      
      // Final states
      'offer_accepted': {
        name: 'Offer Accepted',
        description: 'Candidate accepted the job offer',
        allowedTransitions: ['onboarding_started'],
        autoActions: ['start_onboarding_process', 'notify_stakeholders'],
        requiredFields: ['acceptance_confirmation']
      },
      
      'offer_declined': {
        name: 'Offer Declined',
        description: 'Candidate declined the job offer',
        allowedTransitions: [],
        autoActions: ['update_talent_pool', 'collect_decline_feedback'],
        requiredFields: ['decline_reason']
      },
      
      'rejected': {
        name: 'Rejected',
        description: 'Application has been rejected',
        allowedTransitions: [],
        autoActions: ['send_rejection_notification', 'update_candidate_profile'],
        requiredFields: ['rejection_reason']
      }
    };
    
    // Decision points from the diagram
    this.decisionPoints = {
      'first_review_decision': {
        stage: 'first_level_review',
        question: 'Does the application meet basic requirements?',
        options: [
          { answer: 'Yes', nextStage: 'pending_acceptance', weight: 1 },
          { answer: 'No', nextStage: 'rejected', weight: 0 }
        ]
      },
      
      'acceptance_decision': {
        stage: 'pending_acceptance',
        question: 'Should we accept this application for detailed review?',
        options: [
          { answer: 'Accept', nextStage: 'accepted', weight: 1 },
          { answer: 'Reject', nextStage: 'rejected', weight: 0 }
        ]
      },
      
      'shortlist_decision': {
        stage: 'accepted',
        question: 'Should this candidate be shortlisted for interview?',
        options: [
          { answer: 'Shortlist', nextStage: 'shortlisted', weight: 1 },
          { answer: 'Reject', nextStage: 'rejected', weight: 0 }
        ]
      },
      
      'interview_decision': {
        stage: 'interview_completed',
        question: 'Based on interview performance, what is the decision?',
        options: [
          { answer: 'Extend Offer', nextStage: 'offer_extended', weight: 1 },
          { answer: 'Additional Interview', nextStage: 'additional_interview', weight: 0.5 },
          { answer: 'Reject', nextStage: 'rejected', weight: 0 }
        ]
      }
    };
  }

  // Main workflow transition method
  async transitionApplication(applicationId, newStage, performedBy, data = {}) {
    try {
      const application = await this.applicationModel.findById(applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      const currentStage = application.status;
      const stageConfig = this.workflowStages[currentStage];
      
      if (!stageConfig) {
        throw new Error(`Invalid current stage: ${currentStage}`);
      }

      // Validate transition
      if (!stageConfig.allowedTransitions.includes(newStage)) {
        throw new Error(`Invalid transition from ${currentStage} to ${newStage}`);
      }

      // Validate required fields
      const newStageConfig = this.workflowStages[newStage];
      if (newStageConfig && newStageConfig.requiredFields.length > 0) {
        const missingFields = newStageConfig.requiredFields.filter(field => !data[field]);
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
      }

      // Perform the transition
      const updatedApplication = await this.applicationModel.updateStatus(
        applicationId,
        newStage,
        performedBy,
        data.reason || `Transitioned to ${newStage}`
      );

      // Execute auto actions
      if (newStageConfig && newStageConfig.autoActions.length > 0) {
        await this.executeAutoActions(updatedApplication, newStageConfig.autoActions, data);
      }

      logger.info(`Workflow transition completed: ${applicationId} from ${currentStage} to ${newStage}`);
      return updatedApplication;

    } catch (error) {
      logger.error('Workflow transition failed', { applicationId, newStage, error: error.message });
      throw error;
    }
  }

  // Execute automated actions based on workflow stage
  async executeAutoActions(application, actions, data) {
    for (const action of actions) {
      try {
        await this.executeAction(application, action, data);
      } catch (error) {
        logger.error(`Auto action failed: ${action}`, { applicationId: application._id, error: error.message });
        // Continue with other actions even if one fails
      }
    }
  }

  // Execute individual workflow actions
  async executeAction(application, action, data) {
    switch (action) {
      case 'notify_company':
        await this.notificationService.notifyNewApplication(application);
        break;
        
      case 'assign_reviewer':
        await this.assignReviewer(application);
        break;
        
      case 'create_review_task':
        await this.createReviewTask(application);
        break;
        
      case 'notify_hiring_manager':
        await this.notificationService.notifyHiringManager(application);
        break;
        
      case 'start_detailed_review':
        await this.startDetailedReview(application);
        break;
        
      case 'prepare_interview_materials':
        await this.prepareInterviewMaterials(application);
        break;
        
      case 'send_interview_invitation':
        await this.notificationService.sendInterviewInvitation(application, data.interview_details);
        break;
        
      case 'send_offer_letter':
        await this.notificationService.sendOfferLetter(application, data.offer_details);
        break;
        
      case 'start_onboarding_process':
        await this.startOnboardingProcess(application);
        break;
        
      case 'send_rejection_notification':
        await this.notificationService.sendRejectionNotification(application, data.rejection_reason);
        break;
        
      default:
        logger.warn(`Unknown auto action: ${action}`);
    }
  }

  // Get available actions for current stage
  getAvailableActions(currentStage) {
    const stageConfig = this.workflowStages[currentStage];
    if (!stageConfig) return [];

    return stageConfig.allowedTransitions.map(transition => ({
      id: transition,
      label: this.workflowStages[transition]?.name || transition,
      description: this.workflowStages[transition]?.description || '',
      requiredFields: this.workflowStages[transition]?.requiredFields || []
    }));
  }

  // Get decision point for current stage
  getDecisionPoint(currentStage) {
    return Object.values(this.decisionPoints).find(dp => dp.stage === currentStage);
  }

  // Automated workflow engine
  async processAutomatedWorkflow(applicationId) {
    try {
      const application = await this.applicationModel.findById(applicationId);
      if (!application) return;

      const currentStage = application.status;
      const stageConfig = this.workflowStages[currentStage];

      if (!stageConfig) return;

      // Check for automated transitions
      const automatedTransition = await this.checkAutomatedTransitions(application);
      if (automatedTransition) {
        await this.transitionApplication(
          applicationId,
          automatedTransition.nextStage,
          'system',
          automatedTransition.data
        );
      }

      // Execute scheduled actions
      await this.executeScheduledActions(application);

    } catch (error) {
      logger.error('Automated workflow processing failed', { applicationId, error: error.message });
    }
  }

  // Check for automated transitions based on rules
  async checkAutomatedTransitions(application) {
    const currentStage = application.status;

    // Define automated transition rules
    const automationRules = {
      'submitted': {
        condition: () => this.hasBasicRequirements(application),
        nextStage: 'first_level_review',
        data: { reason: 'Automated transition - basic requirements met' }
      },
      'interview_scheduled': {
        condition: () => this.isInterviewTimeReached(application),
        nextStage: 'interview_completed',
        data: { reason: 'Interview time completed' }
      },
      'offer_extended': {
        condition: () => this.isOfferExpired(application),
        nextStage: 'offer_declined',
        data: { reason: 'Offer expired without response' }
      }
    };

    const rule = automationRules[currentStage];
    if (rule && await rule.condition()) {
      return {
        nextStage: rule.nextStage,
        data: rule.data
      };
    }

    return null;
  }

  // Execute scheduled actions for applications
  async executeScheduledActions(application) {
    const currentStage = application.status;
    const daysSinceLastUpdate = Math.floor(
      (new Date().getTime() - new Date(application.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Define scheduled action rules
    const scheduledActions = {
      'first_level_review': {
        condition: daysSinceLastUpdate > 3,
        action: () => this.sendReminderToReviewer(application)
      },
      'pending_acceptance': {
        condition: daysSinceLastUpdate > 5,
        action: () => this.escalateToManager(application)
      },
      'interview_scheduled': {
        condition: daysSinceLastUpdate > 1,
        action: () => this.sendInterviewReminder(application)
      }
    };

    const scheduledAction = scheduledActions[currentStage];
    if (scheduledAction && scheduledAction.condition) {
      await scheduledAction.action();
    }
  }

  // Condition checking methods
  async hasBasicRequirements(application) {
    // Check if application has all required fields
    return application.personalInformation &&
           application.resumeUrl &&
           application.coverLetter;
  }

  async isInterviewTimeReached(application) {
    // Check if interview is scheduled and time has passed
    if (!application.interviewScheduledAt) return false;

    const interviewTime = new Date(application.interviewScheduledAt);
    const now = new Date();
    const interviewDuration = 60 * 60 * 1000; // 1 hour in milliseconds

    return now.getTime() > (interviewTime.getTime() + interviewDuration);
  }

  async isOfferExpired(application) {
    // Check if offer has expired
    if (!application.offeredAt) return false;

    const offerDate = new Date(application.offeredAt);
    const now = new Date();
    const offerValidityDays = 7; // 7 days validity

    return now.getTime() > (offerDate.getTime() + (offerValidityDays * 24 * 60 * 60 * 1000));
  }

  // Helper methods for specific actions
  async assignReviewer(application) {
    // Logic to assign a reviewer based on job requirements, workload, etc.
    // This would integrate with your user management system
    logger.info(`Reviewer assignment needed for application: ${application._id}`);

    // Mock reviewer assignment
    await this.applicationModel.updateById(application._id, {
      assignedReviewer: 'hr-manager-001',
      reviewerAssignedAt: new Date()
    });
  }

  async createReviewTask(application) {
    // Create a task in your task management system
    logger.info(`Review task created for application: ${application._id}`);

    // Mock task creation
    const taskData = {
      applicationId: application._id,
      taskType: 'review',
      priority: 'normal',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      assignedTo: application.assignedReviewer
    };

    // In real implementation, this would create a task in your task management system
    logger.info('Review task created', taskData);
  }

  async startDetailedReview(application) {
    // Initialize detailed review process
    logger.info(`Detailed review started for application: ${application._id}`);

    // Mock detailed review initialization
    await this.applicationModel.updateById(application._id, {
      detailedReviewStartedAt: new Date(),
      reviewStage: 'technical',
      reviewChecklist: {
        technicalSkills: 'pending',
        experience: 'pending',
        culturalFit: 'pending',
        communication: 'pending'
      }
    });
  }

  async prepareInterviewMaterials(application) {
    // Prepare interview questions, candidate profile, etc.
    logger.info(`Interview materials prepared for application: ${application._id}`);

    // Mock interview materials preparation
    const interviewMaterials = {
      candidateProfile: {
        name: application.candidateName,
        experience: application.experience,
        skills: application.skills
      },
      interviewQuestions: [
        'Tell us about your experience with relevant technologies',
        'Describe a challenging project you worked on',
        'How do you handle tight deadlines?',
        'What interests you about this role?'
      ],
      evaluationCriteria: [
        'Technical competency',
        'Problem-solving ability',
        'Communication skills',
        'Team collaboration'
      ]
    };

    await this.applicationModel.updateById(application._id, {
      interviewMaterials: interviewMaterials,
      materialsPrepairedAt: new Date()
    });
  }

  async startOnboardingProcess(application) {
    // Initialize onboarding workflow
    logger.info(`Onboarding process started for application: ${application._id}`);

    // Mock onboarding process
    const onboardingTasks = [
      'Send welcome email',
      'Prepare workspace',
      'Schedule orientation',
      'Create accounts and access',
      'Assign buddy/mentor',
      'Schedule first day meeting'
    ];

    await this.applicationModel.updateById(application._id, {
      onboardingStartedAt: new Date(),
      onboardingTasks: onboardingTasks.map(task => ({
        task,
        status: 'pending',
        assignedTo: 'hr-team'
      }))
    });
  }

  // Notification and reminder methods
  async sendReminderToReviewer(application) {
    logger.info(`Sending reminder to reviewer for application: ${application._id}`);
    // In real implementation, send email/notification to assigned reviewer
  }

  async escalateToManager(application) {
    logger.info(`Escalating application to manager: ${application._id}`);
    // In real implementation, notify hiring manager about delayed decision
  }

  async sendInterviewReminder(application) {
    logger.info(`Sending interview reminder for application: ${application._id}`);
    // In real implementation, send reminder to both candidate and interviewer
  }
}

module.exports = WorkflowService;
