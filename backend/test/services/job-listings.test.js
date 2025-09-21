import request from 'supertest';
import app from '../../src/app.js';
import { jest } from '@jest/globals';


jest.setTimeout(30000);

describe('Job Listings Flow', () => {
  test('end-to-end: bootstrap, company verified, create/approve/browse listing', async () => {
    // Admin user
    await request(app).post('/users').send({
      email: 'admin@example.com', password: 'password123', role: 'admin',
      profile: { firstName: 'Admin', lastName: 'User' }
    }).expect(201);
    const adminAuth = await request(app).post('/authentication').send({
      strategy: 'local', email: 'admin@example.com', password: 'password123'
    }).expect(201);
    const adminToken = adminAuth.body.accessToken;

    // Company user
    await request(app).post('/users').send({
      email: 'comp@example.com', password: 'password123', role: 'company',
      profile: { firstName: 'Comp', lastName: 'Owner' }
    }).expect(201);
    const compAuth = await request(app).post('/authentication').send({
      strategy: 'local', email: 'comp@example.com', password: 'password123'
    }).expect(201);
    const companyToken = compAuth.body.accessToken;

    // Student user
    await request(app).post('/users').send({
      email: 'stud@example.com', password: 'password123', role: 'student',
      profile: { firstName: 'Stud', lastName: 'Ent' }
    }).expect(201);
    const studAuth = await request(app).post('/authentication').send({
      strategy: 'local', email: 'stud@example.com', password: 'password123'
    }).expect(201);
    const studentToken = studAuth.body.accessToken;

    // Company profile (created by company user)
    const companyRes = await request(app)
      .post('/companies')
      .set('Authorization', `Bearer ${companyToken}`)
      .send({ name: 'Test Co', industry: 'IT', city: 'KL' })
      .expect(201);
    const companyId = companyRes.body._id;

    // Admin approves company (verifiedStatus=1)
    await request(app)
      .patch(`/companies/${companyId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ verifiedStatus: 1 })
      .expect(200);

    // Company creates and submits for approval
    const createRes = await request(app)
      .post('/job-listings')
      .set('Authorization', `Bearer ${companyToken}`)
      .send({
        companyId,
        title: 'Software Intern',
        description: 'Build awesome things',
        submitForApproval: true
      })
      .expect(201);
    const listingId = createRes.body._id;
    expect(createRes.body.status).toBe(1); // pending

    // Admin approves
    const approveRes = await request(app)
      .patch(`/job-listings/${listingId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ approve: true })
      .expect(200);
    expect(approveRes.body.status).toBe(2); // active

    // Student browses active listings
    const listRes = await request(app)
      .get('/job-listings')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    const items = listRes.body.data || listRes.body; // paginate or not
    const found = items.find((it) => String(it._id) === String(listingId));
    expect(found).toBeTruthy();
    expect(found.status).toBe(2);
  });
});

