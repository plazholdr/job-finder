import mongoose from 'mongoose';

const extensionSchema = new mongoose.Schema({
  employmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmploymentRecord', required: true, index: true },
  requestedBy: { type: String, enum: ['company','student'], required: true },
  requestedUntil: { type: Date, required: true },
  reason: String,
  status: { type: Number, enum: [0,1,2,3], default: 0, index: true },
  decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  decidedAt: Date
}, { timestamps: true });

export default mongoose.model('InternshipExtension', extensionSchema);

