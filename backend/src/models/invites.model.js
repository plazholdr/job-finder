import mongoose from 'mongoose';

const inviteSchema = new mongoose.Schema({
  type: { type: String, enum: ['profile_access','interview'], required: true, index: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message: String,
  status: { type: Number, enum: [0,1,2,3], default: 0, index: true },
  respondedAt: Date
}, { timestamps: true });

export default mongoose.model('Invite', inviteSchema);

