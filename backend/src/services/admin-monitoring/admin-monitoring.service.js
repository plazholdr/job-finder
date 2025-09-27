import hooks from './admin-monitoring.hooks.js';

class AdminMonitoringService {
  constructor(options, app) {
    this.options = options || {};
    this.app = app;
  }

  // GET /admin/monitoring/overview
  async get(id, params) {
    if (id !== 'overview') {
      const err = new Error('Not found');
      err.code = 404;
      throw err;
    }

    const Job = this.app.service('job-listings');
    const Companies = this.app.service('companies');
    const Users = this.app.service('users');

    const JobModel = Job?.Model;
    const CompanyModel = Companies?.Model;
    const UserModel = Users?.Model;

    // Fallbacks to avoid crashes if a service is missing
    const countOrZero = async (fn) => { try { return await fn(); } catch (_) { return 0; } };

    const [
      jlDraft, jlPending, jlActive, jlClosed, jlTotal,
      coPending, coApproved, coRejected, coTotal,
      uStudents, uCompanies, uAdmins,
      recentListings
    ] = await Promise.all([
      countOrZero(() => JobModel.countDocuments({ status: 0 })),
      countOrZero(() => JobModel.countDocuments({ status: 1 })),
      countOrZero(() => JobModel.countDocuments({ status: 2 })),
      countOrZero(() => JobModel.countDocuments({ status: 3 })),
      countOrZero(() => JobModel.countDocuments({})),

      countOrZero(() => CompanyModel.countDocuments({ verifiedStatus: 0 })), // pending
      countOrZero(() => CompanyModel.countDocuments({ verifiedStatus: 1 })), // approved
      countOrZero(() => CompanyModel.countDocuments({ verifiedStatus: 2 })), // rejected
      countOrZero(() => CompanyModel.countDocuments({})),

      countOrZero(() => UserModel.countDocuments({ role: 'student' })),
      countOrZero(() => UserModel.countDocuments({ role: 'company' })),
      countOrZero(() => UserModel.countDocuments({ role: 'admin' })),

      (async () => {
        try {
          return await JobModel.find({}, { title: 1, status: 1, companyId: 1, updatedAt: 1 })
            .sort({ updatedAt: -1 })
            .limit(10)
            .lean();
        } catch (_) { return []; }
      })()
    ]);

    return {
      jobListings: {
        counts: { draft: jlDraft, pending: jlPending, active: jlActive, closed: jlClosed, total: jlTotal },
        recent: recentListings
      },
      companies: {
        counts: { pending: coPending, approved: coApproved, rejected: coRejected, total: coTotal }
      },
      users: {
        counts: { students: uStudents, companies: uCompanies, admins: uAdmins }
      }
    };
  }

  // GET /admin/monitoring (list pending items)
  async find(params) {
    const query = params?.query || {};
    const type = String(query.type || 'pending_jobs');

    if (type === 'pending_jobs') {
      const JobModel = this.app.service('job-listings').Model;
      const items = await JobModel.find({ status: 1 }).sort({ submittedAt: -1 }).limit(50).lean();
      return items;
    }

    if (type === 'pending_companies') {
      const CompanyModel = this.app.service('companies').Model;
      const items = await CompanyModel.find({ verifiedStatus: 0 }).sort({ submittedAt: -1 }).limit(50).lean();
      return items;
    }

    if (type === 'renewal_requests') {
      const JobModel = this.app.service('job-listings').Model;
      const CompanyModel = this.app.service('companies').Model;
      const now = new Date();

      const q = String(query.q || '').trim();
      const maxDays = Number(query.maxDays || 0);

      const criteria = { status: 2, renewal: true };
      if (maxDays > 0) {
        const max = new Date(now.getTime());
        max.setDate(max.getDate() + maxDays);
        criteria.expiresAt = { $lte: max, $gte: now };
      }

      if (q) {
        const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        const companies = await CompanyModel.find({ name: rx }, { _id: 1 }).lean();
        const companyIds = companies.map(c => c._id);
        criteria.$or = [ { title: rx }, { companyId: { $in: companyIds } } ];
      }

      const items = await JobModel.find(criteria).sort({ renewalRequestedAt: -1 }).limit(200).lean();
      return items;
    }

    if (type === 'expiring_jobs') {
      const JobModel = this.app.service('job-listings').Model;
      const now = new Date();
      const threshold = new Date(now.getTime());
      threshold.setDate(threshold.getDate() + 7);
      const items = await JobModel.find({ status: 2, expiresAt: { $lte: threshold, $gte: now } }).sort({ expiresAt: 1 }).limit(50).lean();
      return items;
    }

    return [];
  }
}

export default function (app) {
  const options = { paginate: false };
  app.use('/admin/monitoring', new AdminMonitoringService(options, app));
  const service = app.service('admin/monitoring');
  service.hooks(hooks(app));
}

