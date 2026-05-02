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
//   eventType: { type: String, required: true },
//   metadata: { type: Object },
//   timestamp: { type: Date, default: Date.now },
// });

// export const PageView = mongoose.model('PageView', pageViewSchema);
// export const Event = mongoose.model('Event', eventSchema);






import mongoose from 'mongoose';

// ----------------- PageView Schema -----------------
const pageViewSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null,
    index: true               // ✅ userId pe index – agar user-based query karte ho
  },
  route: { 
    type: String, 
    required: true,
    index: true               // ✅ route pe index – frequently filter hota hai
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true               // ✅ timestamp pe index – sorting/range queries ke liye
  },
  ip: { type: String },
  userAgent: { type: String },
}, {
  timestamps: true,           // ✅ createdAt, updatedAt auto-add (optional)
  // production me autoIndex off karo for better write performance
  autoIndex: process.env.NODE_ENV !== 'production'
});

// ✅ Compound index: route + timestamp – agar dono ek saath query me aate hain
pageViewSchema.index({ route: 1, timestamp: -1 });

// ✅ Compound index: userId + timestamp – user ki activities timeline
pageViewSchema.index({ userId: 1, timestamp: -1 });

// ----------------- Event Schema -----------------
const eventSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null,
    index: true
  },
  eventType: { 
    type: String, 
    required: true,
    index: true
  },
  metadata: { type: Object },   // ⚠️ metadata me heavy data mat dalna, otherwise slow
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true
  },
}, {
  timestamps: true,
  autoIndex: process.env.NODE_ENV !== 'production'
});

// ✅ Compound index: eventType + timestamp – analytics queries fast hongi
eventSchema.index({ eventType: 1, timestamp: -1 });

// ✅ Compound index: userId + eventType – specific user ke events
eventSchema.index({ userId: 1, eventType: 1 });

export const PageView = mongoose.model('PageView', pageViewSchema);
export const Event = mongoose.model('Event', eventSchema);