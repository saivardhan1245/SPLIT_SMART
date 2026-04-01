import React, { useState } from 'react';
import axios from 'axios';
import { X, UserPlus } from 'lucide-react';

export default function AddMemberModal({ groupId, onClose, onAdded }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setError('Email is required');
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`/api/groups/${groupId}/members`, { email });
      onAdded(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Add Member</h2>
          <button onClick={onClose} style={{ background: 'var(--bg-hover)', border: 'none', color: 'var(--text-secondary)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Member's Email
            </label>
            <input
              type="email" className="input-field"
              placeholder="friend@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error && <p style={{ color: '#ff6584', fontSize: '0.88rem' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <UserPlus size={16} /> {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
