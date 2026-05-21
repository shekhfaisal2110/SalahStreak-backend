// import mongoose from 'mongoose';

// // ----------------- PageView Schema -----------------
// const pageViewSchema = new mongoose.Schema({
//   userId: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User', 
//     default: null,
//     index: true               // ✅ userId pe index – agar user-based query karte ho
//   },
//   route: { 
//     type: String, 
//     required: true,
//     index: true               // ✅ route pe index – frequently filter hota hai
//   },
//   timestamp: { 
//     type: Date, 
//     default: Date.now,
//     index: true               // ✅ timestamp pe index – sorting/range queries ke liye
//   },
//   ip: { type: String },
//   userAgent: { type: String },
// }, {
//   timestamps: true,           // ✅ createdAt, updatedAt auto-add (optional)
//   // development me autoIndex off karo for better write performance
//   autoIndex: process.env.NODE_ENV !== 'development'
// });

// // ✅ Compound index: route + timestamp – agar dono ek saath query me aate hain
// pageViewSchema.index({ route: 1, timestamp: -1 });

// // ✅ Compound index: userId + timestamp – user ki activities timeline
// pageViewSchema.index({ userId: 1, timestamp: -1 });

// // ----------------- Event Schema -----------------
// const eventSchema = new mongoose.Schema({
//   userId: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User', 
//     default: null,
//     index: true
//   },
//   eventType: { 
//     type: String, 
//     required: true,
//     index: true
//   },
//   metadata: { type: Object },   // ⚠️ metadata me heavy data mat dalna, otherwise slow
//   timestamp: { 
//     type: Date, 
//     default: Date.now,
//     index: true
//   },
// }, {
//   timestamps: true,
//   autoIndex: process.env.NODE_ENV !== 'development'
// });

// // ✅ Compound index: eventType + timestamp – analytics queries fast hongi
// eventSchema.index({ eventType: 1, timestamp: -1 });

// // ✅ Compound index: userId + eventType – specific user ke events
// eventSchema.index({ userId: 1, eventType: 1 });

// export const PageView = mongoose.model('PageView', pageViewSchema);
// export const Event = mongoose.model('Event', eventSchema);













import mongoose from 'mongoose';

// ------------------ PERFORMANCE OPTIMIZED PageView Schema ------------------
// High-write throughput schema with minimal overhead and proper indexing

const pageViewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true, // Single-field index for user-based queries
    },
    route: {
      type: String,
      required: true,
      index: true, // Single-field index for route filtering
    },
    ip: {
      type: String,
      // Optional: limit length to save index space
      maxlength: 45, // IPv6 max length
    },
    userAgent: {
      type: String,
      maxlength: 500,
    },
  },
  {
    // Use timestamps to automatically manage createdAt/updatedAt
    timestamps: true,
    // Disable autoIndex in development – indexes must be created manually (see below)
    autoIndex: process.env.NODE_ENV !== 'development',
    // Minimize memory overhead by not storing empty objects
    minimize: true,
    // Use lean subdocuments (no unnecessary getters/setters) – not applicable at schema level
    // Strict mode to avoid saving unknown fields
    strict: true,
  }
);

// ================== CRITICAL PERFORMANCE INDEXES ==================
// Compound indexes for most common query patterns

// 1. Route + createdAt (descending) – for dashboard "recent page views by route"
pageViewSchema.index({ route: 1, createdAt: -1 });

// 2. UserId + createdAt – for user activity timeline
pageViewSchema.index({ userId: 1, createdAt: -1 });

// 3. Single-field createdAt – for date range queries and TTL cleanup
pageViewSchema.index({ createdAt: 1 });

// 4. Compound for aggregated analytics (route + userId)
pageViewSchema.index({ route: 1, userId: 1 });

// ---------- TTL INDEX: Automatically delete old page views after 30 days ----------
// Keeps collection size small, drastically improves query performance
pageViewSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 } // 30 days
);

// ------------------ PERFORMANCE OPTIMIZED Event Schema ------------------
const eventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    metadata: {
      type: Object,
      // Warn: keep metadata small (< 1KB) for performance
      // Use { select: false } if rarely accessed
    },
  },
  {
    timestamps: true,
    autoIndex: process.env.NODE_ENV !== 'development',
    minimize: true,
    strict: true,
  }
);

// ================== EVENT INDEXES ==================
// 1. EventType + createdAt – for time-series analytics
eventSchema.index({ eventType: 1, createdAt: -1 });

// 2. UserId + eventType – for user-specific event tracking
eventSchema.index({ userId: 1, eventType: 1 });

// 3. UserId + createdAt – for user event timeline
eventSchema.index({ userId: 1, createdAt: -1 });

// 4. Single-field createdAt for date range and TTL
eventSchema.index({ createdAt: 1 });

// TTL: Delete events older than 60 days (events may be less critical than page views)
eventSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 24 * 60 * 60 } // 60 days
);

// ================== HELPER: Ensure indexes on application startup ==================
// Call this function after MongoDB connection is established
// This is mandatory when autoIndex is false in development.
export const ensureIndexes = async () => {
  if (process.env.NODE_ENV === 'development') {
    await Promise.all([
      PageView.syncIndexes(),
      Event.syncIndexes(),
    ]);
    console.log('[Performance] All indexes synced (PageView, Event)');
  }
};

// ================== EXPORT MODELS ==================
export const PageView = mongoose.model('PageView', pageViewSchema);
export const Event = mongoose.model('Event', eventSchema);

// ================== USAGE NOTES FOR 10x FASTER QUERIES ==================
/*
 1. ALWAYS use `.lean()` for read-only queries (no Mongoose document overhead).
    Example: await PageView.find({ route: '/home' }).lean()

 2. Use `.select()` to fetch only required fields.
    Example: await PageView.find({}, { route: 1, createdAt: 1 }).lean()

 3. For bulk inserts (e.g., tracking events), use `insertMany()` with `ordered: false`.
    Example: await Event.insertMany(eventsArray, { ordered: false })

 4. For real-time counts, use estimatedDocumentCount() instead of countDocuments().
    Example: const total = await PageView.estimatedDocumentCount()

 5. For analytics aggregations, use MongoDB's aggregation pipeline with indexes.
    Example:
    await PageView.aggregate([
      { $match: { route: '/home', createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])

 6. Never use `find()` without filters on large collections – use pagination with `limit()` and `skip()` or `cursor()`.

 7. Enable MongoDB's query profiler in development to catch slow queries:
    db.setProfilingLevel(1, { slowms: 100 })
*/