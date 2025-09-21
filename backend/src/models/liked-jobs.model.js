import mongoose from 'mongoose';

const likedJobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  jobListingId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobListing', index: true, required: true }
}, { timestamps: true });

// Avoid duplicates per user+job
likedJobSchema.index({ userId: 1, jobListingId: 1 }, { unique: true });

export default mongoose.model('LikedJob', likedJobSchema);

