import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Plus, Users, Trash2, ArrowRight, TrendingUp, Wallet, Clock } from 'lucide-react';
import CreateGroupModal from '../components/groups/CreateGroupModal';

const CATEGORY_EMOJI = {
  trip: '✈️', household: '🏠', event: '🎉', hostel: '🏨', other: '👥',
};

const CATEGORY_COLORS = {
  trip: '#6c63ff', household: '#43e97b', event: '#fd9644', hostel: '#ff6584', other: '#8888aa',
};

export default function DashboardPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchGroups(); }, []);

  const fetchGroups = async () => {
    try {
      const { data } = await api.get('/api/groups');
      setGroups(data);
    } catch { toast.error('Failed to load groups'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (e, groupId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this group?')) return;
    try {
      await api.delete(`/api/groups/${groupId}`);
      setGroups((prev) => prev.filter((g) => g._id !== groupId));
      toast.success('Group deleted');
    } catch { toast.error('Failed to delete group'); }
  };

  const totalGroups = groups.length;
  const totalSpent = groups.reduce((sum, g) => sum + (g.totalExpenses || 0), 0);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={styles.subtitle}>Manage your shared expenses across all groups</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={18} /> New Group
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(108,99,255,0.15)' }}>
            <Users size={20} color="#6c63ff" />
          </div>
          <div>
            <p style={styles.statLabel}>Active Groups</p>
            <p style={styles.statValue}>{totalGroups}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(67,233,123,0.15)' }}>
            <Wallet size={20} color="#43e97b" />
          </div>
          <div>
            <p style={styles.statLabel}>Total Tracked</p>
            <p style={styles.statValue}>₹{totalSpent.toLocaleString()}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(253,150,68,0.15)' }}>
            <TrendingUp size={20} color="#fd9644" />
          </div>
          <div>
            <p style={styles.statLabel}>Your Paid</p>
            <p style={styles.statValue}>₹{(user?.totalPaid || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Groups */}
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Your Groups</h2>
        <span style={styles.badge} className="badge badge-purple">{totalGroups} groups</span>
      </div>

      {loading ? (
        <div style={styles.loadingGrid}>
          {[1, 2, 3].map((i) => <div key={i} style={styles.skeletonCard} />)}
        </div>
      ) : groups.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>👥</div>
          <h3 style={styles.emptyTitle}>No groups yet</h3>
          <p style={styles.emptyText}>Create your first group to start tracking shared expenses</p>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={18} /> Create First Group
          </button>
        </div>
      ) : (
        <div style={styles.groupsGrid}>
          {groups.map((group) => (
            <div
              key={group._id}
              style={styles.groupCard}
              onClick={() => navigate(`/groups/${group._id}`)}
              className="card"
            >
              {/* Card accent bar */}
              <div style={{
                ...styles.cardAccent,
                background: CATEGORY_COLORS[group.category] || '#6c63ff',
              }} />

              <div style={styles.cardTop}>
                <div style={styles.groupEmoji}>{group.emoji || CATEGORY_EMOJI[group.category]}</div>
                <div style={styles.cardActions}>
                  {group.createdBy?._id === user?._id && (
                    <button
                      style={styles.deleteBtn}
                      onClick={(e) => handleDelete(e, group._id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              <h3 style={styles.groupName}>{group.name}</h3>
              {group.description && (
                <p style={styles.groupDesc}>{group.description}</p>
              )}

              <div style={styles.cardMeta}>
                <div style={styles.members}>
                  {group.members.slice(0, 4).map((m, idx) => (
                    <div key={idx} style={{ ...styles.memberAvatar, left: `${idx * 20}px`, zIndex: idx }}>
                      {m.user?.name?.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {group.members.length > 4 && (
                    <div style={{ ...styles.memberAvatar, left: '80px', background: 'var(--bg-hover)', zIndex: 4, fontSize: '0.7rem' }}>
                      +{group.members.length - 4}
                    </div>
                  )}
                </div>
                <div style={styles.cardRight}>
                  <p style={styles.totalLabel}>Total</p>
                  <p style={styles.totalAmount}>₹{(group.totalExpenses || 0).toLocaleString()}</p>
                </div>
              </div>

              <div style={styles.cardFooter}>
                <span style={styles.memberCount}>
                  <Users size={13} /> {group.members.length} members
                </span>
                <span style={styles.viewLink}>
                  View <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}

          {/* Create new card */}
          <div style={styles.createCard} onClick={() => setShowCreate(true)}>
            <div style={styles.createIcon}><Plus size={24} color="#6c63ff" /></div>
            <p style={styles.createText}>Create New Group</p>
          </div>
        </div>
      )}

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreated={(group) => {
            setGroups((prev) => [group, ...prev]);
            setShowCreate(false);
            toast.success('Group created! 🎉');
          }}
        />
      )}
    </div>
  );
}

const styles = {
  page: { paddingBottom: '48px' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '32px', flexWrap: 'wrap', gap: '16px',
  },
  title: { fontSize: '2rem', fontWeight: '800', marginBottom: '6px', fontFamily: 'Syne, sans-serif' },
  subtitle: { color: 'var(--text-secondary)', fontSize: '0.95rem' },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px', marginBottom: '40px',
  },
  statCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '16px', padding: '20px',
    display: 'flex', alignItems: 'center', gap: '16px',
  },
  statIcon: {
    width: '44px', height: '44px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  statLabel: { color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px', fontWeight: '500' },
  statValue: { fontSize: '1.4rem', fontWeight: '700', fontFamily: 'Syne, sans-serif' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' },
  sectionTitle: { fontSize: '1.2rem', fontWeight: '700' },
  badge: { padding: '4px 12px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: '600' },
  groupsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  groupCard: {
    cursor: 'pointer', position: 'relative', overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    padding: '24px',
  },
  cardAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: '3px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  groupEmoji: { fontSize: '2rem' },
  cardActions: { display: 'flex', gap: '8px' },
  deleteBtn: {
    background: 'rgba(255,101,132,0.1)', border: 'none',
    color: '#ff6584', width: '30px', height: '30px', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'var(--transition)',
  },
  groupName: { fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' },
  groupDesc: { color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  cardMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  members: { position: 'relative', height: '30px', minWidth: '80px' },
  memberAvatar: {
    position: 'absolute', width: '28px', height: '28px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.75rem', fontWeight: '700', color: 'white',
    border: '2px solid var(--bg-card)',
  },
  cardRight: { textAlign: 'right' },
  totalLabel: { fontSize: '0.75rem', color: 'var(--text-muted)' },
  totalAmount: { fontSize: '1.1rem', fontWeight: '700', color: 'var(--accent-primary)' },
  cardFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderTop: '1px solid var(--border)', paddingTop: '12px',
    color: 'var(--text-muted)', fontSize: '0.82rem',
  },
  memberCount: { display: 'flex', alignItems: 'center', gap: '5px' },
  viewLink: { display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)', fontWeight: '600' },
  createCard: {
    border: '2px dashed var(--border)', borderRadius: '16px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: '12px', cursor: 'pointer', transition: 'var(--transition)',
    minHeight: '200px',
  },
  createIcon: {
    width: '52px', height: '52px', borderRadius: '16px',
    background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  createText: { color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.95rem' },
  emptyState: {
    textAlign: 'center', padding: '80px 20px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
  },
  emptyIcon: { fontSize: '4rem' },
  emptyTitle: { fontSize: '1.4rem', fontWeight: '700' },
  emptyText: { color: 'var(--text-secondary)', maxWidth: '400px' },
  loadingGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px',
  },
  skeletonCard: {
    height: '220px', borderRadius: '16px',
    background: 'linear-gradient(90deg, var(--bg-card) 25%, var(--bg-hover) 50%, var(--bg-card) 75%)',
    backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
  },
};
