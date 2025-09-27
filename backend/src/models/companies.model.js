import mongoose from 'mongoose';

const internshipJobSchema = new mongoose.Schema({
  title: String,
  description: String,
  postedAt: { type: Date, default: Date.now },
  duration: String,
  location: String,
  salaryRange: {
    min: Number,
    max: Number
  }
}, { _id: false });

const companySchema = new mongoose.Schema({
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  name: { type: String, required: true, index: true },
  registrationNumber: { type: String, index: true },
  industry: { type: String, index: true }, // business nature
  size: String,
  website: String,
  logoKey: String,
  description: String,
  email: String,
  phone: String,
  // Person-in-charge info for post-verification completeness
  picName: String,
  picEmail: String,
  picPhone: String,
  address: {
    street: String,
    city: { type: String, index: true },
    state: String,
    country: String,
    zipCode: String,
    fullAddress: String
  },
  internships: [internshipJobSchema],
  verifiedStatus: { type: Number, enum: [0,1,2], default: 0, index: true },
  rejectionReason: String,
  submittedAt: Date,
  reviewedAt: Date,
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Company', companySchema);

