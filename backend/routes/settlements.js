const express = require('express');
const router = express.Router();
const Settlement = require('../models/Settlement');
const Expense = require('../models/Expense');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @GET /api/settlements/group/:groupId
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const settlements = await Settlement.find({ group: req.params.groupId })
      .populate('from', 'name email avatar')
      .populate('to', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json(settlements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/settlements — record a settlement
router.post('/', auth, async (req, res) => {
  try {
    const { group, to, amount, note } = req.body;

    const settlement = await Settlement.create({
      group,
      from: req.user._id,
      to,
      amount,
      note: note || '',
      status: 'completed',
      settledAt: new Date(),
    });

    // Mark relevant expense splits as settled
    const expenses = await Expense.find({ group });
    for (const expense of expenses) {
      let modified = false;
      for (const split of expense.splits) {
        if (
          split.user.toString() === req.user._id.toString() &&
          expense.paidBy.toString() === to &&
          !split.settled
        ) {
          split.settled = true;
          modified = true;
        }
      }
      if (modified) await expense.save();
    }

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalOwed: -amount } });
    await User.findByIdAndUpdate(to, { $inc: { totalPaid: amount } });

    await settlement.populate('from', 'name email avatar');
    await settlement.populate('to', 'name email avatar');

    const io = req.app.get('io');
    io.to(group).emit('settlement_recorded', settlement);

    res.status(201).json(settlement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
