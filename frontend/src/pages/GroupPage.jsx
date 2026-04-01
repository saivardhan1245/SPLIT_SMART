import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  ArrowLeft, Plus, BarChart2, Users, Receipt,
  ArrowRight, CheckCircle, Zap, RefreshCw, UserPlus
} from 'lucide-react';
import AddExpenseModal from '../components/expenses/AddExpenseModal';
import BalancePanel from '../components/groups/BalancePanel';
import ExpenseList from '../components/expenses/ExpenseList';
import AddMemberModal from '../components/groups/AddMemberModal';

const TABS = ['Expenses', 'Balances', 'Members'];

export default function GroupPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, joinGroup, leaveGroup } = useSocket();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Expenses');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [liveActivity, setLiveActivity] = useState(null);

  useEffect(() => {
    fetchAll();
    if (socket) {
      joinGroup(id);
      socket.on('expense_added', handleNewExpense);
      socket.on('expense_deleted', handleExpenseDeleted);
      socket.on('settlement_recorded', () => { fetchBalances(); toast.success('Settlement recorded! 💰'); });
      return () => {
        leaveGroup(id);
        socket.off('expense_added');
        socket.off('expense_deleted');
        socket.off('settlement_recorded');
      };
    }
  }, [id, socket]);

  const handleNewExpense = (expense) => {
    setExpenses((prev) => [expense, ...prev]);
    setLiveActivity(`${expense.paidBy?.name} added "${expense.description}"`);
    setTimeout(() => setLiveActivity(null), 4000);
    fetchBalances();
  };

  const handleExpenseDeleted = ({ expenseId }) => {
    setExpenses((prev) => prev.filter((e) => e._id !== expenseId));
    fetchBalances();
  };

  const fetchAll = async () => {
    try {
      const [groupRes, expensesRes] = await Promise.all([
        api.get(`/api/groups/${id}`),
        api.get(`/api/expenses/group/${id}`),
      ]);
      setGroup(groupRes.data);
      setExpenses(expensesRes.data);
      await fetchBalances();
    } catch { toast.error('Failed to load group'); navigate('/dashboard'); }
    finally { setLoading(false); }
  };

  const fetchBalances = async () => {
    try {
      const { data } = await api.get(`/api/groups/${id}/balances`);
      setBalances(data);
    } catch { }
  };

  const handleSettle = async (transaction) => {
    try {
      await api.post('/api/settlements', {
        group: id, to: transaction.to._id, amount: transaction.amount,
      });
      toast.success('Settlement recorded!');
      fetchBalances();
    } catch { toast.error('Failed to record settlement'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
        <p>Loading group...</p>
      </div>
    </div>
  );

  const myBalance = balances?.balances?.[user?._id];

  return (
    <div style={styles.page}>
      {/* Live Activity Banner */}
      {liveActivity && (
        <div style={styles.liveBanner}>
          <Zap size={14} color="#6c63ff" />
          <span>{liveActivity}</span>
          <span style={styles.liveDot} />
          <span style={{ color: 'var(--accent-green)', fontSize: '0.78rem' }}>LIVE</span>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
        </button>
        <div style={styles.groupInfo}>
          <span style={styles.groupEmoji}>{group?.emoji}</span>
          <div>
            <h1 style={styles.groupName}>{group?.name}</h1>
            <p style={styles.groupMeta}>{group?.members?.length} members • {group?.currency}</p>
          </div>
        </div>
        <div style={styles.headerActions}>
          <button className="btn-secondary" onClick={() => navigate(`/groups/${id}/insights`)} style={{ fontSize: '0.88rem', padding: '10px 16px' }}>
            <BarChart2 size={16} /> Insights
          </button>
          <button className="btn-primary" onClick={() => setShowAddExpense(true)}>
            <Plus size={18} /> Add Expense
          </button>
        </div>
      </div>

      {/* My Balance Card */}
      {myBalance !== undefined && (
        <div style={{
          ...styles.balanceCard,
          borderColor: myBalance > 0 ? 'rgba(67,233,123,0.3)' : myBalance < 0 ? 'rgba(255,101,132,0.3)' : 'var(--border)',
          background: myBalance > 0 ? 'rgba(67,233,123,0.05)' : myBalance < 0 ? 'rgba(255,101,132,0.05)' : 'var(--bg-card)',
        }}>
          <div>
            <p style={styles.balanceLabel}>Your balance in this group</p>
            <p style={{
              ...styles.balanceAmount,
              color: myBalance > 0 ? 'var(--accent-green)' : myBalance < 0 ? 'var(--accent-secondary)' : 'var(--text-secondary)',
            }}>
              {myBalance > 0 ? `+₹${myBalance.toFixed(2)} owed to you` :
               myBalance < 0 ? `-₹${Math.abs(myBalance).toFixed(2)} you owe` : 'All settled! 🎉'}
            </p>
          </div>
          {myBalance === 0 && <CheckCircle size={24} color="var(--accent-green)" />}
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'Expenses' && <Receipt size={15} />}
            {tab === 'Balances' && <ArrowRight size={15} />}
            {tab === 'Members' && <Users size={15} />}
            {tab}
            {tab === 'Expenses' && <span style={styles.tabBadge}>{expenses.length}</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Expenses' && (
        <ExpenseList
          expenses={expenses}
          currentUser={user}
          onDelete={(expenseId) => setExpenses((prev) => prev.filter((e) => e._id !== expenseId))}
        />
      )}

      {activeTab === 'Balances' && balances && (
        <BalancePanel
          balances={balances}
          currentUser={user}
          onSettle={handleSettle}
          currency={group?.currency}
        />
      )}

      {activeTab === 'Members' && (
        <div style={styles.membersTab}>
          <div style={styles.membersHeader}>
            <h3 style={styles.membersTitle}>{group?.members?.length} Members</h3>
            <button className="btn-secondary" onClick={() => setShowAddMember(true)} style={{ fontSize: '0.88rem', padding: '8px 16px' }}>
              <UserPlus size={15} /> Add Member
            </button>
          </div>
          <div style={styles.membersList}>
            {group?.members?.map((m) => (
              <div key={m.user._id} style={styles.memberCard}>
                <div style={styles.memberAvatar}>
                  {m.user.name?.charAt(0).toUpperCase()}
                </div>
                <div style={styles.memberInfo}>
                  <p style={styles.memberName}>{m.user.name}</p>
                  <p style={styles.memberEmail}>{m.user.email}</p>
                </div>
                <span className={`badge ${m.role === 'admin' ? 'badge-purple' : 'badge-yellow'}`}>
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddExpense && (
        <AddExpenseModal
          groupId={id}
          members={group?.members || []}
          currency={group?.currency || 'INR'}
          onClose={() => setShowAddExpense(false)}
          onAdded={(expense) => {
            setExpenses((prev) => [expense, ...prev]);
            setShowAddExpense(false);
            fetchBalances();
            toast.success('Expense added! 💸');
          }}
        />
      )}

      {showAddMember && (
        <AddMemberModal
          groupId={id}
          onClose={() => setShowAddMember(false)}
          onAdded={(updatedGroup) => {
            setGroup(updatedGroup);
            setShowAddMember(false);
            toast.success('Member added!');
          }}
        />
      )}
    </div>
  );
}

const styles = {
  page: { paddingBottom: '48px' },
  liveBanner: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)',
    borderRadius: '12px', padding: '10px 16px', marginBottom: '20px',
    fontSize: '0.88rem', color: 'var(--text-secondary)',
    animation: 'slideUp 0.3s ease',
  },
  liveDot: {
    width: '6px', height: '6px', borderRadius: '50%',
    background: 'var(--accent-green)', marginLeft: 'auto',
    animation: 'pulse-glow 1s infinite',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: '16px',
    marginBottom: '24px', flexWrap: 'wrap',
  },
  backBtn: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', width: '40px', height: '40px',
    borderRadius: '12px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
  },
  groupInfo: { display: 'flex', alignItems: 'center', gap: '14px', flex: 1 },
  groupEmoji: { fontSize: '2.2rem' },
  groupName: { fontSize: '1.5rem', fontWeight: '800', fontFamily: 'Syne, sans-serif' },
  groupMeta: { color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' },
  headerActions: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  balanceCard: {
    border: '1px solid', borderRadius: '16px', padding: '20px 24px',
    marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  balanceLabel: { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' },
  balanceAmount: { fontSize: '1.2rem', fontWeight: '700' },
  tabs: {
    display: 'flex', gap: '4px', marginBottom: '24px',
    background: 'var(--bg-secondary)', padding: '4px', borderRadius: '14px',
    border: '1px solid var(--border)', width: 'fit-content',
  },
  tab: {
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '10px 20px', borderRadius: '10px', border: 'none',
    background: 'transparent', color: 'var(--text-secondary)',
    cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500',
    transition: 'var(--transition)',
  },
  tabActive: { background: 'var(--bg-card)', color: 'var(--text-primary)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  tabBadge: {
    background: 'var(--accent-primary)', color: 'white',
    borderRadius: '100px', padding: '1px 7px', fontSize: '0.72rem', fontWeight: '700',
  },
  membersTab: {},
  membersHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  membersTitle: { fontSize: '1.1rem', fontWeight: '700' },
  membersList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  memberCard: {
    display: 'flex', alignItems: 'center', gap: '14px',
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '14px', padding: '16px 20px',
  },
  memberAvatar: {
    width: '44px', height: '44px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '1rem', color: 'white', flexShrink: 0,
  },
  memberInfo: { flex: 1 },
  memberName: { fontWeight: '600', marginBottom: '2px' },
  memberEmail: { color: 'var(--text-muted)', fontSize: '0.82rem' },
};
