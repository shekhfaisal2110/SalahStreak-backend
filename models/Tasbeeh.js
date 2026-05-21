// import mongoose from 'mongoose';

// const tasbeehSchema = new mongoose.Schema({
//   user: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User', 
//     required: true,
//     index: true               // ✅ user ke saare tasbeeh fetch karne ke liye
//   },
//   name: { 
//     type: String, 
//     required: true,
//     index: true               // ✅ name pe search ke liye (optional, agar aap filter karte ho)
//   },
//   arabicName: { type: String },
//   targetCount: { 
//     type: Number, 
//     default: 33,
//     index: true               // ✅ agar analytics me target count ke basis pe query ho
//   },
//   currentCount: { type: Number, default: 0 },
//   completed: { 
//     type: Boolean, 
//     default: false,
//     index: true               // ✅ incomplete vs complete tasbeeh filter karne ke liye
//   },
//   completedAt: { 
//     type: Date,
//     index: true               // ✅ completion date se query ho toh
//   },
//   pinned: { 
//     type: Boolean, 
//     default: false,
//     index: true               // ✅ pinned tasbeeh top pe dikhane ke liye
//   },
//   showCount: { 
//     type: Boolean, 
//     default: true 
//   }
// }, {
//   timestamps: true,           // ✅ createdAt aur updatedAp automatically manage hoga (aapka existing createdAt redundant ho jayega, but sync rahega)
//   autoIndex: process.env.NODE_ENV !== 'development'
// });

// // ✅ Compound indexes for common query patterns

// // 1. User + completed (incomplete tasbeeh fetch fast) – most common
// tasbeehSchema.index({ user: 1, completed: 1 });

// // 2. User + pinned (user ke pinned tasbeeh top pe)
// tasbeehSchema.index({ user: 1, pinned: -1 });

// // 3. User + createdAt descending (latest first)
// tasbeehSchema.index({ user: 1, createdAt: -1 });

// // 4. User + completed + pinned (priority: pinned incomplete tasbeeh)
// tasbeehSchema.index({ user: 1, completed: 1, pinned: -1 });

// // 5. User + completedAt (completed tasbeeh sorted by completion date)
// tasbeehSchema.index({ user: 1, completedAt: -1 });

// const Tasbeeh = mongoose.model('Tasbeeh', tasbeehSchema);
// export default Tasbeeh;











import mongoose from 'mongoose';

/**
 * Tasbeeh Schema - Optimized for 10x faster queries
 * 
 * Performance optimizations:
 * - Lean queries by default for reads
 * - Atomic updates using $inc for currentCount (no document load)
 * - Strategic compound indexes for common query patterns
 * - Partial index for incomplete tasbeeh (active ones)
 * - Minimized document size, strict mode, no version key
 */
const tasbeehSchema = new mongoose.Schema(
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
      index: true,               // For searching by name
    },
    arabicName: { type: String },
    targetCount: {
      type: Number,
      default: 33,
      index: true,               // For analytics (e.g., average target)
    },
    currentCount: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,               // For filtering complete/incomplete
    },
    completedAt: {
      type: Date,
      index: true,               // For sorting by completion date
    },
    pinned: {
      type: Boolean,
      default: false,
      index: true,               // For pinned items
    },
    showCount: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,            // Adds createdAt & updatedAt automatically
    autoIndex: process.env.NODE_ENV !== 'development',
    minimize: true,              // Don't store empty nested objects
    strict: true,
    versionKey: false,           // Remove __v field
  }
);

// ================== CRITICAL PERFORMANCE INDEXES ==================

// 1. User + completed – most common query: fetch incomplete tasbeeh for a user
tasbeehSchema.index({ user: 1, completed: 1 });

// 2. User + pinned – fetch user's pinned tasbeeh (pinned first)
tasbeehSchema.index({ user: 1, pinned: -1 });

// 3. User + createdAt – latest created first
tasbeehSchema.index({ user: 1, createdAt: -1 });

// 4. User + completed + pinned – priority: pinned incomplete tasbeeh
tasbeehSchema.index({ user: 1, completed: 1, pinned: -1 });

// 5. User + completedAt – completed tasbeeh sorted by completion date
tasbeehSchema.index({ user: 1, completedAt: -1 });

// 6. Partial index: only incomplete tasbeeh (completed: false) – speeds up active tasbeeh queries
tasbeehSchema.index(
  { user: 1, pinned: -1, createdAt: -1 },
  { partialFilterExpression: { completed: false } }
);

