import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String, default: '🏆' },
  earnedAt: { type: Date, default: Date.now },
}, { timestamps: true, autoIndex: process.env.NODE_ENV !== 'development' });

badgeSchema.index({ user: 1, name: 1 }, { unique: true });

export default mongoose.model('Badge', badgeSchema);