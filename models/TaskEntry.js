// import mongoose from 'mongoose';

// const taskEntrySchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
//   date: { type: String, required: true }, // YYYY-MM-DD
//   completed: { type: Boolean, default: false },
// });

// taskEntrySchema.index({ user: 1, task: 1, date: 1 }, { unique: true });

// const TaskEntry = mongoose.model('TaskEntry', taskEntrySchema);
// export default TaskEntry;


import mongoose from 'mongoose';

const taskEntrySchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true               // ✅ user ke saare task entries fetch karne ke liye
  },
  task: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Task', 
    required: true,
    index: true               // ✅ specific task ka history dekhne ke liye
  },
  date: { 
    type: String,             // format: YYYY-MM-DD
    required: true,
    index: true               // ✅ date range queries ke liye (e.g., last 7 days)
  },
  completed: { 
    type: Boolean, 
    default: false,
    index: true               // ✅ incomplete tasks filter karne ke liye
  }
}, {
  timestamps: true,           // ✅ createdAt, updatedAt auto add – debugging ke liye
  autoIndex: process.env.NODE_ENV !== 'production'
});

// ✅ Unique compound index – ensure one entry per user, task, date
taskEntrySchema.index({ user: 1, task: 1, date: 1 }, { unique: true });

// ✅ Compound index for user + date – get all task completions for a specific day
taskEntrySchema.index({ user: 1, date: 1 });

// ✅ Compound index for user + date + completed – incomplete tasks for today
taskEntrySchema.index({ user: 1, date: 1, completed: 1 });

// ✅ Compound index for user + completed – overall incomplete tasks across dates (if needed)
taskEntrySchema.index({ user: 1, completed: 1 });

// ✅ Compound index for date + completed – analytics (e.g., total tasks completed today)
taskEntrySchema.index({ date: 1, completed: 1 });

const TaskEntry = mongoose.model('TaskEntry', taskEntrySchema);
export default TaskEntry;