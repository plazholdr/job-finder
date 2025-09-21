import { ApplicationStatusLabel as ASL, EmploymentStatusLabel as ESL, TimesheetStatusLabel as TSL, RequestStatus as RS } from '../../constants/enums.js';

function emptyCounts(labels) { const out = {}; Object.values(labels).forEach(l => out[l] = 0); return out; }

import hooks from './admin-dashboard.hooks.js';

export default function (app) {
  app.use('/admin-dashboard', {
    async find(params) {
      const user = params.user;
      if (!user || user.role !== 'admin') { const e = new Error('Forbidden'); e.code = 403; throw e; }

      // Resolve models lazily
      const Applications = app.service('applications')?.Model;
      const Employment = app.service('employment-records')?.Model;
      const Timesheet = app.service('timesheets')?.Model;
      const Extensions = app.service('internship-extensions')?.Model;
      const Terminations = app.service('internship-terminations')?.Model;
      const Resignations = app.service('resignations')?.Model;

      const applicationsByStatus = emptyCounts(ASL);
      const appCounts = await Applications.aggregate([{ $group: { _id: '$status', c: { $sum: 1 } } }]);
      appCounts.forEach(({ _id, c }) => { const l = ASL[_id]; if (l != null) applicationsByStatus[l] = c; });

      const employmentsByStatus = emptyCounts(ESL);
      const empCounts = await Employment.aggregate([{ $group: { _id: '$status', c: { $sum: 1 } } }]);
      empCounts.forEach(({ _id, c }) => { const l = ESL[_id]; if (l != null) employmentsByStatus[l] = c; });

      const timesheets = emptyCounts(TSL);
      const tsCounts = await Timesheet.aggregate([{ $group: { _id: '$status', c: { $sum: 1 } } }]);
      tsCounts.forEach(({ _id, c }) => { const l = TSL[_id]; if (l != null) timesheets[l] = c; });

      const pendingDecisions = {
        extensions: await Extensions.countDocuments({ status: RS.PENDING }),
        terminations: await Terminations.countDocuments({ status: RS.PENDING }),
        resignations: await Resignations.countDocuments({ status: RS.PENDING })
      };

      return { applicationsByStatus, employmentsByStatus, timesheets, pendingDecisions };
    }
  });
  const service = app.service('admin-dashboard');
  service.hooks(hooks(app));
}

