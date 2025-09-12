const logger = require('../logger');

class InterviewService {
  constructor(app) {
    this.app = app;
    this.userModel = app.get('userModel');
    this.emailService = app.get('emailService');
    this.notificationService = app.get('notificationService');
  }

  // Schedule an interview
  async scheduleInterview(companyId, candidateId, interviewData) {
    try {
      const interview = {
        id: `interview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        companyId,
        candidateId,
        applicationId: interviewData.applicationId,
        jobId: interviewData.jobId,
        jobTitle: interviewData.jobTitle,
        type: interviewData.type, // 'phone', 'video', 'in_person'
        scheduledDate: new Date(interviewData.scheduledDate),
        duration: interviewData.duration || 60, // minutes
        location: interviewData.location || null,
        meetingLink: interviewData.meetingLink || null,
        interviewer: {
          name: interviewData.interviewer.name,
          title: interviewData.interviewer.title,
          email: interviewData.interviewer.email,
          phone: interviewData.interviewer.phone || null
        },
        status: 'scheduled',
        notes: interviewData.notes || null,
        requirements: interviewData.requirements || [],
        agenda: interviewData.agenda || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        remindersSent: {
          candidate: false,
          interviewer: false
        }
      };

      // Store interview in company's interviews array
      await this.userModel.collection.updateOne(
        { _id: this.userModel.toObjectId(companyId) },
        {
          $push: {
            'company.interviews': interview
          }
        }
      );

      // Store interview reference in candidate's profile
      await this.userModel.collection.updateOne(
        { _id: this.userModel.toObjectId(candidateId) },
        {
          $push: {
            'internship.interviews': {
              id: interview.id,
              companyId,
              jobId: interview.jobId,
              jobTitle: interview.jobTitle,
              scheduledDate: interview.scheduledDate,
              type: interview.type,
              status: interview.status
            }
          }
        }
      );

      // Send notifications
      if (this.notificationService) {
        await this.notificationService.sendInterviewNotification(candidateId, interview);
      }

      // Send email notifications
      if (this.emailService) {
        const candidate = await this.userModel.findById(candidateId);
        if (candidate) {
          await this.emailService.sendInterviewInvitation(candidate, interview);
        }
      }

      logger.info('Interview scheduled', {
        interviewId: interview.id,
        companyId,
        candidateId,
        scheduledDate: interview.scheduledDate
      });

      return interview;
    } catch (error) {
      logger.error('Error scheduling interview', { error: error.message, companyId, candidateId });
      throw error;
    }
  }

  // Get interviews for a company
  async getCompanyInterviews(companyId, filters = {}) {
    try {
      const { status, startDate, endDate, type } = filters;

      const company = await this.userModel.collection.findOne(
        { _id: this.userModel.toObjectId(companyId) },
        { projection: { 'company.interviews': 1 } }
      );

      if (!company || !company.company?.interviews) {
        return [];
      }

      let interviews = company.company.interviews;

      // Apply filters
      if (status) {
        interviews = interviews.filter(i => i.status === status);
      }

      if (type) {
        interviews = interviews.filter(i => i.type === type);
      }

      if (startDate) {
        interviews = interviews.filter(i =>
          new Date(i.scheduledDate) >= new Date(startDate)
        );
      }

      if (endDate) {
        interviews = interviews.filter(i =>
          new Date(i.scheduledDate) <= new Date(endDate)
        );
      }

      // Sort by scheduled date
      interviews.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

      return interviews;
    } catch (error) {
      logger.error('Error fetching company interviews', { error: error.message, companyId });
      throw error;
    }
  }

  // Get interviews for a candidate
  async getCandidateInterviews(candidateId, filters = {}) {
    try {
      const { status, startDate, endDate } = filters;

      const candidate = await this.userModel.collection.findOne(
        { _id: this.userModel.toObjectId(candidateId) },
        { projection: { 'internship.interviews': 1 } }
      );

      if (!candidate || !candidate.internship?.interviews) {
        return [];
      }

      let interviews = candidate.internship.interviews;

      // Apply filters
      if (status) {
        interviews = interviews.filter(i => i.status === status);
      }

      if (startDate) {
        interviews = interviews.filter(i =>
          new Date(i.scheduledDate) >= new Date(startDate)
        );
      }

      if (endDate) {
        interviews = interviews.filter(i =>
          new Date(i.scheduledDate) <= new Date(endDate)
        );
      }

      // Sort by scheduled date
      interviews.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

      return interviews;
    } catch (error) {
      logger.error('Error fetching candidate interviews', { error: error.message, candidateId });
      throw error;
    }
  }

  // Update interview status
  async updateInterviewStatus(interviewId, companyId, status, notes = null) {
    try {
      const validStatuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled'];

      if (!validStatuses.includes(status)) {
        throw new Error('Invalid interview status');
      }

      // Update in company's interviews
      await this.userModel.collection.updateOne(
        {
          _id: this.userModel.toObjectId(companyId),
          'company.interviews.id': interviewId
        },
        {
          $set: {
            'company.interviews.$.status': status,
            'company.interviews.$.updatedAt': new Date(),
            ...(notes && { 'company.interviews.$.notes': notes })
          }
        }
      );

      // Get interview details to update candidate's record
      const company = await this.userModel.collection.findOne(
        { _id: this.userModel.toObjectId(companyId) },
        { projection: { 'company.interviews': 1 } }
      );

      const interview = company?.company?.interviews?.find(i => i.id === interviewId);

      if (interview) {
        // Update in candidate's interviews
        await this.userModel.collection.updateOne(
          {
            _id: this.userModel.toObjectId(interview.candidateId),
            'internship.interviews.id': interviewId
          },
          {
            $set: {
              'internship.interviews.$.status': status
            }
          }
        );

        // Send notification to candidate
        if (this.notificationService && status !== 'scheduled') {
          const statusMessages = {
            'confirmed': 'Your interview has been confirmed',
            'in_progress': 'Your interview is now in progress',
            'completed': 'Your interview has been completed',
            'cancelled': 'Your interview has been cancelled',
            'rescheduled': 'Your interview has been rescheduled'
          };

          await this.notificationService.createNotification(interview.candidateId, {
            type: 'interview_update',
            title: `Interview Update: ${interview.jobTitle}`,
            message: statusMessages[status],
            category: 'interview',
            priority: ['cancelled', 'rescheduled'].includes(status) ? 'high' : 'normal',
            data: {
              interviewId,
              jobTitle: interview.jobTitle,
              status,
              scheduledDate: interview.scheduledDate
            },
            actionUrl: `/interviews/${interviewId}`,
            actionText: 'View Interview'
          });
        }
      }

      logger.info('Interview status updated', { interviewId, companyId, status });
      return { success: true, message: 'Interview status updated successfully' };
    } catch (error) {
      logger.error('Error updating interview status', { error: error.message, interviewId, companyId });
      throw error;
    }
  }

  // Reschedule interview
  async rescheduleInterview(interviewId, companyId, newScheduledDate, reason = null) {
    try {
      const newDate = new Date(newScheduledDate);

      // Update in company's interviews
      await this.userModel.collection.updateOne(
        {
          _id: this.userModel.toObjectId(companyId),
          'company.interviews.id': interviewId
        },
        {
          $set: {
            'company.interviews.$.scheduledDate': newDate,
            'company.interviews.$.status': 'rescheduled',
            'company.interviews.$.updatedAt': new Date(),
            'company.interviews.$.remindersSent.candidate': false,
            'company.interviews.$.remindersSent.interviewer': false,
            ...(reason && { 'company.interviews.$.rescheduleReason': reason })
          }
        }
      );

      // Get interview details
      const company = await this.userModel.collection.findOne(
        { _id: this.userModel.toObjectId(companyId) },
        { projection: { 'company.interviews': 1 } }
      );

      const interview = company?.company?.interviews?.find(i => i.id === interviewId);

      if (interview) {
        // Update in candidate's interviews
        await this.userModel.collection.updateOne(
          {
            _id: this.userModel.toObjectId(interview.candidateId),
            'internship.interviews.id': interviewId
          },
          {
            $set: {
              'internship.interviews.$.scheduledDate': newDate,
              'internship.interviews.$.status': 'rescheduled'
            }
          }
        );

        // Send notification to candidate
        if (this.notificationService) {
          await this.notificationService.createNotification(interview.candidateId, {
            type: 'interview_rescheduled',
            title: `Interview Rescheduled: ${interview.jobTitle}`,
            message: `Your interview has been rescheduled to ${newDate.toLocaleDateString()} at ${newDate.toLocaleTimeString()}`,
            category: 'interview',
            priority: 'high',
            data: {
              interviewId,
              jobTitle: interview.jobTitle,
              oldDate: interview.scheduledDate,
              newDate: newDate,
              reason
            },
            actionUrl: `/interviews/${interviewId}`,
            actionText: 'View Interview'
          });
        }
      }

      logger.info('Interview rescheduled', { interviewId, companyId, newScheduledDate });
      return { success: true, message: 'Interview rescheduled successfully' };
    } catch (error) {
      logger.error('Error rescheduling interview', { error: error.message, interviewId, companyId });
      throw error;
    }
  }

  // Send interview reminders
  async sendInterviewReminders() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      // Find interviews scheduled for tomorrow that haven't had reminders sent
      const companies = await this.userModel.collection.find({
        role: 'company',
        'company.interviews': {
          $elemMatch: {
            scheduledDate: {
              $gte: tomorrow,
              $lt: dayAfterTomorrow
            },
            status: { $in: ['scheduled', 'confirmed'] },
            'remindersSent.candidate': false
          }
        }
      }).toArray();

      let remindersSent = 0;

      for (const company of companies) {
        const interviews = company.company.interviews.filter(i =>
          new Date(i.scheduledDate) >= tomorrow &&
          new Date(i.scheduledDate) < dayAfterTomorrow &&
          ['scheduled', 'confirmed'].includes(i.status) &&
          !i.remindersSent?.candidate
        );

        for (const interview of interviews) {
          try {
            // Send notification to candidate
            if (this.notificationService) {
              await this.notificationService.createNotification(interview.candidateId, {
                type: 'interview_reminder',
                title: `Interview Reminder: ${interview.jobTitle}`,
                message: `Your interview is scheduled for tomorrow at ${new Date(interview.scheduledDate).toLocaleTimeString()}`,
                category: 'interview',
                priority: 'high',
                data: {
                  interviewId: interview.id,
                  jobTitle: interview.jobTitle,
                  scheduledDate: interview.scheduledDate,
                  type: interview.type
                },
                actionUrl: `/interviews/${interview.id}`,
                actionText: 'View Interview'
              });
            }

            // Mark reminder as sent
            await this.userModel.collection.updateOne(
              {
                _id: company._id,
                'company.interviews.id': interview.id
              },
              {
                $set: {
                  'company.interviews.$.remindersSent.candidate': true
                }
              }
            );

            remindersSent++;
          } catch (error) {
            logger.error('Error sending interview reminder', {
              error: error.message,
              interviewId: interview.id
            });
          }
        }
      }

      logger.info(`Interview reminders sent: ${remindersSent}`);
      return { remindersSent };
    } catch (error) {
      logger.error('Error sending interview reminders', { error: error.message });
      throw error;
    }
  }
}

module.exports = InterviewService;
