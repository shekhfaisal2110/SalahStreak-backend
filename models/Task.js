import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  scheduledTime: { type: String, required: true }, // e.g., "06:00"
  color: { type: String, default: '#10b981' },
  createdAt: { type: Date, default: Date.now },
});

const Task = mongoose.model('Task', taskSchema);
export default Task;