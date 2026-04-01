/**
 * Debt Simplification Algorithm
 * Minimizes number of transactions needed to settle all debts in a group
 */

function simplifyDebts(balances) {
  // balances: { userId: netBalance } — positive = owed money, negative = owes money
  const creditors = [];
  const debtors = [];

  for (const [userId, balance] of Object.entries(balances)) {
    if (balance > 0.01) creditors.push({ userId, amount: balance });
    else if (balance < -0.01) debtors.push({ userId, amount: -balance });
  }

  const transactions = [];

  let i = 0, j = 0;
  while (i < creditors.length && j < debtors.length) {
    const credit = creditors[i];
    const debt = debtors[j];
    const amount = Math.min(credit.amount, debt.amount);

    transactions.push({
      from: debt.userId,
      to: credit.userId,
      amount: Math.round(amount * 100) / 100,
    });

    credit.amount -= amount;
    debt.amount -= amount;

    if (credit.amount < 0.01) i++;
    if (debt.amount < 0.01) j++;
  }

  return transactions;
}

function calculateGroupBalances(expenses, memberIds) {
  // net balance per user: positive = others owe them, negative = they owe others
  const balances = {};
  memberIds.forEach((id) => (balances[id.toString()] = 0));

  for (const expense of expenses) {
    const paidById = expense.paidBy._id
      ? expense.paidBy._id.toString()
      : expense.paidBy.toString();

    for (const split of expense.splits) {
      const splitUserId = split.user._id
        ? split.user._id.toString()
        : split.user.toString();

      if (!split.settled && splitUserId !== paidById) {
        balances[paidById] = (balances[paidById] || 0) + split.amount;
        balances[splitUserId] = (balances[splitUserId] || 0) - split.amount;
      }
    }
  }

  return balances;
}

function calculateSmartSplit(amount, members, previousExpenses) {
  // Smart split: analyze past contributions and suggest weighted split
  const contributionMap = {};
  members.forEach((m) => (contributionMap[m.toString()] = 0));

  for (const expense of previousExpenses) {
    const paidById = expense.paidBy._id
      ? expense.paidBy._id.toString()
      : expense.paidBy.toString();
    if (contributionMap[paidById] !== undefined) {
      contributionMap[paidById] += expense.amount;
    }
  }

  const totalContributions = Object.values(contributionMap).reduce((a, b) => a + b, 0);

  if (totalContributions === 0) {
    // No history — equal split
    const equalShare = Math.round((amount / members.length) * 100) / 100;
    return members.map((m) => ({ user: m, amount: equalShare, percentage: 100 / members.length }));
  }

  // Inverse contribution weighting: who paid less should pay more now
  const inverseWeights = {};
  let totalInverse = 0;
  members.forEach((m) => {
    const contribution = contributionMap[m.toString()] || 0;
    const maxContrib = Math.max(...Object.values(contributionMap));
    inverseWeights[m.toString()] = maxContrib - contribution + 1; // +1 to avoid 0
    totalInverse += inverseWeights[m.toString()];
  });

  return members.map((m) => {
    const weight = inverseWeights[m.toString()] / totalInverse;
    const share = Math.round(amount * weight * 100) / 100;
    return { user: m, amount: share, percentage: Math.round(weight * 100) };
  });
}

module.exports = { simplifyDebts, calculateGroupBalances, calculateSmartSplit };
