import { ApplicationStatusLabel as ASL, EmploymentStatusLabel as ESL, TimesheetStatusLabel as TSL } from '../../constants/enums.js';

function emptyCounts(labels) {
  const out = {};
  Object.values(labels).forEach(l => { out[l] = 0; });
  return out;
}

import hooks from './student-dashboard.hooks.js';

export default function (app) {
  app.use('/student-dashboard', {
    async find(params) {
      const user = params.user;
      if (!user || user.role !== 'student') {
        const err = new Error('Forbidden'); err.code = 403; throw err;
      }

      // Resolve models lazily to avoid registration order issues
      const Applications = app.service('applications')?.Model;
      const Employment = app.service('employment-records')?.Model;
      const Timesheet = app.service('timesheets')?.Model;

      // Applications by status for this student
      const applicationsByStatus = emptyCounts(ASL);
      const appCounts = await Applications.aggregate([
        { $match: { userId: user._id } },
        { $group: { _id: '$status', c: { $sum: 1 } } }
      ]);
      appCounts.forEach(({ _id, c }) => {
        const label = ASL[_id];
        if (label != null) applicationsByStatus[label] = c;
      });

      // Employments by status for this student
      const employmentsByStatus = emptyCounts(ESL);
      const empIds = await Employment.find({ userId: user._id }).select('_id status').lean();
      const statusMap = {};
      empIds.forEach(e => { statusMap[e.status] = (statusMap[e.status] || 0) + 1; });
      Object.entries(statusMap).forEach(([code, c]) => {
        const label = ESL[Number(code)];
        if (label != null) employmentsByStatus[label] = c;
      });

      // Timesheets for student's employments
      const empIdList = empIds.map(e => e._id);
      const timesheets = emptyCounts(TSL);
      const tsCounts = await Timesheet.aggregate([
        { $match: { employmentId: { $in: empIdList } } },
        { $group: { _id: '$status', c: { $sum: 1 } } }
      ]);
      tsCounts.forEach(({ _id, c }) => {
        const label = TSL[_id];
        if (label != null) timesheets[label] = c;
      });

      return { applicationsByStatus, employmentsByStatus, timesheets };
    }
  });
  const service = app.service('student-dashboard');
  service.hooks(hooks(app));
}

