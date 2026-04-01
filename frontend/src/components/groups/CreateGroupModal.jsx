import React, { useState } from 'react';
import api from '../../utils/api';
import { X, Plus, UserPlus, Trash2 } from 'lucide-react';

const CATEGORIES = [
  { value: 'trip', label: '✈️ Trip' },
  { value: 'household', label: '🏠 Household' },
  { value: 'event', label: '🎉 Event' },
  { value: 'hostel', label: '🏨 Hostel' },
  { value: 'other', label: '👥 Other' },
];

const EMOJIS = ['👥', '✈️', '🏠', '🎉', '🍕', '🏖️', '🎮', '💼', '🏋️', '🎓'];

export default function CreateGroupModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '', description: '', category: 'other', emoji: '👥', currency: 'INR',
  });
  const [memberEmails, setMemberEmails] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Group name is required');
    setLoading(true);
    setError('');
    try {
      const emails = memberEmails.filter((e) => e.trim() !== '');
      const { data } = await api.post('/api/groups', { ...form, memberEmails: emails });
      onCreated(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const addEmail = () => setMemberEmails([...memberEmails, '']);
  const removeEmail = (i) => setMemberEmails(memberEmails.filter((_, idx) => idx !== i));
  const updateEmail = (i, val) => {
    const updated = [...memberEmails];
    updated[i] = val;
    setMemberEmails(updated);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Create New Group</h2>
          <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Emoji picker */}
          <div>
            <label style={styles.label}>Group Icon</label>
            <div style={styles.emojiGrid}>
              {EMOJIS.map((e) => (
                <button
                  type="button" key={e}
                  style={{ ...styles.emojiBtn, ...(form.emoji === e ? styles.emojiBtnActive : {}) }}
                  onClick={() => setForm({ ...form, emoji: e })}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={styles.label}>Group Name *</label>
            <input
              className="input-field" placeholder="e.g. Goa Trip 2024"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label style={styles.label}>Description</label>
            <input
              className="input-field" placeholder="Optional description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div style={styles.row}>
            <div>
              <label style={styles.label}>Category</label>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={styles.label}>Currency</label>
              <select
                className="input-field"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
              </select>
            </div>
          </div>

          {/* Members */}
          <div>
            <label style={styles.label}>Add Members (by email)</label>
            <div style={styles.membersList}>
              {memberEmails.map((email, i) => (
                <div key={i} style={styles.memberRow}>
                  <input
                    className="input-field" placeholder="member@email.com"
                    value={email}
                    onChange={(e) => updateEmail(i, e.target.value)}
                    type="email"
                  />
                  <button type="button" style={styles.removeBtn} onClick={() => removeEmail(i)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              <button type="button" className="btn-secondary" onClick={addEmail} style={{ fontSize: '0.88rem' }}>
                <UserPlus size={15} /> Add Another
              </button>
            </div>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.actions}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Plus size={16} /> {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' },
  title: { fontSize: '1.4rem', fontWeight: '700' },
  closeBtn: {
    background: 'var(--bg-hover)', border: 'none', color: 'var(--text-secondary)',
    width: '36px', height: '36px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  label: { display: 'block', fontSize: '0.88rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' },
  emojiGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  emojiBtn: {
    width: '40px', height: '40px', borderRadius: '10px', fontSize: '1.2rem',
    background: 'var(--bg-secondary)', border: '2px solid transparent',
    cursor: 'pointer', transition: 'var(--transition)',
  },
  emojiBtnActive: { border: '2px solid var(--accent-primary)', background: 'rgba(108,99,255,0.15)' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  membersList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  memberRow: { display: 'flex', gap: '8px', alignItems: 'center' },
  removeBtn: {
    background: 'rgba(255,101,132,0.1)', border: 'none', color: '#ff6584',
    width: '38px', height: '38px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
  },
  error: { color: '#ff6584', fontSize: '0.88rem', background: 'rgba(255,101,132,0.1)', padding: '10px 14px', borderRadius: '8px' },
  actions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' },
};
