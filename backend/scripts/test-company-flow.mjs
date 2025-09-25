#!/usr/bin/env node

import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = 'http://localhost:3030';

async function testCompanyFlow() {
  try {
    console.log('=== Testing Company Setup Flow ===\n');

    // Step 1: Login as a company user
    console.log('1. Logging in as company user...');
    const loginRes = await fetch(`${API_BASE_URL}/authentication`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        strategy: 'local',
        email: 'comp3.owner@example.com', // From our database check
        password: 'password123' // Assuming default password
      })
    });

    if (!loginRes.ok) {
      console.log('Login failed, trying different credentials...');
      // Try to find any company user and test with them
      console.log('Skipping login test - need valid credentials');
      return;
    }

    const loginData = await loginRes.json();
    const token = loginData.accessToken;
    console.log('✅ Login successful');

    // Step 2: Test file upload
    console.log('\n2. Testing file upload...');
    
    // Create a dummy PDF file for testing
    const testPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF';
    const testFilePath = path.join(__dirname, 'test-ssm.pdf');
    fs.writeFileSync(testFilePath, testPdfContent);

    const formData = new FormData();
    formData.append('document', fs.createReadStream(testFilePath), {
      filename: 'test-ssm.pdf',
      contentType: 'application/pdf'
    });

    const uploadRes = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    if (!uploadRes.ok) {
      const uploadError = await uploadRes.text();
      console.log('❌ Upload failed:', uploadError);
      return;
    }

    const uploadData = await uploadRes.json();
    console.log('✅ Upload successful');
    console.log('Upload response:', JSON.stringify(uploadData, null, 2));

    const fileKey = uploadData?.files?.document?.[0]?.key;
    if (!fileKey) {
      console.log('❌ No file key returned from upload');
      return;
    }

    // Step 3: Create company
    console.log('\n3. Creating company...');
    const companyData = {
      name: 'Test Company Ltd',
      registrationNumber: `TEST${Date.now()}`, // Unique number
      phone: '+60123456789'
    };

    const companyRes = await fetch(`${API_BASE_URL}/companies`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(companyData)
    });

    if (!companyRes.ok) {
      const companyError = await companyRes.text();
      console.log('❌ Company creation failed:', companyError);
      return;
    }

    const company = await companyRes.json();
    console.log('✅ Company created');
    console.log('Company:', JSON.stringify(company, null, 2));

    // Step 4: Submit verification
    console.log('\n4. Submitting verification...');
    const verificationData = {
      companyId: company._id,
      documents: [{
        type: 'SSM_SUPERFORM',
        fileKey: fileKey
      }]
    };

    const verificationRes = await fetch(`${API_BASE_URL}/company-verifications`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(verificationData)
    });

    if (!verificationRes.ok) {
      const verificationError = await verificationRes.text();
      console.log('❌ Verification submission failed:', verificationError);
      return;
    }

    const verification = await verificationRes.json();
    console.log('✅ Verification submitted');
    console.log('Verification:', JSON.stringify(verification, null, 2));

    // Clean up test file
    fs.unlinkSync(testFilePath);
    console.log('\n✅ Test completed successfully!');

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
    await testCompanyFlow();
  }
}

main();
