import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock, Zap } from 'lucide-react';
import '../styles/globals.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}><Zap size={24} color="#fff" /></div>
          <span style={styles.logoText}>SplitSmart</span>
        </div>

        <div style={styles.card}>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Sign in to manage your shared expenses</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <div style={styles.inputWrapper}>
                <Mail size={16} color="#8888aa" style={styles.inputIcon} />
                <input
                  type="email"
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={16} color="#8888aa" style={styles.inputIcon} />
                <input
                  type="password"
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '14px' }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : (<><LogIn size={18} /> Sign In</>)}
            </button>
          </form>

          <p style={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>Create one free</Link>
          </p>
        </div>

        {/* Feature hints */}
        <div style={styles.features}>
          {['🧠 Smart splits', '⚡ Real-time sync', '📊 Fairness tracker'].map((f) => (
            <span key={f} style={styles.featureChip}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute', top: '-20%', right: '-10%',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute', bottom: '-20%', left: '-10%',
    width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,101,132,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: { width: '100%', maxWidth: '420px', zIndex: 1 },
  logo: {
    display: 'flex', alignItems: 'center', gap: '12px',
    justifyContent: 'center', marginBottom: '32px',
  },
  logoIcon: {
    width: '44px', height: '44px', borderRadius: '12px',
    background: 'linear-gradient(135deg, #6c63ff, #5a52e0)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(108,99,255,0.4)',
  },
  logoText: {
    fontFamily: 'Syne, sans-serif', fontSize: '1.6rem', fontWeight: '800',
    color: 'var(--text-primary)',
  },
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '24px', padding: '36px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
  },
  title: { fontSize: '1.8rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' },
  subtitle: { color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '32px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '0.88rem', fontWeight: '500', color: 'var(--text-secondary)', letterSpacing: '0.02em' },
  inputWrapper: { position: 'relative' },
  inputIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  switchText: { textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem' },
  link: { color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: '600' },
  features: { display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' },
  featureChip: {
    padding: '6px 14px', borderRadius: '100px', fontSize: '0.8rem',
    background: 'rgba(108,99,255,0.1)', color: 'var(--text-secondary)',
    border: '1px solid rgba(108,99,255,0.2)',
  },
};
