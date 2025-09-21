import JobListings from './models/job-listings.model.js';
import Companies from './models/companies.model.js';
import Applications from './models/applications.model.js';
import EmploymentRecord from './models/employment-records.model.js';
import Timesheet from './models/timesheets.model.js';
import { ApplicationStatus as S, EmploymentStatus as ES, TimesheetStatus as TS } from './constants/enums.js';

// Lightweight in-process scheduler for periodic tasks
// Currently implements: job expiring reminders (7 days before expiresAt)
export default function configureScheduler(app) {
  const enabled = process.env.SCHEDULER_ENABLED !== 'false';
  const isTest = process.env.NODE_ENV === 'test' || !!process.env.JEST_WORKER_ID;

  // Check expiring jobs and create notifications for company owners
  async function runJobExpiryCheck() {
    try {
      const now = new Date();
      const in7 = new Date(now.getTime());
      in7.setDate(in7.getDate() + 7);

      const oncePerDayCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // status=2 (ACTIVE), expiresAt within 7 days, and no reminder in last 24h
      const criteria = {
        status: 2,
        expiresAt: { $gte: now, $lte: in7 },
        $or: [
          { lastExpiryReminderAt: { $exists: false } },
          { lastExpiryReminderAt: null },
          { lastExpiryReminderAt: { $lt: oncePerDayCutoff } }
        ]
      };

      const jobs = await JobListings.find(criteria).limit(200).lean();
      if (!jobs.length) return;

      const notifications = app.service && app.service('notifications');

      for (const job of jobs) {
        try {
          const company = await Companies.findById(job.companyId).lean();
          const ownerUserId = company?.ownerUserId;
          if (!ownerUserId) continue;

          if (notifications) {
            await notifications.create({
              recipientUserId: ownerUserId,
              recipientRole: 'company',
              type: 'job_expiring',
              title: 'Job listing expiring soon',
              body: `Your job "${job.title}" expires on ${new Date(job.expiresAt).toDateString()}. Consider renewing to keep it active.`,
              data: { jobId: job._id, expiresAt: job.expiresAt }
            }, { provider: 'scheduler' });
          }

          // Update reminder timestamp to avoid duplicate notifications
          await JobListings.updateOne({ _id: job._id }, { $set: { lastExpiryReminderAt: now } });
        } catch (e) {
          // Continue with next job
        }
      }
    } catch (err) {
      // Silent catch to avoid crashing the app due to scheduler
    }
  }

  // Application validity and offer expiry checks
  async function runApplicationChecks() {
    try {
      const now = new Date();

      // Auto-withdraw expired application validity (student side)
      const toWithdraw = await Applications.find({ status: { $in: [S.NEW, S.SHORTLISTED, S.INTERVIEW_SCHEDULED, S.PENDING_ACCEPTANCE] }, validityUntil: { $lte: now } }).limit(200).lean();
      if (toWithdraw.length) {
        for (const a of toWithdraw) {
          try {
            await Applications.updateOne({ _id: a._id }, { $set: { status: S.WITHDRAWN, withdrawnAt: now }, $push: { history: { at: now, actorRole: 'system', action: 'autoWithdraw' } } });
            try {
              const company = await Companies.findById(a.companyId).lean();
              const ownerUserId = company?.ownerUserId;
              if (ownerUserId) {
                await app.service('notifications').create({ recipientUserId: ownerUserId, recipientRole: 'company', type: 'application_withdrawn', title: 'Application withdrawn (expired)', data: { applicationId: a._id } }, { provider: 'scheduler' });
              }
              await app.service('notifications').create({ recipientUserId: a.userId, recipientRole: 'student', type: 'application_withdrawn', title: 'Your application expired', data: { applicationId: a._id } }, { provider: 'scheduler' });
            } catch (_) {}
          } catch (_) {}
        }
      }

      // Offer expiry reminder (24h before validUntil)
      const dayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const offers = await Applications.find({ status: S.PENDING_ACCEPTANCE, 'offer.validUntil': { $gte: now, $lte: dayFromNow } }).limit(200).lean();
      for (const a of offers) {
        try {
          await app.service('notifications').create({ recipientUserId: a.userId, recipientRole: 'student', type: 'offer_expiring', title: 'Offer expiring soon', data: { applicationId: a._id, validUntil: a.offer?.validUntil } }, { provider: 'scheduler' });
        } catch (_) {}
      }
    } catch (_) {}
  }

  // Employment checks
  async function runEmploymentChecks() {
    try {
      const now = new Date();
      // UPCOMING -> ONGOING
      await EmploymentRecord.updateMany({ status: ES.UPCOMING, startDate: { $lte: now } }, { $set: { status: ES.ONGOING } });
      // ONGOING -> CLOSURE at endDate
      await EmploymentRecord.updateMany({ status: ES.ONGOING, endDate: { $lte: now } }, { $set: { status: ES.CLOSURE } });

      // CLOSURE -> COMPLETED if all docs verified and timesheets approved
      const inClosure = await EmploymentRecord.find({ status: ES.CLOSURE }).limit(200).lean();
      for (const emp of inClosure) {
        const required = emp.requiredDocs || [];
        const hasAllDocs = required.every(rt => (emp.docs || []).some(d => d.type === rt && d.verified));
        if (!hasAllDocs) continue;
        if (emp.endDate) {
          const pending = await Timesheet.countDocuments({ employmentId: emp._id, periodEnd: { $lte: emp.endDate }, status: { $ne: TS.APPROVED } });
          if (pending > 0) continue;
        }
        await EmploymentRecord.updateOne({ _id: emp._id }, { $set: { status: ES.COMPLETED } });
      }
    } catch (_) {}
  }

  // Weekly reminders
  async function runTimesheetReminders() {
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const Notifications = app.service('notifications')?.Model;
      const emps = await EmploymentRecord.find({ status: ES.ONGOING }).select('_id userId').limit(500).lean();
      for (const emp of emps) {
        try {
          if (Notifications) {
            const exists = await Notifications.findOne({ recipientUserId: emp.userId, type: 'timesheet_reminder', createdAt: { $gte: weekAgo } }).lean();
            if (exists) continue;
          }
          await app.service('notifications').create({
            recipientUserId: emp.userId,
            recipientRole: 'student',
            type: 'timesheet_reminder',
            title: 'Weekly timesheet reminder',
            body: 'Please submit your timesheet for this week.',
            data: { employmentId: emp._id }
          }, { provider: 'scheduler' });
        } catch (_) {}
      }
    } catch (_) {}
  }

  async function runClosureReminders() {
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const Notifications = app.service('notifications')?.Model;
      const emps = await EmploymentRecord.find({ status: ES.CLOSURE }).limit(500).lean();
      for (const emp of emps) {
        try {
          const required = emp.requiredDocs || [];
          const hasAllDocs = required.every(rt => (emp.docs || []).some(d => d.type === rt && d.verified));
          let pending = 0;
          if (emp.endDate) {
            pending = await Timesheet.countDocuments({ employmentId: emp._id, periodEnd: { $lte: emp.endDate }, status: { $ne: TS.APPROVED } });
          }
          if (hasAllDocs && pending === 0) continue;

          const company = await Companies.findById(emp.companyId).lean();
          const ownerUserId = company?.ownerUserId; if (!ownerUserId) continue;

          if (Notifications) {
            const exists = await Notifications.findOne({ recipientUserId: ownerUserId, type: 'closure_reminder', 'data.employmentId': emp._id, createdAt: { $gte: weekAgo } }).lean();
            if (exists) continue;
          }

          await app.service('notifications').create({
            recipientUserId: ownerUserId,
            recipientRole: 'company',
            type: 'closure_reminder',
            title: 'Employment closure reminder',
            body: 'Some closure tasks are pending (documents or timesheets). Please review to finalize.',
            data: { employmentId: emp._id }
          }, { provider: 'scheduler' });
        } catch (_) {}
      }
    } catch (_) {}
  }

  // Expose manual trigger (useful for tests or admin)
  app.set('scheduler:runJobExpiryCheck', runJobExpiryCheck);
  app.set('scheduler:runApplicationChecks', runApplicationChecks);
  app.set('scheduler:runEmploymentChecks', runEmploymentChecks);
  app.set('scheduler:runTimesheetReminders', runTimesheetReminders);
  app.set('scheduler:runClosureReminders', runClosureReminders);

  // Do not start intervals during tests to keep Jest green
  if (!enabled || isTest) return;

  const intervalMinutes = Number(process.env.SCHEDULER_INTERVAL_MINUTES || 60);
  const intervalMs = Math.max(1, intervalMinutes) * 60 * 1000;

  // Helper: ms until next Monday 09:00
  function msUntilNextWeekly(weekday = 1, hour = 9, minute = 0) {
    const now = new Date();
    const result = new Date(now.getTime());
    // Set to target hour:minute today first
    result.setHours(hour, minute, 0, 0);
    // Day of week: 0=Sun..6=Sat. We need next `weekday` (Mon=1)
    let deltaDays = (weekday - now.getDay());
    if (deltaDays < 0 || (deltaDays === 0 && result <= now)) {
      deltaDays += 7;
    }
    result.setDate(now.getDate() + deltaDays);
    return result.getTime() - now.getTime();
  }

  setTimeout(runJobExpiryCheck, 10 * 1000); // initial delayed run
  setInterval(runJobExpiryCheck, intervalMs);
  setTimeout(runApplicationChecks, 15 * 1000);
  setInterval(runApplicationChecks, intervalMs);
  // Weekly schedule for reminders (every Monday 09:00 server time)
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  setTimeout(() => {
    runTimesheetReminders();
    setInterval(runTimesheetReminders, weekMs);
  }, msUntilNextWeekly(1, 9, 0));
  setTimeout(() => {
    runClosureReminders();
    setInterval(runClosureReminders, weekMs);
  }, msUntilNextWeekly(1, 9, 0));
}

