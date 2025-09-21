import { hooks as authHooks } from '@feathersjs/authentication';
import EmploymentRecord from '../../models/employment-records.model.js';
import Applications from '../../models/applications.model.js';
import JobListings from '../../models/job-listings.model.js';
import Companies from '../../models/companies.model.js';

const { authenticate } = authHooks;

class EmploymentDetailService {
  constructor (app) { this.app = app; }

  async get(id, params) {
    const user = params.user;
    const emp = await EmploymentRecord.findById(id).lean();
    if (!emp) throw Object.assign(new Error('Employment not found'), { code: 404 });

    // Access control
    if (user.role === 'student') {
      if (String(emp.userId) !== String(user._id)) throw Object.assign(new Error('Forbidden'), { code: 403 });
    } else if (user.role === 'company') {
      const company = await Companies.findOne({ ownerUserId: user._id }).lean();
      if (!company || String(emp.companyId) !== String(company._id)) throw Object.assign(new Error('Forbidden'), { code: 403 });
    }

    const [application, job] = await Promise.all([
      emp.applicationId ? Applications.findById(emp.applicationId).lean() : null,
      emp.jobListingId ? JobListings.findById(emp.jobListingId).lean() : null
    ]);

    // Collect related requests hints (latest pending decision if any)
    const Resignations = this.app.service('resignations')?.Model;
    const EarlyCompletions = this.app.service('early-completions')?.Model;
    const latestResignation = Resignations ? await Resignations.findOne({ employmentId: emp._id }).sort({ createdAt: -1 }).lean() : null;
    const latestEarlyCompletion = EarlyCompletions ? await EarlyCompletions.findOne({ employmentId: emp._id }).sort({ createdAt: -1 }).lean() : null;

    return {
      employment: emp,
      job,
      application,
      onboarding: { requiredDocs: emp.requiredDocs || [], docs: emp.docs || [] },
      notes: emp.notes || [],
      applicationHistory: application?.history || [],
      latestRequests: {
        resignation: latestResignation ? { _id: latestResignation._id, status: latestResignation.status, reason: latestResignation.reason, proposedLastDay: latestResignation.proposedLastDay } : null,
        earlyCompletion: latestEarlyCompletion ? { _id: latestEarlyCompletion._id, status: latestEarlyCompletion.status, reason: latestEarlyCompletion.reason, proposedCompletionDate: latestEarlyCompletion.proposedCompletionDate } : null
      }
    };
  }
}

export default function (app) {
  app.use('/employment-detail', new EmploymentDetailService(app));
  app.service('employment-detail').hooks({ before: { all: [ authenticate('jwt') ] } });
}

