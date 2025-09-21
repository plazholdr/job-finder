import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  fileKey: String,
  contentType: String
}, { _id: false });

const messageSchema = new mongoose.Schema({
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread', required: true, index: true },
  senderUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: String,
  attachments: [attachmentSchema]
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);