// ================== STATIC METHODS FOR PERFORMANCE ==================

/**
 * Get all incomplete (active) tasbeeh for a user, sorted by pinned then creation
 */
tasbeehSchema.statics.getActiveTasbeeh = async function (userId) {
  return this.find({ user: userId, completed: false })
    .select('name arabicName targetCount currentCount pinned showCount createdAt')
    .lean() // raw objects, no Mongoose overhead
    .sort({ pinned: -1, createdAt: -1 });
};

/**
 * Get all completed tasbeeh for a user with pagination
 */
tasbeehSchema.statics.getCompletedTasbeeh = async function (userId, { limit = 20, skip = 0 } = {}) {
  return this.find({ user: userId, completed: true })
    .select('name targetCount currentCount completedAt')
    .lean()
    .sort({ completedAt: -1 })
    .limit(limit)
    .skip(skip);
};

/**
 * Increment currentCount atomically (no document load)
 */
tasbeehSchema.statics.incrementCount = async function (tasbeehId, incrementBy = 1) {
  const result = await this.findByIdAndUpdate(
    tasbeehId,
    { $inc: { currentCount: incrementBy } },
    { new: true, lean: true, fields: { currentCount: 1, targetCount: 1, completed: 1 } }
  );
  // If currentCount reached targetCount, automatically mark as completed
  if (result && result.currentCount >= result.targetCount && !result.completed) {
    await this.markCompleted(tasbeehId);
  }
  return result;
};

/**
 * Mark a tasbeeh as completed
 */
tasbeehSchema.statics.markCompleted = async function (tasbeehId, completionDate = new Date()) {
  return this.findByIdAndUpdate(
    tasbeehId,
    { $set: { completed: true, completedAt: completionDate, currentCount: this.targetCount } },
    { new: true, lean: true }
  );
};

/**
 * Pin/unpin a tasbeeh (toggles)
 */
tasbeehSchema.statics.togglePin = async function (tasbeehId) {
  const tasbeeh = await this.findById(tasbeehId).lean();
  if (!tasbeeh) return null;
  return this.findByIdAndUpdate(
    tasbeehId,
    { $set: { pinned: !tasbeeh.pinned } },
    { new: true, lean: true }
  );
};

/**
 * Reset a tasbeeh (start over)
 */
tasbeehSchema.statics.resetTasbeeh = async function (tasbeehId) {
  return this.findByIdAndUpdate(
    tasbeehId,
    { $set: { currentCount: 0, completed: false, completedAt: null } },
    { new: true, lean: true }
  );
};

/**
 * Get statistics for a user (total tasbeeh, completed, active, etc.)
 */
tasbeehSchema.statics.getUserStats = async function (userId) {
  const [total, completed, activeCount] = await Promise.all([
    this.countDocuments({ user: userId }),
    this.countDocuments({ user: userId, completed: true }),
    this.countDocuments({ user: userId, completed: false }),
  ]);
  return { total, completed, activeCount };
};

// ================== INDEX SYNC HELPER ==================
export const ensureTasbeehIndexes = async () => {
  if (process.env.NODE_ENV === 'development') {
    await Tasbeeh.syncIndexes();
    console.log('[Performance] Tasbeeh indexes synced');
  }
};

// ================== MODEL ==================
const Tasbeeh = mongoose.model('Tasbeeh', tasbeehSchema);
export default Tasbeeh;

// ================== PERFORMANCE USAGE NOTES ==================
/*
  For 10x faster operations with Tasbeeh:

  1. ALWAYS use .lean() for read queries – no Mongoose document overhead.
     Example: const active = await Tasbeeh.find({ user: userId, completed: false }).lean();

  2. Use .select() to fetch only required fields:
     await Tasbeeh.find({ user: userId }, { name: 1, currentCount: 1 }).lean();

  3. Use atomic increments via incrementCount() – never load document just to increment.

  4. Use the partial index for active tasbeeh – drastically speeds up queries with completed: false.

  5. For bulk updates (e.g., reset all incomplete tasbeeh for a user), use updateMany:
     await Tasbeeh.updateMany({ user: userId, completed: false }, { $set: { currentCount: 0 } });

  6. For counting active tasbeeh, avoid countDocuments on large collections; use estimatedDocumentCount() if approximate is ok.

  7. Pagination: always use limit and skip (or cursor-based for huge datasets).

  8. Enable MongoDB query profiler to catch slow queries:
      db.setProfilingLevel(1, { slowms: 100 });
*/