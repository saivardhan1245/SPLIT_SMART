const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['trip', 'household', 'event', 'hostel', 'other'],
      default: 'other',
    },
    emoji: { type: String, default: '👥' },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['admin', 'member'], default: 'member' },
        joinedAt: { type: Date, default: Date.now },
        totalContributed: { type: Number, default: 0 },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    totalExpenses: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);
