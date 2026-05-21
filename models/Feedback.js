import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['feedback', 'query', 'problem'], default: 'feedback' },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'replied', 'resolved'], default: 'pending' },
  adminReply: { type: String, default: '' },
  adminReplyDate: { type: Date },
  createdAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true, autoIndex: process.env.NODE_ENV !== 'development' });

feedbackSchema.index({ user: 1, createdAt: -1 });
feedbackSchema.index({ status: 1 });

export default mongoose.model('Feedback', feedbackSchema);