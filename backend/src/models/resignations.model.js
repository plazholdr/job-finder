import mongoose from 'mongoose';

const resignationSchema = new mongoose.Schema({
  employmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmploymentRecord', required: true, index: true },
  initiatedBy: { type: String, enum: ['student'], default: 'student', required: true },
  reason: String,
  proposedLastDay: Date,
  status: { type: Number, enum: [0,1,2,3], default: 0, index: true }, // RequestStatus
  decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  decidedAt: Date
}, { timestamps: true });

export default mongoose.model('Resignation', resignationSchema);

