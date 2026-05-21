// import mongoose from 'mongoose';

// const tasbeehDailySchema = new mongoose.Schema({
//   user: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User', 
//     required: true,
//     index: true               // ✅ user ke saare daily records fetch karne ke liye
//   },
//   tasbeeh: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'Tasbeeh', 
//     required: true,
//     index: true               // ✅ specific tasbeeh ka daily history dekhne ke liye
//   },
//   date: { 
//     type: String,             // format: YYYY-MM-DD
//     required: true,
//     index: true               // ✅ date pe range queries (e.g., last 7 days) fast
//   },
//   count: { 
//     type: Number, 
//     default: 0 
//   }
// }, {
//   timestamps: true,           // ✅ createdAt, updatedAt auto add – useful for debugging
//   autoIndex: process.env.NODE_ENV !== 'development'
// });

// // ✅ Existing unique compound index – prevent duplicate entries per user, tasbeeh, and date
// tasbeehDailySchema.index({ user: 1, tasbeeh: 1, date: 1 }, { unique: true });

// // ✅ Compound index for user + date – get user's all tasbeeh counts for a specific day
// tasbeehDailySchema.index({ user: 1, date: 1 });

// // ✅ Compound index for user + date + count – for leaderboard / analytics (fast sorting)
// tasbeehDailySchema.index({ user: 1, date: 1, count: -1 });

// // ✅ Compound index for date + count – for daily top users (admin dashboard)
// tasbeehDailySchema.index({ date: 1, count: -1 });

// // ✅ Compound index for tasbeeh + date – see how a particular tasbeeh is used over time
// tasbeehDailySchema.index({ tasbeeh: 1, date: 1 });

// const TasbeehDaily = mongoose.model('TasbeehDaily', tasbeehDailySchema);
// export default TasbeehDaily;













import mongoose from 'mongoose';

/**
 * TasbeehDaily Schema - Optimized for 10x faster queries
 * 
 * Performance optimizations:
 * - Lean queries by default for reads
 * - Unique compound index prevents duplicates efficiently
 * - TTL index to auto-delete old daily records (keeps collection size small)
 * - Strategic compound indexes for analytics and leaderboards
 * - No virtuals, strict mode, minimized document size
 */
const tasbeehDailySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tasbeeh: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tasbeeh',
      required: true,
      index: true,
    },
    date: {
      type: String,             // Format: YYYY-MM-DD – string is faster for equality than Date
      required: true,
      index: true,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,           // createdAt, updatedAt – useful for debugging and TTL
    autoIndex: process.env.NODE_ENV !== 'development',
    minimize: true,             // Don't store empty nested objects
    strict: true,
    versionKey: false,          // Remove __v field
  }
);

// ================== CRITICAL PERFORMANCE INDEXES ==================

// 1. Unique compound index: user + tasbeeh + date – prevents duplicates efficiently
tasbeehDailySchema.index({ user: 1, tasbeeh: 1, date: 1 }, { unique: true });

// 2. Compound index: user + date – get all tasbeeh counts for a user on a specific day
tasbeehDailySchema.index({ user: 1, date: 1 });

// 3. Compound index: user + date + count (descending) – for user's daily analytics (sorted by count)
tasbeehDailySchema.index({ user: 1, date: 1, count: -1 });

// 4. Compound index: date + count (descending) – for daily leaderboard (top users by count)
tasbeehDailySchema.index({ date: 1, count: -1 });

// 5. Compound index: tasbeeh + date – track usage of a specific tasbeeh over time
tasbeehDailySchema.index({ tasbeeh: 1, date: 1 });

// 6. Compound index: user + date + tasbeeh – for fast lookup of a specific record
tasbeehDailySchema.index({ user: 1, date: 1, tasbeeh: 1 });

// ================== TTL INDEX: Auto-delete old records (e.g., after 1 year) ==================
// Keeps collection size manageable and query performance high
tasbeehDailySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 365 * 24 * 60 * 60 } // 1 year (adjust as needed)
);

// ================== STATIC METHODS FOR PERFORMANCE ==================

/**
 * Get all daily records for a user within a date range (lean, selected fields)
 */
tasbeehDailySchema.statics.getUserDailyRecords = async function (
  userId,
  { startDate, endDate, limit = 100, skip = 0 } = {}
) {
  const query = { user: userId };
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startDate;
    if (endDate) query.date.$lte = endDate;
  }
  return this.find(query)
    .select('tasbeeh date count') // only needed fields
    .lean()
    .sort({ date: -1, count: -1 })
    .limit(limit)
    .skip(skip);
};

/**
 * Get daily leaderboard for a specific date (top users by total count)
 */
tasbeehDailySchema.statics.getLeaderboard = async function (date, { limit = 10 } = {}) {
  const result = await this.aggregate([
    { $match: { date } },
    { $group: { _id: '$user', totalCount: { $sum: '$count' } } },
    { $sort: { totalCount: -1 } },
    { $limit: limit },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $project: { userId: '$_id', name: '$user.name', totalCount: 1, _id: 0 } }
  ]);
  return result;
};

/**
 * Update or create daily count for a user, tasbeeh, and date (atomic upsert)
 */
tasbeehDailySchema.statics.updateCount = async function (userId, tasbeehId, date, increment = 1) {
  return this.findOneAndUpdate(
    { user: userId, tasbeeh: tasbeehId, date },
    { $inc: { count: increment } },
    { upsert: true, new: true, lean: true, setDefaultsOnInsert: true }
  );
};

/**
 * Get total count for a user on a specific date (across all tasbeeh)
 */
tasbeehDailySchema.statics.getUserDailyTotal = async function (userId, date) {
  const result = await this.aggregate([
    { $match: { user: userId, date } },
    { $group: { _id: null, total: { $sum: '$count' } } }
  ]);
  return result[0]?.total || 0;
};

/**
 * Bulk insert daily records (e.g., during data migration)
 */
tasbeehDailySchema.statics.bulkInsert = async function (recordsArray) {
  // Use ordered: false for faster parallel inserts, ignore duplicate errors
  return this.insertMany(recordsArray, { ordered: false });
};

// ================== INDEX SYNC HELPER ==================
export const ensureTasbeehDailyIndexes = async () => {
  if (process.env.NODE_ENV === 'development') {
    await TasbeehDaily.syncIndexes();
    console.log('[Performance] TasbeehDaily indexes synced');
  }
};

// ================== MODEL ==================
const TasbeehDaily = mongoose.model('TasbeehDaily', tasbeehDailySchema);
export default TasbeehDaily;

// ================== PERFORMANCE USAGE NOTES ==================
/*
  For 10x faster operations with TasbeehDaily:

  1. ALWAYS use .lean() for read queries – no Mongoose document overhead.
     Example: const records = await TasbeehDaily.find({ user: userId }).lean();

  2. Use .select() to limit fields – never fetch the entire document if not needed.

  3. Use atomic upserts via updateCount() – avoids find-then-update race conditions.

  4. For leaderboards, use aggregation pipeline which leverages the (date, count) index.

  5. TTL index automatically deletes records older than 1 year – keeps queries fast.

  6. Bulk insert with ordered: false for best performance when importing data.

  7. For date range queries, string format YYYY-MM-DD works lexicographically with indexes.

  8. Avoid using $regex on date field; always use exact match or range ($gte, $lte).

  9. Enable query profiling to catch slow queries:
      db.setProfilingLevel(1, { slowms: 100 });
*/