import request from 'supertest';
import app from '../../src/app.js';
import { ApplicationStatus as AS, EmploymentStatus as ES, TimesheetStatus as TS } from '../../src/constants/enums.js';

describe('Employment & Timesheets services', () => {
  let studentToken; let companyToken; let adminToken; let companyId; let jobId; let applicationId; let employmentId; let studentId;

  beforeAll(async () => {
    await request(app).post('/users').send({ email: 'admin2@example.com', password: 'pw', role: 'admin' }).expect(201);
    const adminAuth = await request(app).post('/authentication').send({ strategy: 'local', email: 'admin2@example.com', password: 'pw' }).expect(201);
    adminToken = adminAuth.body.accessToken;

    const co = await request(app).post('/users').send({ email: 'c2@example.com', password: 'pw', role: 'company' }).expect(201);
    const ca = await request(app).post('/authentication').send({ strategy: 'local', email: 'c2@example.com', password: 'pw' }).expect(201);
    companyToken = ca.body.accessToken;

    const st = await request(app).post('/users').send({ email: 's2@example.com', password: 'pw', role: 'student' }).expect(201);
    studentId = st.body._id;
    const sa = await request(app).post('/authentication').send({ strategy: 'local', email: 's2@example.com', password: 'pw' }).expect(201);
    studentToken = sa.body.accessToken;

    const Companies = app.service('companies').Model;
    const company = await Companies.create({ ownerUserId: co.body._id, name: 'ACME' });
    companyId = company._id.toString();

    const start = new Date(Date.now() + 7 * 86400000); // next week
    const end = new Date(Date.now() + 14 * 86400000); // +1 week

    const JobModel = app.service('job-listings').Model;
    const job = await JobModel.create({ companyId, title: 'QA Intern', status: 2, project: { startDate: start, endDate: end } });
    jobId = job._id.toString();
  });

  test('accept offer creates employment; student timesheet, company approves; closure and complete', async () => {
    const sAuthz = { Authorization: `Bearer ${studentToken}` };
    const cAuthz = { Authorization: `Bearer ${companyToken}` };

    // Student applies
    const created = await request(app).post('/applications').set(sAuthz).send({ jobListingId: jobId }).expect(201);
    applicationId = created.body._id;

    // Company shortlist then sends offer
    await request(app).patch(`/applications/${applicationId}`).set(cAuthz).send({ action: 'shortlist' }).expect(200);
    const offered = await request(app).patch(`/applications/${applicationId}`).set(cAuthz).send({ action: 'sendOffer', title: 'Offer' }).expect(200);
    expect(offered.body.status).toBe(AS.PENDING_ACCEPTANCE);

    // Student accepts
    const accepted = await request(app).patch(`/applications/${applicationId}`).set(sAuthz).send({ action: 'acceptOffer' }).expect(200);
    expect(accepted.body.status).toBe(AS.ACCEPTED);

    // Employment should exist
    const Employment = app.service('employment-records').Model;
    const emps = await Employment.find({ applicationId }).lean();
    expect(emps.length).toBe(1);
    employmentId = emps[0]._id.toString();

    // Student creates timesheet (draft) for week window, submit
    const periodStart = new Date(Date.now() + 7 * 86400000);
    const periodEnd = new Date(Date.now() + 13 * 86400000);
    const tsCreate = await request(app).post('/timesheets').set(sAuthz).send({ employmentId, periodStart, periodEnd, items: [{ date: periodStart, hours: 8, description: 'work' }] }).expect(201);
    const timesheetId = tsCreate.body._id;

    const submitted = await request(app).patch(`/timesheets/${timesheetId}`).set(sAuthz).send({ action: 'submit' }).expect(200);
    expect(submitted.body.status).toBe(TS.SUBMITTED);

    const approved = await request(app).patch(`/timesheets/${timesheetId}`).set(cAuthz).send({ action: 'approve' }).expect(200);
    expect(approved.body.status).toBe(TS.APPROVED);

    // Company starts now then moves to closure
    await request(app).patch(`/employment-records/${employmentId}`).set(cAuthz).send({ action: 'startNow' }).expect(200);
    const moveClosure = await request(app).patch(`/employment-records/${employmentId}`).set(cAuthz).send({ action: 'moveToClosure' }).expect(200);
    expect(moveClosure.body.status).toBe(ES.CLOSURE);

    // Attach and verify required docs
    await request(app).patch(`/employment-records/${employmentId}`).set(cAuthz).send({ action: 'attachDoc', type: 'contract', fileKey: 'k1' }).expect(200);
    const afterAttach = await request(app).patch(`/employment-records/${employmentId}`).set(cAuthz).send({ action: 'attachDoc', type: 'nda', fileKey: 'k2' }).expect(200);
    const doc1 = afterAttach.body.docs.find(d => d.type === 'contract');
    const doc2 = afterAttach.body.docs.find(d => d.type === 'nda');
    await request(app).patch(`/employment-records/${employmentId}`).set(cAuthz).send({ action: 'verifyDoc', docId: doc1._id, verified: true }).expect(200);
    await request(app).patch(`/employment-records/${employmentId}`).set(cAuthz).send({ action: 'verifyDoc', docId: doc2._id, verified: true }).expect(200);

    // Complete (gated)
    const completed = await request(app).patch(`/employment-records/${employmentId}`).set(cAuthz).send({ action: 'complete' }).expect(200);
    expect(completed.body.status).toBe(ES.COMPLETED);
  });
});

