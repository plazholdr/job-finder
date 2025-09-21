import request from 'supertest';
import app from '../../src/app.js';
import { ApplicationStatus as S } from '../../src/constants/enums.js';

describe('Applications service', () => {
  let studentToken; let companyOwnerToken; let companyId; let jobId; let applicationId;

  beforeAll(async () => {
    const student = await request(app).post('/users').send({ email: 'stud@example.com', password: 'pass1234', role: 'student' }).expect(201);
    const sAuth = await request(app).post('/authentication').send({ strategy: 'local', email: 'stud@example.com', password: 'pass1234' }).expect(201);
    studentToken = sAuth.body.accessToken;

    const co = await request(app).post('/users').send({ email: 'owner@example.com', password: 'pass1234', role: 'company' }).expect(201);
    const cAuth = await request(app).post('/authentication').send({ strategy: 'local', email: 'owner@example.com', password: 'pass1234' }).expect(201);
    companyOwnerToken = cAuth.body.accessToken;

    const Companies = app.service('companies').Model;
    const company = await Companies.create({ ownerUserId: co.body._id, name: 'Globex' });
    companyId = company._id.toString();

    const JobModel = app.service('job-listings').Model;
    const job = await JobModel.create({ companyId, title: 'Frontend Intern', status: 2 });
    jobId = job._id.toString();
  });

  test('student can create application; company can shortlist and send offer; student accepts', async () => {
    const sAuthz = { Authorization: `Bearer ${studentToken}` };
    const cAuthz = { Authorization: `Bearer ${companyOwnerToken}` };

    const created = await request(app).post('/applications').set(sAuthz).send({ jobListingId: jobId, candidateStatement: 'I am interested.' }).expect(201);
    expect(created.body.status).toBe(S.NEW);
    applicationId = created.body._id;

    const shortlisted = await request(app).patch(`/applications/${applicationId}`).set(cAuthz).send({ action: 'shortlist' }).expect(200);
    expect(shortlisted.body.status).toBe(S.SHORTLISTED);

    const offered = await request(app).patch(`/applications/${applicationId}`).set(cAuthz).send({ action: 'sendOffer', title: 'Intern Offer' }).expect(200);
    expect(offered.body.status).toBe(S.PENDING_ACCEPTANCE);

    const accepted = await request(app).patch(`/applications/${applicationId}`).set(sAuthz).send({ action: 'acceptOffer' }).expect(200);
    expect(accepted.body.status).toBe(S.ACCEPTED);
  });
});

