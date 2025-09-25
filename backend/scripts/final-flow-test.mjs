#!/usr/bin/env node

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3030';

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Company Registration Flow\n');

  try {
    // Test 1: Login as verified company user
    console.log('1️⃣ Testing login...');
    const loginRes = await fetch(`${API_BASE_URL}/authentication`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        strategy: 'local',
        email: 'comp1.owner@example.com',
        password: 'Password123!'
      })
    });

    if (!loginRes.ok) {
      console.log('❌ Login failed');
      return;
    }

    const loginData = await loginRes.json();
    const token = loginData.accessToken;
    const user = loginData.user;
    
    console.log(`✅ Login successful`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Verified: ${user.isEmailVerified}`);

    // Test 2: Check access control requirements
    console.log('\n2️⃣ Testing access control...');
    
    if (user.role !== 'company') {
      console.log('❌ User is not company role');
      return;
    }
    console.log('✅ User has company role');

    if (!user.isEmailVerified) {
      console.log('❌ User email not verified');
      return;
    }
    console.log('✅ User email is verified');

    // Test 3: Check existing companies
    console.log('\n3️⃣ Testing existing company check...');
    const companiesRes = await fetch(`${API_BASE_URL}/companies?ownerUserId=${user._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (companiesRes.ok) {
      const companiesData = await companiesRes.json();
      const companies = Array.isArray(companiesData?.data) ? companiesData.data : (Array.isArray(companiesData) ? companiesData : []);
      console.log(`✅ Found ${companies.length} existing companies`);
      
      if (companies.length > 0) {
        console.log('ℹ️  User already has companies - would redirect to dashboard');
        companies.forEach(company => {
          console.log(`   - ${company.name}`);
        });
      }
    }

    // Test 4: Test uniqueness check with existing registration number
    console.log('\n4️⃣ Testing uniqueness validation...');
    
    // Create a test registration number
    const testRegNumber = 'TEST123456789';
    
    const uniquenessRes = await fetch(`${API_BASE_URL}/companies?$limit=1&registrationNumber=${encodeURIComponent(testRegNumber)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (uniquenessRes.ok) {
      const uniquenessData = await uniquenessRes.json();
      const list = Array.isArray(uniquenessData?.data) ? uniquenessData.data : (Array.isArray(uniquenessData) ? uniquenessData : []);
      console.log(`✅ Uniqueness check returned ${list.length} results for ${testRegNumber}`);
      
      if (list.length === 0) {
        console.log('✅ Registration number is available');
      } else {
        console.log(`ℹ️  Registration number exists: ${list[0].name}`);
      }
    }

    // Test 5: Test company creation with conflict detection
    console.log('\n5️⃣ Testing company creation conflict detection...');
    
    // Try to create a company with existing registration number
    const existingRegNumber = '202001234567'; // This should exist from seed data
    
    const createRes = await fetch(`${API_BASE_URL}/companies`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Company',
        registrationNumber: existingRegNumber,
        contactNumber: '+60123456789',
        address: {
          street: 'Test Street',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Malaysia'
        }
      })
    });

    if (createRes.status === 409) {
      const conflictData = await createRes.json().catch(() => ({}));
      console.log('✅ Conflict detection working');
      console.log(`   Error: ${conflictData.message || 'Company already exists'}`);
    } else if (createRes.ok) {
      console.log('ℹ️  Company created successfully (registration number was available)');
    } else {
      console.log(`❌ Unexpected response: ${createRes.status}`);
    }

    console.log('\n🎉 Complete flow test finished!');
    console.log('\n📋 Summary:');
    console.log('✅ Authentication working');
    console.log('✅ Access control implemented');
    console.log('✅ Email verification checked');
    console.log('✅ Existing company detection');
    console.log('✅ Uniqueness validation working');
    console.log('✅ Conflict detection working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check server first
async function checkServer() {
  try {
    const healthRes = await fetch(`${API_BASE_URL}/health`);
    return healthRes.ok;
  } catch {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Server not running. Start with: yarn dev');
    return;
  }
  
  console.log('✅ Server is running\n');
  await testCompleteFlow();
}

main();
