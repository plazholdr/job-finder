const UsersService = require('./users.service');
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

  // Make authentication middleware available to other parts of the app
  app.set('authenticate', authenticateToken(app));
  app.set('optionalAuth', optionalAuth(app));
};
