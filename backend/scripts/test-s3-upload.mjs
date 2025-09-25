#!/usr/bin/env node

import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = 'http://localhost:3030';

async function testS3Upload() {
  try {
    console.log('=== Testing S3 Upload ===\n');

    // Create a test PDF file
    const testPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF';
    const testFilePath = path.join(__dirname, 'test-upload.pdf');
    fs.writeFileSync(testFilePath, testPdfContent);

    console.log('1. Created test PDF file');

    // Try to get a token first (you'll need to provide valid credentials)
    console.log('2. Getting authentication token...');
    
    // For now, let's test without authentication to see if the upload endpoint is working
    console.log('3. Testing upload endpoint...');
    
    const formData = new FormData();
    formData.append('document', fs.createReadStream(testFilePath), {
      filename: 'test-upload.pdf',
      contentType: 'application/pdf'
    });

    const uploadRes = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });

    console.log('Upload response status:', uploadRes.status);
    console.log('Upload response headers:', Object.fromEntries(uploadRes.headers.entries()));

    if (uploadRes.ok) {
      const uploadData = await uploadRes.json();
      console.log('✅ Upload successful!');
      console.log('Response:', JSON.stringify(uploadData, null, 2));
    } else {
      const errorText = await uploadRes.text();
      console.log('❌ Upload failed');
      console.log('Error:', errorText);
    }

    // Clean up
    fs.unlinkSync(testFilePath);
    console.log('4. Cleaned up test file');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testS3Upload();
