const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');
const { calculateGroupBalances, simplifyDebts } = require('../utils/debtSimplifier');

// @GET /api/groups — get all groups for current user
router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find({ 'members.user': req.user._id, isActive: true })
      .populate('members.user', 'name email avatar fairnessScore')
      .populate('createdBy', 'name email')
      .sort({ updatedAt: -1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/groups — create group
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, category, emoji, memberEmails, currency } = req.body;
    if (!name) return res.status(400).json({ message: 'Group name is required' });

    // Find members by email
    const memberUsers = [];
    if (memberEmails && memberEmails.length > 0) {
      for (const email of memberEmails) {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (user) memberUsers.push(user._id);
      }
    }

    // Always add creator
    const members = [{ user: req.user._id, role: 'admin' }];
    memberUsers.forEach((uid) => {
      if (uid.toString() !== req.user._id.toString()) {
        members.push({ user: uid, role: 'member' });
      }
    });

    const group = await Group.create({
      name,
      description,
      category: category || 'other',
      emoji: emoji || '👥',
      members,
      createdBy: req.user._id,
      currency: currency || 'INR',
    });

    await group.populate('members.user', 'name email avatar');
    await group.populate('createdBy', 'name email');

    const io = req.app.get('io');
    members.forEach((m) => io.to(m.user.toString()).emit('group_created', group));

    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/groups/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members.user', 'name email avatar fairnessScore totalPaid totalOwed')
      .populate('createdBy', 'name email');

    if (!group) return res.status(404).json({ message: 'Group not found' });
    const isMember = group.members.some((m) => m.user._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Not a member of this group' });

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/groups/:id — update group
router.put('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const member = group.members.find((m) => m.user.toString() === req.user._id.toString());
    if (!member || member.role !== 'admin')
      return res.status(403).json({ message: 'Only admin can update group' });

    const { name, description, category, emoji } = req.body;
    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (category) group.category = category;
    if (emoji) group.emoji = emoji;

    await group.save();
    await group.populate('members.user', 'name email avatar');

    const io = req.app.get('io');
    io.to(req.params.id).emit('group_updated', group);

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @DELETE /api/groups/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const member = group.members.find((m) => m.user.toString() === req.user._id.toString());
    if (!member || member.role !== 'admin')
      return res.status(403).json({ message: 'Only admin can delete group' });

    group.isActive = false;
    await group.save();

    const io = req.app.get('io');
    io.to(req.params.id).emit('group_deleted', { groupId: req.params.id });

    res.json({ message: 'Group deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/groups/:id/members — add member
router.post('/:id/members', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const { email } = req.body;
    const newUser = await User.findOne({ email: email.toLowerCase() });
    if (!newUser) return res.status(404).json({ message: 'User not found with this email' });

    const alreadyMember = group.members.some((m) => m.user.toString() === newUser._id.toString());
    if (alreadyMember) return res.status(400).json({ message: 'User already in group' });

    group.members.push({ user: newUser._id, role: 'member' });
    await group.save();
    await group.populate('members.user', 'name email avatar');

    const io = req.app.get('io');
    io.to(req.params.id).emit('member_added', { group, newMember: newUser });

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/groups/:id/balances
router.get('/:id/balances', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members.user', 'name email avatar');
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const expenses = await Expense.find({ group: req.params.id })
      .populate('paidBy', 'name email')
      .populate('splits.user', 'name email');

    const memberIds = group.members.map((m) => m.user._id);
    const balances = calculateGroupBalances(expenses, memberIds);
    const simplifiedDebts = simplifyDebts(balances);

    // Map IDs to user objects
    const memberMap = {};
    group.members.forEach((m) => (memberMap[m.user._id.toString()] = m.user));

    const transactions = simplifiedDebts.map((t) => ({
      from: memberMap[t.from],
      to: memberMap[t.to],
      amount: t.amount,
    }));

    res.json({ balances, transactions, memberMap });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
