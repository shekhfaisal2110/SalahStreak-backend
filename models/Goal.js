import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['daily', 'weekly'], required: true },
  category: { type: String, enum: ['prayer', 'quran', 'dhikr'], required: true },
  targetValue: { type: Number, required: true }, // e.g., 5 prayers, 1 juz, 1000 dhikr
  currentValue: { type: Number, default: 0 },
  progress: { type: Number, default: 0 }, // percentage
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date }, // for weekly: 7 days from start
  badge: { type: String }, // badge name awarded when completed
  createdAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true, autoIndex: process.env.NODE_ENV !== 'development' });

goalSchema.index({ user: 1, completed: 1, createdAt: -1 });
goalSchema.index({ user: 1, type: 1 });

export default mongoose.model('Goal', goalSchema);