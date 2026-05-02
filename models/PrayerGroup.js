// import mongoose from 'mongoose';

// const prayerGroupSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   area: { type: String, required: true },
//   pincode: { type: String, required: true },
//   pinned: { type: Boolean, default: false },
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
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
//   updateHistory: [{
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     userName: { type: String },
//     updatedAt: { type: Date, default: Date.now }
//   }]
// });

// const PrayerGroup = mongoose.model('PrayerGroup', prayerGroupSchema);
// export default PrayerGroup;








import mongoose from 'mongoose';

const prayerGroupSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    index: true               // ✅ name pe index – agar group name se search karna ho
  },
  area: { 
    type: String, 
    required: true,
    index: true               // ✅ area pe index – location-based search fast
  },
  pincode: { 
    type: String, 
    required: true,
    index: true               // ✅ pincode pe index – exact location filter
  },
  pinned: { 
    type: Boolean, 
    default: false,
    index: true               // ✅ pinned pe index – featured groups quick fetch
  },
  times: {
    Fajr: {
      azan: { type: String, default: '' },
      jamaat: { type: String, default: '' }
    },
    Dhuhr: {
      azan: { type: String, default: '' },
      jamaat: { type: String, default: '' }
    },
    Asr: {
      azan: { type: String, default: '' },
      jamaat: { type: String, default: '' }
    },
    Maghrib: {
      azan: { type: String, default: '' },
      jamaat: { type: String, default: '' }
    },
    Isha: {
      azan: { type: String, default: '' },
      jamaat: { type: String, default: '' }
    },
    Jumma: {
      azan: { type: String, default: '' },
      jamaat: { type: String, default: '' }
    },
    Sehri: { type: String, default: '' },
    Iftar: { type: String, default: '' }
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true               // ✅ createdBy pe index – user ke groups find karne ke liye
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  updateHistory: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    updatedAt: { type: Date, default: Date.now }
  }]
}, {
  // ✅ timestamps: true se automatically createdAt & updatedAt manage honge
  timestamps: true,
  // ✅ autoIndex off in production for write performance
  autoIndex: process.env.NODE_ENV !== 'production'
});

// ✅ Compound indexes for common search patterns

// 1. Search by pincode + pinned (user wants pinned groups in an area)
prayerGroupSchema.index({ pincode: 1, pinned: -1 });

// 2. Search by area + name (text search ke liye)
prayerGroupSchema.index({ area: 1, name: 1 });

// 3. Latest updated groups (dashboard)
prayerGroupSchema.index({ updatedAt: -1 });

// 4. createdBy + updatedAt (user's own groups, sorted by recent)
prayerGroupSchema.index({ createdBy: 1, updatedAt: -1 });

// 5. Compound index for geo-location like queries (pincode + area)
prayerGroupSchema.index({ pincode: 1, area: 1 });

prayerGroupSchema.index({ name: 1, area: 1 });

// Optional: Text index for name and area search (if full-text search needed)
prayerGroupSchema.index({ name: 'text', area: 'text' });

const PrayerGroup = mongoose.model('PrayerGroup', prayerGroupSchema);
export default PrayerGroup;