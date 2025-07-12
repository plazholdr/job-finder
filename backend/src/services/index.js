const UsersService = require('./users.service');
const { AuthenticationService, authenticateToken, optionalAuth } = require('./authentication.service');
const InternshipPreferencesService = require('./internshipPreferences.service');
const JobsService = require('./jobs.service');
const CompaniesService = require('./companies.service');
const multer = require('multer');
const StorageUtils = require('../utils/storage');

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

  // Register internship preferences service endpoints
  app.post('/internshipPreferences', authenticateToken(app), async (req, res) => {
    try {
      const preferencesService = new InternshipPreferencesService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };
      const result = await preferencesService.create(req.body, serviceParams);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/internshipPreferences', authenticateToken(app), async (req, res) => {
    try {
      const preferencesService = new InternshipPreferencesService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId,
        query: req.query
      };
      const result = await preferencesService.find(serviceParams);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/internshipPreferences/:id', authenticateToken(app), async (req, res) => {
    try {
      const preferencesService = new InternshipPreferencesService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };
      const result = await preferencesService.get(req.params.id, serviceParams);
      res.json(result);
    } catch (error) {
      if (error.code === 404) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.patch('/internshipPreferences/:id', authenticateToken(app), async (req, res) => {
    try {
      const preferencesService = new InternshipPreferencesService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };
      const result = await preferencesService.patch(req.params.id, req.body, serviceParams);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/internshipPreferences/:id', authenticateToken(app), async (req, res) => {
    try {
      const preferencesService = new InternshipPreferencesService(app);
      const serviceParams = {
        user: req.user,
        userId: req.userId
      };
      const result = await preferencesService.remove(req.params.id, serviceParams);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
      const validation = StorageUtils.validateFile(file);
      if (validation.isValid) {
        cb(null, true);
      } else {
        cb(new Error(validation.errors.join(', ')), false);
      }
    }
  });

  // Register jobs service endpoints
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

  app.get('/jobs', authenticateToken(app), async (req, res) => {
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

  app.get('/jobs/:id', authenticateToken(app), async (req, res) => {
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
      res.status(400).json({ error: error.message });
    }
  });

  // File upload endpoint
  app.post('/jobs/:id/upload', authenticateToken(app), upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const jobsService = new JobsService(app);
      const result = await jobsService.uploadAttachment(req.params.id, req.file, req.userId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // File download endpoint - generates signed URL
  app.get('/jobs/:id/attachments/:fileName/download', authenticateToken(app), async (req, res) => {
    try {
      const jobsService = new JobsService(app);
      const downloadUrl = await jobsService.getAttachmentDownloadUrl(req.params.id, req.params.fileName, req.userId);
      res.json({ downloadUrl });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // File removal endpoint
  app.delete('/jobs/:id/attachments/:fileName', authenticateToken(app), async (req, res) => {
    try {
      const jobsService = new JobsService(app);
      const result = await jobsService.removeAttachment(req.params.id, req.params.fileName, req.userId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Register companies service endpoints
  app.get('/companies', authenticateToken(app), async (req, res) => {
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

  app.get('/companies/:id', authenticateToken(app), async (req, res) => {
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

  // Make authentication middleware available to other parts of the app
  app.set('authenticate', authenticateToken(app));
  app.set('optionalAuth', optionalAuth(app));
};
