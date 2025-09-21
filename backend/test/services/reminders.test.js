import { jest } from '@jest/globals';
import app from '../../src/app.js';
jest.setTimeout(30000);

import { EmploymentStatus as ES } from '../../src/constants/enums.js';

describe('Scheduler reminders', () => {
  test('timesheet and closure reminders are generated and deduplicated', async () => {
    // Create users
    const owner = await app.service('users').create({ email: 'rem_owner@example.com', password: 'pw', role: 'company' });
    const student = await app.service('users').create({ email: 'rem_student@example.com', password: 'pw', role: 'student' });

    // Create company
    const Companies = app.service('companies').Model;
    const company = await Companies.create({ ownerUserId: owner._id, name: 'Remind Co' });

    // Employment ONGOING for timesheet reminder
    const Employment = app.service('employment-records').Model;
    const ongoing = await Employment.create({
      userId: student._id,
      companyId: company._id,
      status: ES.ONGOING,
      startDate: new Date(Date.now() - 24*60*60*1000),
      endDate: new Date(Date.now() + 7*24*60*60*1000),
      requiredDocs: ['contract']
    });

    // Run timesheet reminders twice (dedupe within 7 days)
    await app.get('scheduler:runTimesheetReminders')();
    await app.get('scheduler:runTimesheetReminders')();

    const Notifications = app.service('notifications').Model;
    const tsCount = await Notifications.countDocuments({ recipientUserId: student._id, type: 'timesheet_reminder' });
    expect(tsCount).toBe(1);

    // Employment in CLOSURE with outstanding tasks (missing required docs)
    const closure = await Employment.create({
      userId: student._id,
      companyId: company._id,
      status: ES.CLOSURE,
      endDate: new Date(),
      requiredDocs: ['contract'],
      docs: []
    });

    // Run closure reminders twice (dedupe within 7 days)
    await app.get('scheduler:runClosureReminders')();
    await app.get('scheduler:runClosureReminders')();

    const clCount = await Notifications.countDocuments({ recipientUserId: owner._id, type: 'closure_reminder' });
    expect(clCount).toBe(1);
  });
});

