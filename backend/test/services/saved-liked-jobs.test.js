import request from 'supertest';
import app from '../../src/app.js';

describe('Saved & Liked Jobs services', () => {
  let token;
  let companyId;
  let jobId;

  beforeAll(async () => {
    // create a company owner user and company and a job
    const user = await request(app).post('/users').send({ email: 'user1@example.com', password: 'pass1234', role: 'student' }).expect(201);
    const auth = await request(app).post('/authentication').send({ strategy: 'local', email: 'user1@example.com', password: 'pass1234' }).expect(201);
    token = auth.body.accessToken;

    const coUser = await request(app).post('/users').send({ email: 'co@example.com', password: 'pass1234', role: 'company' }).expect(201);
    const Companies = app.service('companies').Model;
    const company = await Companies.create({ ownerUserId: coUser.body._id, name: 'ACME' });
    companyId = company._id.toString();

    const JobModel = app.service('job-listings').Model;
    const job = await JobModel.create({ companyId, title: 'Intern QA', status: 2 });
    jobId = job._id.toString();
  });

  test('can save and like a job (idempotent)', async () => {
    const authz = { Authorization: `Bearer ${token}` };

    const saved1 = await request(app).post('/saved-jobs').set(authz).send({ jobListingId: jobId }).expect(201);
    expect(saved1.body.jobListingId).toBe(jobId);

    const saved2 = await request(app).post('/saved-jobs').set(authz).send({ jobListingId: jobId }).expect(201);
    expect(saved2.body.jobListingId).toBe(jobId);

    const liked1 = await request(app).post('/liked-jobs').set(authz).send({ jobListingId: jobId }).expect(201);
    expect(liked1.body.jobListingId).toBe(jobId);

    const liked2 = await request(app).post('/liked-jobs').set(authz).send({ jobListingId: jobId }).expect(201);
    expect(liked2.body.jobListingId).toBe(jobId);

    const listSaved = await request(app).get('/saved-jobs').set(authz).expect(200);
    expect(listSaved.body.data?.length || listSaved.body.length).toBeGreaterThanOrEqual(1);

    const listLiked = await request(app).get('/liked-jobs').set(authz).expect(200);
    expect(listLiked.body.data?.length || listLiked.body.length).toBeGreaterThanOrEqual(1);
  });
});

