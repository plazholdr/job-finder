import mongoose from 'mongoose';

const shareSchema = new mongoose.Schema({
  type: { type: String, enum: ['job','company','user'], required: true, index: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  token: { type: String, unique: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  expiresAt: { type: Date },
  disabledAt: { type: Date },
  note: { type: String },
  payload: { type: Object }, // snapshot shown to viewers
  clicks: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Share', shareSchema);

