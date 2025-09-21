import request from 'supertest';
import app from '../../src/app.js';

describe('Users Service', () => {
  let userToken;
  let userId;

  test('should create and authenticate user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      role: 'student',
      profile: { firstName: 'John', lastName: 'Doe' }
    };

    const created = await request(app)
      .post('/users')
      .send(userData)
      .expect(201);

    expect(created.body.email).toBe(userData.email);
    expect(created.body.role).toBe(userData.role);
    expect(created.body.password).toBeUndefined();

    userId = created.body._id;

    const loginData = { strategy: 'local', email: userData.email, password: userData.password };
    const auth = await request(app)
      .post('/authentication')
      .send(loginData)
      .expect(201);

    expect(auth.body.accessToken).toBeDefined();
    expect(auth.body.refreshToken).toBeDefined();
    expect(auth.body.user.email).toBe(loginData.email);

    userToken = auth.body.accessToken;
  });

  test('should get user profile with valid token', async () => {
    const user = await request(app)
      .post('/users')
      .send({ email: 'test2@example.com', password: 'password123', role: 'student' })
      .expect(201);

    const auth = await request(app)
      .post('/authentication')
      .send({ strategy: 'local', email: 'test2@example.com', password: 'password123' })
      .expect(201);

    const response = await request(app)
      .get(`/users/${user.body._id}`)
      .set('Authorization', `Bearer ${auth.body.accessToken}`)
      .expect(200);

    expect(response.body.email).toBe('test2@example.com');
    expect(response.body.password).toBeUndefined();
  });

  test('should not access users without authentication', async () => {
    await request(app)
      .get('/users')
      .expect(401);
  });
});
