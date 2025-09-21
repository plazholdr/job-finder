import { hooks as authHooks } from '@feathersjs/authentication';
import mongoose from 'mongoose';
import { ApplicationStatus as S } from '../../constants/enums.js';
import { storageUtils } from '../../utils/storage.js';

const { authenticate } = authHooks;

function asObjectId(id) { try { return new mongoose.Types.ObjectId(id); } catch { return null; } }

export default (app) => {
  const JobModel = app.service('job-listings')?.Model;
  const Applications = app.service('applications')?.Model;

  async function notify(recipientUserId, recipientRole, type, title, body, data) {
    try {
      await app.service('notifications').create({ recipientUserId, recipientRole, type, title, body, data });
    } catch (_) {}
  }

  // Helper: Generate nicer PDF for an application and upload to object storage
  async function generateAndUploadPdf(a) {
    try {
      const PDFDocument = (await import('pdfkit')).default;
      const job = await app.service('job-listings')?.Model.findById(a.jobListingId).lean();
      const company = await app.service('companies')?.Model.findById(a.companyId).lean();
      const chunks = [];
      const doc = new PDFDocument({ size: 'A4', margin: 48 });
      doc.on('data', (c) => chunks.push(c));
      const done = new Promise((resolve) => doc.on('end', resolve));

      // Header
      doc.fontSize(20).text('Application Summary', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#444').text(`Generated: ${new Date().toISOString()}`);
      doc.moveDown();
      doc.fillColor('black');

      // Meta
      doc.fontSize(12).text(`Application ID: ${a._id}`);
      doc.text(`Applicant: ${a.userId}`);
      doc.text(`Company: ${company?.name || a.companyId}`);
      doc.text(`Job: ${job?.title || a.jobListingId}`);
      if (a.submittedAt) doc.text(`Submitted: ${new Date(a.submittedAt).toISOString()}`);

      // Sections
      if (a.candidateStatement) {
        doc.moveDown().fontSize(14).text('Candidate Statement', { underline: true });
        doc.fontSize(12).text(a.candidateStatement);
      }
      if (a.form && Object.keys(a.form).length) {
        doc.moveDown().fontSize(14).text('Form Data', { underline: true });
        doc.fontSize(12);
        Object.entries(a.form).forEach(([k, v]) => {
          const val = typeof v === 'object' ? JSON.stringify(v) : String(v);
          doc.text(`- ${k}: ${val}`);
        });
      }

      doc.end();
      await done;
      const buffer = Buffer.concat(chunks);
      const key = await storageUtils.uploadFile(buffer, `application-${a._id}.pdf`, 'application/pdf', 'applications');
      return key;
    } catch (_) {
      return null;
    }
  }

  async function ensureAccessFind(ctx) {
    const user = ctx.params.user;
    if (!user) return ctx;
    const q = ctx.params.query || {};
    if (user.role === 'student') {
      ctx.params.query = { ...q, userId: user._id };
    } else if (user.role === 'company') {
      const company = await app.service('companies').Model.findOne({ ownerUserId: user._id }).lean();
      if (!company) { throw new Error('Company profile not found'); }
      ctx.params.query = { ...q, companyId: company._id };
    } // admin sees all
    return ctx;
  }

  async function ensureAccessGet(ctx) {
    const user = ctx.params.user;
    if (!user) return ctx;
    const doc = await Applications.findById(ctx.id).lean();
    if (!doc) return ctx;
    if (user.role === 'student' && String(doc.userId) !== String(user._id)) throw Object.assign(new Error('Forbidden'), { code: 403 });
    if (user.role === 'company') {
      const company = await app.service('companies').Model.findOne({ ownerUserId: user._id }).lean();
      if (!company || String(doc.companyId) !== String(company._id)) throw Object.assign(new Error('Forbidden'), { code: 403 });
    }
    return ctx;
  }

  async function onCreate(ctx) {
    const user = ctx.params.user;
    if (user.role !== 'student') throw Object.assign(new Error('Only students can apply'), { code: 403 });

    const jobId = asObjectId(ctx.data.jobListingId);
    const job = await JobModel.findById(jobId).lean();
    if (!job) throw Object.assign(new Error('Job not found'), { code: 404 });

    const now = new Date();
    const defaultValidityDays = Number(process.env.APPLICATION_VALIDITY_DAYS || 14);
    const validity = ctx.data.validityUntil ? new Date(ctx.data.validityUntil) : new Date(now.getTime() + defaultValidityDays * 86400000);

    ctx.data = {
      userId: user._id,
      companyId: job.companyId,
      jobListingId: job._id,
      candidateStatement: ctx.data.candidateStatement,
      form: ctx.data.form || {},
      attachments: ctx.data.attachments || [],
      pdfKey: ctx.data.pdfKey,
      status: S.NEW,
      validityUntil: validity,
      submittedAt: now,
      history: [{ at: now, actorUserId: user._id, actorRole: 'student', action: 'apply', data: {} }]
    };
  }

  async function applyTransition(ctx) {
    // patch with { action, ...payload }
    const user = ctx.params.user;
    const doc = await Applications.findById(ctx.id);
    if (!doc) throw Object.assign(new Error('Not found'), { code: 404 });

    // Access check (same as get)
    if (user.role === 'student' && String(doc.userId) !== String(user._id)) throw Object.assign(new Error('Forbidden'), { code: 403 });
    if (user.role === 'company') {
      const company = await app.service('companies').Model.findOne({ ownerUserId: user._id }).lean();
      if (!company || String(doc.companyId) !== String(company._id)) throw Object.assign(new Error('Forbidden'), { code: 403 });
    }

    const action = String(ctx.data.action || '').trim();
    if (!action) return ctx; // normal patch (if any allowed fields later)

    const now = new Date();
    const historyEntry = { at: now, actorUserId: user._id, actorRole: user.role, action, data: { ...ctx.data } };

    function set(data) {
      ctx.data = {
        ...(data || {}),
        $push: { history: historyEntry }
      };
    }

    // Generic: regenerate application PDF (both roles allowed with access)
    if (action === 'regeneratePdf') {
      set({});
      ctx.params._regenPdf = true;
      return;
    }

    // Company-driven
    if (user.role === 'company') {
      if (action === 'shortlist' && doc.status === S.NEW) {
        set({ status: S.SHORTLISTED });
        ctx.params._notify = { type: 'application_shortlisted', toUserId: doc.userId, toRole: 'student' };
        return;
      }
      if ((action === 'scheduleInterview' || action === 'rescheduleInterview') && (doc.status === S.SHORTLISTED || doc.status === S.INTERVIEW_SCHEDULED)) {
        const when = ctx.data.scheduledAt ? new Date(ctx.data.scheduledAt) : null;
        set({ status: S.INTERVIEW_SCHEDULED, interview: { scheduledAt: when, location: ctx.data.location, locations: ctx.data.locations, mode: ctx.data.mode, notes: ctx.data.notes, updatedAt: now } });
        ctx.params._notify = { type: 'interview_scheduled', toUserId: doc.userId, toRole: 'student' };
        return;
      }
      if (action === 'cancelInterview' && doc.status === S.INTERVIEW_SCHEDULED) {
        set({ status: S.SHORTLISTED, interview: { ...doc.interview?.toObject?.() || {}, scheduledAt: null, updatedAt: now } });
        ctx.params._notify = { type: 'interview_cancelled', toUserId: doc.userId, toRole: 'student' };
        return;
      }
      if (action === 'sendOffer' && (doc.status === S.INTERVIEW_SCHEDULED || doc.status === S.SHORTLISTED)) {
        const defaultOfferDays = Number(process.env.OFFER_VALIDITY_DAYS || 7);
        const validUntil = ctx.data.validUntil ? new Date(ctx.data.validUntil) : new Date(now.getTime() + defaultOfferDays * 86400000);
        set({ status: S.PENDING_ACCEPTANCE, offer: { sentAt: now, validUntil, title: ctx.data.title, notes: ctx.data.notes } });
        ctx.params._notify = { type: 'offer_sent', toUserId: doc.userId, toRole: 'student' };
        return;
      }
      if (action === 'reject' && [S.NEW, S.SHORTLISTED, S.INTERVIEW_SCHEDULED, S.PENDING_ACCEPTANCE].includes(doc.status)) {
        set({ status: S.REJECTED, rejectedAt: now });
        ctx.params._notify = { type: 'application_rejected', toUserId: doc.userId, toRole: 'student' };
        return;
      }
      if (action === 'markNoShow' && doc.status === S.INTERVIEW_SCHEDULED) {
        set({ status: S.NOT_ATTENDING });
        ctx.params._notify = { type: 'interview_noshow', toUserId: doc.userId, toRole: 'student' };
        return;
      }
      throw Object.assign(new Error('Invalid action for current state'), { code: 400 });
    }

    // Student-driven
    if (user.role === 'student') {
      if (action === 'withdraw' && [S.NEW, S.SHORTLISTED, S.INTERVIEW_SCHEDULED, S.PENDING_ACCEPTANCE].includes(doc.status)) {
        set({ status: S.WITHDRAWN, withdrawnAt: now });
        ctx.params._notify = { type: 'application_withdrawn', toUserId: doc.companyId, toRole: 'company' };
        return;
      }
      if (action === 'declineInterview' && doc.status === S.INTERVIEW_SCHEDULED) {
        set({ status: S.SHORTLISTED, interview: { ...(doc.interview?.toObject?.() || {}), outcome: 'declined', updatedAt: now } });
        ctx.params._notify = { type: 'interview_declined', toUserId: doc.companyId, toRole: 'company' };
        return;
      }
      if (action === 'acceptOffer' && doc.status === S.PENDING_ACCEPTANCE) {
        set({ status: S.ACCEPTED, acceptedAt: now });
        ctx.params._notify = { type: 'offer_accepted', toUserId: doc.companyId, toRole: 'company' };
        // Create EmploymentRecord
        try {
          const Employment = app.service('employment-records')?.Model;
          const job = await JobModel.findById(doc.jobListingId).lean();
          const startDate = job?.project?.startDate ? new Date(job.project.startDate) : undefined;
          const endDate = job?.project?.endDate ? new Date(job.project.endDate) : undefined;
          const requiredDocs = ['contract','nda'];
          if (Employment) {
            await Employment.create({
              userId: doc.userId,
              companyId: doc.companyId,
              jobListingId: doc.jobListingId,
              applicationId: doc._id,
              status: 0, // UPCOMING
              startDate,
              endDate,
              cadence: 'weekly',
              requiredDocs
            });
          }
        } catch (_) {}
        return;
      }
      if (action === 'declineOffer' && doc.status === S.PENDING_ACCEPTANCE) {
        set({ status: S.REJECTED, rejectedAt: now });
        ctx.params._notify = { type: 'offer_declined', toUserId: doc.companyId, toRole: 'company' };
        return;
      }
      throw Object.assign(new Error('Invalid action for current state'), { code: 400 });
    }

    // Admin/system can be handled later
    return ctx;
  }

  async function afterNotify(ctx) {
    const n = ctx.params._notify;
    if (!n) return ctx;
    // Determine recipient userId for company case (owner)
    let recipientUserId = n.toUserId;
    if (n.toRole === 'company') {
      try {
        const company = await app.service('companies').Model.findById(n.toUserId).lean();
        if (company?.ownerUserId) recipientUserId = company.ownerUserId;
      } catch (_) {}
    }
    await notify(recipientUserId, n.toRole, n.type, 'Application update', '', { applicationId: ctx.id || ctx.result?._id });
    return ctx;
  }

  return {
    before: {
      all: [ authenticate('jwt') ],
      find: [ ensureAccessFind ],
      get: [ ensureAccessGet ],
      create: [ onCreate ],
      patch: [ applyTransition ]
    },
    after: {
      all: [],
      create: [ async (ctx) => {
        // 1) Generate and upload nicer PDF
        try {
          if (process.env.GENERATE_PDF !== 'false') {
            const key = await generateAndUploadPdf(ctx.result);
            if (key) {
              ctx.result.pdfKey = key;
              try { await app.service('applications').patch(ctx.result._id, { pdfKey: key }); } catch (_) {}
            }
          }
        } catch (_) {}

        // 2) notify company owner of new application (include pdf link if present)
        try {
          const company = await app.service('companies').Model.findById(ctx.result.companyId).lean();
          if (company?.ownerUserId) {
            const data = { applicationId: ctx.result._id };
            if (ctx.result.pdfKey) {
              try { data.pdfUrl = await storageUtils.getSignedUrl(ctx.result.pdfKey, 3600); } catch (_) {}
            }
            await notify(company.ownerUserId, 'company', 'application_created', 'New application', '', data);
          }
        } catch (_) {}
      } ],
      patch: [ async (ctx) => {
        if (!ctx.params._regenPdf) return ctx;
        try {
          const a = await Applications.findById(ctx.id).lean();
          if (a) {
            const key = await generateAndUploadPdf(a);
            if (key) {
              try { await app.service('applications').patch(ctx.id, { pdfKey: key }); } catch (_) {}
              try {
                const company = await app.service('companies').Model.findById(a.companyId).lean();
                if (company?.ownerUserId) {
                  const data = { applicationId: a._id };
                  try { data.pdfUrl = await storageUtils.getSignedUrl(key, 3600); } catch (_) {}
                  await notify(company.ownerUserId, 'company', 'application_pdf_regenerated', 'Application PDF regenerated', '', data);
                }
              } catch (_) {}
            }
          }
        } catch (_) {}
        return ctx;
      }, afterNotify ]
    },
    error: { }
  };
};

