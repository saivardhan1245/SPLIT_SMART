import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Zap, ChevronDown, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['food', 'transport', 'stay', 'entertainment', 'shopping', 'utilities', 'other'];
const SPLIT_TYPES = [
  { value: 'equal', label: '⚖️ Equal Split' },
  { value: 'smart', label: '🧠 Smart Split' },
  { value: 'custom', label: '✏️ Custom Amounts' },
  { value: 'percentage', label: '📊 By Percentage' },
];

export default function AddExpenseModal({ groupId, members, currency, onClose, onAdded }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    description: '', amount: '', category: 'food',
    splitType: 'equal', notes: '',
  });
  const [splits, setSplits] = useState([]);
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSmartSplit, setLoadingSmartSplit] = useState(false);
  const [error, setError] = useState('');

  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹';

  useEffect(() => {
    // Init equal splits
    const equalShare = form.amount ? parseFloat(form.amount) / members.length : 0;
    setSplits(members.map((m) => ({
      user: m.user._id,
      name: m.user.name,
      amount: Math.round(equalShare * 100) / 100,
      percentage: Math.round(100 / members.length),
    })));
  }, [members]);

  const handleAmountChange = (amount) => {
    setForm({ ...form, amount });
    if (form.splitType === 'equal' && amount) {
      const share = parseFloat(amount) / members.length;
      setSplits((prev) => prev.map((s) => ({
        ...s, amount: Math.round(share * 100) / 100,
        percentage: Math.round(100 / members.length),
      })));
    }
  };

  const handleSplitTypeChange = async (type) => {
    setForm({ ...form, splitType: type });

    if (type === 'equal' && form.amount) {
      const share = parseFloat(form.amount) / members.length;
      setSplits((prev) => prev.map((s) => ({ ...s, amount: Math.round(share * 100) / 100 })));
    }

    if (type === 'smart' && form.amount) {
      setLoadingSmartSplit(true);
      try {
        const { data } = await axios.get(`/api/expenses/smart-split/${groupId}?amount=${form.amount}`);
        setSmartSuggestions(data);
        setSplits(data.map((s) => ({
          user: s.user._id,
          name: s.user.name,
          amount: s.amount,
          percentage: s.percentage,
        })));
      } catch { }
      finally { setLoadingSmartSplit(false); }
    }
  };

  const updateSplit = (userId, field, value) => {
    setSplits((prev) => prev.map((s) =>
      s.user === userId ? { ...s, [field]: parseFloat(value) || 0 } : s
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) return setError('Description is required');
    if (!form.amount || parseFloat(form.amount) <= 0) return setError('Valid amount required');

    setLoading(true);
    setError('');
    try {
      const processedSplits = splits.map((s) => ({
        user: s.user,
        amount: s.amount,
        percentage: s.percentage,
        settled: s.user === user._id,
      }));

      const { data } = await axios.post('/api/expenses', {
        group: groupId,
        description: form.description,
        amount: parseFloat(form.amount),
        category: form.category,
        splitType: form.splitType,
        splits: processedSplits,
        notes: form.notes,
      });
      onAdded(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const totalSplit = splits.reduce((sum, s) => sum + (s.amount || 0), 0);
  const splitDiff = form.amount ? Math.abs(parseFloat(form.amount) - totalSplit) : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div style={styles.header}>
          <h2 style={styles.title}>Add Expense</h2>
          <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={{ flex: 2 }}>
              <label style={styles.label}>Description *</label>
              <input
                className="input-field" placeholder="e.g. Dinner at Taj Hotel"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Category</label>
              <select
                className="input-field" value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{ textTransform: 'capitalize' }}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={styles.label}>Amount ({currencySymbol})</label>
            <input
              className="input-field" type="number" step="0.01" placeholder="0.00"
              value={form.amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              style={{ fontSize: '1.5rem', fontFamily: 'Syne, sans-serif', fontWeight: '700' }}
            />
          </div>

          {/* Split Type */}
          <div>
            <label style={styles.label}>How to split?</label>
            <div style={styles.splitTypeGrid}>
              {SPLIT_TYPES.map((st) => (
                <button
                  key={st.value} type="button"
                  style={{
                    ...styles.splitTypeBtn,
                    ...(form.splitType === st.value ? styles.splitTypeBtnActive : {}),
                  }}
                  onClick={() => handleSplitTypeChange(st.value)}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Smart Split Info */}
          {form.splitType === 'smart' && (
            <div style={styles.smartInfo}>
              <Zap size={14} color="#6c63ff" />
              <p style={styles.smartInfoText}>
                Smart split analyzes past payment history to suggest fair amounts.
                Members who paid less recently get a larger share now.
              </p>
            </div>
          )}

          {/* Splits breakdown */}
          {(form.splitType === 'custom' || form.splitType === 'percentage' || form.splitType === 'smart') && (
            <div>
              <label style={styles.label}>
                Split Details
                {splitDiff > 0.01 && (
                  <span style={{ color: '#ff6584', marginLeft: '8px', fontSize: '0.8rem' }}>
                    ⚠ Difference: {currencySymbol}{splitDiff.toFixed(2)}
                  </span>
                )}
              </label>
              <div style={styles.splitsContainer}>
                {loadingSmartSplit ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', padding: '12px' }}>
                    Analyzing payment history...
                  </p>
                ) : splits.map((split) => (
                  <div key={split.user} style={styles.splitRow}>
                    <div style={styles.splitAvatar}>{split.name?.charAt(0)}</div>
                    <span style={styles.splitName}>{split.name}</span>
                    {form.splitType === 'percentage' ? (
                      <div style={styles.splitInput}>
                        <input
                          type="number" className="input-field"
                          style={{ padding: '8px 12px', textAlign: 'right', width: '90px' }}
                          value={split.percentage}
                          onChange={(e) => updateSplit(split.user, 'percentage', e.target.value)}
                        />
                        <span style={{ color: 'var(--text-muted)' }}>%</span>
                      </div>
                    ) : (
                      <div style={styles.splitInput}>
                        <span style={{ color: 'var(--text-muted)' }}>{currencySymbol}</span>
                        <input
                          type="number" className="input-field"
                          style={{ padding: '8px 12px', textAlign: 'right', width: '100px' }}
                          value={split.amount}
                          onChange={(e) => updateSplit(split.user, 'amount', e.target.value)}
                          readOnly={form.splitType === 'smart'}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Equal split preview */}
          {form.splitType === 'equal' && form.amount && (
            <div style={styles.equalPreview}>
              <Info size={14} color="var(--text-muted)" />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Each person pays {currencySymbol}{(parseFloat(form.amount) / members.length).toFixed(2)}
              </span>
            </div>
          )}

          <div>
            <label style={styles.label}>Notes (optional)</label>
            <input
              className="input-field" placeholder="Any extra details..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.actions}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding...' : `Add Expense`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '1.4rem', fontWeight: '700' },
  closeBtn: {
    background: 'var(--bg-hover)', border: 'none', color: 'var(--text-secondary)',
    width: '36px', height: '36px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  row: { display: 'flex', gap: '16px' },
  label: { display: 'block', fontSize: '0.88rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' },
  splitTypeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  splitTypeBtn: {
    padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)',
    background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
    cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', transition: 'var(--transition)',
    textAlign: 'left',
  },
  splitTypeBtnActive: {
    background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.4)',
    color: 'var(--accent-primary)',
  },
  smartInfo: {
    display: 'flex', gap: '10px', padding: '12px 16px',
    background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)',
    borderRadius: '10px', alignItems: 'flex-start',
  },
  smartInfoText: { fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' },
  splitsContainer: {
    background: 'var(--bg-secondary)', borderRadius: '12px',
    border: '1px solid var(--border)', overflow: 'hidden',
  },
  splitRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 16px', borderBottom: '1px solid var(--border)',
  },
  splitAvatar: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '0.8rem', color: 'white', flexShrink: 0,
  },
  splitName: { flex: 1, fontSize: '0.9rem', fontWeight: '500' },
  splitInput: { display: 'flex', alignItems: 'center', gap: '6px' },
  equalPreview: {
    display: 'flex', gap: '8px', alignItems: 'center',
    padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '10px',
  },
  error: { color: '#ff6584', fontSize: '0.88rem', background: 'rgba(255,101,132,0.1)', padding: '10px 14px', borderRadius: '8px' },
  actions: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
};
