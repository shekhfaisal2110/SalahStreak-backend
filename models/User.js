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
// });

// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// const User = mongoose.model('User', userSchema);
// export default User;










import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  streak: { type: Number, default: 0 },
  lastPrayerDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  totalSteps: { type: Number, default: 0 },
  lastMilestoneNotified: { type: Number, default: 0 },
  showRank: { type: Boolean, default: false }, 
  loginKey: { type: String, unique: true, sparse: true },
  pincode: { type: String, default: '' },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;