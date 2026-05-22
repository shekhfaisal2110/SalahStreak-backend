import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
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

// ✅ Fixed pre-save hook – remove `next` parameter
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;