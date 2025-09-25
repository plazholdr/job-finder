#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function checkCollections() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');

    const db = mongoose.connection.db;
    
    // List all collections
    console.log('\n=== All Collections ===');
    const collections = await db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });

    // Check companies collection
    console.log('\n=== Companies Collection ===');
    const companiesCount = await db.collection('companies').countDocuments();
    console.log(`Total companies: ${companiesCount}`);
    
    if (companiesCount > 0) {
      const sampleCompany = await db.collection('companies').findOne();
      console.log('Sample company:', JSON.stringify(sampleCompany, null, 2));
    }

    // Check company-verifications collection (Mongoose pluralizes to companyverifications)
    console.log('\n=== Company Verifications Collection ===');
    const verificationsCount = await db.collection('companyverifications').countDocuments();
    console.log(`Total verifications: ${verificationsCount}`);
    
    if (verificationsCount > 0) {
      const sampleVerification = await db.collection('companyverifications').findOne();
      console.log('Sample verification:', JSON.stringify(sampleVerification, null, 2));
    }

    // Check users collection for company users
    console.log('\n=== Company Users ===');
    const companyUsersCount = await db.collection('users').countDocuments({ role: 'company' });
    console.log(`Total company users: ${companyUsersCount}`);
    
    if (companyUsersCount > 0) {
      const sampleCompanyUser = await db.collection('users').findOne({ role: 'company' });
      console.log('Sample company user:', JSON.stringify({
        _id: sampleCompanyUser._id,
        email: sampleCompanyUser.email,
        role: sampleCompanyUser.role,
        isVerified: sampleCompanyUser.isVerified
      }, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkCollections();
