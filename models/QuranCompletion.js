import mongoose from 'mongoose';

const quranCompletionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  completedAt: { type: Date, default: Date.now },
  durationDays: { type: Number },
});

const QuranCompletion = mongoose.model('QuranCompletion', quranCompletionSchema);
export default QuranCompletion;