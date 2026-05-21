// import mongoose from 'mongoose';

// const quranProgressSchema = new mongoose.Schema({
//   user: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User', 
//     required: true,
//     index: true               // ✅ user pe index – progress fetch karne ke liye
//   },
//   startDate: { 
//     type: Date, 
//     default: Date.now,
//     index: true               // ✅ startDate pe index – date range queries ke liye
//   },
//   completedAt: { 
//     type: Date,
//     index: true               // ✅ completedAt pe index – completion date queries
//   },
//   paras: { 
//     type: [Boolean], 
//     default: () => Array(30).fill(false), // ✅ function use karo, direct array nahi (Mongoose issue avoid)
//     validate: [arr => arr.length === 30, 'Paras array must have exactly 30 items']
//   },
//   completed: { 
//     type: Boolean, 
//     default: false,
//     index: true               // ✅ completed pe index – incomplete/complete progress filter
//   }
// }, {
//   timestamps: true,           // ✅ createdAt, updatedAt auto add
//   autoIndex: process.env.NODE_ENV !== 'development'
// });

// // ✅ Compound indexes for common queries

// // 1. User + completed (incomplete progress fetch fast)
// quranProgressSchema.index({ user: 1, completed: 1 });

// // 2. User + startDate (descending) – latest progress first
// quranProgressSchema.index({ user: 1, startDate: -1 });

// // 3. User + completedAt – completed records sorted by date
// quranProgressSchema.index({ user: 1, completedAt: -1 });

// // 4. Completed + completedAt – for dashboard (showing recent completions across users)
// quranProgressSchema.index({ completed: 1, completedAt: -1 });

// quranProgressSchema.index({ user: 1, completed: 1, startDate: -1 });

// const QuranProgress = mongoose.model('QuranProgress', quranProgressSchema);
// export default QuranProgress;













import mongoose from 'mongoose';

const quranProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
      // No index: true here – handled by compound index
    },
    completedAt: {
      type: Date,
      index: true,
    },
    paras: {
      type: [Boolean],
      default: () => Array(30).fill(false),
      validate: [(arr) => arr.length === 30, 'Paras array must have exactly 30 items'],
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    autoIndex: process.env.NODE_ENV !== 'development',
    minimize: true,
    strict: true,
    versionKey: false,
  }
);

// Compound indexes – no duplicates
quranProgressSchema.index({ user: 1, completed: 1 });
quranProgressSchema.index({ user: 1, startDate: -1 });          // only one index with this key
quranProgressSchema.index({ user: 1, completedAt: -1 });
quranProgressSchema.index({ completed: 1, completedAt: -1 });
quranProgressSchema.index({ user: 1, completed: 1, startDate: -1 });

export default mongoose.model('QuranProgress', quranProgressSchema);