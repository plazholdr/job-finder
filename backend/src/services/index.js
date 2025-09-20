const users = require('./users/users.service.js');
const refreshToken = require('./refresh-token/refresh-token.service.js');
const upload = require('./upload/upload.service.js');

module.exports = function (app) {
  app.configure(users);
  app.configure(refreshToken);
  app.configure(upload);
};
