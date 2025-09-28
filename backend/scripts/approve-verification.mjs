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
    type: Number, 
    enum: [0, 1, 2], // 0=pending, 1=approved, 2=rejected
    default: 0,
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
    type: Number, 
    enum: [0, 1, 2], // 0=pending, 1=approved, 2=rejected
    default: 0,
    index: true 
  },
  submittedAt: Date,
  reviewedAt: Date
}, {
  timestamps: true
});

const CompanyVerifications = mongoose.model('companyverifications', companyVerificationSchema);
const Companies = mongoose.model('companies', companySchema);

async function approveVerification(verificationId) {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the verification
    const verification = await CompanyVerifications.findById(verificationId).populate('companyId');
    if (!verification) {
      console.log('❌ Verification not found with ID:', verificationId);
      return;
    }

    console.log('📋 Found verification:');
    console.log('- Company:', verification.companyId?.name || 'Unknown');
    console.log('- Current Status:', verification.status === 0 ? 'Pending' : verification.status === 1 ? 'Approved' : 'Rejected');
    console.log('- Submitted:', verification.submittedAt);

    if (verification.status === 1) {
      console.log('✅ Company verification is already approved!');
      return;
    }

    // Update verification status
    await CompanyVerifications.findByIdAndUpdate(verificationId, {
      status: 1, // approved
      reviewedAt: new Date(),
      adminNotes: 'Approved via admin script'
    });

    // Update company status
    if (verification.companyId) {
      await Companies.findByIdAndUpdate(verification.companyId._id, {
        verifiedStatus: 1, // approved
        reviewedAt: new Date()
      });
    }

    console.log('✅ Company verification approved successfully!');
    console.log('🏢 Company:', verification.companyId?.name);
    console.log('📅 Approved at:', new Date().toISOString());
    
  } catch (error) {
    console.error('❌ Error approving verification:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// The verification ID for "voter1 sdn bhd" company
const verificationId = '68d552d929197a16d774d750';

console.log('🔍 Approving company verification:', verificationId);
approveVerification(verificationId);
