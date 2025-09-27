#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://saino365forweb_db_user:dgBXwQFyUwI6LBnI@cluster0.tffyagz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Company Verification schema
const companyVerificationSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'companies', required: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  documents: [{
    type: { type: String, enum: ['SSM_SUPERFORM', 'BUSINESS_LICENSE', 'OTHER'], required: true },
    fileKey: { type: String, required: true },
    fileName: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending',
    index: true 
  },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  rejectionReason: String,
  adminNotes: String
}, {
  timestamps: true
});

// Company schema
const companySchema = new mongoose.Schema({
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  name: { type: String, required: true },
  registrationNumber: String,
  phone: String,
  industry: String,
  size: String,
  website: String,
  description: String,
  logo: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  verifiedStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending',
    index: true 
  },
  submittedAt: Date,
  reviewedAt: Date
}, {
  timestamps: true
});

const CompanyVerifications = mongoose.model('companyverifications', companyVerificationSchema);
const Companies = mongoose.model('companies', companySchema);

async function listVerifications() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all verifications
    const verifications = await CompanyVerifications.find({}).populate('companyId').sort({ submittedAt: -1 });
    
    console.log(`\n📋 Found ${verifications.length} company verifications:\n`);
    
    verifications.forEach((verification, index) => {
      console.log(`${index + 1}. Verification ID: ${verification._id}`);
      console.log(`   Company: ${verification.companyId?.name || 'Unknown'}`);
      console.log(`   Status: ${verification.status}`);
      console.log(`   Submitted: ${verification.submittedAt?.toISOString() || 'Unknown'}`);
      console.log(`   Documents: ${verification.documents?.length || 0}`);
      console.log('');
    });

    // Also list companies
    const companies = await Companies.find({}).sort({ createdAt: -1 });
    console.log(`\n🏢 Found ${companies.length} companies:\n`);
    
    companies.forEach((company, index) => {
      console.log(`${index + 1}. Company ID: ${company._id}`);
      console.log(`   Name: ${company.name}`);
      console.log(`   Status: ${company.verifiedStatus}`);
      console.log(`   Owner: ${company.ownerUserId}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error listing verifications:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

listVerifications();
