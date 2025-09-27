#!/usr/bin/env node

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://saino365forweb_db_user:dgBXwQFyUwI6LBnI@cluster0.tffyagz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// User schema (simplified)
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true, required: true },
  username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'company', 'admin'], required: true, default: 'student' },
  profile: {
    firstName: String,
    lastName: String,
    middleName: String,
    phone: String,
    avatar: String,
    bio: String,
    hidePhoneForCompanies: { type: Boolean, default: false }
  },
  privacySetting: { type: String, enum: ['full', 'restricted', 'private'], default: 'full' },
  isEmailVerified: { type: Boolean, default: false }
}, {
  timestamps: true
});

const Users = mongoose.model('users', userSchema);

async function createAdminUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Users.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    const adminUser = await Users.create({
      email: 'admin@jobfinder.com',
      username: 'admin@jobfinder.com',
      password: hashedPassword,
      role: 'admin',
      profile: {
        firstName: 'System',
        lastName: 'Administrator'
      },
      isEmailVerified: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@jobfinder.com');
    console.log('🔑 Password: Admin123!');
    console.log('👤 Role: admin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser();
