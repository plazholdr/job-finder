#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function verifyCompanyUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');

    const db = mongoose.connection.db;
    
    // Find a company user to verify
    const companyUser = await db.collection('users').findOne({ 
      role: 'company',
      isEmailVerified: false 
    });
    
    if (!companyUser) {
      console.log('No unverified company users found');
      return;
    }

    console.log(`Found unverified company user: ${companyUser.email}`);
    
    // Manually verify their email
    const result = await db.collection('users').updateOne(
      { _id: companyUser._id },
      { 
        $set: { 
          isEmailVerified: true 
        },
        $unset: {
          emailVerificationToken: "",
          emailVerificationExpires: ""
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Successfully verified user email');
      console.log(`User ${companyUser.email} is now verified`);
      
      // Check if they have a company
      const company = await db.collection('companies').findOne({ 
        ownerUserId: companyUser._id 
      });
      
      if (company) {
        console.log(`✅ User has company: ${company.name}`);
        console.log(`Company verification status: ${company.verifiedStatus}`);
        console.log('\nNow you can test the company setup form with this user:');
        console.log(`Email: ${companyUser.email}`);
        console.log('Password: (you\'ll need to know their password)');
      } else {
        console.log('ℹ️  User does not have a company yet');
        console.log('You can test the company setup form with this user:');
        console.log(`Email: ${companyUser.email}`);
        console.log('Password: (you\'ll need to know their password)');
      }
    } else {
      console.log('❌ Failed to verify user email');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

verifyCompanyUser();
