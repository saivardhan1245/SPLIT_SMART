const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { calculateSmartSplit } = require('../utils/debtSimplifier');

// @GET /api/expenses/group/:groupId
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('paidBy', 'name email avatar')
      .populate('splits.user', 'name email avatar')
      .sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/expenses/smart-split/:groupId
router.get('/smart-split/:groupId', auth, async (req, res) => {
  try {
    const { amount } = req.query;
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const previousExpenses = await Expense.find({ group: req.params.groupId })
      .populate('paidBy', 'name');

    const memberIds = group.members.map((m) => m.user);
    const smartSplits = calculateSmartSplit(
      parseFloat(amount) || 100,
      memberIds,
      previousExpenses
    );

    // Populate user details
    const users = await User.find({ _id: { $in: memberIds } }, 'name email avatar');
    const userMap = {};
    users.forEach((u) => (userMap[u._id.toString()] = u));

    const result = smartSplits.map((s) => ({
      user: userMap[s.user.toString()],
      amount: s.amount,
      percentage: s.percentage,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/expenses
router.post('/', auth, async (req, res) => {
  try {
    const { group: groupId, description, amount, category, splitType, splits, date, notes } = req.body;

    if (!groupId || !description || !amount)
      return res.status(400).json({ message: 'Group, description, and amount are required' });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isMember = group.members.some((m) => m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Not a member of this group' });

    // Process splits
    let processedSplits = splits || [];
    if (!splits || splits.length === 0) {
      // Default equal split among all members
      const memberIds = group.members.map((m) => m.user);
      const share = Math.round((amount / memberIds.length) * 100) / 100;
      processedSplits = memberIds.map((uid) => ({
        user: uid,
        amount: share,
        percentage: Math.round(100 / memberIds.length),
        settled: uid.toString() === req.user._id.toString(),
      }));
    }

    const expense = await Expense.create({
      group: groupId,
      description,
      amount,
      category: category || 'other',
      paidBy: req.user._id,
      splitType: splitType || 'equal',
      splits: processedSplits,
      date: date || new Date(),
      notes: notes || '',
    });

    // Update group total
    group.totalExpenses += amount;
    const memberInGroup = group.members.find((m) => m.user.toString() === req.user._id.toString());
    if (memberInGroup) memberInGroup.totalContributed += amount;
    await group.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalPaid: amount } });

    await expense.populate('paidBy', 'name email avatar');
    await expense.populate('splits.user', 'name email avatar');

    // Real-time update
    const io = req.app.get('io');
    io.to(groupId).emit('expense_added', expense);

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/expenses/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    if (expense.paidBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the payer can edit this expense' });

    const { description, amount, category, notes, splits } = req.body;
    if (description) expense.description = description;
    if (amount) expense.amount = amount;
    if (category) expense.category = category;
    if (notes !== undefined) expense.notes = notes;
    if (splits) expense.splits = splits;

    await expense.save();
    await expense.populate('paidBy', 'name email avatar');
    await expense.populate('splits.user', 'name email avatar');

    const io = req.app.get('io');
    io.to(expense.group.toString()).emit('expense_updated', expense);

    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @DELETE /api/expenses/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    if (expense.paidBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the payer can delete this expense' });

    const groupId = expense.group.toString();
    await Group.findByIdAndUpdate(groupId, { $inc: { totalExpenses: -expense.amount } });
    await expense.deleteOne();

    const io = req.app.get('io');
    io.to(groupId).emit('expense_deleted', { expenseId: req.params.id });

    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
