import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

const API_BASE_URL = 'http://localhost:3030';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobfinder';

async function testPendingApproval() {
  try {
    console.log('=== Testing Pending Approval Flow ===\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Find or create a company user with pending status
    let companyUser = await db.collection('users').findOne({ 
      role: 'company',
      email: 'test.pending@example.com'
    });

    if (!companyUser) {
      console.log('Creating test company user...');
      const result = await db.collection('users').insertOne({
        email: 'test.pending@example.com',
        username: 'test.pending@example.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'company',
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      companyUser = { _id: result.insertedId, email: 'test.pending@example.com' };
    }

    // Create a company with pending status
    let company = await db.collection('companies').findOne({
      ownerUserId: companyUser._id
    });

    if (!company) {
      console.log('Creating test company with pending status...');
      await db.collection('companies').insertOne({
        ownerUserId: companyUser._id,
        name: 'Test Pending Company',
        registrationNumber: 'TEST123456',
        phone: '+60123456789',
        verifiedStatus: 0, // 0 = pending
        submittedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      // Ensure it's pending
      await db.collection('companies').updateOne(
        { _id: company._id },
        { $set: { verifiedStatus: 0 } }
      );
    }

    console.log('Test setup complete. Company user with pending status ready.');
    console.log(`Email: ${companyUser.email}`);
    console.log('Password: password');
    console.log('\nNow try logging in at: http://localhost:3000/login');
    console.log('You should see the pending approval error message.');

  } catch (error) {
    console.error('Test setup error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testPendingApproval();
