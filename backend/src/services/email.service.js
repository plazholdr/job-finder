const nodemailer = require('nodemailer');
const logger = require('../logger');

class EmailService {
  constructor(config) {
    this.config = config;
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // For development, use ethereal email (fake SMTP)
      if (this.config.env === 'development') {
        this.transporter = nodemailer.createTransporter({
          host: 'smtp.ethereal.email',
          port: 587,
          auth: {
            user: 'ethereal.user@ethereal.email',
            pass: 'ethereal.pass'
          }
        });
      } else {
        // Production email configuration
        this.transporter = nodemailer.createTransporter({
          host: this.config.email.smtp.host,
          port: this.config.email.smtp.port,
          secure: this.config.email.smtp.secure,
          auth: {
            user: this.config.email.smtp.auth.user,
            pass: this.config.email.smtp.auth.pass,
          },
        });
      }

      logger.info('Email service initialized');
    } catch (error) {
      logger.error('Failed to initialize email service', { error: error.message });
    }
  }

  async sendEmailVerification(user, verificationToken) {
    try {
      const verificationUrl = `${this.config.app.frontendUrl}/auth/verify-email?token=${verificationToken}`;

      const mailOptions = {
        from: this.config.email.from,
        to: user.email,
        subject: 'Verify Your Email Address - Job Finder',
        html: this.getEmailVerificationTemplate(user, verificationUrl),
        text: `Hi ${user.firstName},\n\nPlease verify your email address by clicking the following link:\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nBest regards,\nJob Finder Team`
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('Email verification sent', {
        userId: user._id,
        email: user.email,
        messageId: result.messageId
      });

      return result;
    } catch (error) {
      logger.error('Failed to send email verification', {
        userId: user._id,
        email: user.email,
        error: error.message
      });
      throw error;
    }
  }

  async sendPasswordReset(user, resetToken) {
    try {
      const resetUrl = `${this.config.app.frontendUrl}/auth/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: this.config.email.from,
        to: user.email,
        subject: 'Reset Your Password - Job Finder',
        html: this.getPasswordResetTemplate(user, resetUrl),
        text: `Hi ${user.firstName},\n\nYou requested to reset your password. Click the following link to reset it:\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nJob Finder Team`
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('Password reset email sent', {
        userId: user._id,
        email: user.email,
        messageId: result.messageId
      });

      return result;
    } catch (error) {
      logger.error('Failed to send password reset email', {
        userId: user._id,
        email: user.email,
        error: error.message
      });
      throw error;
    }
  }

  async sendApplicationStatusUpdate(user, application, newStatus) {
    try {
      const mailOptions = {
        from: this.config.email.from,
        to: user.email,
        subject: `Application Update: ${application.jobTitle || 'Your Application'}`,
        html: this.getApplicationStatusTemplate(user, application, newStatus),
        text: `Hi ${user.firstName},\n\nYour application status has been updated to: ${newStatus}\n\nJob: ${application.jobTitle}\nCompany: ${application.companyName}\n\nLogin to your dashboard for more details.\n\nBest regards,\nJob Finder Team`
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('Application status email sent', {
        userId: user._id,
        email: user.email,
        applicationId: application.id,
        status: newStatus,
        messageId: result.messageId
      });

      return result;
    } catch (error) {
      logger.error('Failed to send application status email', {
        userId: user._id,
        email: user.email,
        error: error.message
      });
      throw error;
    }
  }

  async sendInterviewInvitation(user, interview) {
    try {
      const mailOptions = {
        from: this.config.email.from,
        to: user.email,
        subject: `Interview Invitation: ${interview.jobTitle}`,
        html: this.getInterviewInvitationTemplate(user, interview),
        text: `Hi ${user.firstName},\n\nYou've been invited for an interview!\n\nJob: ${interview.jobTitle}\nCompany: ${interview.companyName}\nDate: ${interview.scheduledDate}\nType: ${interview.type}\n\nLogin to your dashboard for more details.\n\nBest regards,\nJob Finder Team`
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('Interview invitation email sent', {
        userId: user._id,
        email: user.email,
        interviewId: interview.id,
        messageId: result.messageId
      });

      return result;
    } catch (error) {
      logger.error('Failed to send interview invitation email', {
        userId: user._id,
        email: user.email,
        error: error.message
      });
      throw error;
    }
  }

  async sendCompanyVerificationUpdate(user, status, notes = null) {
    try {
      const mailOptions = {
        from: this.config.email.from,
        to: user.email,
        subject: `Company Verification ${status === 'verified' ? 'Approved' : 'Update'}`,
        html: this.getCompanyVerificationTemplate(user, status, notes),
        text: `Hi ${user.firstName},\n\nYour company verification status has been updated to: ${status}\n\n${notes ? `Notes: ${notes}` : ''}\n\nLogin to your dashboard for more details.\n\nBest regards,\nJob Finder Team`
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('Company verification email sent', {
        userId: user._id,
        email: user.email,
        status,
        messageId: result.messageId
      });

      return result;
    } catch (error) {
      logger.error('Failed to send company verification email', {
        userId: user._id,
        email: user.email,
        error: error.message
      });
      throw error;
    }
  }

  getEmailVerificationTemplate(user, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Job Finder!</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.firstName},</h2>
            <p>Thank you for registering with Job Finder. To complete your registration and start exploring opportunities, please verify your email address.</p>
            <p>Click the button below to verify your email:</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>The Job Finder Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetTemplate(user, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.firstName},</h2>
            <p>You requested to reset your password for your Job Finder account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #dc2626;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>The Job Finder Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getApplicationStatusTemplate(user, application, newStatus) {
    const statusColors = {
      'applied': '#3B82F6',
      'reviewing': '#F59E0B',
      'interview_scheduled': '#8B5CF6',
      'interview_completed': '#06B6D4',
      'accepted': '#10B981',
      'rejected': '#EF4444',
      'withdrawn': '#6B7280'
    };

    const statusColor = statusColors[newStatus] || '#6B7280';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusColor}; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .status-badge { display: inline-block; padding: 8px 16px; background: ${statusColor}; color: white; border-radius: 20px; font-weight: bold; text-transform: uppercase; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Status Update</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.firstName},</h2>
            <p>Your application status has been updated!</p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>${application.jobTitle}</h3>
              <p><strong>Company:</strong> ${application.companyName}</p>
              <p><strong>Status:</strong> <span class="status-badge">${newStatus.replace('_', ' ')}</span></p>
            </div>

            <p>Login to your dashboard to view more details and next steps.</p>
            <a href="${this.config.app.frontendUrl}/dashboard" class="button">View Application</a>
          </div>
          <div class="footer">
            <p>Best regards,<br>The Job Finder Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getInterviewInvitationTemplate(user, interview) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Interview Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .interview-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B5CF6; }
          .button { display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Interview Invitation!</h1>
          </div>
          <div class="content">
            <h2>Congratulations ${user.firstName}!</h2>
            <p>You've been invited for an interview. Here are the details:</p>

            <div class="interview-details">
              <h3>${interview.jobTitle}</h3>
              <p><strong>Company:</strong> ${interview.companyName}</p>
              <p><strong>Interview Type:</strong> ${interview.type}</p>
              <p><strong>Date & Time:</strong> ${new Date(interview.scheduledDate).toLocaleString()}</p>
              <p><strong>Duration:</strong> ${interview.duration} minutes</p>
              ${interview.location ? `<p><strong>Location:</strong> ${interview.location}</p>` : ''}
              ${interview.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${interview.meetingLink}">${interview.meetingLink}</a></p>` : ''}
              ${interview.notes ? `<p><strong>Notes:</strong> ${interview.notes}</p>` : ''}
            </div>

            <p>Please confirm your attendance and prepare for the interview. Good luck!</p>
            <a href="${this.config.app.frontendUrl}/dashboard" class="button">View Details</a>
          </div>
          <div class="footer">
            <p>Best regards,<br>The Job Finder Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getCompanyVerificationTemplate(user, status, notes) {
    const isApproved = status === 'verified';
    const headerColor = isApproved ? '#10B981' : '#F59E0B';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Company Verification Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${headerColor}; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .status-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${headerColor}; }
          .button { display: inline-block; padding: 12px 24px; background: ${headerColor}; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isApproved ? '✅ Company Verified!' : '📋 Verification Update'}</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.firstName},</h2>
            <p>Your company verification status has been updated.</p>

            <div class="status-box">
              <h3>Verification Status: <strong style="color: ${headerColor}; text-transform: uppercase;">${status}</strong></h3>
              ${notes ? `<p><strong>Admin Notes:</strong> ${notes}</p>` : ''}
            </div>

            ${isApproved ?
              '<p>🎉 Congratulations! Your company has been verified. You can now access all platform features and start posting job opportunities.</p>' :
              '<p>Please review the admin notes and take any necessary actions. Contact support if you need assistance.</p>'
            }

            <a href="${this.config.app.frontendUrl}/company/dashboard" class="button">Go to Dashboard</a>
          </div>
          <div class="footer">
            <p>Best regards,<br>The Job Finder Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed', { error: error.message });
      return false;
    }
  }
}

module.exports = EmailService;
