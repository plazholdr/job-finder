import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true, required: true }
}, { timestamps: true });

export default mongoose.model('Favorite', favoriteSchema);

