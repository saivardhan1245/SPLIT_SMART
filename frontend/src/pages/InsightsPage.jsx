import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, TrendingUp, Award, AlertCircle, BarChart2 } from 'lucide-react';

const COLORS = ['#6c63ff', '#ff6584', '#43e97b', '#fd9644', '#f9ca24', '#74b9ff', '#a29bfe'];

const CATEGORY_ICONS = {
  food: '🍕', transport: '🚗', stay: '🏨', entertainment: '🎮',
  shopping: '🛍️', utilities: '💡', other: '💰',
};

export default function InsightsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [insights, setInsights] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [insightsRes, groupRes] = await Promise.all([
          api.get(`/api/insights/group/${id}`),
          api.get(`/api/groups/${id}`),
        ]);
        setInsights(insightsRes.data);
        setGroup(groupRes.data);
      } catch { }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>
      Loading insights...
    </div>
  );

  if (!insights) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' }}>
          <p style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{payload[0].name}</p>
          <p style={{ color: 'var(--accent-primary)' }}>₹{payload[0].value?.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(`/groups/${id}`)}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={styles.title}>{group?.emoji} {group?.name}</h1>
          <p style={styles.subtitle}>Smart Insights & Analytics</p>
        </div>
      </div>

      {/* Summary cards */}
      <div style={styles.summaryGrid}>
        {[
          { label: 'Total Spent', value: `₹${insights.totalSpend?.toLocaleString() || 0}`, icon: '💰', color: '#6c63ff' },
          { label: 'Expenses', value: insights.expenseCount || 0, icon: '📝', color: '#43e97b' },
          { label: 'Avg per Expense', value: `₹${insights.avgExpense || 0}`, icon: '📊', color: '#fd9644' },
          { label: 'Members', value: group?.members?.length || 0, icon: '👥', color: '#ff6584' },
        ].map((s) => (
          <div key={s.label} style={styles.summaryCard}>
            <span style={{ fontSize: '1.8rem' }}>{s.icon}</span>
            <div>
              <p style={styles.summaryValue} >{s.value}</p>
              <p style={styles.summaryLabel}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={styles.chartsRow}>
        {/* Category pie */}
        {insights.categoryBreakdown?.length > 0 && (
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Spending by Category</h3>
            <div style={styles.pieContainer}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={insights.categoryBreakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%" cy="50%"
                    outerRadius={85}
                    innerRadius={50}
                  >
                    {insights.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={styles.legend}>
                {insights.categoryBreakdown.map((item, i) => (
                  <div key={i} style={styles.legendItem}>
                    <div style={{ ...styles.legendDot, background: COLORS[i % COLORS.length] }} />
                    <span style={styles.legendLabel}>
                      {CATEGORY_ICONS[item.category]} {item.category}
                    </span>
                    <span style={styles.legendPct}>{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Member contributions bar */}
        {insights.fairnessData?.length > 0 && (
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Who Paid How Much</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={insights.fairnessData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="user.name" tick={{ fontSize: 11, fill: '#8888aa' }} />
                <YAxis tick={{ fontSize: 11, fill: '#8888aa' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="paid" fill="#6c63ff" radius={[6, 6, 0, 0]} name="Amount Paid" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Fairness scores */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <Award size={18} color="var(--accent-yellow)" />
          <h3 style={styles.sectionTitle}>Fairness Tracker</h3>
        </div>
        <p style={styles.sectionSubtext}>Tracks who contributes fairly over time</p>

        <div style={styles.fairnessList}>
          {[...insights.fairnessData]
            .sort((a, b) => b.fairnessScore - a.fairnessScore)
            .map((item, i) => (
              <div key={i} style={styles.fairnessCard}>
                <div style={styles.fairnessLeft}>
                  <div style={styles.fairnessRank}>{i + 1}</div>
                  <div style={styles.fairnessAvatar}>{item.user?.name?.charAt(0)}</div>
                  <div>
                    <p style={styles.fairnessName}>{item.user?.name}</p>
                    <p style={styles.fairnessMeta}>Paid ₹{item.paid?.toLocaleString()} • Owes ₹{item.owes?.toFixed(0)}</p>
                  </div>
                </div>
                <div style={styles.fairnessRight}>
                  <div style={styles.scoreBar}>
                    <div style={{ ...styles.scoreFill, width: `${item.fairnessScore}%`, background: item.fairnessScore >= 50 ? 'var(--accent-green)' : '#ff6584' }} />
                  </div>
                  <span style={{
                    ...styles.scoreValue,
                    color: item.fairnessScore >= 50 ? 'var(--accent-green)' : '#ff6584',
                  }}>
                    {item.fairnessScore}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Smart highlights */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <TrendingUp size={18} color="var(--accent-primary)" />
          <h3 style={styles.sectionTitle}>Smart Highlights</h3>
        </div>
        <div style={styles.highlightsGrid}>
          {insights.topPayer && (
            <div style={styles.highlightCard}>
              <span style={styles.highlightEmoji}>🏆</span>
              <div>
                <p style={styles.highlightTitle}>Most Generous</p>
                <p style={styles.highlightValue}>{insights.topPayer.user?.name}</p>
                <p style={styles.highlightSub}>Paid ₹{insights.topPayer.paid?.toLocaleString()}</p>
              </div>
            </div>
          )}
          {insights.mostOwed && insights.mostOwed.owes > 0 && (
            <div style={{ ...styles.highlightCard, borderColor: 'rgba(255,101,132,0.2)', background: 'rgba(255,101,132,0.05)' }}>
              <span style={styles.highlightEmoji}>⚠️</span>
              <div>
                <p style={styles.highlightTitle}>Pending Settlement</p>
                <p style={styles.highlightValue}>{insights.mostOwed.user?.name}</p>
                <p style={styles.highlightSub}>Owes ₹{insights.mostOwed.owes?.toFixed(0)}</p>
              </div>
            </div>
          )}
          {insights.categoryBreakdown?.[0] && (
            <div style={{ ...styles.highlightCard, borderColor: 'rgba(253,150,68,0.2)', background: 'rgba(253,150,68,0.05)' }}>
              <span style={styles.highlightEmoji}>{CATEGORY_ICONS[insights.categoryBreakdown[0].category]}</span>
              <div>
                <p style={styles.highlightTitle}>Top Spending Category</p>
                <p style={styles.highlightValue} style={{ textTransform: 'capitalize' }}>{insights.categoryBreakdown[0].category}</p>
                <p style={styles.highlightSub}>{insights.categoryBreakdown[0].percentage}% of total spend</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { paddingBottom: '48px' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' },
  backBtn: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', width: '40px', height: '40px',
    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  title: { fontSize: '1.6rem', fontWeight: '800', fontFamily: 'Syne, sans-serif' },
  subtitle: { color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' },
  summaryGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '16px', marginBottom: '32px',
  },
  summaryCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '16px', padding: '20px',
    display: 'flex', alignItems: 'center', gap: '14px',
  },
  summaryValue: { fontSize: '1.3rem', fontWeight: '700', fontFamily: 'Syne, sans-serif' },
  summaryLabel: { color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' },
  chartsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' },
  chartCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '20px', padding: '24px',
  },
  chartTitle: { fontSize: '1rem', fontWeight: '600', marginBottom: '20px' },
  pieContainer: { display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' },
  legend: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '120px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' },
  legendDot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  legendLabel: { flex: 1, color: 'var(--text-secondary)', textTransform: 'capitalize' },
  legendPct: { color: 'var(--text-primary)', fontWeight: '600' },
  section: { marginBottom: '32px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: '700' },
  sectionSubtext: { color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' },
  fairnessList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  fairnessCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '14px', padding: '16px 20px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px',
  },
  fairnessLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  fairnessRank: { color: 'var(--text-muted)', fontSize: '0.85rem', width: '20px', fontWeight: '600' },
  fairnessAvatar: {
    width: '40px', height: '40px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '0.9rem', color: 'white', flexShrink: 0,
  },
  fairnessName: { fontWeight: '600', fontSize: '0.95rem', marginBottom: '2px' },
  fairnessMeta: { color: 'var(--text-muted)', fontSize: '0.78rem' },
  fairnessRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  scoreBar: { width: '100px', height: '8px', background: 'var(--bg-hover)', borderRadius: '4px', overflow: 'hidden' },
  scoreFill: { height: '100%', borderRadius: '4px', transition: 'width 0.6s ease' },
  scoreValue: { fontWeight: '700', fontSize: '1rem', fontFamily: 'Syne, sans-serif', minWidth: '30px', textAlign: 'right' },
  highlightsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
  highlightCard: {
    background: 'rgba(67,233,123,0.05)', border: '1px solid rgba(67,233,123,0.2)',
    borderRadius: '16px', padding: '20px',
    display: 'flex', alignItems: 'center', gap: '16px',
  },
  highlightEmoji: { fontSize: '2rem', flexShrink: 0 },
  highlightTitle: { color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' },
  highlightValue: { fontWeight: '700', fontSize: '1rem', marginBottom: '2px' },
  highlightSub: { color: 'var(--text-secondary)', fontSize: '0.8rem' },
};
