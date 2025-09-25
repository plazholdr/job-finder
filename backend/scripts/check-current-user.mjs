import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobfinder';

async function checkCurrentUser() {
  try {
    console.log('=== Checking Current User State ===\n');

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Find the user that's likely being used (sesagi153@gmail.com)
    const user = await db.collection('users').findOne({ 
      email: 'sesagi153@gmail.com'
    });

    if (user) {
      console.log('👤 User found:');
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Email Verified: ${user.isEmailVerified}`);
      console.log(`  User ID: ${user._id}`);

      // Check if they have a company
      const company = await db.collection('companies').findOne({
        ownerUserId: user._id
      });

      if (company) {
        console.log('\n🏢 Company found:');
        console.log(`  Name: ${company.name}`);
        console.log(`  Registration: ${company.registrationNumber}`);
        console.log(`  Verified Status: ${company.verifiedStatus} (0=pending, 1=approved, 2=rejected)`);
        console.log(`  Created: ${company.createdAt}`);
        console.log(`  Submitted: ${company.submittedAt}`);
      } else {
        console.log('\n❌ No company found for this user');
        console.log('This explains why they can access the setup page');
      }

      // Check for verification submissions
      const verifications = await db.collection('companyverifications').find({
        submittedBy: user._id
      }).toArray();

      if (verifications.length > 0) {
        console.log('\n📋 Verification submissions:');
        verifications.forEach((v, i) => {
          console.log(`  ${i + 1}. Status: ${v.status}, Submitted: ${v.submittedAt}`);
        });
      } else {
        console.log('\n❌ No verification submissions found');
      }

    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkCurrentUser();
