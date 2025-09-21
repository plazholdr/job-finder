import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  date: Date,
  hours: Number,
  description: String
}, { _id: false });

const timesheetSchema = new mongoose.Schema({
  employmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmploymentRecord', required: true, index: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  cadence: { type: String, default: 'weekly' },
  items: [itemSchema],
  totalHours: { type: Number, default: 0 },
  status: { type: Number, enum: [0,1,2,3], default: 0, index: true },
  submittedAt: Date,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  feedback: String
}, { timestamps: true });

export default mongoose.model('Timesheet', timesheetSchema);

