#!/usr/bin/env node

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3030';

async function testEnhancedCompanyFlow() {
  try {
    console.log('=== Testing Enhanced Company Registration Flow ===\n');

    // Step 1: Login as a verified company user
    console.log('1. Logging in as verified company user...');
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
      const loginError = await loginRes.text();
      console.log('❌ Login failed:', loginError);
      return;
    }

    const loginData = await loginRes.json();
    const token = loginData.accessToken;
    const user = loginData.user;
    console.log('✅ Login successful');
    console.log(`   User: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Email Verified: ${user.isEmailVerified}`);

    // Step 2: Test JWT authentication endpoint
    console.log('\n2. Testing JWT authentication...');
    const jwtRes = await fetch(`${API_BASE_URL}/authentication`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ strategy: 'jwt' })
    });

    if (jwtRes.ok) {
      const jwtData = await jwtRes.json();
      console.log('✅ JWT authentication successful');
      console.log(`   User ID: ${jwtData.user._id}`);
    } else {
      console.log('❌ JWT authentication failed');
    }

    // Step 3: Check if user already has companies
    console.log('\n3. Checking existing companies for user...');
    const companiesRes = await fetch(`${API_BASE_URL}/companies?ownerUserId=${user._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (companiesRes.ok) {
      const companiesData = await companiesRes.json();
      const companies = Array.isArray(companiesData?.data) ? companiesData.data : (Array.isArray(companiesData) ? companiesData : []);
      console.log(`Found ${companies.length} existing companies for this user`);
      
      if (companies.length > 0) {
        companies.forEach(company => {
          console.log(`   - ${company.name} (${company.registrationNumber || 'No reg number'})`);
        });
      }
    } else {
      console.log('❌ Failed to check existing companies');
    }

    // Step 4: Test uniqueness check with existing registration number
    console.log('\n4. Testing uniqueness check with existing registration number...');
    
    // First, get an existing registration number
    const allCompaniesRes = await fetch(`${API_BASE_URL}/companies`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    let existingRegNumber = null;
    if (allCompaniesRes.ok) {
      const allCompanies = await allCompaniesRes.json();
      const companies = Array.isArray(allCompanies?.data) ? allCompanies.data : (Array.isArray(allCompanies) ? allCompanies : []);
      const companyWithRegNumber = companies.find(c => c.registrationNumber);
      if (companyWithRegNumber) {
        existingRegNumber = companyWithRegNumber.registrationNumber;
        console.log(`   Testing with existing registration number: ${existingRegNumber}`);
        console.log(`   From company: ${companyWithRegNumber.name}`);
      }
    }

    if (existingRegNumber) {
      const uniquenessRes = await fetch(`${API_BASE_URL}/companies?$limit=1&registrationNumber=${encodeURIComponent(existingRegNumber)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (uniquenessRes.ok) {
        const uniquenessData = await uniquenessRes.json();
        const list = Array.isArray(uniquenessData?.data) ? uniquenessData.data : (Array.isArray(uniquenessData) ? uniquenessData : []);
        console.log(`   ✅ Found ${list.length} companies with registration number ${existingRegNumber}`);
        
        if (list.length > 0) {
          console.log(`   Company details: ${list[0].name}`);
        }
      } else {
        console.log('   ❌ Uniqueness check failed');
      }
    } else {
      console.log('   ℹ️  No existing registration numbers found to test with');
    }

    // Step 5: Test with new registration number
    console.log('\n5. Testing uniqueness check with new registration number...');
    const newRegNumber = `TEST${Date.now()}`;
    const newUniquenessRes = await fetch(`${API_BASE_URL}/companies?$limit=1&registrationNumber=${encodeURIComponent(newRegNumber)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (newUniquenessRes.ok) {
      const newUniquenessData = await newUniquenessRes.json();
      const newList = Array.isArray(newUniquenessData?.data) ? newUniquenessData.data : (Array.isArray(newUniquenessData) ? newUniquenessData : []);
      console.log(`   ✅ Found ${newList.length} companies with new registration number ${newRegNumber}`);
      
      if (newList.length === 0) {
        console.log('   ✅ New registration number is available');
      }
    } else {
      console.log('   ❌ New uniqueness check failed');
    }

    console.log('\n✅ Enhanced company flow test completed!');

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
    await testEnhancedCompanyFlow();
  }
}

main();
