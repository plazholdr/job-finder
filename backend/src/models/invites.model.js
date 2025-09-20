const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
  type: { type: String, enum: ['profile_access','interview'], required: true, index: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message: String,
  status: { type: String, enum: ['pending','accepted','declined','expired'], default: 'pending', index: true },
  respondedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Invite', inviteSchema);

