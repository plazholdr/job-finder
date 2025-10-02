import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Users from '../src/models/users.model.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobfinder';

async function connect() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');
}

async function main() {
  try {
    await connect();

    const companyEmails = [
      'techvision@example.com',
      'greenearth@example.com',
      'financefirst@example.com'
    ];

    const password = 'Password123!';
    const hashed = await bcrypt.hash(password, 10);

    for (const email of companyEmails) {
      const user = await Users.findOne({ email });
      if (user) {
        user.password = hashed;
        user.isEmailVerified = true;
        await user.save();
        console.log(`✅ Updated password for ${email}`);
        
        // Test the password
        const isValid = await bcrypt.compare(password, user.password);
        console.log(`   Password verification: ${isValid ? 'PASS' : 'FAIL'}`);
      } else {
        console.log(`⚠️  User not found: ${email}`);
      }
    }

    console.log('\n✅ Password update complete!');
    console.log('\n🔐 Test credentials:');
    console.log(`   Email: techvision@example.com`);
    console.log(`   Password: Password123!`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

main();

