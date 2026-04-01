const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    settledAt: { type: Date },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settlement', settlementSchema);
