const request = require('supertest');
const app = require('../../src/app');

describe('Users Service', () => {
  let userToken;
  let userId;

  test('should create a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      role: 'intern',
      profile: {
        firstName: 'John',
        lastName: 'Doe'
      }
    };

    const response = await request(app)
      .post('/users')
      .send(userData)
      .expect(201);

    expect(response.body.email).toBe(userData.email);
    expect(response.body.role).toBe(userData.role);
    expect(response.body.password).toBeUndefined();
    
    userId = response.body._id;
  });

  test('should authenticate user', async () => {
    const loginData = {
      strategy: 'local',
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/authentication')
      .send(loginData)
      .expect(201);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(response.body.user.email).toBe(loginData.email);
    
    userToken = response.body.accessToken;
  });

  test('should get user profile with valid token', async () => {
    const response = await request(app)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(response.body.email).toBe('test@example.com');
    expect(response.body.password).toBeUndefined();
  });

  test('should not access users without authentication', async () => {
    await request(app)
      .get('/users')
      .expect(401);
  });
});
