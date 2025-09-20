const mongoose = require('mongoose');

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
  address: {
    street: String,
    city: { type: String, index: true },
    state: String,
    country: String,
    zipCode: String,
    fullAddress: String
  },
  internships: [internshipJobSchema],
  verifiedStatus: { type: String, enum: ['pending','approved','rejected'], default: 'pending', index: true },
  rejectionReason: String,
  submittedAt: Date,
  reviewedAt: Date,
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);

