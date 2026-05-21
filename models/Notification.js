import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['announcement', 'event', 'reminder'], default: 'announcement' },
  target: { type: String, enum: ['all', 'specific'], default: 'all' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true, autoIndex: process.env.NODE_ENV !== 'development' });

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ target: 1, createdAt: -1 });
notificationSchema.index({ userId: 1 });
notificationSchema.index({ readBy: 1 });

export default mongoose.model('Notification', notificationSchema);