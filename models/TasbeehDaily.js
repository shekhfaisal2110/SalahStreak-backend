// models/TasbeehDaily.js
import mongoose from 'mongoose';

const tasbeehDailySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tasbeeh: { type: mongoose.Schema.Types.ObjectId, ref: 'Tasbeeh', required: true },
  date: { type: String, required: true }, // format: YYYY-MM-DD
  count: { type: Number, default: 0 },
});

tasbeehDailySchema.index({ user: 1, tasbeeh: 1, date: 1 }, { unique: true });

const TasbeehDaily = mongoose.model('TasbeehDaily', tasbeehDailySchema);
export default TasbeehDaily;