// Simple test script to verify authentication works
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3030';

async function testAuth() {
  console.log('🧪 Testing Authentication System...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    console.log('   MongoDB:', healthData.services.mongodb);
    console.log('   Redis:', healthData.services.redis);
    console.log('');

    // Test 2: User Registration
    console.log('2. Testing user registration...');
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'student'
    };

    const registerResponse = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    if (registerResponse.ok) {
      const userData = await registerResponse.json();
      console.log('✅ User registration successful');
      console.log('   User ID:', userData._id);
      console.log('   Email:', userData.email);
      console.log('   Role:', userData.role);
    } else {
      const error = await registerResponse.json();
      console.log('❌ Registration failed:', error.message || error.error);
    }
    console.log('');

    // Test 3: User Login
    console.log('3. Testing user login...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
      strategy: 'local'
    };

    const loginResponse = await fetch(`${API_BASE}/authentication`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    if (loginResponse.ok) {
      const authData = await loginResponse.json();
      console.log('✅ User login successful');
      console.log('   Token received:', authData.accessToken ? 'Yes' : 'No');
      console.log('   User:', authData.user.firstName, authData.user.lastName);
      
      // Test 4: Protected Route
      console.log('\n4. Testing protected route...');
      const meResponse = await fetch(`${API_BASE}/users/me`, {
        headers: { 
          'Authorization': `Bearer ${authData.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (meResponse.ok) {
        const meData = await meResponse.json();
        console.log('✅ Protected route access successful');
        console.log('   Current user:', meData.firstName, meData.lastName);
      } else {
        console.log('❌ Protected route access failed');
      }
    } else {
      const error = await loginResponse.json();
      console.log('❌ Login failed:', error.message || error.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the backend server is running on port 3030');
    console.log('   Run: cd backend && npm run dev');
  }
}

// Run the test
testAuth();
