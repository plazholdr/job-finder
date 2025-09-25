#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function testVerificationService() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');

    const db = mongoose.connection.db;
    
    // Find a company user and a company
    const companyUser = await db.collection('users').findOne({ role: 'company' });
    const company = await db.collection('companies').findOne();
    
    if (!companyUser) {
      console.log('No company user found');
      return;
    }
    
    if (!company) {
      console.log('No company found');
      return;
    }

    console.log('Found company user:', companyUser.email);
    console.log('Found company:', company.name);

    // Try to create a test verification record directly in the database
    const testVerification = {
      companyId: company._id,
      submittedBy: companyUser._id,
      documents: [{
        type: 'SSM_SUPERFORM',
        fileKey: 'test-file-key.pdf'
      }],
      status: 0, // pending
      submittedAt: new Date()
    };

    console.log('\nTrying to insert test verification...');
    const result = await db.collection('companyverifications').insertOne(testVerification);
    console.log('Insert result:', result);

    // Check if it was inserted
    const inserted = await db.collection('companyverifications').findOne({ _id: result.insertedId });
    console.log('Inserted verification:', JSON.stringify(inserted, null, 2));

    // Clean up - remove the test record
    await db.collection('companyverifications').deleteOne({ _id: result.insertedId });
    console.log('Test record cleaned up');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testVerificationService();
