// // import mongoose from 'mongoose';

// // const tasbeehSchema = new mongoose.Schema({
// //   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
// //   name: { type: String, required: true },
// //   arabicName: { type: String },
// //   targetCount: { type: Number, default: 33 },
// //   currentCount: { type: Number, default: 0 },
// //   completed: { type: Boolean, default: false },
// //   completedAt: { type: Date },
// //   createdAt: { type: Date, default: Date.now },
// // });

// // const Tasbeeh = mongoose.model('Tasbeeh', tasbeehSchema);
// // export default Tasbeeh;




// // models/Tasbeeh.js
// import mongoose from 'mongoose';

// const tasbeehSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   name: { type: String, required: true },
//   arabicName: { type: String },
//   targetCount: { type: Number, default: 33 },
//   currentCount: { type: Number, default: 0 },
//   completed: { type: Boolean, default: false },
//   completedAt: { type: Date },
//   pinned: { type: Boolean, default: false },        // <-- new
//   showCount: { type: Boolean, default: true },      // <-- new
//   createdAt: { type: Date, default: Date.now },
// });

// const Tasbeeh = mongoose.model('Tasbeeh', tasbeehSchema);
// export default Tasbeeh;



import mongoose from 'mongoose';

const tasbeehSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true               // ✅ user ke saare tasbeeh fetch karne ke liye
  },
  name: { 
    type: String, 
    required: true,
    index: true               // ✅ name pe search ke liye (optional, agar aap filter karte ho)
  },
  arabicName: { type: String },
  targetCount: { 
    type: Number, 
    default: 33,
    index: true               // ✅ agar analytics me target count ke basis pe query ho
  },
  currentCount: { type: Number, default: 0 },
  completed: { 
    type: Boolean, 
    default: false,
    index: true               // ✅ incomplete vs complete tasbeeh filter karne ke liye
  },
  completedAt: { 
    type: Date,
    index: true               // ✅ completion date se query ho toh
  },
  pinned: { 
    type: Boolean, 
    default: false,
    index: true               // ✅ pinned tasbeeh top pe dikhane ke liye
  },
  showCount: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true,           // ✅ createdAt aur updatedAp automatically manage hoga (aapka existing createdAt redundant ho jayega, but sync rahega)
  autoIndex: process.env.NODE_ENV !== 'production'
});

// ✅ Compound indexes for common query patterns

// 1. User + completed (incomplete tasbeeh fetch fast) – most common
tasbeehSchema.index({ user: 1, completed: 1 });

// 2. User + pinned (user ke pinned tasbeeh top pe)
tasbeehSchema.index({ user: 1, pinned: -1 });

// 3. User + createdAt descending (latest first)
tasbeehSchema.index({ user: 1, createdAt: -1 });

// 4. User + completed + pinned (priority: pinned incomplete tasbeeh)
tasbeehSchema.index({ user: 1, completed: 1, pinned: -1 });

// 5. User + completedAt (completed tasbeeh sorted by completion date)
tasbeehSchema.index({ user: 1, completedAt: -1 });

const Tasbeeh = mongoose.model('Tasbeeh', tasbeehSchema);
export default Tasbeeh;