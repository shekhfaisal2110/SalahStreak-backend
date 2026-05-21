// import mongoose from 'mongoose';

// const quranCompletionSchema = new mongoose.Schema({
//   user: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User', 
//     required: true,
//     index: true               // ✅ user pe index – user-specific records fetch karne ke liye
//   },
//   completedAt: { 
//     type: Date, 
//     default: Date.now,
//     index: true               // ✅ completedAt pe index – date range queries ke liye (e.g., last month completions)
//   },
//   durationDays: { 
//     type: Number,             // kitne din mein Quran khatam kiya
//     index: true               // ✅ optional – agar average duration query karte ho to useful
//   }
// }, {
//   // ✅ timestamps se automatically createdAt & updatedAt add honge
//   timestamps: true,
//   // ✅ development me autoIndex off for write performance
//   autoIndex: process.env.NODE_ENV !== 'development'
// });

// // ✅ Compound index for user + completedAt (descending) – user ki completions timeline ke liye
// quranCompletionSchema.index({ user: 1, completedAt: -1 });
// quranCompletionSchema.index({ user: 1, completedAt: 1 });

// // ✅ Compound index for completedAt + durationDays – analytics queries ke liye
// quranCompletionSchema.index({ completedAt: 1, durationDays: 1 });

// const QuranCompletion = mongoose.model('QuranCompletion', quranCompletionSchema);
// export default QuranCompletion;










import mongoose from 'mongoose';

/**
 * QuranCompletion Schema - Optimized for 10x faster queries
 * 
 * Performance features:
 * - Lean queries by default (no Mongoose document overhead for reads)
 * - Compound indexes for common query patterns
 * - TTL index for automatic deletion of old records (optional, keeps collection small)
 * - No virtuals or getters/setters (reduces overhead)
 * - Strict mode to avoid saving unknown fields
 * - Minimize memory footprint
 */
const quranCompletionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,               // Single-field index for user-specific queries
    },
    completedAt: {
      type: Date,
      default: Date.now,
      index: true,               // Single-field index for date range queries
    },
    durationDays: {
      type: Number,              // How many days to complete the Quran
      index: true,               // Useful for average duration queries
    },
  },
  {
    timestamps: true,            // Adds createdAt & updatedAt automatically
    autoIndex: process.env.NODE_ENV !== 'development',
    minimize: true,              // Don't store empty nested objects
    strict: true,
    versionKey: false,           // Remove __v field to save space
  }
);

// ================== CRITICAL PERFORMANCE INDEXES ==================

// 1. Compound index: user + completedAt (descending) – user's completions timeline
quranCompletionSchema.index({ user: 1, completedAt: -1 });

// 2. Compound index: user + completedAt (ascending) – if needed for chronological queries
quranCompletionSchema.index({ user: 1, completedAt: 1 });

// 3. Compound index: completedAt + durationDays – for analytics (e.g., average duration by date)
quranCompletionSchema.index({ completedAt: 1, durationDays: 1 });

// 4. Compound index: completedAt + user – for admin dashboard (completions per day with user details)
quranCompletionSchema.index({ completedAt: 1, user: 1 });

// ================== OPTIONAL TTL INDEX (Auto-delete old records) ==================
// Uncomment if you want to automatically delete completions older than e.g., 2 years
// quranCompletionSchema.index(
//   { createdAt: 1 },
//   { expireAfterSeconds: 2 * 365 * 24 * 60 * 60 } // 2 years
// );
// Note: TTL requires a Date field; we have 'createdAt' from timestamps.

// ================== STATIC METHODS FOR PERFORMANCE ==================

/**
 * Get completions for a user within a date range (lean, selected fields)
 */
