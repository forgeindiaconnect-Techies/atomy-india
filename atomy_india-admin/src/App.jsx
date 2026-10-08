import React, { useState, useEffect } from 'react';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminLoginPage from './components/Admin/AdminLoginPage';
import './App.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const localSession = localStorage.getItem('atomy_admin_session');
      if (localSession) {
        const parsed = JSON.parse(localSession);
        if (parsed?.authenticated) return true;
      }
      const sessSession = sessionStorage.getItem('atomy_admin_session');
      if (sessSession) {
        const parsed = JSON.parse(sessSession);
        if (parsed?.authenticated) return true;
      }
      return false;
    } catch {
      return false;
    }
  });

  const [currentAdmin, setCurrentAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('atomy_admin_session') || sessionStorage.getItem('atomy_admin_session');
      return saved ? JSON.parse(saved).adminUser : null;
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (adminUserData) => {
    setCurrentAdmin(adminUserData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('atomy_admin_session');
      sessionStorage.removeItem('atomy_admin_session');
    } catch (e) {
      console.error('Failed to clear admin session', e);
    }
    setIsAuthenticated(false);
    setCurrentAdmin(null);
  };

  const handleBackToStore = () => {
    const storeUrl = import.meta.env.VITE_STORE_URL || 'http://localhost:5173';
    window.location.href = storeUrl;
  };

  return (
    <div className="admin-app-root">
      {!isAuthenticated ? (
        <AdminLoginPage 
          onLoginSuccess={handleLoginSuccess}
          onBackToStore={handleBackToStore}
        />
      ) : (
        <AdminDashboard 
          adminProfileProp={currentAdmin}
          onLogout={handleLogout}
          onBackToStore={handleBackToStore}
        />
      )}
    </div>
  );
}
