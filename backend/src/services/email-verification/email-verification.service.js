import crypto from 'crypto';
import { sendMail } from '../../utils/mailer.js';
import { verifyEmailTemplate, companyVerifyEmailTemplate } from '../../utils/email-templates.js';
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
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await users.patch(user._id, {
      emailVerificationToken: token + ':' + code,
      emailVerificationExpires: expires,
      isEmailVerified: false
    });

    // Send email via nodemailer
    const isCompany = String(user.role || '') === 'company';
    const forCompany = isCompany ? '&forCompany=1' : '';
    const verifyLink = `${process.env.PUBLIC_WEB_URL || ''}/verify-email?token=${token}&email=${encodeURIComponent(user.email)}${forCompany}`;

    let subject, text, html;
    if (isCompany) {
      subject = 'Welcome to JobFinder - Verify Your Company Account';
      text = `Welcome to JobFinder! Click to verify your email and setup your company: ${verifyLink}\n\n(This link expires in 24 hours.)`;
      html = companyVerifyEmailTemplate({ brandName: 'JobFinder', verifyLink });
    } else {
      subject = 'Verify your email';
      text = `Click to verify: ${verifyLink}\n\n(This link expires in 24 hours.)`;
      html = verifyEmailTemplate({ brandName: 'JobFinder', code, verifyLink });
    }

    try { await sendMail({ to: user.email, subject, text, html }); } catch (_) {}

    // Also notify in-app
    try {
      await this.app.service('notifications').create({
        recipientUserId: user._id,
        recipientRole: user.role,
        type: 'email_verification',
        title: 'Verify your email',
        body: 'We sent a verification link to your email. It expires in 24 hours.'
      });
    } catch (_) {}

    return { ok: true };
  }

  async patch(id, data = {}) {
    // Verify by token + email and enforce expiry (24h)
    const { token, email } = data;
    if (!email || !token) {
      const err = new Error('token and email are required');
      err.code = 400;
      throw err;
    }

    const users = this.app.service('users');

    // Find user by email
    const found = await users.find({ paginate: false, query: { email: String(email).toLowerCase() } });
    const user = Array.isArray(found) ? found[0] : found;

    if (!user) {
      const err = new Error('User not found');
      err.code = 404;
      throw err;
    }

    // Validate token and expiration
    const stored = user.emailVerificationToken || '';
    const exp = user.emailVerificationExpires ? new Date(user.emailVerificationExpires) : null;
    if (!stored || !stored.includes(String(token))) {
      const err = new Error('Invalid verification link');
      err.code = 400; throw err;
    }
    if (!exp || exp < new Date()) {
      const err = new Error('Verification link expired');
      err.code = 400; throw err;
    }

    // Mark as verified
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

    return { ok: true, user };
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

