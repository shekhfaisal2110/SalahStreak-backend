import mongoose from 'mongoose';

const quranProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, default: Date.now },
  completedAt: { type: Date },
  paras: { type: [Boolean], default: Array(30).fill(false) },
  completed: { type: Boolean, default: false },
});

const QuranProgress = mongoose.model('QuranProgress', quranProgressSchema);
export default QuranProgress;