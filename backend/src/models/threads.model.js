const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  role: { type: String, enum: ['company','student'], required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });

const threadSchema = new mongoose.Schema({
  participants: [participantSchema],
  lastMessageAt: { type: Date, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Thread', threadSchema);

