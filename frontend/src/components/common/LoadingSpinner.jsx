import React from 'react';
import { Zap } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.spinner}>
        <Zap size={28} color="#6c63ff" />
      </div>
      <p style={styles.text}>Loading...</p>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh',
    background: 'var(--bg-primary)', gap: '16px',
  },
  spinner: {
    width: '56px', height: '56px', borderRadius: '16px',
    background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    animation: 'pulse 1.5s ease infinite',
  },
  text: { color: 'var(--text-secondary)', fontSize: '0.9rem' },
};
