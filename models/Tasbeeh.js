import mongoose from 'mongoose';

const tasbeehSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  arabicName: { type: String },
  targetCount: { type: Number, default: 33 },
  currentCount: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

const Tasbeeh = mongoose.model('Tasbeeh', tasbeehSchema);
export default Tasbeeh;