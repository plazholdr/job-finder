import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Set test environment variables
process.env.S3_BUCKET = 'test-bucket';
process.env.S3_ENDPOINT = 'https://test.endpoint.com';
process.env.S3_ACCESS_KEY = 'test-key';
process.env.S3_SECRET_KEY = 'test-secret';
process.env.JWT_SECRET = 'test-jwt-secret';

let mongoServer;

// Setup test database before all tests
beforeAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Clean up after each test
afterEach(async () => {
  const { collections } = mongoose.connection;
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

