#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function debugCompanyVerification() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');

    const db = mongoose.connection.db;
    
    // Check company users and their details
    console.log('\n=== Company Users Analysis ===');
    const companyUsers = await db.collection('users').find({ role: 'company' }).toArray();
    
    console.log(`Found ${companyUsers.length} company users:`);
    companyUsers.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Verified: ${user.isVerified}`);
      console.log(`   ID: ${user._id}`);
      console.log('');
    });

    // Check companies and their owners
    console.log('\n=== Companies and Ownership ===');
    const companies = await db.collection('companies').find().toArray();
    
    for (const company of companies) {
      console.log(`Company: ${company.name}`);
      console.log(`  Owner ID: ${company.ownerUserId}`);
      console.log(`  Registration: ${company.registrationNumber || 'N/A'}`);
      console.log(`  Verified Status: ${company.verifiedStatus}`);
      
      // Find the owner user
      const owner = await db.collection('users').findOne({ _id: company.ownerUserId });
      if (owner) {
        console.log(`  Owner Email: ${owner.email}`);
        console.log(`  Owner Role: ${owner.role}`);
        console.log(`  Owner Verified: ${owner.isVerified}`);
      } else {
        console.log(`  ❌ Owner user not found!`);
      }
      console.log('');
    }

    // Check if there are any verification attempts
    console.log('\n=== Verification Attempts ===');
    const verifications = await db.collection('companyverifications').find().toArray();
    console.log(`Total verifications: ${verifications.length}`);
    
    if (verifications.length > 0) {
      verifications.forEach((verification, index) => {
        console.log(`${index + 1}. Company ID: ${verification.companyId}`);
        console.log(`   Submitted By: ${verification.submittedBy}`);
        console.log(`   Status: ${verification.status}`);
        console.log(`   Documents: ${verification.documents?.length || 0}`);
        console.log('');
      });
    }

    // Check for any users who might have submitted companies but aren't verified
    console.log('\n=== Potential Issues ===');
    const unverifiedCompanyUsers = await db.collection('users').find({ 
      role: 'company', 
      isVerified: false 
    }).toArray();
    
    if (unverifiedCompanyUsers.length > 0) {
      console.log(`⚠️  Found ${unverifiedCompanyUsers.length} unverified company users:`);
      unverifiedCompanyUsers.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user._id})`);
      });
    } else {
      console.log('✅ All company users are verified');
    }

    // Check for companies without verifications
    const companiesWithoutVerifications = [];
    for (const company of companies) {
      const hasVerification = await db.collection('companyverifications').findOne({ 
        companyId: company._id 
      });
      if (!hasVerification) {
        companiesWithoutVerifications.push(company);
      }
    }

    if (companiesWithoutVerifications.length > 0) {
      console.log(`\n⚠️  Found ${companiesWithoutVerifications.length} companies without verification records:`);
      companiesWithoutVerifications.forEach(company => {
        console.log(`   - ${company.name} (ID: ${company._id})`);
      });
    } else {
      console.log('\n✅ All companies have verification records');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

debugCompanyVerification();
