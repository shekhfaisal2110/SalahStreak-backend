// import mongoose from 'mongoose';

// const prayerEntrySchema = new mongoose.Schema({
//   user: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User', 
//     required: true,
//     index: true               // ✅ user pe index – user-specific queries fast
//   },
//   date: { 
//     type: String,             // YYYY-MM-DD format
//     required: true,
//     index: true               // ✅ date pe index – range queries (e.g., last 7 days) fast
//   },
//   prayers: {
//     Fajr: { type: Boolean, default: false },
//     Dhuhr: { type: Boolean, default: false },
//     Asr: { type: Boolean, default: false },
//     Maghrib: { type: Boolean, default: false },
//     Isha: { type: Boolean, default: false },
//   },
//   createdAt: { 
//     type: Date, 
//     default: Date.now,
//     index: true               // ✅ optional – if you ever clean up old entries
//   }
// }, {
//   // ✅ autoIndex off in development for better write performance
//   autoIndex: process.env.NODE_ENV !== 'development',
//   // ✅ timestamps: true se createdAt & updatedAt automatically manage ho jayenge
//   // but aapne manually createdAt dala hai, isliye timestamps false rakhte hain
//   timestamps: false
// });

// // ✅ Unique compound index – ensure one entry per user per date
// prayerEntrySchema.index({ user: 1, date: 1 }, { unique: true });

// // ✅ Compound index for user + createdAt – agar pagination by date chahiye
// prayerEntrySchema.index({ user: 1, createdAt: -1 });

// // ✅ Compound index for date range queries (e.g., admin dashboard)
// prayerEntrySchema.index({ date: 1, user: 1 });

// const PrayerEntry = mongoose.model('PrayerEntry', prayerEntrySchema);
// export default PrayerEntry;














import mongoose from 'mongoose';

const prayerEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true, index: true },
    prayers: {
      Fajr: { type: Boolean, default: false },
      Dhuhr: { type: Boolean, default: false },
      Asr: { type: Boolean, default: false },
      Maghrib: { type: Boolean, default: false },
      Isha: { type: Boolean, default: false },
    },
    createdAt: { type: Date, default: Date.now }, // no index: true
  },
  {
    autoIndex: process.env.NODE_ENV !== 'development',
    timestamps: false,
    minimize: true,
    strict: true,
    versionKey: false,
  }
);

prayerEntrySchema.index({ user: 1, date: 1 }, { unique: true });
prayerEntrySchema.index({ user: 1, date: -1 });
prayerEntrySchema.index({ date: 1, user: 1 });
prayerEntrySchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export default mongoose.model('PrayerEntry', prayerEntrySchema);