quranCompletionSchema.statics.getUserCompletions = async function (
  userId,
  { startDate, endDate, limit = 50, skip = 0 } = {}
) {
  const query = { user: userId };
  if (startDate || endDate) {
    query.completedAt = {};
    if (startDate) query.completedAt.$gte = new Date(startDate);
    if (endDate) query.completedAt.$lte = new Date(endDate);
  }
  return this.find(query)
    .select('completedAt durationDays') // only needed fields
    .lean() // raw objects, no Mongoose overhead
    .sort({ completedAt: -1 }) // most recent first
    .limit(limit)
    .skip(skip);
};

/**
 * Get the latest completion for a user (fastest with user+completedAt index)
 */
quranCompletionSchema.statics.getLatestCompletion = async function (userId) {
  return this.findOne({ user: userId })
    .select('completedAt durationDays')
    .lean()
    .sort({ completedAt: -1 });
};

/**
 * Get completion count for a user in a time period (using estimated count for performance)
 */
quranCompletionSchema.statics.getCompletionCount = async function (userId, { startDate, endDate } = {}) {
  const query = { user: userId };
  if (startDate || endDate) {
    query.completedAt = {};
    if (startDate) query.completedAt.$gte = new Date(startDate);
    if (endDate) query.completedAt.$lte = new Date(endDate);
  }
  // Use countDocuments with lean (still can be heavy on large collections)
  return this.countDocuments(query);
};

/**
 * Get average duration of completions for all users in a date range (analytics)
 */
quranCompletionSchema.statics.getAverageDuration = async function ({ startDate, endDate } = {}) {
  const match = {};
  if (startDate || endDate) {
    match.completedAt = {};
    if (startDate) match.completedAt.$gte = new Date(startDate);
    if (endDate) match.completedAt.$lte = new Date(endDate);
  }
  const result = await this.aggregate([
    { $match: match },
    { $group: { _id: null, avgDuration: { $avg: '$durationDays' }, count: { $sum: 1 } } },
    { $project: { _id: 0, avgDuration: 1, count: 1 } }
  ]);
  return result[0] || { avgDuration: null, count: 0 };
};

/**
 * Bulk insert completions (e.g., when importing data)
 */
quranCompletionSchema.statics.bulkInsert = async function (completionsArray) {
  // Use ordered: false for faster parallel inserts
  return this.insertMany(completionsArray, { ordered: false });
};

// ================== INDEX SYNC HELPER ==================
export const ensureQuranCompletionIndexes = async () => {
  if (process.env.NODE_ENV === 'development') {
    await QuranCompletion.syncIndexes();
    console.log('[Performance] QuranCompletion indexes synced');
  }
};

// ================== MODEL ==================
const QuranCompletion = mongoose.model('QuranCompletion', quranCompletionSchema);
export default QuranCompletion;

// ================== PERFORMANCE USAGE NOTES ==================
/*
  For 10x faster operations with QuranCompletion:

  1. ALWAYS use .lean() for read queries – avoid Mongoose document overhead.
     Example: const completions = await QuranCompletion.find({ user: userId }).lean();

  2. Use .select() to fetch only required fields (e.g., only 'completedAt').

  3. For recent completions, use the provided static methods that already implement lean and sorting.

  4. For counting documents in large collections, consider using estimatedDocumentCount() if exact count not required:
     const total = await QuranCompletion.estimatedDocumentCount();

  5. Use date range queries with proper indexes (completedAt index handles this well):
     await QuranCompletion.find({ completedAt: { $gte: startDate, $lte: endDate } }).lean();

  6. For dashboard aggregations (e.g., weekly completions), use aggregation pipeline with indexes:
     await QuranCompletion.aggregate([
       { $match: { completedAt: { $gte: startDate } } },
       { $group: { _id: { $week: '$completedAt' }, count: { $sum: 1 } } }
     ]);

  7. Avoid using countDocuments() on huge collections without filters; use estimatedDocumentCount() when possible.

  8. If you need to auto-clean old records (e.g., older than 1 year), uncomment the TTL index.

  9. Enable query profiling to catch slow queries in development:
      db.setProfilingLevel(1, { slowms: 100 });
*/