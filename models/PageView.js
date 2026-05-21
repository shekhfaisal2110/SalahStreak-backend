import mongoose from 'mongoose';

const pageViewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    route: {
      type: String,
      required: true,
      index: true,
    },
    ip: {
      type: String,
      maxlength: 45,
    },
    userAgent: {
      type: String,
      maxlength: 500,
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
pageViewSchema.index({ route: 1, createdAt: -1 });
pageViewSchema.index({ userId: 1, createdAt: -1 });
pageViewSchema.index({ route: 1, userId: 1 });

// TTL index – automatically deletes old entries after 30 days
pageViewSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const PageView = mongoose.model('PageView', pageViewSchema);