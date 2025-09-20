const users = require('./users/users.service.js');
const refreshToken = require('./refresh-token/refresh-token.service.js');
const upload = require('./upload/upload.service.js');
const companies = require('./companies/companies.service.js');
const companyVerifications = require('./company-verifications/company-verifications.service.js');
const invites = require('./invites/invites.service.js');
const notifications = require('./notifications/notifications.service.js');
const shortlists = require('./shortlists/shortlists.service.js');
const favorites = require('./favorites/favorites.service.js');
const threads = require('./threads/threads.service.js');
const messages = require('./messages/messages.service.js');

module.exports = function (app) {
  app.configure(users);
  app.configure(refreshToken);
  app.configure(upload);
  app.configure(companies);
  app.configure(companyVerifications);
  app.configure(invites);
  app.configure(notifications);
  app.configure(shortlists);
  app.configure(favorites);
  app.configure(threads);
  app.configure(messages);
};
