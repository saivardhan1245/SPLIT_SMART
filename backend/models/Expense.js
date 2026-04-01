const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ['food', 'transport', 'stay', 'entertainment', 'shopping', 'utilities', 'other'],
      default: 'other',
    },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    splitType: {
      type: String,
      enum: ['equal', 'custom', 'percentage', 'smart'],
      default: 'equal',
    },
    splits: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },
        settled: { type: Boolean, default: false },
      },
    ],
    date: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
    receiptUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
