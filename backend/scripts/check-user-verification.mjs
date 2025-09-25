#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function checkUserVerification() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');

    const db = mongoose.connection.db;
    
    // Check all users and their verification status
    console.log('\n=== User Verification Status ===');
    const users = await db.collection('users').find().toArray();
    
    console.log(`Total users: ${users.length}\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Email Verified: ${user.isEmailVerified || false}`);
      console.log(`   Active: ${user.isActive !== false}`);
      console.log(`   Created: ${user.createdAt}`);
      if (user.emailVerificationToken) {
        console.log(`   ⚠️  Has pending verification token`);
      }
      if (user.emailVerificationExpires) {
        const expired = new Date(user.emailVerificationExpires) < new Date();
        console.log(`   Verification expires: ${user.emailVerificationExpires} ${expired ? '(EXPIRED)' : '(VALID)'}`);
      }
      console.log('');
    });

    // Summary
    const companyUsers = users.filter(u => u.role === 'company');
    const verifiedCompanyUsers = companyUsers.filter(u => u.isEmailVerified);
    const unverifiedCompanyUsers = companyUsers.filter(u => !u.isEmailVerified);

    console.log('\n=== Summary ===');
    console.log(`Total company users: ${companyUsers.length}`);
    console.log(`Verified company users: ${verifiedCompanyUsers.length}`);
    console.log(`Unverified company users: ${unverifiedCompanyUsers.length}`);

    if (unverifiedCompanyUsers.length > 0) {
      console.log('\n⚠️  Unverified company users:');
      unverifiedCompanyUsers.forEach(user => {
        console.log(`   - ${user.email}`);
      });
      console.log('\nThese users may not be able to submit company verifications if email verification is required.');
    }

    // Check if there's a requireVerifiedCompany hook
    console.log('\n=== Checking for verification requirements ===');
    console.log('Looking for any hooks that might require email verification...');
    
    // This would need to be checked in the code, but let's see if we can infer from the data
    const companiesWithUnverifiedOwners = [];
    const companies = await db.collection('companies').find().toArray();
    
    for (const company of companies) {
      const owner = users.find(u => u._id.toString() === company.ownerUserId.toString());
      if (owner && !owner.isEmailVerified) {
        companiesWithUnverifiedOwners.push({
          company: company.name,
          owner: owner.email,
          companyId: company._id
        });
      }
    }

    if (companiesWithUnverifiedOwners.length > 0) {
      console.log('\n⚠️  Companies with unverified owners:');
      companiesWithUnverifiedOwners.forEach(item => {
        console.log(`   - ${item.company} (owner: ${item.owner})`);
      });
    } else {
      console.log('✅ All company owners have verified emails');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkUserVerification();
