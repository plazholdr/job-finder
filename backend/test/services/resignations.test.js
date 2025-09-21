import request from 'supertest';
import app from '../../src/app.js';
import { ApplicationStatus as AS, EmploymentStatus as ES } from '../../src/constants/enums.js';

describe('Resignations service', () => {
  let studentToken; let companyToken; let companyId; let jobId; let employmentId; let resignationId; let studentId;

  beforeAll(async () => {
    const co = await request(app).post('/users').send({ email: 'rc_owner@example.com', password: 'pw', role: 'company' }).expect(201);
    const ca = await request(app).post('/authentication').send({ strategy: 'local', email: 'rc_owner@example.com', password: 'pw' }).expect(201);
    companyToken = ca.body.accessToken;

    const st = await request(app).post('/users').send({ email: 'rc_student@example.com', password: 'pw', role: 'student' }).expect(201);
    studentId = st.body._id;
    const sa = await request(app).post('/authentication').send({ strategy: 'local', email: 'rc_student@example.com', password: 'pw' }).expect(201);
    studentToken = sa.body.accessToken;

    const Companies = app.service('companies').Model;
    const company = await Companies.create({ ownerUserId: co.body._id, name: 'Zeon Corp' });
    companyId = company._id.toString();

    const start = new Date(Date.now() + 3 * 86400000);
    const end = new Date(Date.now() + 10 * 86400000);

    const JobModel = app.service('job-listings').Model;
    const job = await JobModel.create({ companyId, title: 'Backend Intern', status: 2, project: { startDate: start, endDate: end } });
    jobId = job._id.toString();
  });

  test('student can request resignation; company approves; employment becomes TERMINATED', async () => {
    const sAuthz = { Authorization: `Bearer ${studentToken}` };
    const cAuthz = { Authorization: `Bearer ${companyToken}` };

    // Application -> Offer -> Accept
    const created = await request(app).post('/applications').set(sAuthz).send({ jobListingId: jobId }).expect(201);
    const applicationId = created.body._id;
    await request(app).patch(`/applications/${applicationId}`).set(cAuthz).send({ action: 'shortlist' }).expect(200);
    const offered = await request(app).patch(`/applications/${applicationId}`).set(cAuthz).send({ action: 'sendOffer', title: 'Offer' }).expect(200);
    expect(offered.body.status).toBe(AS.PENDING_ACCEPTANCE);
    await request(app).patch(`/applications/${applicationId}`).set(sAuthz).send({ action: 'acceptOffer' }).expect(200);

    // Employment exists
    const Employment = app.service('employment-records').Model;
    const emp = await Employment.findOne({ applicationId }).lean();
    employmentId = emp._id.toString();

    // Student requests resignation
    const proposedLastDay = new Date(Date.now() + 5 * 86400000);
    const resReq = await request(app).post('/resignations').set(sAuthz).send({ employmentId, reason: 'Personal reasons', proposedLastDay }).expect(201);
    resignationId = resReq.body._id;

    // Company approves
    const approved = await request(app).patch(`/resignations/${resignationId}`).set(cAuthz).send({ action: 'approve' }).expect(200);
    expect(approved.body.status).toBe(1); // APPROVED

    // Employment should be TERMINATED
    const empAfter = await Employment.findById(employmentId).lean();
    expect(empAfter.status).toBe(ES.TERMINATED);
  });
});

