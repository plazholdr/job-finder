import { hooks as authHooks } from '@feathersjs/authentication';
import crypto from 'crypto';
import Shares from '../../models/shares.model.js';
import JobListings from '../../models/job-listings.model.js';
import Companies from '../../models/companies.model.js';
import Users from '../../models/users.model.js';

const { authenticate } = authHooks;

function safeUserSnapshot(u) {
  return {
    profile: {
      firstName: u.profile?.firstName,
      lastName: u.profile?.lastName,
      avatar: u.profile?.avatar,
      location: u.profile?.location
    },
    internProfile: {
      university: u.internProfile?.university,
      major: u.internProfile?.major,
      graduationYear: u.internProfile?.graduationYear,
      skills: u.internProfile?.skills?.slice(0, 20)
    }
  };
}

function safeCompanySnapshot(c) {
  return {
    name: c.name || c.companyName,
    industry: c.industry,
    website: c.website,
    description: c.description,
    logo: c.logo
  };
}

function safeJobSnapshot(job, company) {
  return {
    title: job.title,
    description: job.description,
    locations: job.locations,
    salaryRange: job.salaryRange,
    company: company ? safeCompanySnapshot(company) : undefined,
    expiresAt: job.expiresAt
  };
}

class SharesService {
  constructor(app) { this.app = app; }

  async create(data, params) {
    const user = params.user;
    if (!user) throw Object.assign(new Error('Authentication required'), { code: 401 });

    const { type, targetId, note, expiresAt } = data || {};
    if (!['job','company','user'].includes(type)) throw Object.assign(new Error('Invalid type'), { code: 400 });
    if (!targetId) throw Object.assign(new Error('targetId required'), { code: 400 });

    let payload = null;
    if (type === 'user') {
      const u = await Users.findById(targetId).lean();
      if (!u) throw Object.assign(new Error('User not found'), { code: 404 });
      if (String(u._id) !== String(user._id) && user.role !== 'admin') {
        throw Object.assign(new Error('Not allowed to share this user profile'), { code: 403 });
      }
      payload = safeUserSnapshot(u);
    } else if (type === 'company') {
      const c = await Companies.findById(targetId).lean();
      if (!c) throw Object.assign(new Error('Company not found'), { code: 404 });
      if (user.role === 'company') {
        const myCompany = await Companies.findOne({ ownerUserId: user._id }).lean();
        if (!myCompany || String(myCompany._id) !== String(c._id)) throw Object.assign(new Error('Not allowed to share this company'), { code: 403 });
      } else if (user.role !== 'admin') {
        throw Object.assign(new Error('Not allowed to share this company'), { code: 403 });
      }
      payload = safeCompanySnapshot(c);
    } else if (type === 'job') {
      const job = await JobListings.findById(targetId).lean();
      if (!job) throw Object.assign(new Error('Job not found'), { code: 404 });
      let company = null;
      if (user.role === 'company') {
        company = await Companies.findOne({ ownerUserId: user._id }).lean();
        if (!company || String(company._id) !== String(job.companyId)) throw Object.assign(new Error('Not allowed to share this job'), { code: 403 });
      } else if (user.role === 'admin') {
        company = await Companies.findById(job.companyId).lean();
      } else {
        throw Object.assign(new Error('Not allowed to share this job'), { code: 403 });
      }
      payload = safeJobSnapshot(job, company);
    }

    let token;
    for (;;) {
      token = crypto.randomBytes(24).toString('base64url');
      const exists = await Shares.findOne({ token }).lean();
      if (!exists) break;
    }

    const doc = await Shares.create({
      type, targetId, token, createdBy: user._id, note: note || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      payload
    });

    const base = this.app.get('publicUrl') || process.env.PUBLIC_BASE_URL || (params?.headers?.host
      ? `${(params.headers['x-forwarded-proto'] || params.headers['x-forwarded-protocol'] || 'https')}://${params.headers.host}`
      : null);
    const url = base ? `${base}/shares/${doc.token}` : `/shares/${doc.token}`;
    return { _id: doc._id, type: doc.type, token: doc.token, url };
  }

  async get(id, params) {
    // If id looks like a token (not ObjectId), resolve by token and allow public GET
    const isToken = typeof id === 'string' && !id.match(/^[0-9a-fA-F]{24}$/);
    const query = isToken ? { token: id } : { _id: id };
    const share = await Shares.findOne(query).lean();
    if (!share) throw Object.assign(new Error('Not found'), { code: 404 });

    if (share.disabledAt) throw Object.assign(new Error('Share disabled'), { code: 410 });
    if (share.expiresAt && share.expiresAt <= new Date()) throw Object.assign(new Error('Share expired'), { code: 410 });

    if (!isToken) {
      // Owner/admin can view the record
      const user = params.user;
      if (!user) throw Object.assign(new Error('Authentication required'), { code: 401 });
      if (user.role !== 'admin' && String(share.createdBy) !== String(user._id)) {
        throw Object.assign(new Error('Forbidden'), { code: 403 });
      }
      return share;
    }

    // Public token view returns only the prebuilt payload and metadata
    const isFirstOpen = (share.clicks || 0) === 0;
    await Shares.updateOne({ _id: share._id }, { $inc: { clicks: 1 } });

    if (isFirstOpen) {
      try {
        const owner = await Users.findById(share.createdBy).lean();
        if (owner) {
          await this.app.service('notifications').create({
            recipientUserId: owner._id,
            recipientRole: owner.role,
            type: 'share_opened',
            title: 'Share link opened',
            body: 'Someone opened your share link.',
            data: { shareId: share._id, type: share.type, targetId: share.targetId, token: share.token }
          });
        }
      } catch (e) { /* ignore notification failures for public GET */ }
    }

    return { type: share.type, payload: share.payload, createdAt: share.createdAt };
  }

  async patch(id, data, params) {
    const user = params.user;
    if (!user) throw Object.assign(new Error('Authentication required'), { code: 401 });
    const share = await Shares.findById(id).lean();
    if (!share) throw Object.assign(new Error('Not found'), { code: 404 });
    if (user.role !== 'admin' && String(share.createdBy) !== String(user._id)) throw Object.assign(new Error('Forbidden'), { code: 403 });

    if (data?.action === 'disable') {
      await Shares.updateOne({ _id: share._id }, { $set: { disabledAt: new Date() } });
      return await Shares.findById(share._id).lean();
    }
    throw Object.assign(new Error('Invalid action'), { code: 400 });
  }
}

export default function (app) {
  app.use('/shares', new SharesService(app));
  app.service('shares').hooks({
    before: {
      // Allow public GET via token (no auth), but require auth for others
      get: [ async (ctx) => {
        const id = ctx.id;
        const isToken = typeof id === 'string' && !String(id).match(/^[0-9a-fA-F]{24}$/);
        if (!isToken) return authHooks.authenticate('jwt')(ctx);
      } ],
      create: [ authenticate('jwt') ],
      patch: [ authenticate('jwt') ]
    }
  });
}

