const UsersService = require('./users.service');
const AdminService = require('./admin.service');
const EmailService = require('./email.service');
const NotificationService = require('./notification.service');
const JobsService = require('./jobs.service');
const CompaniesService = require('./companies.service');
const ApplicationsService = require('./applications.service');
const InternshipsService = require('./internships.service');
const RequestsService = require('./requests.service');
const NotificationsService = require('./notifications.service');
const WorkflowService = require('./workflow.service');
const WorkflowSchedulerService = require('./workflow-scheduler.service');
const { AuthenticationService, authenticateToken, optionalAuth } = require('./authentication.service');
const multer = require('multer');
const { S3StorageUtils } = require('../utils/s3-storage');
const ApplicationModel = require('../models/application.model');
const { getDB } = require('../db');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const validation = S3StorageUtils.validateFile(file);
    if (validation.isValid) {
      cb(null, true);
    } else {
      cb(new Error(validation.errors.join(', ')), false);
    }
  }
});

// Configure all services here
module.exports = function (app) {
  // Register authentication service
  app.use('/authentication', {
    async create(data) {
      const authService = new AuthenticationService(app);
      return await authService.create(data);
    },
    async remove(id) {
      const authService = new AuthenticationService(app);
      return await authService.remove(id);
    }
  });

  // Protected routes for current user - MUST come before general /users service
  app.get('/users/me', authenticateToken(app), async (req, res) => {
    try {
      console.log('GET /users/me - req.userId:', req.userId);
      const usersService = new UsersService(app);
      const user = await usersService.getCurrentUser(req.userId);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch('/users/me', authenticateToken(app), async (req, res) => {
    try {
      console.log('PATCH /users/me - req.userId:', req.userId);
      console.log('PATCH /users/me - req.user:', req.user);

      const usersService = new UsersService(app);
      const user = await usersService.updateCurrentUser(req.userId, req.body);
      res.json(user);
    } catch (error) {
      console.error('PATCH /users/me error:', error.message);
      res.status(400).json({ error: error.message });
    }
  });

  // Users routes - converted from Feathers service to Express routes

  // POST /users - Create user (registration)
  app.post('/users', async (req, res) => {
    try {
      const usersService = new UsersService(app);
      const user = await usersService.create(req.body);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // GET /users - Find users (with query parameters)
  app.get('/users', optionalAuth(app), async (req, res) => {
    try {
      const usersService = new UsersService(app);
      const users = await usersService.find(req.query);
      res.json(users);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get user profile endpoint - MUST come before /users/:id
  app.get('/users/profile', authenticateToken(app), async (req, res) => {
    try {
      const usersService = new UsersService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };
      const result = await usersService.get(req.userId, serviceParams);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // User profile update endpoint - MUST come before /users/:id
  app.patch('/users/profile', authenticateToken(app), async (req, res) => {
    try {
      console.log('=== ENDPOINT DEBUG ===');
      console.log('req.userId:', req.userId);
      console.log('req.userId type:', typeof req.userId);
      console.log('req.user._id:', req.user._id);
      console.log('req.user._id type:', typeof req.user._id);
      console.log('req.body keys:', Object.keys(req.body));
      console.log('=== END ENDPOINT DEBUG ===');

      const usersService = new UsersService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };
      const result = await usersService.updateProfile(req.body, serviceParams);
      res.json(result);
    } catch (error) {
      console.log('=== ENDPOINT ERROR ===');
      console.log('Error:', error.message);
      console.log('Stack:', error.stack);
      console.log('=== END ENDPOINT ERROR ===');
      res.status(400).json({ error: error.message });
    }
  });

  // GET /users/:id - Get specific user
  app.get('/users/:id', optionalAuth(app), async (req, res) => {
    try {
      const usersService = new UsersService(app);
      const user = await usersService.get(req.params.id);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // PATCH /users/:id - Update specific user (admin only)
  app.patch('/users/:id', authenticateToken(app), async (req, res) => {
    try {
      const usersService = new UsersService(app);
      const user = await usersService.patch(req.params.id, req.body);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // DELETE /users/:id - Delete user (admin only)
  app.delete('/users/:id', authenticateToken(app), async (req, res) => {
    try {
      const usersService = new UsersService(app);
      const result = await usersService.remove(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Password change endpoint
  app.post('/users/change-password', authenticateToken(app), async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const usersService = new UsersService(app);
      const result = await usersService.changePassword(req.userId, currentPassword, newPassword);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Email verification endpoints
  app.post('/email-verification/verify', async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: 'Verification token is required' });
      }

      const usersService = new UsersService(app);
      const result = await usersService.verifyEmail(token);
      res.json({
        success: true,
        message: result.message,
        role: result.role,
        needsCompanySetup: result.needsCompanySetup
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/email-verification/resend', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const usersService = new UsersService(app);
      const result = await usersService.resendEmailVerification(email);
      res.json({ success: true, message: result.message });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Password reset endpoints
  app.post('/password-reset/request', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const usersService = new UsersService(app);
      const result = await usersService.requestPasswordReset(email);
      res.json({ success: true, message: result.message });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/password-reset/reset', async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
      }

      const usersService = new UsersService(app);
      const result = await usersService.resetPassword(token, newPassword);
      res.json({ success: true, message: result.message });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // User search endpoints
  app.get('/users/search', optionalAuth(app), async (req, res) => {
    try {
      const { q: query, role, location, skills, industry, limit = 50 } = req.query;

      const filters = {};
      if (role) filters.role = role;
      if (location) filters.location = location;
      if (skills) filters.skills = Array.isArray(skills) ? skills : [skills];
      if (industry) filters.industry = industry;

      const usersService = new UsersService(app);
      const results = await usersService.searchUsers(
        query,
        filters,
        req.userId
      );

      res.json({
        success: true,
        data: results.slice(0, parseInt(limit)),
        total: results.length
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/users/suggestions', authenticateToken(app), async (req, res) => {
    try {
      const { limit = 10 } = req.query;

      const usersService = new UsersService(app);
      const suggestions = await usersService.getUserSuggestions(
        req.userId,
        parseInt(limit)
      );

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Admin Management Routes
  app.get('/admin/users', authenticateToken(app), async (req, res) => {
    try {
      // Check if user is admin
      const user = await new UsersService(app).getCurrentUser(req.userId);
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { page, limit, role, status, search } = req.query;
      const adminService = new AdminService(app);
      const result = await adminService.getAllUsers({ role, status, search }, { page, limit });

      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch('/admin/users/:userId/status', authenticateToken(app), async (req, res) => {
    try {
      const user = await new UsersService(app).getCurrentUser(req.userId);
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { userId } = req.params;
      const { status, reason } = req.body;
      const adminService = new AdminService(app);
      const result = await adminService.updateUserStatus(userId, status, req.userId, reason);

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/admin/companies/pending', authenticateToken(app), async (req, res) => {
    try {
      const user = await new UsersService(app).getCurrentUser(req.userId);
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const adminService = new AdminService(app);
      const companies = await adminService.getPendingCompanyVerifications();

      res.json({ success: true, data: companies });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // List companies by verification status (pending|verified|rejected|all)
  app.get('/admin/companies', authenticateToken(app), async (req, res) => {
    try {
      const user = await new UsersService(app).getCurrentUser(req.userId);
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { status } = req.query;
      const adminService = new AdminService(app);
      const companies = await adminService.getCompaniesByStatus((status || 'all'));

      res.json({ success: true, data: companies });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch('/admin/companies/:companyId/verify', authenticateToken(app), async (req, res) => {
    try {
      const user = await new UsersService(app).getCurrentUser(req.userId);
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { companyId } = req.params;
      const { status, notes } = req.body;
      const adminService = new AdminService(app);
      const result = await adminService.verifyCompany(companyId, req.userId, status, notes);

      // If rejected, send rejection email with appeal link
      const normalized = typeof status === 'string' ? status.toLowerCase() : status;
      const statusName = typeof normalized === 'string' ? normalized : (normalized === 1 ? 'verified' : normalized === 2 ? 'rejected' : 'pending');
      if (statusName === 'rejected') {
        const usersService = new UsersService(app);
        const emailService = new EmailService(app.get('config'));
        const rejectedUser = await usersService.userModel.findById(companyId);
        if (rejectedUser) {
          const crypto = require('crypto');
          const token = crypto.randomBytes(32).toString('hex');
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days to appeal
          await usersService.userModel.collection.updateOne(
            { _id: usersService.userModel.toObjectId(companyId) },
            { $set: { company: { ...(rejectedUser.company || {}), rejectionReason: notes || null }, appealToken: token, appealTokenExpires: expiresAt, updatedAt: new Date() } }
          );
          const appealUrl = `${app.get('config').app.frontendUrl || ''}/auth/company-appeal?token=${token}`;
          // Send email
          try {
            if (emailService.sendCompanyRejectionEmail) {
              await emailService.sendCompanyRejectionEmail(rejectedUser, notes || '', appealUrl);
            } else {
              await emailService.sendCompanyVerificationUpdate(rejectedUser, 'rejected', notes || '');
            }
          } catch (e) {
            console.error('Failed sending rejection email:', e.message);
          }
        }
      }

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/admin/stats', authenticateToken(app), async (req, res) => {
    try {
      const user = await new UsersService(app).getCurrentUser(req.userId);
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const adminService = new AdminService(app);
      const stats = await adminService.getSystemStats();

      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/admin/logs', authenticateToken(app), async (req, res) => {
    try {
      const user = await new UsersService(app).getCurrentUser(req.userId);
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { limit } = req.query;
      const adminService = new AdminService(app);
      const logs = await adminService.getAdminActionLogs(null, parseInt(limit) || 100);

      res.json({ success: true, data: logs });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Notification Routes
  app.get('/notifications', authenticateToken(app), async (req, res) => {
    try {
      const { page, limit, category, isRead, priority } = req.query;
      const notificationService = new NotificationService(app);
      const result = await notificationService.getUserNotifications(req.userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        category,
        isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
        priority
      });

      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch('/notifications/:notificationId/read', authenticateToken(app), async (req, res) => {
    try {
      const { notificationId } = req.params;
      const notificationService = new NotificationService(app);
      const result = await notificationService.markAsRead(req.userId, notificationId);

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch('/notifications/read-all', authenticateToken(app), async (req, res) => {
    try {
      const notificationService = new NotificationService(app);
      const result = await notificationService.markAllAsRead(req.userId);

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete('/notifications/:notificationId', authenticateToken(app), async (req, res) => {
    try {
      const { notificationId } = req.params;
      const notificationService = new NotificationService(app);
      const result = await notificationService.deleteNotification(req.userId, notificationId);

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Jobs service endpoints
  app.post('/jobs', authenticateToken(app), async (req, res) => {
    try {
      const jobsService = new JobsService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };
      const result = await jobsService.create(req.body, serviceParams);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/jobs', optionalAuth(app), async (req, res) => {
    try {
      const jobsService = new JobsService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId,
        query: req.query
      };
      const result = await jobsService.find(serviceParams);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/jobs/:id', optionalAuth(app), async (req, res) => {
    try {
      const jobsService = new JobsService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };
      const result = await jobsService.get(req.params.id, serviceParams);
      res.json(result);
    } catch (error) {
      if (error.code === 404) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.patch('/jobs/:id', authenticateToken(app), async (req, res) => {
    try {
      const jobsService = new JobsService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };
      const result = await jobsService.patch(req.params.id, req.body, serviceParams);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/jobs/:id', authenticateToken(app), async (req, res) => {
    try {
      const jobsService = new JobsService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };
      const result = await jobsService.remove(req.params.id, serviceParams);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Job status update endpoint
  app.patch('/jobs/:id/status', authenticateToken(app), async (req, res) => {
    try {
      const { status, reason } = req.body;
      const jobsService = new JobsService(app);
      const result = await jobsService.updateStatus(req.params.id, status, req.userId, reason);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Register companies service endpoints
  app.get('/companies', optionalAuth(app), async (req, res) => {
    try {
      const companiesService = new CompaniesService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId,
        query: req.query
      };
      const result = await companiesService.find(serviceParams);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/companies/:id', optionalAuth(app), async (req, res) => {
    try {
      const companiesService = new CompaniesService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };
      const result = await companiesService.get(req.params.id, serviceParams);
      res.json(result);
    } catch (error) {
      if (error.code === 404) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Company registration helpers
  app.post('/companies/check-registration', async (req, res) => {
    try {
      const { registrationNumber } = req.body || {};
      if (!registrationNumber) {
        return res.status(400).json({ error: 'Registration number is required' });
      }

      const usersService = new UsersService(app);
      // Directly query the user collection via model for uniqueness
      const normalized = String(registrationNumber).trim();
      const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const existing = await usersService.userModel.collection.findOne({
        role: 'company',
        'company.registrationNumber': { $regex: `^${escaped}$`, $options: 'i' }
      });

      return res.json({ isUnique: !existing });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/companies/setup', upload.single('superform'), async (req, res) => {
    try {
      const { token, companyName, companyRegistrationNumber, companyContactNumber } = req.body || {};
      if (!token || !companyName || !companyRegistrationNumber || !companyContactNumber) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Validate file presence
      if (!req.file) {
        return res.status(400).json({ error: 'Superform file is required' });
      }

      const usersService = new UsersService(app);
      const user = await usersService.userModel.findByEmailVerificationToken(token);
      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }
      if (user.role !== 'company') {
        return res.status(400).json({ error: 'Only company users can complete company setup' });
      }

      // Upload superform to S3-compatible storage
      const uploadResult = await S3StorageUtils.uploadUserResume(
        req.file.buffer,
        req.file.originalname,
        String(user._id),
        req.file.mimetype
      );

      // Update user company fields and mark pending approval
  const update = {
        company: {
          ...(user.company || {}),
      name: companyName,
      registrationNumber: String(companyRegistrationNumber).trim().toUpperCase(),
          contactNumber: companyContactNumber,
          superform: uploadResult.filePath,
      approvalStatus: 'pending',
      approvalStatusCode: 0,
      verificationStatus: 'pending',
      verificationStatusCode: 0,
          setupComplete: false
        },
        updatedAt: new Date()
      };

      await usersService.userModel.updateById(user._id, update);

      // Now that setup is submitted, clear the verification token
      await usersService.userModel.collection.updateOne(
        { _id: user._id },
        {
          $unset: {
            emailVerificationToken: 1,
            emailVerificationExpires: 1
          },
          $set: { updatedAt: new Date() }
        }
      );

      return res.json({ success: true, message: 'Company setup submitted for approval' });
    } catch (error) {
      console.error('Company setup error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Company essentials submission (post-approval onboarding)
  app.post('/companies/essentials', authenticateToken(app), upload.single('logo'), async (req, res) => {
    try {
      const usersService = new UsersService(app);
      const authedUser = await usersService.getCurrentUser(req.userId);

      if (!authedUser || authedUser.role !== 'company') {
        return res.status(403).json({ error: 'Only company users can submit essentials' });
      }

      // Must be approved by admin (treat verified as approved for compatibility)
      const companyState = authedUser.company || {};
      const isApproved = (companyState.approvalStatusCode === 1)
        || (companyState.verificationStatusCode === 1)
        || (companyState.verificationStatus === 'verified');
      if (!isApproved) {
        return res.status(400).json({ error: 'Company account must be approved before submitting essentials' });
      }

      // Parse fields
      const {
        description,
        nature,
        address,
        picName,
        picEmail,
        picMobile,
        website
      } = req.body || {};

      // Basic validation
      if (!description || !nature || !address || !picName || !picEmail || !picMobile) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Handle optional logo upload
      let logoUpdate = {};
      if (req.file) {
        try {
          const uploadResult = await S3StorageUtils.uploadCompanyLogo(
            req.file.buffer,
            req.file.originalname,
            String(authedUser._id),
            req.file.mimetype
          );
          logoUpdate = { logo: uploadResult.filePath };
        } catch (e) {
          return res.status(400).json({ error: `Logo upload failed: ${e.message}` });
        }
      }

      // Build update payload
      const update = {
        company: {
          ...(authedUser.company || {}),
          description: String(description).trim(),
          industry: String(nature).trim(),
          headquarters: String(address).trim(),
          website: website ? String(website).trim() : (authedUser.company?.website || null),
          contactPerson: {
            ...(authedUser.company?.contactPerson || {}),
            name: String(picName).trim(),
            email: String(picEmail).trim(),
            phone: String(picMobile).trim()
          },
          inputEssentials: true,
          ...logoUpdate
        },
        updatedAt: new Date()
      };

      const updated = await usersService.userModel.updateById(authedUser._id, update);
      // Remove sensitive fields if any
      const { password, resetPasswordToken, resetPasswordExpires, ...safe } = updated;
      return res.json({ success: true, data: safe });
    } catch (error) {
      console.error('Company essentials error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Backward/lenient alias: singular path support
  app.post('/company/essentials', authenticateToken(app), upload.single('logo'), async (req, res) => {
    try {
      const usersService = new UsersService(app);
      const authedUser = await usersService.getCurrentUser(req.userId);

      if (!authedUser || authedUser.role !== 'company') {
        return res.status(403).json({ error: 'Only company users can submit essentials' });
      }

      const companyState = authedUser.company || {};
      const isApproved = (companyState.approvalStatusCode === 1)
        || (companyState.verificationStatusCode === 1)
        || (companyState.verificationStatus === 'verified');
      if (!isApproved) {
        return res.status(400).json({ error: 'Company account must be approved before submitting essentials' });
      }

      const { description, nature, address, picName, picEmail, picMobile, website } = req.body || {};
      if (!description || !nature || !address || !picName || !picEmail || !picMobile) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      let logoUpdate = {};
      if (req.file) {
        try {
          const uploadResult = await S3StorageUtils.uploadCompanyLogo(
            req.file.buffer,
            req.file.originalname,
            String(authedUser._id),
            req.file.mimetype
          );
          logoUpdate = { logo: uploadResult.filePath };
        } catch (e) {
          return res.status(400).json({ error: `Logo upload failed: ${e.message}` });
        }
      }

      const update = {
        company: {
          ...(authedUser.company || {}),
          description: String(description).trim(),
          industry: String(nature).trim(),
          headquarters: String(address).trim(),
          website: website ? String(website).trim() : (authedUser.company?.website || null),
          contactPerson: {
            ...(authedUser.company?.contactPerson || {}),
            name: String(picName).trim(),
            email: String(picEmail).trim(),
            phone: String(picMobile).trim()
          },
          inputEssentials: true,
          ...logoUpdate
        },
        updatedAt: new Date()
      };

      const updated = await usersService.userModel.updateById(authedUser._id, update);
      const { password, resetPasswordToken, resetPasswordExpires, ...safe } = updated;
      return res.json({ success: true, data: safe });
    } catch (error) {
      console.error('Company essentials (alias) error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Company appeal: validate token (public)
  app.get('/companies/appeal/validate', async (req, res) => {
    try {
      const token = req.query.token;
      if (!token) return res.status(400).json({ error: 'Token is required' });
      const usersService = new UsersService(app);
      const user = await usersService.userModel.collection.findOne({ appealToken: token, appealTokenExpires: { $gt: new Date() } });
      if (!user) return res.status(400).json({ error: 'Invalid or expired token' });
      return res.json({ success: true, data: { companyName: user.company?.name || null, email: user.email } });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // Company appeal submit (public, multipart allowed)
  app.post('/companies/appeal', upload.single('document'), async (req, res) => {
    try {
      const { token, message } = req.body || {};
      if (!token) return res.status(400).json({ error: 'Token is required' });
      const usersService = new UsersService(app);
      const user = await usersService.userModel.collection.findOne({ appealToken: token, appealTokenExpires: { $gt: new Date() } });
      if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

      // Optional: handle document upload for appeal (reuse S3 temp folder)
      let appealDocPath = null;
      if (req.file) {
        try {
          const { s3 } = require('../utils/s3-storage');
          const path = require('path');
          const { v4: uuidv4 } = require('uuid');
          const bucketName = require('../utils/s3-storage').storageConfig.bucketName || require('../config').storage.s3.bucket;
          const fileName = `appeals/${String(user._id)}/appeal_${uuidv4()}${path.extname(req.file.originalname)}`;
          await s3.upload({ Bucket: bucketName, Key: fileName, Body: req.file.buffer, ContentType: req.file.mimetype }).promise();
          appealDocPath = fileName;
        } catch (e) {
          // proceed without document
        }
      }

      // Reset to pending and store appeal message
      await usersService.userModel.collection.updateOne(
        { _id: user._id },
        {
          $set: {
            'company.verificationStatus': 'pending',
            'company.verificationStatusCode': 0,
            'company.verificationNotes': message || null,
            'company.appealDocument': appealDocPath,
            updatedAt: new Date()
          },
          $unset: { appealToken: 1, appealTokenExpires: 1 }
        }
      );

      return res.json({ success: true, message: 'Appeal submitted. Your registration will be re-reviewed.' });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // Register applications service endpoints
  app.post('/applications', authenticateToken(app), async (req, res) => {
    try {
      const applicationsService = new ApplicationsService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };
      const result = await applicationsService.create(req.body, serviceParams);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/applications', authenticateToken(app), async (req, res) => {
    try {
      const applicationsService = new ApplicationsService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId,
        query: req.query
      };
      const result = await applicationsService.find(serviceParams);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/applications/:id', authenticateToken(app), async (req, res) => {
    try {
      const applicationsService = new ApplicationsService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };
      const result = await applicationsService.get(req.params.id, serviceParams);
      res.json(result);
    } catch (error) {
      if (error.code === 404) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.patch('/applications/:id', authenticateToken(app), async (req, res) => {
    try {
      console.log('🔥 BACKEND: Applications PATCH route called');
      console.log('🔥 Application ID:', req.params.id);
      console.log('🔥 Request body:', JSON.stringify(req.body, null, 2));
      console.log('🔥 User from auth:', req.user ? { id: req.user._id, role: req.user.role } : 'NO USER');

      const applicationsService = new ApplicationsService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };
      const result = await applicationsService.patch(req.params.id, req.body, serviceParams);
      res.json(result);
    } catch (error) {
      console.log('🔥 BACKEND ERROR:', error.message);
      if (error.code === 404) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.delete('/applications/:id', authenticateToken(app), async (req, res) => {
    try {
      const applicationsService = new ApplicationsService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };
      const result = await applicationsService.remove(req.params.id, serviceParams);
      res.json(result);
    } catch (error) {
      if (error.code === 404) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Check if user has applied to a job
  app.get('/jobs/:jobId/applied', authenticateToken(app), async (req, res) => {
    try {
      const applicationsService = new ApplicationsService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };
      const result = await applicationsService.hasApplied(req.params.jobId, serviceParams);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get application statistics for company dashboard
  app.get('/applications/stats/company', authenticateToken(app), async (req, res) => {
    try {
      const applicationsService = new ApplicationsService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId,
        query: req.query
      };
      const result = await applicationsService.getStats(serviceParams);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Signed image proxy: serve company logos or profile avatars by key or absolute URL
  app.get('/files/image', async (req, res) => {
    try {
      const { key, url, minutes } = req.query || {};
      const expires = parseInt(minutes || '10', 10);

      let fileKey = key;
      if (!fileKey && url) {
        try {
          const u = new URL(url);
          fileKey = u.pathname.replace(/^\/+/, '');
        } catch {
          fileKey = url;
        }
      }

      if (!fileKey || typeof fileKey !== 'string') {
        return res.status(400).json({ error: 'Missing image key or url' });
      }

      // Try S3 first; if not configured, fall back to GCS utils
      try {
        const { S3StorageUtils } = require('../utils/s3-storage');
        const signed = await S3StorageUtils.generateDownloadUrl(fileKey, expires);
        return res.redirect(signed);
      } catch (_s3err) {
        try {
          const StorageUtils = require('../utils/storage');
          const signed = await StorageUtils.generateSignedUrl(fileKey, expires);
          return res.redirect(signed);
        } catch (e) {
          return res.status(404).json({ error: 'File not found or not accessible' });
        }
      }
    } catch (error) {
      console.error('Signed image proxy error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Register internships service endpoints
  app.get('/internships', authenticateToken(app), async (req, res) => {
    try {
      const internshipsService = new InternshipsService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId,
        query: req.query
      };
      const result = await internshipsService.find(serviceParams);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/internships/:id', authenticateToken(app), async (req, res) => {
    try {
      const internshipsService = new InternshipsService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };
      const result = await internshipsService.get(req.params.id, serviceParams);
      res.json(result);
    } catch (error) {
      if (error.code === 404) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.post('/internships', authenticateToken(app), async (req, res) => {
    try {
      const internshipsService = new InternshipsService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };
      const result = await internshipsService.create(req.body, serviceParams);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch('/internships/:id', authenticateToken(app), async (req, res) => {
    try {
      const internshipsService = new InternshipsService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };
      const result = await internshipsService.patch(req.params.id, req.body, serviceParams);
      res.json(result);
    } catch (error) {
      if (error.code === 404) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.delete('/internships/:id', authenticateToken(app), async (req, res) => {
    try {
      const internshipsService = new InternshipsService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };
      const result = await internshipsService.remove(req.params.id, serviceParams);
      res.json(result);
    } catch (error) {
      if (error.code === 404) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Upload onboarding materials for internship
  app.post('/internships/:id/upload-onboarding', authenticateToken(app), upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const internshipsService = new InternshipsService(app);
      const result = await internshipsService.uploadOnboardingMaterials(req.params.id, req.file, req.userId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Download onboarding materials for internship
  app.get('/internships/:id/onboarding-materials/download', authenticateToken(app), async (req, res) => {
    try {
      const internshipsService = new InternshipsService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId,
        internshipId: req.params.id
      };

      const result = await internshipsService.downloadOnboardingMaterials(serviceParams);

      // Set headers for file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="onboarding-materials-${req.params.id}.pdf"`);

      // Send the file buffer
      res.send(result.fileBuffer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });



  // Test endpoint to check internship database
  app.get('/internships/test/database', authenticateToken(app), async (req, res) => {
    try {
      const db = app.get('mongoClient').db();
      const internshipsCollection = db.collection('internships');

      // Get count and sample documents
      const count = await internshipsCollection.countDocuments();
      const samples = await internshipsCollection.find().limit(5).toArray();

      res.json({
        success: true,
        message: 'Internships database test',
        count: count,
        samples: samples,
        collectionName: 'internships'
      });
    } catch (error) {
      console.error('Database test error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to test internships database'
      });
    }
  });

  // Resume upload endpoint
  app.post('/users/resume/upload', authenticateToken(app), upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const usersService = new UsersService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };
      const result = await usersService.uploadResume(req.file, serviceParams);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Resume download endpoint (current user)
  app.get('/users/resume/download', authenticateToken(app), async (req, res) => {
    try {
      const usersService = new UsersService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };

      const result = await usersService.downloadResume(serviceParams);

      // Set headers for file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');

      // Send the file buffer
      res.send(result.fileBuffer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Resume download endpoint (specific user - for companies to download candidate resumes)
  app.get('/users/:id/resume/download', authenticateToken(app), async (req, res) => {
    try {
      console.log('🔄 Company downloading resume for user:', req.params.id);
      console.log('👤 Requester:', req.user ? { id: req.user._id, role: req.user.role } : 'NO USER');

      const usersService = new UsersService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId,
        targetUserId: req.params.id // The user whose resume we want to download
      };

      const result = await usersService.downloadUserResume(serviceParams);

      // Set headers for file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="resume_${req.params.id}.pdf"`);

      // Send the file buffer
      res.send(result.fileBuffer);
    } catch (error) {
      console.error('❌ Error downloading user resume:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Offer letter download endpoint
  app.get('/applications/:id/offer-letter/download', authenticateToken(app), async (req, res) => {
    try {
      const applicationsService = new ApplicationsService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId,
        applicationId: req.params.id
      };

      const result = await applicationsService.downloadOfferLetter(serviceParams);

      // Set headers for file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="offer_letter_${req.params.id}.pdf"`);

      // Send the file buffer
      res.send(result.fileBuffer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update expired applications endpoint
  app.post('/applications/update-expired', authenticateToken(app), async (req, res) => {
    try {
      const applicationsService = new ApplicationsService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };

      const result = await applicationsService.updateExpiredApplications(serviceParams);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Resume path endpoint - just returns the file path
  app.get('/users/resume/path', authenticateToken(app), async (req, res) => {
    try {
      const usersService = new UsersService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };

      const result = await usersService.getResumePath(serviceParams);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Initialize workflow services (delayed to avoid circular dependencies)
  let workflowScheduler = null;

  setTimeout(() => {
    try {
      const applicationModel = new ApplicationModel(getDB());
      const notificationService = new NotificationService(app);
      const workflowService = new WorkflowService(applicationModel, notificationService);
      workflowScheduler = new WorkflowSchedulerService(workflowService, applicationModel);

      // Start workflow scheduler
      workflowScheduler.start();

      // Store services in app for access from other parts
      app.set('workflowService', workflowService);
      app.set('workflowScheduler', workflowScheduler);

      console.log('✅ Workflow services initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize workflow services:', error.message);
    }
  }, 1000);

  // Workflow management endpoints
  app.post('/workflow/transition', authenticateToken(app), async (req, res) => {
    try {
      const workflowService = app.get('workflowService');
      if (!workflowService) {
        return res.status(503).json({
          success: false,
          error: 'Workflow service not available'
        });
      }

      const { applicationId, newStage, reason, additionalData } = req.body;

      if (!applicationId || !newStage) {
        return res.status(400).json({
          success: false,
          error: 'Application ID and new stage are required'
        });
      }

      const result = await workflowService.transitionApplication(
        applicationId,
        newStage,
        req.userId,
        { reason, ...additionalData }
      );

      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.get('/workflow/stages/:stage/actions', authenticateToken(app), async (req, res) => {
    try {
      const workflowService = app.get('workflowService');
      if (!workflowService) {
        return res.status(503).json({
          success: false,
          error: 'Workflow service not available'
        });
      }

      const { stage } = req.params;
      const actions = workflowService.getAvailableActions(stage);
      res.json({ success: true, data: actions });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.get('/workflow/stages/:stage/decision', authenticateToken(app), async (req, res) => {
    try {
      const workflowService = app.get('workflowService');
      if (!workflowService) {
        return res.status(503).json({
          success: false,
          error: 'Workflow service not available'
        });
      }

      const { stage } = req.params;
      const decisionPoint = workflowService.getDecisionPoint(stage);
      res.json({ success: true, data: decisionPoint });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.post('/workflow/automation/process', authenticateToken(app), async (req, res) => {
    try {
      // Check if user is admin
      const user = await new UsersService(app).getCurrentUser(req.userId);
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { applicationId } = req.body;

      if (applicationId) {
        const workflowService = app.get('workflowService');
        if (!workflowService) {
          return res.status(503).json({ error: 'Workflow service not available' });
        }
        await workflowService.processAutomatedWorkflow(applicationId);
        res.json({ success: true, message: 'Automated workflow processed for application' });
      } else {
        // Process all active applications
        const workflowScheduler = app.get('workflowScheduler');
        if (!workflowScheduler) {
          return res.status(503).json({ error: 'Workflow scheduler not available' });
        }
        await workflowScheduler.processAutomatedWorkflows();
        res.json({ success: true, message: 'Automated workflow processed for all applications' });
      }
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  app.get('/workflow/health', authenticateToken(app), async (req, res) => {
    try {
      // Check if user is admin
      const user = await new UsersService(app).getCurrentUser(req.userId);
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const workflowScheduler = app.get('workflowScheduler');
      if (!workflowScheduler) {
        return res.status(503).json({ error: 'Workflow scheduler not available' });
      }
      await workflowScheduler.performHealthCheck();
      res.json({ success: true, message: 'Workflow health check completed' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });





  // Register requests service endpoints
  app.post('/requests', authenticateToken(app), async (req, res) => {
    try {
      console.log('🚀 POST /requests endpoint hit');
      console.log('📋 Request body:', req.body);
      console.log('👤 User:', req.user);
      console.log('🆔 User ID:', req.userId);

      const requestsService = new RequestsService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };
      const result = await requestsService.create(req.body, serviceParams);
      console.log('✅ Request created successfully:', result);
      res.json(result);
    } catch (error) {
      console.error('Error in POST /requests:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/requests', authenticateToken(app), async (req, res) => {
    try {
      console.log('🔍 GET /requests endpoint hit');
      console.log('👤 User:', req.user ? { id: req.user._id, role: req.user.role } : 'NO USER');
      console.log('📋 Query params:', req.query);

      const requestsService = new RequestsService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId,
        query: req.query
      };
      const result = await requestsService.find(serviceParams);
      console.log('✅ Found requests:', result.data?.length || 0);
      if (result.data?.length > 0) {
        console.log('📄 First request sample:', JSON.stringify(result.data[0], null, 2));
      }
      res.json(result);
    } catch (error) {
      console.error('Error in GET /requests:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/requests/:id', authenticateToken(app), async (req, res) => {
    try {
      console.log('🔄 PATCH /requests/:id endpoint hit');
      console.log('📋 Request ID:', req.params.id);
      console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
      console.log('👤 User:', req.user ? { id: req.user._id, role: req.user.role } : 'NO USER');

      const requestsService = new RequestsService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };
      const result = await requestsService.patch(req.params.id, req.body, serviceParams);
      console.log('✅ Request updated successfully');
      res.json(result);
    } catch (error) {
      console.error('❌ Error updating request:', error);
      if (error.code === 404) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.get('/requests/:id', authenticateToken(app), async (req, res) => {
    try {
      console.log('🔍 GET /requests/:id endpoint hit');
      console.log('📋 Request ID:', req.params.id);

      const requestsService = new RequestsService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };
      const result = await requestsService.get(req.params.id, serviceParams);
      res.json(result);
    } catch (error) {
      console.error('❌ Error fetching request:', error);
      if (error.code === 404) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Graceful shutdown handler for workflow scheduler
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, stopping workflow scheduler...');
    const scheduler = app.get('workflowScheduler');
    if (scheduler) {
      scheduler.stop();
    }
  });

  process.on('SIGINT', () => {
    console.log('Received SIGINT, stopping workflow scheduler...');
    const scheduler = app.get('workflowScheduler');
    if (scheduler) {
      scheduler.stop();
    }
  });

  // Make authentication middleware available to other parts of the app
  app.set('authenticate', authenticateToken(app));
  app.set('optionalAuth', optionalAuth(app));
};
