import users from './users/users.service.js';
import refreshToken from './refresh-token/refresh-token.service.js';
import upload from './upload/upload.service.js';
import companies from './companies/companies.service.js';
import companyVerifications from './company-verifications/company-verifications.service.js';
import invites from './invites/invites.service.js';
import notifications from './notifications/notifications.service.js';
import shortlists from './shortlists/shortlists.service.js';
import favorites from './favorites/favorites.service.js';
import threads from './threads/threads.service.js';
import messages from './messages/messages.service.js';
import emailVerification from './email-verification/email-verification.service.js';

export default function (app) {
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
  app.configure(emailVerification);
};
