const UsersService = require('./users.service');
const AdminService = require('./admin.service');
const NotificationService = require('./notification.service');
const { AuthenticationService, authenticateToken, optionalAuth } = require('./authentication.service');

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

  // Register users service
  app.use('/users', {
    async create(data) {
      const usersService = new UsersService(app);
      return await usersService.create(data);
    },
    async find(params) {
      const usersService = new UsersService(app);
      return await usersService.find(params);
    },
    async get(id) {
      const usersService = new UsersService(app);
      return await usersService.get(id);
    },
    async patch(id, data) {
      const usersService = new UsersService(app);
      return await usersService.patch(id, data);
    },
    async remove(id) {
      const usersService = new UsersService(app);
      return await usersService.remove(id);
    }
  });

  // Protected route for current user
  app.use('/users/me', authenticateToken(app), {
    async find() {
      const usersService = new UsersService(app);
      return await usersService.getCurrentUser(this.userId);
    },
    async patch(id, data) {
      const usersService = new UsersService(app);
      return await usersService.updateCurrentUser(this.userId, data);
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
      res.json({ success: true, message: result.message });
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

  // Make authentication middleware available to other parts of the app
  app.set('authenticate', authenticateToken(app));
  app.set('optionalAuth', optionalAuth(app));
};
