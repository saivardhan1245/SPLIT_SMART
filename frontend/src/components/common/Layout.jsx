import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, LayoutDashboard, Users, LogOut, Menu, X, Bell, ChevronRight } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div style={styles.wrapper}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, transform: sidebarOpen ? 'translateX(0)' : undefined }}>
        {/* Logo */}
        <div style={styles.sidebarLogo}>
          <div style={styles.logoIcon}><Zap size={20} color="#fff" /></div>
          <span style={styles.logoText}>SplitSmart</span>
        </div>

        {/* Nav */}
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navItem,
                ...(isActive(item.path) ? styles.navItemActive : {}),
              }}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
              {isActive(item.path) && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div style={styles.sidebarBottom}>
          <div style={styles.userCard}>
            <div style={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={styles.userInfo}>
              <p style={styles.userName}>{user?.name}</p>
              <p style={styles.userEmail}>{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        {/* Top bar (mobile) */}
        <div style={styles.topbar}>
          <button style={styles.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div style={styles.topbarLogo}>
            <Zap size={18} color="#6c63ff" />
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: '700' }}>SplitSmart</span>
          </div>
          <div style={styles.topbarRight}>
            <div style={styles.avatarSmall}>{user?.name?.charAt(0).toUpperCase()}</div>
          </div>
        </div>

        <div style={styles.content}>{children}</div>
      </main>
    </div>
  );
}

const styles = {
  wrapper: { display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    zIndex: 99, display: 'none',
    '@media (max-width: 768px)': { display: 'block' },
  },
  sidebar: {
    width: '260px', minHeight: '100vh',
    background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', padding: '24px 16px',
    position: 'sticky', top: 0, height: '100vh',
    flexShrink: 0,
  },
  sidebarLogo: {
    display: 'flex', alignItems: 'center', gap: '12px',
    marginBottom: '36px', paddingLeft: '8px',
  },
  logoIcon: {
    width: '36px', height: '36px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #6c63ff, #5a52e0)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '1.2rem' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 16px', borderRadius: '12px',
    color: 'var(--text-secondary)', textDecoration: 'none',
    fontSize: '0.95rem', fontWeight: '500', transition: 'var(--transition)',
  },
  navItemActive: {
    background: 'rgba(108,99,255,0.15)', color: 'var(--accent-primary)',
    border: '1px solid rgba(108,99,255,0.2)',
  },
  sidebarBottom: { borderTop: '1px solid var(--border)', paddingTop: '16px' },
  userCard: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px', borderRadius: '12px', marginBottom: '8px',
    background: 'var(--bg-hover)',
  },
  avatar: {
    width: '38px', height: '38px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '1rem', color: 'white', flexShrink: 0,
  },
  userInfo: { overflow: 'hidden' },
  userName: { fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userEmail: { fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    width: '100%', padding: '10px 16px', borderRadius: '10px',
    background: 'transparent', border: 'none',
    color: 'var(--text-secondary)', cursor: 'pointer',
    fontSize: '0.9rem', fontWeight: '500', transition: 'var(--transition)',
  },
  // Mobile topbar
  topbar: {
    display: 'none', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', borderBottom: '1px solid var(--border)',
    background: 'var(--bg-secondary)', position: 'sticky', top: 0, zIndex: 50,
  },
  menuBtn: {
    background: 'none', border: 'none', color: 'var(--text-primary)',
    cursor: 'pointer', display: 'flex', padding: '4px',
  },
  topbarLogo: { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' },
  topbarRight: {},
  avatarSmall: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '0.85rem', color: 'white',
  },
  main: { flex: 1, overflow: 'auto' },
  content: { padding: '32px', maxWidth: '1100px' },
};
