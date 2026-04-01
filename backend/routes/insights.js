const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const auth = require('../middleware/auth');

// @GET /api/insights/group/:groupId
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate(
      'members.user',
      'name email avatar fairnessScore'
    );
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('paidBy', 'name email avatar')
      .populate('splits.user', 'name email');

    // Category breakdown
    const categoryTotals = {};
    const memberPayments = {};
    const memberOwes = {};

    group.members.forEach((m) => {
      const id = m.user._id.toString();
      memberPayments[id] = { user: m.user, amount: 0, count: 0 };
      memberOwes[id] = { user: m.user, amount: 0 };
    });

    for (const expense of expenses) {
      // Category
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;

      // Who paid
      const payerId = expense.paidBy._id.toString();
      if (memberPayments[payerId]) {
        memberPayments[payerId].amount += expense.amount;
        memberPayments[payerId].count += 1;
      }

      // Who owes
      for (const split of expense.splits) {
        if (!split.settled) {
          const splitUserId = split.user._id ? split.user._id.toString() : split.user.toString();
          if (memberOwes[splitUserId] && splitUserId !== payerId) {
            memberOwes[splitUserId].amount += split.amount;
          }
        }
      }
    }

    // Fairness scores
    const totalGroupSpend = expenses.reduce((sum, e) => sum + e.amount, 0);
    const memberCount = group.members.length;
    const fairShare = totalGroupSpend / memberCount;

    const fairnessData = group.members.map((m) => {
      const id = m.user._id.toString();
      const paid = memberPayments[id]?.amount || 0;
      const score = fairShare > 0 ? Math.min(100, Math.round((paid / fairShare) * 50)) : 50;
      return {
        user: m.user,
        paid,
        owes: memberOwes[id]?.amount || 0,
        fairnessScore: score,
        paymentCount: memberPayments[id]?.count || 0,
      };
    });

    // Top spender / most owed
    const topPayer = fairnessData.sort((a, b) => b.paid - a.paid)[0];
    const mostOwed = [...fairnessData].sort((a, b) => b.owes - a.owes)[0];

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([cat, amount]) => ({
        category: cat,
        amount,
        percentage: totalGroupSpend > 0 ? Math.round((amount / totalGroupSpend) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    res.json({
      totalSpend: totalGroupSpend,
      expenseCount: expenses.length,
      categoryBreakdown,
      fairnessData,
      topPayer,
      mostOwed,
      avgExpense: expenses.length > 0 ? Math.round(totalGroupSpend / expenses.length) : 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
