import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  at: { type: Date, default: Date.now },
  byUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: String
}, { _id: false });

const docSchema = new mongoose.Schema({
  type: String, // e.g., contract, nda
  fileKey: String,
  verified: { type: Boolean, default: false },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: true });

const employmentRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  jobListingId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobListing', index: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', index: true },

  status: { type: Number, enum: [0,1,2,3,4], default: 0, index: true },
  startDate: Date,
  endDate: Date,
  cadence: { type: String, default: 'weekly' }, // weekly by default

  requiredDocs: [{ type: String }], // e.g., ['contract','nda']
  docs: [docSchema],

  supervisorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: [noteSchema]
}, { timestamps: true });

employmentRecordSchema.index({ userId: 1, companyId: 1, startDate: 1 });

export default mongoose.model('EmploymentRecord', employmentRecordSchema);

