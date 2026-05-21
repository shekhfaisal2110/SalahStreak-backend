// import mongoose from 'mongoose';

// const prayerGroupSchema = new mongoose.Schema({
//   name: { 
//     type: String, 
//     required: true,
//     index: true               // ✅ name pe index – agar group name se search karna ho
//   },
//   area: { 
//     type: String, 
//     required: true,
//     index: true               // ✅ area pe index – location-based search fast
//   },
//   pincode: { 
//     type: String, 
//     required: true,
//     index: true               // ✅ pincode pe index – exact location filter
//   },
//   pinned: { 
//     type: Boolean, 
//     default: false,
//     index: true               // ✅ pinned pe index – featured groups quick fetch
//   },
//   times: {
//     Fajr: {
//       azan: { type: String, default: '' },
//       jamaat: { type: String, default: '' }
//     },
//     Dhuhr: {
//       azan: { type: String, default: '' },
//       jamaat: { type: String, default: '' }
//     },
//     Asr: {
//       azan: { type: String, default: '' },
//       jamaat: { type: String, default: '' }
//     },
//     Maghrib: {
//       azan: { type: String, default: '' },
//       jamaat: { type: String, default: '' }
//     },
//     Isha: {
//       azan: { type: String, default: '' },
//       jamaat: { type: String, default: '' }
//     },
//     Jumma: {
//       azan: { type: String, default: '' },
//       jamaat: { type: String, default: '' }
//     },
//     Sehri: { type: String, default: '' },
//     Iftar: { type: String, default: '' }
//   },
//   createdBy: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User', 
//     required: true,
//     index: true               // ✅ createdBy pe index – user ke groups find karne ke liye
//   },
//   updatedBy: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User' 
//   },
//   updateHistory: [{
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     userName: { type: String },
//     updatedAt: { type: Date, default: Date.now }
//   }]
// }, {
//   // ✅ timestamps: true se automatically createdAt & updatedAt manage honge
//   timestamps: true,
//   // ✅ autoIndex off in development for write performance
//   autoIndex: process.env.NODE_ENV !== 'development'
// });

// // ✅ Compound indexes for common search patterns

// // 1. Search by pincode + pinned (user wants pinned groups in an area)
// prayerGroupSchema.index({ pincode: 1, pinned: -1 });

// // 2. Search by area + name (text search ke liye)
// prayerGroupSchema.index({ area: 1, name: 1 });

// // 3. Latest updated groups (dashboard)
// prayerGroupSchema.index({ updatedAt: -1 });

// // 4. createdBy + updatedAt (user's own groups, sorted by recent)
// prayerGroupSchema.index({ createdBy: 1, updatedAt: -1 });

// // 5. Compound index for geo-location like queries (pincode + area)
// prayerGroupSchema.index({ pincode: 1, area: 1 });

// prayerGroupSchema.index({ name: 1, area: 1 });

// // Optional: Text index for name and area search (if full-text search needed)
// prayerGroupSchema.index({ name: 'text', area: 'text' });

// const PrayerGroup = mongoose.model('PrayerGroup', prayerGroupSchema);
// export default PrayerGroup;












import mongoose from 'mongoose';

/**
 * PrayerGroup Schema - Optimized for 10x faster queries
 * 
 * Performance optimizations:
 * - Lean queries by default for reads
 * - Strategic compound indexes for common search patterns
 * - Minimal document size (avoid deep nesting where possible)
 * - Pagination using limit + skip (or cursor-based)
 * - No virtuals or getters/setters (reduces overhead)
 * - Text index for name+area search (optional but powerful)
 * - Strict mode to avoid saving unknown fields
 */
const prayerGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,               // Single-field index for exact name matches
    },
    area: {
      type: String,
      required: true,
      trim: true,
      index: true,               // Single-field index for area-based queries
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      index: true,               // Single-field index for exact pincode queries
    },
    pinned: {
      type: Boolean,
      default: false,
      index: true,               // Single-field index for pinned groups
    },
    times: {
      Fajr: {
        azan: { type: String, default: '' },
        jamaat: { type: String, default: '' },
      },
      Dhuhr: {
        azan: { type: String, default: '' },
        jamaat: { type: String, default: '' },
      },
      Asr: {
        azan: { type: String, default: '' },
        jamaat: { type: String, default: '' },
      },
      Maghrib: {
        azan: { type: String, default: '' },
        jamaat: { type: String, default: '' },
      },
      Isha: {
        azan: { type: String, default: '' },
        jamaat: { type: String, default: '' },
      },
      Jumma: {
        azan: { type: String, default: '' },
        jamaat: { type: String, default: '' },
      },
      Sehri: { type: String, default: '' },
      Iftar: { type: String, default: '' },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updateHistory: {
      type: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          userName: { type: String },
          updatedAt: { type: Date, default: Date.now },
        },
      ],
      // Limit history size to prevent unbounded array growth
      default: [],
      // Use `select: false` if rarely accessed, otherwise keep but limit via schema
    },
  },
  {
    timestamps: true, // Automatically adds createdAt & updatedAt
    autoIndex: process.env.NODE_ENV !== 'development',
    minimize: true,   // Don't store empty nested objects
    strict: true,
    versionKey: false, // Remove __v field (saves space)
  }
);

// ================== CRITICAL PERFORMANCE INDEXES ==================

// 1. Pincode + pinned – most common query: "show pinned groups in this pincode"
prayerGroupSchema.index({ pincode: 1, pinned: -1 });

// 2. Area + name – for search by area and group name together
prayerGroupSchema.index({ area: 1, name: 1 });

// 3. UpdatedAt descending – for "recently updated groups" dashboard
prayerGroupSchema.index({ updatedAt: -1 });

