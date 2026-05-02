// import mongoose from 'mongoose';

// const quranCompletionSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   completedAt: { type: Date, default: Date.now },
//   durationDays: { type: Number },
// });

// const QuranCompletion = mongoose.model('QuranCompletion', quranCompletionSchema);
// export default QuranCompletion;



import mongoose from 'mongoose';

const quranCompletionSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true               // ✅ user pe index – user-specific records fetch karne ke liye
  },
  completedAt: { 
    type: Date, 
    default: Date.now,
    index: true               // ✅ completedAt pe index – date range queries ke liye (e.g., last month completions)
  },
  durationDays: { 
    type: Number,             // kitne din mein Quran khatam kiya
    index: true               // ✅ optional – agar average duration query karte ho to useful
  }
}, {
  // ✅ timestamps se automatically createdAt & updatedAt add honge
  timestamps: true,
  // ✅ production me autoIndex off for write performance
  autoIndex: process.env.NODE_ENV !== 'production'
});

// ✅ Compound index for user + completedAt (descending) – user ki completions timeline ke liye
quranCompletionSchema.index({ user: 1, completedAt: -1 });
quranCompletionSchema.index({ user: 1, completedAt: 1 });

// ✅ Compound index for completedAt + durationDays – analytics queries ke liye
quranCompletionSchema.index({ completedAt: 1, durationDays: 1 });

const QuranCompletion = mongoose.model('QuranCompletion', quranCompletionSchema);
export default QuranCompletion;