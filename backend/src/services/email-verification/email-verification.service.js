import crypto from 'crypto';
import { sendMail } from '../../utils/mailer.js';
import { verifyEmailTemplate } from '../../utils/email-templates.js';
import { hooks as authHooks } from '@feathersjs/authentication';

const { authenticate } = authHooks;

class EmailVerificationService {
  constructor(options, app) {
    this.options = options || {};
    this.app = app;
  }

  async create(data = {}, params) {
    // Request a verification email (OTP code + token)
    const users = this.app.service('users');

    let user = null;
    if (params && params.user) {
      user = await users.get(params.user._id);
    } else if (data.email) {
      const list = await users.find({ paginate: false, query: { email: String(data.email).toLowerCase() } });
      user = Array.isArray(list) ? list[0] : list;
    }

    if (!user) {
      const err = new Error('User not found');
      err.code = 404;
      throw err;
    }

    // Generate a 6-digit OTP code and a fallback token (link)
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const token = crypto.randomBytes(24).toString('hex');
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await users.patch(user._id, {
      emailVerificationToken: token + ':' + code,
      emailVerificationExpires: expires,
      isEmailVerified: false
    });

    // Send email via nodemailer
    const verifyLink = `${process.env.PUBLIC_WEB_URL || ''}/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;
    const subject = 'Verify your email';
    const text = `Your verification code is ${code}. It expires in 10 minutes.\n\nOr click the link: ${verifyLink}`;
    const html = verifyEmailTemplate({ brandName: 'JobFinder', code, verifyLink });
    try { await sendMail({ to: user.email, subject, text, html }); } catch (_) {}

    // Also notify in-app
    try {
      await this.app.service('notifications').create({
        recipientUserId: user._id,
        recipientRole: user.role,
        type: 'email_verification',
        title: 'Verify your email',
        body: 'We sent a verification code to your email. It expires in 10 minutes.'
      });
    } catch (_) {}

    return { ok: true };
  }

  async patch(id, data = {}) {
    // Confirm verification with token or code
    const { token, code, email } = data;
    if (!token && !code) {
      const err = new Error('token or code is required');
      err.code = 400;
      throw err;
    }

    const users = this.app.service('users');

    // Build query to match either exact token or contains code
    const query = {};
    if (token) query.emailVerificationToken = { $regex: `^${token}` };
    if (code) query.emailVerificationToken = { $regex: `${code}$` };
    if (email) query.email = String(email).toLowerCase();

    const found = await users.find({ paginate: false, query });
    const user = Array.isArray(found) ? found[0] : found;
    if (!user) {
      const err = new Error('Invalid token/code');
      err.code = 400;
      throw err;
    }
    if (user.emailVerificationExpires && new Date(user.emailVerificationExpires) < new Date()) {
      const err = new Error('Code expired');
      err.code = 400;
      throw err;
    }

    await users.patch(user._id, { isEmailVerified: true, emailVerificationToken: null, emailVerificationExpires: null });

    try {
      await this.app.service('notifications').create({
        recipientUserId: user._id,
        recipientRole: user.role,
        type: 'email_verified',
        title: 'Email verified',
        body: 'Your email address has been verified.'
      });
    } catch (_) {}

    return { ok: true };
  }
}

export default function (app) {
  const options = { paginate: app.get('paginate') };
  const svc = new EmailVerificationService(options, app);
  app.use('/email-verification', svc);
  app.use('/email-verification/resend', svc);

  // Public for primary endpoint; alias requires auth
  app.service('email-verification').hooks({ before: { all: [] }, after: { all: [] }, error: { all: [] } });
  app.service('email-verification/resend').hooks({ before: { all: [ authenticate('jwt') ] }, after: { all: [] }, error: { all: [] } });
};

