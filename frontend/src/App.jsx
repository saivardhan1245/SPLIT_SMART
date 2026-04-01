import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import GroupPage from './pages/GroupPage';
import InsightsPage from './pages/InsightsPage';
import Layout from './components/common/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return !user ? children : <Navigate to="/dashboard" />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" />} />
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
    <Route path="/dashboard" element={<PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>} />
    <Route path="/groups/:id" element={<PrivateRoute><Layout><GroupPage /></Layout></PrivateRoute>} />
    <Route path="/groups/:id/insights" element={<PrivateRoute><Layout><InsightsPage /></Layout></PrivateRoute>} />
  </Routes>
);

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1a2e',
                color: '#e2e8f0',
                border: '1px solid #4a5568',
                borderRadius: '12px',
              },
            }}
          />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
