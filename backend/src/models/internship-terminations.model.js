import mongoose from 'mongoose';

const terminationSchema = new mongoose.Schema({
  employmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmploymentRecord', required: true, index: true },
  initiatedBy: { type: String, enum: ['company','student'], required: true },
  reason: String,
  remark: String,
  proposedLastDay: Date,
  status: { type: Number, enum: [0,1,2,3], default: 0, index: true },
  decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  decidedAt: Date,
  decisionRemark: String
}, { timestamps: true });

export default mongoose.model('InternshipTermination', terminationSchema);

