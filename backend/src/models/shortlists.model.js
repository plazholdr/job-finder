import mongoose from 'mongoose';

const shortlistSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  note: String
}, { timestamps: true });

export default mongoose.model('Shortlist', shortlistSchema);

