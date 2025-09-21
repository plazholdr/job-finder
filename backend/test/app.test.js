import request from 'supertest';
import app from '../src/app.js';

describe('Application', () => {
  test('should start and show health endpoint', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.status).toBe('OK');
    expect(response.body.timestamp).toBeDefined();
    expect(response.body.uptime).toBeDefined();
  });

  test('should return 404 for non-existent routes', async () => {
    await request(app)
      .get('/non-existent-route')
      .expect(404);
  });
});
