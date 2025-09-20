const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Set test environment variables
process.env.S3_BUCKET = 'test-bucket';
process.env.S3_ENDPOINT = 'https://test.endpoint.com';
process.env.S3_ACCESS_KEY = 'test-key';
process.env.S3_SECRET_KEY = 'test-secret';
process.env.JWT_SECRET = 'test-jwt-secret';

let mongoServer;

// Setup test database before all tests
beforeAll(async () => {
  // Close any existing connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }

  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
});

// Clean up after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

// Increase timeout for database operations
jest.setTimeout(30000);
