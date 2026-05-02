// // models/TasbeehDaily.js
// import mongoose from 'mongoose';

// const tasbeehDailySchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   tasbeeh: { type: mongoose.Schema.Types.ObjectId, ref: 'Tasbeeh', required: true },
//   date: { type: String, required: true }, // format: YYYY-MM-DD
//   count: { type: Number, default: 0 },
// });

// tasbeehDailySchema.index({ user: 1, tasbeeh: 1, date: 1 }, { unique: true });

// const TasbeehDaily = mongoose.model('TasbeehDaily', tasbeehDailySchema);
// export default TasbeehDaily;



import mongoose from 'mongoose';

const tasbeehDailySchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true               // ✅ user ke saare daily records fetch karne ke liye
  },
  tasbeeh: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tasbeeh', 
    required: true,
    index: true               // ✅ specific tasbeeh ka daily history dekhne ke liye
  },
  date: { 
    type: String,             // format: YYYY-MM-DD
    required: true,
    index: true               // ✅ date pe range queries (e.g., last 7 days) fast
  },
  count: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true,           // ✅ createdAt, updatedAt auto add – useful for debugging
  autoIndex: process.env.NODE_ENV !== 'production'
});

// ✅ Existing unique compound index – prevent duplicate entries per user, tasbeeh, and date
tasbeehDailySchema.index({ user: 1, tasbeeh: 1, date: 1 }, { unique: true });

// ✅ Compound index for user + date – get user's all tasbeeh counts for a specific day
tasbeehDailySchema.index({ user: 1, date: 1 });

// ✅ Compound index for user + date + count – for leaderboard / analytics (fast sorting)
tasbeehDailySchema.index({ user: 1, date: 1, count: -1 });

// ✅ Compound index for date + count – for daily top users (admin dashboard)
tasbeehDailySchema.index({ date: 1, count: -1 });

// ✅ Compound index for tasbeeh + date – see how a particular tasbeeh is used over time
tasbeehDailySchema.index({ tasbeeh: 1, date: 1 });

const TasbeehDaily = mongoose.model('TasbeehDaily', tasbeehDailySchema);
export default TasbeehDaily;