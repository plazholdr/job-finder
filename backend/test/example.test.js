const request = require('supertest');

describe('Example Test', () => {
  test('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  test('should test async operation', async () => {
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });
});
