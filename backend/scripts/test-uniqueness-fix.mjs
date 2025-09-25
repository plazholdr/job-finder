#!/usr/bin/env node

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3030';

async function testUniquenessFix() {
  try {
    console.log('=== Testing Company Uniqueness Check Fix ===\n');

    // Step 1: Login as a company user
    console.log('1. Logging in as company user...');
    const loginRes = await fetch(`${API_BASE_URL}/authentication`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        strategy: 'local',
        email: 'comp1.owner@example.com', // From our database check
        password: 'Password123!' // Default password from seed data
      })
    });

    if (!loginRes.ok) {
      const loginError = await loginRes.text();
      console.log('❌ Login failed:', loginError);
      console.log('Trying different credentials...');

      // Try with a different user
      const loginRes2 = await fetch(`${API_BASE_URL}/authentication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy: 'local',
          email: 'comp3.owner@example.com',
          password: 'Password123!'
        })
      });

      if (!loginRes2.ok) {
        console.log('❌ Second login attempt failed. Cannot test without valid credentials.');
        return;
      }

      const loginData2 = await loginRes2.json();
      var token = loginData2.accessToken;
      console.log('✅ Login successful with comp3.owner@example.com');
    } else {
      const loginData = await loginRes.json();
      var token = loginData.accessToken;
      console.log('✅ Login successful with comp1.owner@example.com');
    }

    // Step 2: Test uniqueness check with existing registration number
    console.log('\n2. Testing uniqueness check with existing registration number...');

    // First, let's see what registration numbers exist
    const allCompaniesRes = await fetch(`${API_BASE_URL}/companies`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (allCompaniesRes.ok) {
      const allCompanies = await allCompaniesRes.json();
      console.log('Existing companies:');
      (allCompanies.data || allCompanies).forEach(company => {
        console.log(`  - ${company.name}: "${company.registrationNumber || 'NULL'}"`);
      });
    }

    // Test with a known existing registration number
    const testRegNumber = '202001234567'; // This might exist from seed data
    const uniquenessRes = await fetch(`${API_BASE_URL}/companies?$limit=1&registrationNumber=${encodeURIComponent(testRegNumber)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`\nUniqueness check for "${testRegNumber}":`);
    console.log('Status:', uniquenessRes.status);

    if (uniquenessRes.ok) {
      const uniquenessData = await uniquenessRes.json();
      const list = Array.isArray(uniquenessData?.data) ? uniquenessData.data : (Array.isArray(uniquenessData) ? uniquenessData : []);
      console.log(`Found ${list.length} companies with this registration number`);

      if (list.length > 0) {
        console.log('✅ Fix working! Found existing company:', list[0].name);
        console.log('   Verification status:', list[0].verifiedStatus);
      } else {
        console.log('ℹ️  No companies found with this registration number');
      }
    } else {
      const error = await uniquenessRes.text();
      console.log('❌ Uniqueness check failed:', error);
    }

    // Step 3: Test with a new registration number
    console.log('\n3. Testing with a new registration number...');
    const newRegNumber = `TEST${Date.now()}`;
    const newUniquenessRes = await fetch(`${API_BASE_URL}/companies?$limit=1&registrationNumber=${encodeURIComponent(newRegNumber)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (newUniquenessRes.ok) {
      const newUniquenessData = await newUniquenessRes.json();
      const newList = Array.isArray(newUniquenessData?.data) ? newUniquenessData.data : (Array.isArray(newUniquenessData) ? newUniquenessData : []);
      console.log(`Found ${newList.length} companies with registration number "${newRegNumber}"`);

      if (newList.length === 0) {
        console.log('✅ Good! New registration number is available');
      } else {
        console.log('❌ Unexpected: Found existing company with new registration number');
      }
    } else {
      const error = await newUniquenessRes.text();
      console.log('❌ New uniqueness check failed:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const healthRes = await fetch(`${API_BASE_URL}/health`);
    if (healthRes.ok) {
      console.log('✅ Server is running');
      return true;
    }
  } catch (error) {
    console.log('❌ Server is not running. Please start the backend server first.');
    console.log('Run: yarn dev');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testUniquenessFix();
  }
}

main();
