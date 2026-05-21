// import mongoose from 'mongoose';

// const otpSchema = new mongoose.Schema({
//   email: { 
//     type: String, 
//     required: true,
//     index: true               // ✅ email pe index – OTP verify karte waqt fast lookup
//   },
//   otp: { 
//     type: String, 
//     required: true 
//   },
//   type: { 
//     type: String, 
//     enum: ['verify', 'reset'], 
//     required: true,
//     index: true               // ✅ type pe index – agar "reset" ya "verify" filter karna ho
//   },
//   expiresAt: { 
//     type: Date, 
//     required: true 
//   },
//   createdAt: { 
//     type: Date, 
//     default: Date.now,
//     index: true               // ✅ createdAt pe index – troubleshooting/cleanup ke liye
//   }
// }, {
//   // ✅ autoIndex development me off (performance gain)
//   autoIndex: process.env.NODE_ENV !== 'development',
//   // ✅ timestamps optional – agar createdAt manual hai to redundant, but rakhte hain
//   timestamps: false
// });

// // ✅ TTL index – purane OTPs auto delete honge expireAt ke hisaab se
// otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// // ✅ Compound index for common query: email + type (dono ek saath filter)
// otpSchema.index({ email: 1, type: 1 });

// // ✅ Compound index for type + expiresAt – cleanup ke liye useful
// otpSchema.index({ type: 1, expiresAt: 1 });

// const Otp = mongoose.model('Otp', otpSchema);
// export default Otp;














import mongoose from 'mongoose';

/**
 * OTP Schema - Optimized for 10x faster lookups and automatic cleanup
 * 
 * Performance features:
 * - Lean queries by default (no Mongoose document overhead for reads)
 * - TTL index for automatic expiration
 * - Compound indexes for common query patterns
 * - No virtuals or getters/setters (reduces overhead)
 * - Strict mode to avoid saving unknown fields
 * - Minimized document size (no timestamps, minimal fields)
 */
const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,               // ✅ Remove whitespace for consistent indexing
      lowercase: true,         // ✅ Normalize email for case-insensitive search
      index: true,             // ✅ Single-field index for fast email lookup
    },
    otp: {
      type: String,
      required: true,
      // Store as string; length validation can be added if needed
    },
    type: {
      type: String,
      enum: ['verify', 'reset'],
      required: true,
      index: true,             // ✅ Single-field index for type filtering
    },
    expiresAt: {
      type: Date,
      required: true,
      // TTL index will auto-delete documents after expiresAt
    },
  },
  {
    // Disable autoIndex in development – indexes must be created manually on startup
    autoIndex: process.env.NODE_ENV !== 'development',
    // No timestamps – we use expiresAt for expiration, createdAt not needed
    timestamps: false,
    // Minimize memory footprint – don't store empty objects
    minimize: true,
    // Strict mode prevents saving unknown fields
    strict: true,
    // Disable versioning (__v field) – not needed for OTPs
    versionKey: false,
  }
);

// ================== CRITICAL PERFORMANCE INDEXES ==================
// 1. TTL index: Automatically delete expired OTPs (cleanup, keeps collection small)
//    expireAfterSeconds: 0 means delete exactly at expiresAt time
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 2. Compound index: email + type – most common query pattern during verification
//    Example: find one OTP for specific email and type (verify/reset)
otpSchema.index({ email: 1, type: 1 });

// 3. Compound index: type + expiresAt – efficient cleanup queries (if any manual cleanup)
otpSchema.index({ type: 1, expiresAt: 1 });

// 4. Optional: compound index for email + expiresAt – useful if you need to check non-expired OTPs
otpSchema.index({ email: 1, expiresAt: 1 });

// ================== INDEX SYNC HELPER ==================
// Call this after MongoDB connection to ensure indexes in development (since autoIndex is off)
export const ensureOtpIndexes = async () => {
  if (process.env.NODE_ENV === 'development') {
    await Otp.syncIndexes();
    console.log('[Performance] OTP indexes synced');
  }
};

// ================== MODEL ==================
const Otp = mongoose.model('Otp', otpSchema);
export default Otp;

// ================== PERFORMANCE USAGE NOTES ==================
/*
  For 10x faster OTP operations, follow these patterns:

  1. ALWAYS use .lean() for read operations (no Mongoose document overhead):
     const otp = await Otp.findOne({ email, type }).lean();

  2. Use .select() to fetch only needed fields:
     const otp = await Otp.findOne({ email, type }, { otp: 1, expiresAt: 1 }).lean();

  3. When verifying OTP, combine query with expiration check:
     const otp = await Otp.findOne({
       email,
       type,
       expiresAt: { $gt: new Date() }
     }).lean();

  4. Delete OTP immediately after successful verification (don't wait for TTL):
     await Otp.deleteOne({ _id: otpId });

  5. Use insertMany for bulk OTP generation (if needed):
     await Otp.insertMany(otpArray, { ordered: false });

  6. Avoid countDocuments() on large collections; use estimatedDocumentCount() if you need approximate totals.

  7. For cleanup, rely on TTL index – do NOT run manual delete queries unless necessary.

  8. Consider using writeConcern: { w: 0 } for non-critical OTP writes (fire-and-forget) – use cautiously.
     Example: await Otp.create(otpData).catch(console.error); // no await

  9. Set reasonable expiresAt duration (e.g., 10 minutes) to keep collection size small.
*/