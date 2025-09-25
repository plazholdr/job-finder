import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

const API_BASE_URL = 'http://localhost:3030';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobfinder';

async function testAuthFlow() {
  try {
    console.log('=== Testing New Authentication Flow ===\n');

    // Connect to MongoDB to check user status
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Find a company user with a company profile
    const companyUser = await db.collection('users').findOne({ 
      role: 'company',
      isEmailVerified: true 
    });

    if (!companyUser) {
      console.log('No verified company users found');
      return;
    }

    console.log(`Found company user: ${companyUser.email}`);

    // Check if they have a company profile
    const company = await db.collection('companies').findOne({
      ownerUserId: companyUser._id
    });

    if (company) {
      console.log(`Company: ${company.name}`);
      console.log(`Verification Status: ${company.verifiedStatus} (0=pending, 1=approved, 2=rejected)`);
    } else {
      console.log('No company profile found - should allow login for setup');
    }

    // Test login attempt
    console.log('\n=== Testing Login ===');
    const loginRes = await fetch(`${API_BASE_URL}/authentication`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        strategy: 'local',
        email: companyUser.email,
        password: 'password123' // Assuming this is the password
      })
    });

    console.log(`Login Response Status: ${loginRes.status}`);

    if (loginRes.ok) {
      const loginData = await loginRes.json();
      console.log('✅ Login successful');
      console.log(`User Role: ${loginData.user?.role}`);
      console.log(`Access Token: ${loginData.accessToken ? 'Present' : 'Missing'}`);
    } else {
      const errorData = await loginRes.json().catch(() => ({}));
      console.log('❌ Login failed');
      console.log(`Error: ${errorData.message || 'Unknown error'}`);
      
      if (loginRes.status === 403 && errorData.message?.includes('pending approval')) {
        console.log('✅ Correctly blocked pending company from logging in');
      }
    }

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testAuthFlow();
