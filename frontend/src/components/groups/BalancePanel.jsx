import React from 'react';
import { ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

export default function BalancePanel({ balances, currentUser, onSettle, currency }) {
  const { transactions, memberMap } = balances;
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹';

  const myTransactions = transactions?.filter(
    (t) => t.from?._id === currentUser?._id || t.to?._id === currentUser?._id
  ) || [];

  const otherTransactions = transactions?.filter(
    (t) => t.from?._id !== currentUser?._id && t.to?._id !== currentUser?._id
  ) || [];

  return (
    <div style={styles.container}>
      {/* Simplified summary box */}
      <div style={styles.summaryBox}>
        <div style={styles.summaryHeader}>
          <CheckCircle size={18} color="var(--accent-green)" />
          <h3 style={styles.summaryTitle}>Minimum Transactions Needed</h3>
          <span className="badge badge-green" style={{ marginLeft: 'auto' }}>
            {transactions?.length || 0} payments
          </span>
        </div>
        <p style={styles.summarySubtext}>
          Debt Simplification Algorithm reduces all debts to the fewest possible transactions.
        </p>
      </div>

      {/* My transactions */}
      {myTransactions.length > 0 && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Your Settlements</h4>
          {myTransactions.map((t, i) => {
            const iAmPayer = t.from?._id === currentUser?._id;
            return (
              <div key={i} style={styles.transactionCard}>
                <div style={styles.transactionFlow}>
                  <div style={styles.person}>
                    <div style={{ ...styles.avatar, background: iAmPayer ? 'rgba(255,101,132,0.15)' : 'rgba(67,233,123,0.15)', color: iAmPayer ? '#ff6584' : 'var(--accent-green)' }}>
                      {t.from?.name?.charAt(0)}
                    </div>
                    <span style={styles.personName}>{iAmPayer ? 'You' : t.from?.name}</span>
                  </div>
                  <div style={styles.arrow}>
                    <ArrowRight size={18} color="var(--text-muted)" />
                    <span style={styles.arrowAmount}>{symbol}{t.amount.toFixed(2)}</span>
                  </div>
                  <div style={styles.person}>
                    <div style={{ ...styles.avatar, background: 'rgba(108,99,255,0.15)', color: 'var(--accent-primary)' }}>
                      {t.to?.name?.charAt(0)}
                    </div>
                    <span style={styles.personName}>{t.to?._id === currentUser?._id ? 'You' : t.to?.name}</span>
                  </div>
                </div>
                {iAmPayer && (
                  <button
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    onClick={() => onSettle(t)}
                  >
                    Mark Settled
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* All balances */}
      {memberMap && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Individual Balances</h4>
          {Object.entries(balances.balances || {}).map(([userId, balance]) => {
            const member = memberMap[userId];
            if (!member) return null;
            return (
              <div key={userId} style={styles.balanceRow}>
                <div style={styles.balanceMember}>
                  <div style={styles.memberAvatar}>{member.name?.charAt(0)}</div>
                  <span style={styles.memberName}>{userId === currentUser?._id ? 'You' : member.name}</span>
                </div>
                <div style={styles.balanceValue}>
                  {balance > 0.01 ? (
                    <span style={styles.positive}>+{symbol}{balance.toFixed(2)} owed</span>
                  ) : balance < -0.01 ? (
                    <span style={styles.negative}>-{symbol}{Math.abs(balance).toFixed(2)} owes</span>
                  ) : (
                    <span style={styles.neutral}><CheckCircle size={14} /> Settled</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Other transactions */}
      {otherTransactions.length > 0 && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Other Settlements</h4>
          {otherTransactions.map((t, i) => (
            <div key={i} style={styles.otherTransaction}>
              <span style={styles.personSmall}>{t.from?.name}</span>
              <ArrowRight size={14} color="var(--text-muted)" />
              <span style={styles.personSmall}>{t.to?.name}</span>
              <span style={{ ...styles.amountSmall, marginLeft: 'auto' }}>
                {symbol}{t.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}

      {transactions?.length === 0 && (
        <div style={styles.allSettled}>
          <CheckCircle size={40} color="var(--accent-green)" />
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: '700' }}>All Settled! 🎉</h3>
          <p style={{ color: 'var(--text-secondary)' }}>No outstanding balances in this group</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  summaryBox: {
    background: 'rgba(67,233,123,0.05)', border: '1px solid rgba(67,233,123,0.2)',
    borderRadius: '16px', padding: '20px',
  },
  summaryHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
  summaryTitle: { fontSize: '1rem', fontWeight: '600' },
  summarySubtext: { color: 'var(--text-muted)', fontSize: '0.85rem' },
  section: {},
  sectionTitle: { fontSize: '1rem', fontWeight: '600', marginBottom: '12px', color: 'var(--text-secondary)' },
  transactionCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '14px', padding: '16px 20px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '10px', flexWrap: 'wrap', gap: '12px',
  },
  transactionFlow: { display: 'flex', alignItems: 'center', gap: '16px' },
  person: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  personName: { fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-secondary)' },
  avatar: {
    width: '44px', height: '44px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '1rem',
  },
  arrow: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  arrowAmount: { fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' },
  balanceRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 20px', background: 'var(--bg-card)',
    border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '8px',
  },
  balanceMember: { display: 'flex', alignItems: 'center', gap: '12px' },
  memberAvatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '0.85rem', color: 'white',
  },
  memberName: { fontWeight: '500', fontSize: '0.95rem' },
  balanceValue: { fontWeight: '600', fontSize: '0.95rem' },
  positive: { color: 'var(--accent-green)' },
  negative: { color: '#ff6584' },
  neutral: { color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem' },
  otherTransaction: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 16px', background: 'var(--bg-secondary)',
    border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '8px',
  },
  personSmall: { fontSize: '0.88rem', fontWeight: '500' },
  amountSmall: { fontSize: '0.88rem', fontWeight: '600', color: 'var(--accent-primary)' },
  allSettled: {
    textAlign: 'center', padding: '60px 20px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
  },
};