// 4. CreatedBy + updatedAt – for user's own groups sorted by recency
prayerGroupSchema.index({ createdBy: 1, updatedAt: -1 });

// 5. Pincode + area – for hierarchical filtering (area within pincode)
prayerGroupSchema.index({ pincode: 1, area: 1 });

// 6. Name + area – for searches where both are provided (e.g., "Central Mosque" + "Delhi")
prayerGroupSchema.index({ name: 1, area: 1 });

// 7. Pinned + updatedAt – for featured groups sorted by freshness
prayerGroupSchema.index({ pinned: 1, updatedAt: -1 });

// 8. Text index: name and area (supports $text search)
prayerGroupSchema.index({ name: 'text', area: 'text' }, {
  weights: { name: 10, area: 5 }, // name is more important
  name: 'group_text_index',
});

// ================== STATIC METHODS FOR PERFORMANCE ==================

/**
 * Search groups by pincode with optional pinned filter and pagination
 */
prayerGroupSchema.statics.findByPincode = async function (
  pincode,
  { pinnedOnly = false, limit = 20, skip = 0 } = {}
) {
  const query = { pincode };
  if (pinnedOnly) query.pinned = true;
  return this.find(query)
    .select('name area pincode pinned times updatedAt') // fetch only needed fields
    .lean() // raw objects – no Mongoose overhead
    .sort({ pinned: -1, updatedAt: -1 }) // pinned first, then recent
    .limit(limit)
    .skip(skip);
};

/**
 * Search groups by area with text search or prefix match
 */
prayerGroupSchema.statics.searchByArea = async function (
  areaQuery,
  { limit = 20, skip = 0, useTextSearch = false } = {}
) {
  if (useTextSearch) {
    return this.find({ $text: { $search: areaQuery } })
      .select('name area pincode pinned times')
      .lean()
      .sort({ score: { $meta: 'textScore' }, pinned: -1 })
      .limit(limit)
      .skip(skip);
  } else {
    // Regex prefix search (fast with index on area)
    return this.find({ area: { $regex: `^${areaQuery}`, $options: 'i' } })
      .select('name area pincode pinned times')
      .lean()
      .sort({ pinned: -1, name: 1 })
      .limit(limit)
      .skip(skip);
  }
};

/**
 * Get groups created by a specific user with pagination
 */
prayerGroupSchema.statics.getUserGroups = async function (userId, { limit = 20, skip = 0 } = {}) {
  return this.find({ createdBy: userId })
    .select('name area pincode pinned times updatedAt')
    .lean()
    .sort({ updatedAt: -1 })
    .limit(limit)
    .skip(skip);
};

/**
 * Get pinned groups globally (for homepage) with pagination
 */
prayerGroupSchema.statics.getPinnedGroups = async function ({ limit = 20, skip = 0 } = {}) {
  return this.find({ pinned: true })
    .select('name area pincode times updatedAt')
    .lean()
    .sort({ updatedAt: -1 })
    .limit(limit)
    .skip(skip);
};

/**
 * Update group timings efficiently (partial update)
 */
prayerGroupSchema.statics.updateTimings = async function (groupId, prayerName, azan, jamaat) {
  const update = {};
  if (azan !== undefined) update[`times.${prayerName}.azan`] = azan;
  if (jamaat !== undefined) update[`times.${prayerName}.jamaat`] = jamaat;
  return this.findByIdAndUpdate(groupId, { $set: update }, { new: true, lean: true });
};

/**
 * Add update history entry (push with $slice to limit array size)
 */
prayerGroupSchema.statics.addUpdateHistory = async function (groupId, user) {
  return this.findByIdAndUpdate(
    groupId,
    {
      $push: {
        updateHistory: {
          $each: [{ user: user._id, userName: user.name, updatedAt: new Date() }],
          $slice: -20, // keep only last 20 updates
        },
      },
    },
    { new: false, lean: true } // don't need the updated doc
  );
};

// ================== INDEX SYNC HELPER ==================
export const ensurePrayerGroupIndexes = async () => {
  if (process.env.NODE_ENV === 'development') {
    await PrayerGroup.syncIndexes();
    console.log('[Performance] PrayerGroup indexes synced');
  }
};

// ================== MODEL ==================
const PrayerGroup = mongoose.model('PrayerGroup', prayerGroupSchema);
export default PrayerGroup;

// ================== PERFORMANCE USAGE NOTES ==================
/*
  For 10x faster operations with PrayerGroup:

  1. ALWAYS use .lean() for read queries – no Mongoose document overhead.
     Example: const groups = await PrayerGroup.find({ pincode: '110001' }).lean();

  2. Use .select() to fetch only required fields (never fetch entire document unnecessarily):
     await PrayerGroup.find({}, { name: 1, area: 1 }).lean();

  3. For pagination, use .limit() and .skip() (or cursor-based with _id for large datasets).

  4. For text search, enable $text index and use $text query:
     await PrayerGroup.find({ $text: { $search: 'mosque delhi' } })
       .select({ score: { $meta: 'textScore' } })
       .sort({ score: { $meta: 'textScore' } });

  5. For bulk updates, use updateMany with $set (avoid loading documents):
     await PrayerGroup.updateMany({ area: 'Old City' }, { $set: { pinned: true } });

  6. Limit updateHistory array size using $slice to prevent unbounded growth.

  7. Use the provided static methods which already implement lean and field selection.

  8. For real-time dashboard, consider pre-aggregated counts (e.g., total groups per pincode) in a separate collection.

  9. Avoid regex that starts with '^' is fast; avoid '.*' patterns which can't use indexes.

  10. Enable MongoDB query profiler to catch slow queries:
      db.setProfilingLevel(1, { slowms: 100 })
*/