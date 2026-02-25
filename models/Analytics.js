// import mongoose from 'mongoose';

// const pageViewSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
//   route: { type: String, required: true },
//   timestamp: { type: Date, default: Date.now },
//   ip: { type: String },
//   userAgent: { type: String },
// });

// const eventSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
//   eventType: { type: String, required: true }, // e.g., 'tasbeeh_10_increment'
//   metadata: { type: Object },
//   timestamp: { type: Date, default: Date.now },
// });

// export const PageView = mongoose.model('PageView', pageViewSchema);
// export const Event = mongoose.model('Event', eventSchema);





import mongoose from 'mongoose';

const pageViewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  route: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  ip: { type: String },
  userAgent: { type: String },
});

const eventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  eventType: { type: String, required: true },
  metadata: { type: Object },
  timestamp: { type: Date, default: Date.now },
});

export const PageView = mongoose.model('PageView', pageViewSchema);
export const Event = mongoose.model('Event', eventSchema);