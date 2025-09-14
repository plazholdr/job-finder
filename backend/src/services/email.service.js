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
      // Check if we have real SMTP credentials
      const hasRealCredentials = this.config.email.smtp.auth.user &&
                                this.config.email.smtp.auth.pass &&
                                this.config.email.smtp.auth.pass !== 'REPLACE_WITH_YOUR_BREVO_SMTP_KEY';

      if (this.config.env === 'development' && !hasRealCredentials) {
        // Development mode without real credentials - log emails to console
        this.transporter = nodemailer.createTransport({
          streamTransport: true,
          newline: 'unix',
          buffer: true
        });
        logger.info('Email service initialized (development mode - emails will be logged to console)');
      } else {
        // Real SMTP configuration (development with credentials or production)
        this.transporter = nodemailer.createTransport({
          host: this.config.email.smtp.host || 'smtp-relay.brevo.com',
          port: this.config.email.smtp.port || 587,
          secure: this.config.email.smtp.secure || false,
          auth: {
            user: this.config.email.smtp.auth.user,
            pass: this.config.email.smtp.auth.pass,
          },
        });
        logger.info(`Email service initialized (${this.config.env} mode - using real SMTP)`);
      }
    } catch (error) {
      logger.error('Failed to initialize email service', { error: error.message });
    }
  }

  async sendEmailVerification(user, verificationToken) {
    try {
      const verificationUrl = `${this.config.app.frontendUrl}/auth/verify-email?token=${verificationToken}`;
      const greeting = (user.role === 'company' || !user.firstName) ? 'Hi,' : `Hi ${user.firstName},`;

      const mailOptions = {
        from: this.config.email.from,
        to: user.email,
        subject: 'Verify Your Email Address - Job Finder',
        html: this.getEmailVerificationTemplate(user, verificationUrl),
        text: `${greeting}\n\nPlease verify your email address by clicking the following link:\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nBest regards,\nJob Finder Team`
      };

      // Check if we're in development mode without real credentials
      const hasRealCredentials = this.config.email.smtp.auth.user &&
                                this.config.email.smtp.auth.pass &&
                                this.config.email.smtp.auth.pass !== 'REPLACE_WITH_YOUR_BREVO_SMTP_KEY';

      if (this.config.env === 'development' && !hasRealCredentials) {
        logger.info('📧 EMAIL VERIFICATION (Development Mode - Console Only)', {
          to: user.email,
          subject: mailOptions.subject,
          verificationUrl: verificationUrl,
          userId: user._id
        });
        return { messageId: 'dev-' + Date.now() };
      }

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
      const greeting = (user.role === 'company' || !user.firstName) ? 'Hi,' : `Hi ${user.firstName},`;

      const mailOptions = {
        from: this.config.email.from,
        to: user.email,
        subject: 'Reset Your Password - Job Finder',
        html: this.getPasswordResetTemplate(user, resetUrl),
        text: `${greeting}\n\nYou requested to reset your password. Click the following link to reset it:\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nJob Finder Team`
      };

      // Development fallback without real SMTP credentials
      const hasRealCredentials = this.config.email.smtp.auth.user &&
                                this.config.email.smtp.auth.pass &&
                                this.config.email.smtp.auth.pass !== 'REPLACE_WITH_YOUR_BREVO_SMTP_KEY';

      if (this.config.env === 'development' && !hasRealCredentials) {
        logger.info('📧 PASSWORD RESET (Development Mode - Console Only)', {
          to: user.email,
          subject: mailOptions.subject,
          resetUrl,
          userId: user._id
        });
        return { messageId: 'dev-' + Date.now() };
      }

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

  async sendCompanyRejectionEmail(user, reason, appealUrl) {
    try {
      const mailOptions = {
        from: this.config.email.from,
        to: user.email,
        subject: 'Company Registration Rejected',
        html: this.getCompanyRejectionTemplate(user, reason, appealUrl),
        text: `Hi,\n\nYour company registration was rejected.\n\nReason: ${reason || 'No reason provided'}\n\nYou can submit an appeal and updated information here: ${appealUrl}\n\nBest regards,\nJob Finder Team`
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger?.info?.('Company rejection email sent', { userId: user._id, email: user.email, messageId: result.messageId });
      return result;
    } catch (error) {
      this.logger?.error?.('Failed to send company rejection email', { userId: user._id, email: user.email, error: error.message });
      throw error;
    }
  }

  getCompanyRejectionTemplate(user, reason, appealUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Company Registration Rejected</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .reason { background: #fff1f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 6px; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Registration Rejected</h1>
          </div>
          <div class="content">
            <h2>Hi,</h2>
            <p>We reviewed your company registration and unfortunately it was not approved at this time.</p>
            <div class="reason">
              <strong>Reason provided:</strong>
              <p>${reason ? String(reason).replace(/</g, '&lt;').replace(/>/g, '&gt;') : 'No reason provided.'}</p>
            </div>
            <p>You may submit an appeal with updated information or documents using the link below:</p>
            <a class="button" href="${appealUrl}">Submit Appeal</a>
            <p>If the button does not work, copy and paste this URL into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${appealUrl}</p>
          </div>
          <div class="footer">
            <p>Best regards,<br/>The Job Finder Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getEmailVerificationTemplate(user, verificationUrl) {
    const greeting = (user.role === 'company' || !user.firstName) ? 'Hi,' : `Hi ${user.firstName},`;
    const isCompany = user.role === 'company';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Job Finder</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #f3e8ff 100%);
            min-height: 100vh;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .header {
            background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
          }
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%);
          }
          .header-content { position: relative; z-index: 1; }
          .logo-icon {
            width: 64px;
            height: 64px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            backdrop-filter: blur(10px);
          }
          .header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .header p {
            font-size: 16px;
            opacity: 0.9;
            color: #e0e7ff;
          }
          .content {
            padding: 40px 30px;
            background: rgba(255, 255, 255, 0.8);
          }
          .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 30px;
            line-height: 1.7;
          }
          .button-container {
            text-align: center;
            margin: 40px 0;
          }
          .button {
            display: inline-block;
            padding: 16px 32px;
            background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
            color: white;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4);
            transition: all 0.3s ease;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 35px -5px rgba(37, 99, 235, 0.5);
          }
          .link-section {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
          }
          .link-label {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 8px;
            font-weight: 500;
          }
          .verification-link {
            word-break: break-all;
            color: #2563eb;
            font-size: 14px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            background: #eff6ff;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #bfdbfe;
          }
          .warning-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #f59e0b;
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
            display: flex;
            align-items: flex-start;
            gap: 12px;
          }
          .warning-icon {
            width: 24px;
            height: 24px;
            background: #f59e0b;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            flex-shrink: 0;
            margin-top: 2px;
          }
          .warning-content {
            color: #92400e;
          }
          .warning-title {
            font-weight: 600;
            margin-bottom: 4px;
          }
          ${isCompany ? `
          .next-steps {
            background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
            border: 1px solid #3b82f6;
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
            display: flex;
            align-items: flex-start;
            gap: 12px;
          }
          .steps-icon {
            width: 24px;
            height: 24px;
            background: #3b82f6;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            flex-shrink: 0;
            margin-top: 2px;
          }
          .steps-content {
            color: #1e40af;
          }
          .steps-title {
            font-weight: 600;
            margin-bottom: 4px;
          }
          ` : ''}
          .footer {
            padding: 30px;
            text-align: center;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
          }
          .footer-text {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 8px;
          }
          .team-signature {
            color: #1f2937;
            font-weight: 600;
          }
          @media (max-width: 600px) {
            .container { margin: 10px; border-radius: 16px; }
            .header { padding: 30px 20px; }
            .content { padding: 30px 20px; }
            .header h1 { font-size: 28px; }
            .greeting { font-size: 20px; }
            .button { padding: 14px 28px; font-size: 15px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-content">
              <div class="logo-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h1>Welcome to Job Finder!</h1>
              <p>${isCompany ? 'Your company registration journey begins here' : 'Your career journey starts here'}</p>
            </div>
          </div>

          <div class="content">
            <div class="greeting">${greeting}</div>

            <div class="message">
              Thank you for registering with Job Finder. To complete your registration and start ${isCompany ? 'hiring top talent' : 'exploring amazing opportunities'}, please verify your email address.
            </div>

            <div class="button-container">
              <a href="${verificationUrl}" class="button">✨ Verify Email Address</a>
            </div>

            <div class="link-section">
              <div class="link-label">Or copy and paste this link into your browser:</div>
              <div class="verification-link">${verificationUrl}</div>
            </div>

            ${isCompany ? `
            <div class="next-steps">
              <div class="steps-icon">→</div>
              <div class="steps-content">
                <div class="steps-title">Next Steps for Companies:</div>
                <div>After verification, you'll complete your company registration with business details and Malaysian Superform for admin approval.</div>
              </div>
            </div>
            ` : ''}

            <div class="warning-box">
              <div class="warning-icon">!</div>
              <div class="warning-content">
                <div class="warning-title">Important:</div>
                <div>This verification link will expire in 24 hours. If it expires, you'll need to register again.</div>
              </div>
            </div>

            <div class="message">
              If you didn't create an account with us, please ignore this email.
            </div>
          </div>

          <div class="footer">
            <div class="footer-text">Best regards,</div>
            <div class="team-signature">The Job Finder Team</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetTemplate(user, resetUrl) {
  const greeting = (user.role === 'company' || !user.firstName) ? 'Hi,' : `Hi ${user.firstName},`;
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
            <h2>${greeting}</h2>
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
