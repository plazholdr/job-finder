const request = require('supertest');
const app = require('../src/index');

// Mock the MongoDB and Redis connections
jest.mock('../src/db', () => ({
  connectToMongoDB: jest.fn().mockResolvedValue({}),
  getDB: jest.fn().mockReturnValue({}),
  closeConnection: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('../src/redis', () => ({
  connectToRedis: jest.fn().mockResolvedValue({}),
  getRedisClient: jest.fn().mockReturnValue({}),
  closeRedisConnection: jest.fn().mockResolvedValue(undefined)
}));

describe('Health Check', () => {
  beforeAll(() => {
    // Set the connection status
    app.set('mongoConnected', true);
    app.set('redisConnected', true);
  });

  it('should return status ok with service information', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('services');
    expect(response.body.services).toHaveProperty('mongodb', 'connected');
    expect(response.body.services).toHaveProperty('redis', 'connected');
  });
});
