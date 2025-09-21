import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  type: { type: String, enum: ['SSM_SUPERFORM','OTHERS'], required: true },
  fileKey: { type: String, required: true },
  metadata: { type: Object }
}, { _id: false });

const companyVerificationSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true, required: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  documents: [documentSchema],
  status: { type: Number, enum: [0,1,2], default: 0, index: true },
  rejectionReason: String,
  submittedAt: Date,
  reviewedAt: Date,
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('CompanyVerification', companyVerificationSchema);

