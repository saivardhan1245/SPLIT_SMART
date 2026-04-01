import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { UserPlus, Mail, Lock, User, Zap } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to SplitSmart 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.container}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}><Zap size={24} color="#fff" /></div>
          <span style={styles.logoText}>SplitSmart</span>
        </div>

        <div style={styles.card}>
          <h1 style={styles.title}>Create account</h1>
          <p style={styles.subtitle}>Start splitting expenses smartly with your group</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <div style={styles.inputWrapper}>
                <User size={16} color="#8888aa" style={styles.inputIcon} />
                <input
                  type="text" className="input-field" style={{ paddingLeft: '40px' }}
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <div style={styles.inputWrapper}>
                <Mail size={16} color="#8888aa" style={styles.inputIcon} />
                <input
                  type="email" className="input-field" style={{ paddingLeft: '40px' }}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.inputWrapper}>
                  <Lock size={16} color="#8888aa" style={styles.inputIcon} />
                  <input
                    type="password" className="input-field" style={{ paddingLeft: '40px' }}
                    placeholder="Min 6 chars"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirm</label>
                <div style={styles.inputWrapper}>
                  <Lock size={16} color="#8888aa" style={styles.inputIcon} />
                  <input
                    type="password" className="input-field" style={{ paddingLeft: '40px' }}
                    placeholder="Repeat"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit" className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
              disabled={loading}
            >
              {loading ? 'Creating account...' : (<><UserPlus size={18} /> Create Account</>)}
            </button>
          </form>

          <p style={styles.switchText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', background: 'var(--bg-primary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px', position: 'relative', overflow: 'hidden',
  },
  orb1: {
    position: 'absolute', top: '-20%', left: '-10%', width: '500px', height: '500px',
    borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute', bottom: '-20%', right: '-10%', width: '400px', height: '400px',
    borderRadius: '50%', background: 'radial-gradient(circle, rgba(67,233,123,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: { width: '100%', maxWidth: '480px', zIndex: 1 },
  logo: { display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '32px' },
  logoIcon: {
    width: '44px', height: '44px', borderRadius: '12px',
    background: 'linear-gradient(135deg, #6c63ff, #5a52e0)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(108,99,255,0.4)',
  },
  logoText: { fontFamily: 'Syne, sans-serif', fontSize: '1.6rem', fontWeight: '800' },
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '24px', padding: '36px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
  },
  title: { fontSize: '1.8rem', fontWeight: '700', marginBottom: '8px' },
  subtitle: { color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '32px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '0.88rem', fontWeight: '500', color: 'var(--text-secondary)' },
  inputWrapper: { position: 'relative' },
  inputIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  switchText: { textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem' },
  link: { color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: '600' },
};
