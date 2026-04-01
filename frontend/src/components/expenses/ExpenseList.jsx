import React from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Trash2, Receipt } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORY_ICONS = {
  food: '🍕', transport: '🚗', stay: '🏨', entertainment: '🎮',
  shopping: '🛍️', utilities: '💡', other: '💰',
};

const CATEGORY_COLORS = {
  food: '#fd9644', transport: '#6c63ff', stay: '#43e97b', entertainment: '#ff6584',
  shopping: '#f9ca24', utilities: '#74b9ff', other: '#8888aa',
};

export default function ExpenseList({ expenses, currentUser, onDelete }) {
  const handleDelete = async (expenseId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this expense?')) return;
    try {
      await axios.delete(`/api/expenses/${expenseId}`);
      onDelete(expenseId);
      toast.success('Expense deleted');
    } catch { toast.error('Failed to delete'); }
  };

  if (expenses.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}><Receipt size={28} color="var(--text-muted)" /></div>
        <p style={styles.emptyTitle}>No expenses yet</p>
        <p style={styles.emptyText}>Add the first expense to start tracking</p>
      </div>
    );
  }

  return (
    <div style={styles.list}>
      {expenses.map((expense) => {
        const myShare = expense.splits?.find(
          (s) => (s.user?._id || s.user) === currentUser?._id
        );
        const iAmPayer = expense.paidBy?._id === currentUser?._id;

        return (
          <div key={expense._id} style={styles.card} className="card">
            <div style={styles.cardLeft}>
              <div style={{
                ...styles.categoryIcon,
                background: `${CATEGORY_COLORS[expense.category]}20`,
                border: `1px solid ${CATEGORY_COLORS[expense.category]}40`,
              }}>
                <span style={{ fontSize: '1.3rem' }}>
                  {CATEGORY_ICONS[expense.category] || '💰'}
                </span>
              </div>
              <div>
                <p style={styles.description}>{expense.description}</p>
                <p style={styles.meta}>
                  Paid by <strong style={{ color: iAmPayer ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                    {iAmPayer ? 'You' : expense.paidBy?.name}
                  </strong>
                  {' • '}{format(new Date(expense.date), 'dd MMM, yyyy')}
                </p>
                {expense.notes && (
                  <p style={styles.notes}>{expense.notes}</p>
                )}
              </div>
            </div>

            <div style={styles.cardRight}>
              <div style={styles.amounts}>
                <p style={styles.totalAmount}>₹{expense.amount.toLocaleString()}</p>
                {myShare && !iAmPayer && (
                  <span className={`badge ${myShare.settled ? 'badge-green' : 'badge-red'}`}>
                    {myShare.settled ? '✓ Settled' : `You owe ₹${myShare.amount.toFixed(2)}`}
                  </span>
                )}
                {iAmPayer && (
                  <span className="badge badge-purple">You paid</span>
                )}
              </div>
              {iAmPayer && (
                <button
                  style={styles.deleteBtn}
                  onClick={(e) => handleDelete(expense._id, e)}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  card: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 20px', gap: '16px',
  },
  cardLeft: { display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 },
  categoryIcon: {
    width: '48px', height: '48px', borderRadius: '14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  description: { fontWeight: '600', fontSize: '0.95rem', marginBottom: '4px' },
  meta: { color: 'var(--text-muted)', fontSize: '0.8rem' },
  notes: { color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px', fontStyle: 'italic' },
  cardRight: { display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 },
  amounts: { textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' },
  totalAmount: { fontWeight: '700', fontSize: '1.05rem', fontFamily: 'Syne, sans-serif' },
  deleteBtn: {
    background: 'rgba(255,101,132,0.1)', border: 'none', color: '#ff6584',
    width: '32px', height: '32px', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  empty: {
    textAlign: 'center', padding: '60px 20px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
  },
  emptyIcon: {
    width: '64px', height: '64px', borderRadius: '20px',
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontWeight: '700', fontSize: '1.1rem' },
  emptyText: { color: 'var(--text-muted)', fontSize: '0.9rem' },
};
