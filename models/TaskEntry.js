import mongoose from 'mongoose';

const taskEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  completed: { type: Boolean, default: false },
});

taskEntrySchema.index({ user: 1, task: 1, date: 1 }, { unique: true });

const TaskEntry = mongoose.model('TaskEntry', taskEntrySchema);
export default TaskEntry;