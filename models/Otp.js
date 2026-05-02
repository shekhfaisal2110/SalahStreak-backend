// import mongoose from 'mongoose';

// const otpSchema = new mongoose.Schema({
//   email: { type: String, required: true },
//   otp: { type: String, required: true },
//   type: { type: String, enum: ['verify', 'reset'], required: true },
//   expiresAt: { type: Date, required: true },
//   createdAt: { type: Date, default: Date.now },
// });

// otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// const Otp = mongoose.model('Otp', otpSchema);
// export default Otp;



import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true,
    index: true               // ✅ email pe index – OTP verify karte waqt fast lookup
  },
  otp: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['verify', 'reset'], 
    required: true,
    index: true               // ✅ type pe index – agar "reset" ya "verify" filter karna ho
  },
  expiresAt: { 
    type: Date, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true               // ✅ createdAt pe index – troubleshooting/cleanup ke liye
  }
}, {
  // ✅ autoIndex production me off (performance gain)
  autoIndex: process.env.NODE_ENV !== 'production',
  // ✅ timestamps optional – agar createdAt manual hai to redundant, but rakhte hain
  timestamps: false
});

// ✅ TTL index – purane OTPs auto delete honge expireAt ke hisaab se
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ✅ Compound index for common query: email + type (dono ek saath filter)
otpSchema.index({ email: 1, type: 1 });

// ✅ Compound index for type + expiresAt – cleanup ke liye useful
otpSchema.index({ type: 1, expiresAt: 1 });

const Otp = mongoose.model('Otp', otpSchema);
export default Otp;