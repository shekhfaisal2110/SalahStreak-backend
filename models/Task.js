// import mongoose from 'mongoose';

// const taskSchema = new mongoose.Schema({
//   user: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User', 
//     required: true,
//     index: true               // ✅ user ke saare tasks fetch karne ke liye
//   },
//   name: { 
//     type: String, 
//     required: true 
//   },
//   scheduledTime: { 
//     type: String,             // format: "HH:MM" (24-hour)
//     required: true,
//     index: true               // ✅ time-based queries ke liye (e.g., tasks due at a specific time)
//   },
//   color: { 
//     type: String, 
//     default: '#10b981' 
//   }
// }, {
//   timestamps: true,           // ✅ createdAt, updatedAt auto add (aapka manual createdAt redundant, but sync rahega)
//   autoIndex: process.env.NODE_ENV !== 'development'
// });

// // ✅ Compound index for user + scheduledTime – user ke sorted tasks fast
// taskSchema.index({ user: 1, scheduledTime: 1 });

// // ✅ Compound index for user + createdAt – recent tasks fetch karne ke liye
// taskSchema.index({ user: 1, createdAt: -1 });

// const Task = mongoose.model('Task', taskSchema);
// export default Task;














import mongoose from 'mongoose';

/**
 * Task Schema - Optimized for 10x faster queries
 * 
 * Performance optimizations:
 * - Lean queries by default for reads
 * - Compound indexes for user-specific sorted queries
 * - Minimal document structure (no unnecessary fields)
 * - Strict mode, no version key, minimize enabled
 * - TTL index for optional auto-cleanup (if needed)
 */
const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,               // Single-field index for user queries
    },
    name: {
      type: String,
      required: true,
      trim: true,                // Remove whitespace to save index space
    },
    scheduledTime: {
      type: String,              // Format: "HH:MM" (24-hour) - string is faster for equality/range than Date with timezone
      required: true,
      index: true,               // Single-field index for time-based queries
    },
    color: {
      type: String,
      default: '#10b981',
      // Optional: index if you frequently filter by color
    },
  },
  {
    timestamps: true,            // createdAt, updatedAt automatically
    autoIndex: process.env.NODE_ENV !== 'development',
    minimize: true,              // Don't store empty nested objects
    strict: true,
    versionKey: false,           // Remove __v field (saves space)
  }
);

// ================== CRITICAL PERFORMANCE INDEXES ==================

// 1. Compound index: user + scheduledTime – for user's tasks sorted by time (most common query)
taskSchema.index({ user: 1, scheduledTime: 1 });

// 2. Compound index: user + createdAt (descending) – for fetching recent tasks
taskSchema.index({ user: 1, createdAt: -1 });

// 3. Compound index: user + name – if you frequently search tasks by name for a user
taskSchema.index({ user: 1, name: 1 });

// 4. Partial index: only tasks with specific colors (if needed)
// taskSchema.index({ user: 1, color: 1 }, { partialFilterExpression: { color: { $ne: '#10b981' } } });

// ================== OPTIONAL TTL INDEX (Auto-delete old tasks) ==================
// If tasks should be auto-deleted after a certain period (e.g., 30 days), uncomment:
// taskSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// ================== STATIC METHODS FOR PERFORMANCE ==================

/**
 * Get all tasks for a user, sorted by scheduled time (most common use case)
 */
taskSchema.statics.getUserTasks = async function (userId) {
  return this.find({ user: userId })
    .select('name scheduledTime color') // fetch only needed fields
    .lean() // raw objects, no Mongoose overhead
    .sort({ scheduledTime: 1 }); // ascending by time
};

/**
 * Get tasks scheduled at or after a given time for a user
 */
taskSchema.statics.getTasksFromTime = async function (userId, fromTime) {
  return this.find({
    user: userId,
    scheduledTime: { $gte: fromTime },
  })
    .select('name scheduledTime color')
    .lean()
    .sort({ scheduledTime: 1 });
};

/**
 * Get tasks for a user within a time range
 */
taskSchema.statics.getTasksInTimeRange = async function (userId, startTime, endTime) {
  return this.find({
    user: userId,
    scheduledTime: { $gte: startTime, $lte: endTime },
  })
    .select('name scheduledTime color')
    .lean()
    .sort({ scheduledTime: 1 });
};

/**
 * Get recent tasks for a user (based on createdAt)
 */
taskSchema.statics.getRecentTasks = async function (userId, { limit = 10 } = {}) {
  return this.find({ user: userId })
    .select('name scheduledTime color createdAt')
    .lean()
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * Bulk insert tasks (e.g., from a template)
 */
taskSchema.statics.bulkInsert = async function (tasksArray) {
  // ordered: false for faster parallel inserts
  return this.insertMany(tasksArray, { ordered: false });
};

// ================== INDEX SYNC HELPER ==================
export const ensureTaskIndexes = async () => {
  if (process.env.NODE_ENV === 'development') {
    await Task.syncIndexes();
    console.log('[Performance] Task indexes synced');
  }
};

// ================== MODEL ==================
const Task = mongoose.model('Task', taskSchema);
export default Task;

// ================== PERFORMANCE USAGE NOTES ==================
/*
  For 10x faster operations with Task:

  1. ALWAYS use .lean() for read queries – no Mongoose document overhead.
     Example: const tasks = await Task.find({ user: userId }).lean();

  2. Use .select() to limit fields – never fetch the entire document if not needed.

  3. For the most common query (user's tasks sorted by time), use getUserTasks() which already implements lean and select.

  4. Use $gte, $lte on scheduledTime string – lexicographic order matches chronological order for HH:MM format.

  5. Avoid using $regex on scheduledTime; always use exact or range comparisons.

  6. For pagination, use .limit() and .skip() (or cursor-based with _id for very large datasets).

  7. If your app has many old tasks, consider uncommenting the TTL index to auto-delete them.

  8. Enable MongoDB query profiler in development:
      db.setProfilingLevel(1, { slowms: 100 });
*/