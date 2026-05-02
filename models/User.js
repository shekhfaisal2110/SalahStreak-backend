// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   isVerified: { type: Boolean, default: false },
//   streak: { type: Number, default: 0 },
//   lastPrayerDate: { type: Date, default: null },
//   createdAt: { type: Date, default: Date.now },
//   totalSteps: { type: Number, default: 0 },
//   lastMilestoneNotified: { type: Number, default: 0 },
//   showRank: { type: Boolean, default: false },
//   loginKey: { type: String, unique: true, sparse: true },
//   pincode: { type: String, default: '' },
// });

// // ✅ Fixed pre-save hook – remove `next` parameter
// userSchema.pre('save', async function () {
//   if (!this.isModified('password')) return;
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// const User = mongoose.model('User', userSchema);
// export default User;



import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    index: true               // ✅ name pe search ke liye (optional)
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,             // ✅ unique index automatically ban jayega
    index: true
  },
  password: { 
    type: String, 
    required: true ,
    select: false
  },
  isVerified: { 
    type: Boolean, 
    default: false,
    index: true               // ✅ verified/unverified users filter karne ke liye
  },
  streak: { 
    type: Number, 
    default: 0,
    index: true               // ✅ leaderboard top streaks ke liye
  },
  lastPrayerDate: { 
    type: Date, 
    default: null,
    index: true               // ✅ today prayed users ya streak calculation ke liye
  },
  totalSteps: { 
    type: Number, 
    default: 0,
    index: true               // ✅ top steps leaderboard ke liye
  },
  lastMilestoneNotified: { 
    type: Number, 
    default: 0 
  },
  showRank: { 
    type: Boolean, 
    default: false 
  },
  loginKey: { 
    type: String, 
    unique: true, 
    sparse: true,             // ✅ sparse: true – null values ko unique constraint se exempt karega
    index: true
  },
  pincode: { 
    type: String, 
    default: '',
    index: true               // ✅ location-based queries ke liye
  }
}, {
  timestamps: true,           // ✅ createdAt, updatedAt auto add (aapka manual createdAt redundant, but dono rahenge)
  autoIndex: process.env.NODE_ENV !== 'production'
});

// ✅ Compound indexes for common query patterns

// 1. isVerified + createdAt – new verified users list ke liye
userSchema.index({ isVerified: 1, createdAt: -1 });

// 2. streak + lastPrayerDate – active users with high streak (for engagement)
userSchema.index({ streak: -1, lastPrayerDate: -1 });

// 3. pincode + isVerified – location-wise verified users
userSchema.index({ pincode: 1, isVerified: 1 });

// 4. totalSteps + isVerified – verified users leaderboard by steps
userSchema.index({ totalSteps: -1, isVerified: 1 });

// 5. lastPrayerDate + streak – for cron jobs (e.g., reset streaks)
userSchema.index({ lastPrayerDate: 1, streak: 1 });

// ✅ Pre-save hook – standard pattern with `next`
userSchema.pre('save', async function (next) {
  // Only hash password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;