#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function verifyTestUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');

    const db = mongoose.connection.db;
    
    // Verify the test user's email
    const email = 'comp1.owner@example.com';
    const result = await db.collection('users').updateOne(
      { email: email },
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
      console.log(`✅ Successfully verified email for ${email}`);
    } else {
      console.log(`ℹ️  User ${email} was already verified or not found`);
    }

    // Check the user's current status
    const user = await db.collection('users').findOne({ email: email });
    if (user) {
      console.log('\nUser details:');
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Email Verified: ${user.isEmailVerified}`);
      console.log(`  Created: ${user.createdAt}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

verifyTestUser();
