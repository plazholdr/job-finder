import mongoose from 'mongoose';

const salaryRangeSchema = new mongoose.Schema({
  min: { type: Number },
  max: { type: Number }
}, { _id: false });

const filtersSchema = new mongoose.Schema({
  // Intern search (used by companies)
  fieldOfStudy: { type: String },
  preferredStartDate: { type: Date },
  preferredEndDate: { type: Date },
  locations: [{ type: String }],
  salaryRange: { type: salaryRangeSchema },

  // Company search (used by students)
  keyword: { type: String },
  companyName: { type: String },
  nature: { type: String },
  location: { type: String },
  sort: { type: String }
}, { _id: false, minimize: true });

const searchProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  kind: { type: String, enum: ['intern', 'company'], required: true, index: true },
  name: { type: String }, // optional label if we ever allow multiple
  filters: { type: filtersSchema, default: {} }
}, { timestamps: true });

searchProfileSchema.index({ userId: 1, kind: 1 }, { unique: true }); // enforce 1 profile per kind per user

const SearchProfile = mongoose.model('SearchProfile', searchProfileSchema);
export default SearchProfile;

