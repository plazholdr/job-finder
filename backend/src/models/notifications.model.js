const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  recipientRole: { type: String, enum: ['student','company','admin'], required: true },
  type: { type: String, enum: ['invite_sent','invite_accepted','invite_declined','kyc_submitted','kyc_approved','kyc_rejected','message','system'], required: true },
  title: String,
  body: String,
  data: { type: Object },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);

