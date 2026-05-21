import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    metadata: {
      type: Object,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      // DO NOT add index: true here – the TTL index will handle it
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
    autoIndex: process.env.NODE_ENV !== 'development',
    minimize: true,
    strict: true,
  }
);

// Compound indexes (use createdAt in these, not standalone)
eventSchema.index({ eventType: 1, createdAt: -1 });
eventSchema.index({ userId: 1, eventType: 1 });
eventSchema.index({ userId: 1, createdAt: -1 });

// TTL index – automatically deletes old events after 60 days
eventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 24 * 60 * 60 });

export const Event = mongoose.model('Event', eventSchema);