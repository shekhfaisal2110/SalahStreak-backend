import mongoose from 'mongoose';

const prayerGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  area: { type: String, required: true },
  pincode: { type: String, required: true },
  pinned: { type: Boolean, default: false },
  times: {
    Fajr: {
      azan: { type: String, default: '' },
      jamaat: { type: String, default: '' }
    },
    Dhuhr: {
      azan: { type: String, default: '' },
      jamaat: { type: String, default: '' }
    },
    Asr: {
      azan: { type: String, default: '' },
      jamaat: { type: String, default: '' }
    },
    Maghrib: {
      azan: { type: String, default: '' },
      jamaat: { type: String, default: '' }
    },
    Isha: {
      azan: { type: String, default: '' },
      jamaat: { type: String, default: '' }
    },
    Jumma: {                                   
      azan: { type: String, default: '' },
      jamaat: { type: String, default: '' }
    },
    Sehri: { type: String, default: '' },
    Iftar: { type: String, default: '' }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  updateHistory: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    updatedAt: { type: Date, default: Date.now }
  }]
});

prayerGroupSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const PrayerGroup = mongoose.model('PrayerGroup', prayerGroupSchema);
export default PrayerGroup;