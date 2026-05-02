// import mongoose from 'mongoose';

// const taskSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   name: { type: String, required: true },
//   scheduledTime: { type: String, required: true }, // e.g., "06:00"
//   color: { type: String, default: '#10b981' },
//   createdAt: { type: Date, default: Date.now },
// });

// const Task = mongoose.model('Task', taskSchema);
// export default Task;


import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true               // ✅ user ke saare tasks fetch karne ke liye
  },
  name: { 
    type: String, 
    required: true 
  },
  scheduledTime: { 
    type: String,             // format: "HH:MM" (24-hour)
    required: true,
    index: true               // ✅ time-based queries ke liye (e.g., tasks due at a specific time)
  },
  color: { 
    type: String, 
    default: '#10b981' 
  }
}, {
  timestamps: true,           // ✅ createdAt, updatedAt auto add (aapka manual createdAt redundant, but sync rahega)
  autoIndex: process.env.NODE_ENV !== 'production'
});

// ✅ Compound index for user + scheduledTime – user ke sorted tasks fast
taskSchema.index({ user: 1, scheduledTime: 1 });

// ✅ Compound index for user + createdAt – recent tasks fetch karne ke liye
taskSchema.index({ user: 1, createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);
export default Task;