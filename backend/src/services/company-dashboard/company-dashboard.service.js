import { ApplicationStatusLabel as ASL, EmploymentStatusLabel as ESL, TimesheetStatusLabel as TSL, RequestStatus as RS } from '../../constants/enums.js';

function emptyCounts(labels) {
  const out = {}; Object.values(labels).forEach(l => out[l] = 0); return out;
}

import hooks from './company-dashboard.hooks.js';

export default function (app) {
  app.use('/company-dashboard', {
    async find(params) {
      const user = params.user;
      if (!user || user.role !== 'company') { const e = new Error('Forbidden'); e.code = 403; throw e; }

      // Resolve models lazily
      const Applications = app.service('applications')?.Model;
      const Employment = app.service('employment-records')?.Model;
      const Timesheet = app.service('timesheets')?.Model;
      const Extensions = app.service('internship-extensions')?.Model;
      const Terminations = app.service('internship-terminations')?.Model;
      const Resignations = app.service('resignations')?.Model;
      const Companies = app.service('companies')?.Model;

      const company = await Companies.findOne({ ownerUserId: user._id }).lean();
      if (!company) { return { applicationsByStatus: emptyCounts(ASL), employmentsByStatus: emptyCounts(ESL), timesheets: emptyCounts(TSL), pendingDecisions: { extensions: 0, terminations: 0, resignations: 0 }, pendingReview: 0 }; }

      // Applications by status for this company
      const applicationsByStatus = emptyCounts(ASL);
      const appCounts = await Applications.aggregate([
        { $match: { companyId: company._id } },
        { $group: { _id: '$status', c: { $sum: 1 } } }
      ]);
      appCounts.forEach(({ _id, c }) => { const l = ASL[_id]; if (l != null) applicationsByStatus[l] = c; });

      // Employments by status
      const employmentsByStatus = emptyCounts(ESL);
      const emps = await Employment.find({ companyId: company._id }).select('_id status').lean();
      const empIdList = emps.map(e => e._id);
      const localCount = {}; emps.forEach(e => { localCount[e.status] = (localCount[e.status] || 0) + 1; });
      Object.entries(localCount).forEach(([code, c]) => { const l = ESL[Number(code)]; if (l != null) employmentsByStatus[l] = c; });

      // Timesheets counts and pending review
      const timesheets = emptyCounts(TSL);
      const tsCounts = await Timesheet.aggregate([
        { $match: { employmentId: { $in: empIdList } } },
        { $group: { _id: '$status', c: { $sum: 1 } } }
      ]);
      tsCounts.forEach(({ _id, c }) => { const l = TSL[_id]; if (l != null) timesheets[l] = c; });
      const pendingReview = timesheets[TSL[1]] || 0; // SUBMITTED

      // Pending decisions
      const extensions = await Extensions.countDocuments({ status: RS.PENDING, employmentId: { $in: empIdList } });
      const terminations = await Terminations.countDocuments({ status: RS.PENDING, employmentId: { $in: empIdList } });
      const resignations = await Resignations.countDocuments({ status: RS.PENDING, employmentId: { $in: empIdList } });

      return { applicationsByStatus, employmentsByStatus, timesheets, pendingReview, pendingDecisions: { extensions, terminations, resignations } };
    }
  });
  const service = app.service('company-dashboard');
  service.hooks(hooks(app));
}

