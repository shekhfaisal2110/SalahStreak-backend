import mongoose from 'mongoose';

const prayerEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // format: YYYY-MM-DD
  prayers: {
    Fajr: { type: Boolean, default: false },
    Dhuhr: { type: Boolean, default: false },
    Asr: { type: Boolean, default: false },
    Maghrib: { type: Boolean, default: false },
    Isha: { type: Boolean, default: false },
  },
  createdAt: { type: Date, default: Date.now },
});

prayerEntrySchema.index({ user: 1, date: 1 }, { unique: true });

const PrayerEntry = mongoose.model('PrayerEntry', prayerEntrySchema);
export default PrayerEntry;