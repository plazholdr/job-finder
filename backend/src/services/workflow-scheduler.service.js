const cron = require('node-cron');
const logger = require('../logger');

class WorkflowSchedulerService {
  constructor(workflowService, applicationModel) {
    this.workflowService = workflowService;
    this.applicationModel = applicationModel;
    this.scheduledTasks = new Map();
    this.isRunning = false;
  }

  // Start the workflow scheduler
  start() {
    if (this.isRunning) {
      logger.warn('Workflow scheduler is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting workflow scheduler');

    // Schedule automated workflow processing every 15 minutes
    this.scheduledTasks.set('workflow-automation', cron.schedule('*/15 * * * *', async () => {
      await this.processAutomatedWorkflows();
    }, {
      scheduled: true,
      timezone: "UTC"
    }));

    // Schedule daily workflow health checks
    this.scheduledTasks.set('health-check', cron.schedule('0 9 * * *', async () => {
      await this.performHealthCheck();
    }, {
      scheduled: true,
      timezone: "UTC"
    }));

    // Schedule weekly workflow analytics
    this.scheduledTasks.set('analytics', cron.schedule('0 10 * * 1', async () => {
      await this.generateWeeklyAnalytics();
    }, {
      scheduled: true,
      timezone: "UTC"
    }));

    // Schedule reminder notifications every hour
    this.scheduledTasks.set('reminders', cron.schedule('0 * * * *', async () => {
      await this.processReminders();
    }, {
      scheduled: true,
      timezone: "UTC"
    }));

    // Schedule SLA monitoring every 30 minutes
    this.scheduledTasks.set('sla-monitoring', cron.schedule('*/30 * * * *', async () => {
      await this.monitorSLAs();
    }, {
      scheduled: true,
      timezone: "UTC"
    }));

    logger.info('Workflow scheduler started successfully');
  }

  // Stop the workflow scheduler
  stop() {
    if (!this.isRunning) {
      logger.warn('Workflow scheduler is not running');
      return;
    }

    this.isRunning = false;
    
    // Stop all scheduled tasks
    this.scheduledTasks.forEach((task, name) => {
      task.stop();
      logger.info(`Stopped scheduled task: ${name}`);
    });
    
    this.scheduledTasks.clear();
    logger.info('Workflow scheduler stopped');
  }

  // Process automated workflows for all active applications
  async processAutomatedWorkflows() {
    try {
      logger.info('Starting automated workflow processing');
      
      // Get all active applications
      const activeApplications = await this.applicationModel.findByStatus([
        'submitted',
        'first_level_review',
        'pending_acceptance',
        'accepted',
        'shortlisted',
        'interview_scheduled',
        'interview_completed',
        'offer_extended'
      ]);

      let processedCount = 0;
      let errorCount = 0;

      // Process each application
      for (const application of activeApplications) {
        try {
          await this.workflowService.processAutomatedWorkflow(application._id);
          processedCount++;
        } catch (error) {
          errorCount++;
          logger.error('Failed to process automated workflow', {
            applicationId: application._id,
            error: error.message
          });
        }
      }

      logger.info('Automated workflow processing completed', {
        totalApplications: activeApplications.length,
        processed: processedCount,
        errors: errorCount
      });

    } catch (error) {
      logger.error('Automated workflow processing failed', { error: error.message });
    }
  }

  // Perform daily health checks on the workflow system
  async performHealthCheck() {
    try {
      logger.info('Starting workflow health check');
      
      const healthMetrics = {
        timestamp: new Date(),
        totalApplications: 0,
        stuckApplications: [],
        bottlenecks: [],
        slaViolations: [],
        systemHealth: 'healthy'
      };

      // Check for stuck applications (no updates in 7+ days)
      const stuckThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const stuckApplications = await this.applicationModel.findStuckApplications(stuckThreshold);
      
      healthMetrics.stuckApplications = stuckApplications.map(app => ({
        id: app._id,
        status: app.status,
        lastUpdated: app.updatedAt,
        daysSinceUpdate: Math.floor((new Date() - new Date(app.updatedAt)) / (1000 * 60 * 60 * 24))
      }));

      // Identify bottlenecks
      const bottlenecks = await this.identifyBottlenecks();
      healthMetrics.bottlenecks = bottlenecks;

      // Check SLA violations
      const slaViolations = await this.checkSLAViolations();
      healthMetrics.slaViolations = slaViolations;

      // Determine overall system health
      if (stuckApplications.length > 10 || bottlenecks.length > 3 || slaViolations.length > 5) {
        healthMetrics.systemHealth = 'degraded';
      } else if (stuckApplications.length > 20 || bottlenecks.length > 5 || slaViolations.length > 10) {
        healthMetrics.systemHealth = 'critical';
      }

      // Log health metrics
      logger.info('Workflow health check completed', healthMetrics);

      // Send alerts if needed
      if (healthMetrics.systemHealth !== 'healthy') {
        await this.sendHealthAlert(healthMetrics);
      }

    } catch (error) {
      logger.error('Workflow health check failed', { error: error.message });
    }
  }

  // Generate weekly analytics
  async generateWeeklyAnalytics() {
    try {
      logger.info('Generating weekly workflow analytics');
      
      const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const analytics = await this.calculateWeeklyMetrics(weekStart);
      
      logger.info('Weekly workflow analytics', analytics);
      
      // In real implementation, save to database or send to analytics service
      
    } catch (error) {
      logger.error('Weekly analytics generation failed', { error: error.message });
    }
  }

  // Process reminder notifications
  async processReminders() {
    try {
      logger.info('Processing workflow reminders');
      
      const now = new Date();
      const reminderTypes = [
        {
          type: 'review_overdue',
          condition: (app) => this.isReviewOverdue(app, now),
          action: (app) => this.sendReviewOverdueReminder(app)
        },
        {
          type: 'interview_reminder',
          condition: (app) => this.needsInterviewReminder(app, now),
          action: (app) => this.sendInterviewReminder(app)
        },
        {
          type: 'offer_expiring',
          condition: (app) => this.isOfferExpiring(app, now),
          action: (app) => this.sendOfferExpiringReminder(app)
        }
      ];

      // Get applications that might need reminders
      const activeApplications = await this.applicationModel.findActiveApplications();
      
      let remindersSent = 0;

      for (const application of activeApplications) {
        for (const reminderType of reminderTypes) {
          if (reminderType.condition(application)) {
            try {
              await reminderType.action(application);
              remindersSent++;
            } catch (error) {
              logger.error(`Failed to send ${reminderType.type} reminder`, {
                applicationId: application._id,
                error: error.message
              });
            }
          }
        }
      }

      logger.info('Reminder processing completed', { remindersSent });

    } catch (error) {
      logger.error('Reminder processing failed', { error: error.message });
    }
  }

  // Monitor SLA compliance
  async monitorSLAs() {
    try {
      logger.info('Monitoring SLA compliance');
      
      const slaDefinitions = {
        'first_level_review': { maxDays: 3, description: 'Initial review should complete within 3 days' },
        'pending_acceptance': { maxDays: 5, description: 'Acceptance decision should be made within 5 days' },
        'interview_scheduled': { maxDays: 7, description: 'Interview should be scheduled within 7 days' },
        'offer_extended': { maxDays: 14, description: 'Offer decision should be made within 14 days' }
      };

      const violations = [];
      const now = new Date();

      for (const [stage, sla] of Object.entries(slaDefinitions)) {
        const applicationsInStage = await this.applicationModel.findByStatus([stage]);
        
        for (const application of applicationsInStage) {
          const daysSinceStageEntry = this.calculateDaysSinceStageEntry(application, stage, now);
          
          if (daysSinceStageEntry > sla.maxDays) {
            violations.push({
              applicationId: application._id,
              candidateName: application.candidateName,
              stage: stage,
              daysSinceStageEntry: daysSinceStageEntry,
              slaMaxDays: sla.maxDays,
              violation: daysSinceStageEntry - sla.maxDays,
              description: sla.description
            });
          }
        }
      }

      if (violations.length > 0) {
        logger.warn('SLA violations detected', { violationCount: violations.length, violations });
        await this.handleSLAViolations(violations);
      } else {
        logger.info('No SLA violations detected');
      }

    } catch (error) {
      logger.error('SLA monitoring failed', { error: error.message });
    }
  }

  // Helper methods
  async identifyBottlenecks() {
    // Identify stages with high application counts and long processing times
    const bottlenecks = [];
    
    const stageStats = await this.applicationModel.getStageStatistics();
    
    for (const stat of stageStats) {
      if (stat.count > 10 && stat.averageProcessingTime > 5) {
        bottlenecks.push({
          stage: stat.stage,
          applicationCount: stat.count,
          averageProcessingTime: stat.averageProcessingTime,
          severity: stat.count > 20 ? 'high' : 'medium'
        });
      }
    }
    
    return bottlenecks;
  }

  async checkSLAViolations() {
    // Check for applications that have exceeded SLA timeframes
    const violations = [];
    // Implementation would check against SLA definitions
    return violations;
  }

  async calculateWeeklyMetrics(weekStart) {
    return {
      weekStart: weekStart,
      totalApplications: 0,
      completedApplications: 0,
      averageProcessingTime: 0,
      stageDistribution: {},
      conversionRates: {},
      bottlenecks: []
    };
  }

  isReviewOverdue(application, now) {
    if (application.status !== 'first_level_review') return false;
    const daysSinceReview = (now - new Date(application.updatedAt)) / (1000 * 60 * 60 * 24);
    return daysSinceReview > 3;
  }

  needsInterviewReminder(application, now) {
    if (application.status !== 'interview_scheduled') return false;
    if (!application.interviewScheduledAt) return false;
    
    const hoursUntilInterview = (new Date(application.interviewScheduledAt) - now) / (1000 * 60 * 60);
    return hoursUntilInterview > 0 && hoursUntilInterview <= 24; // Remind 24 hours before
  }

  isOfferExpiring(application, now) {
    if (application.status !== 'offer_extended') return false;
    if (!application.offeredAt) return false;
    
    const daysUntilExpiry = 7 - ((now - new Date(application.offeredAt)) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 2 && daysUntilExpiry > 0; // Remind 2 days before expiry
  }

  calculateDaysSinceStageEntry(application, stage, now) {
    // Calculate days since application entered the current stage
    const stageEntry = application.statusHistory?.find(h => h.status === stage);
    if (!stageEntry) return 0;
    
    return Math.floor((now - new Date(stageEntry.changedAt)) / (1000 * 60 * 60 * 24));
  }

  async sendHealthAlert(healthMetrics) {
    logger.warn('Workflow health alert', healthMetrics);
    // In real implementation, send alert to administrators
  }

  async handleSLAViolations(violations) {
    logger.warn('Handling SLA violations', { violationCount: violations.length });
    // In real implementation, escalate to managers, send notifications
  }

  async sendReviewOverdueReminder(application) {
    logger.info(`Sending review overdue reminder for application: ${application._id}`);
    // Send reminder to assigned reviewer
  }

  async sendInterviewReminder(application) {
    logger.info(`Sending interview reminder for application: ${application._id}`);
    // Send reminder to candidate and interviewer
  }

  async sendOfferExpiringReminder(application) {
    logger.info(`Sending offer expiring reminder for application: ${application._id}`);
    // Send reminder to candidate about expiring offer
  }
}

module.exports = WorkflowSchedulerService;
