import React, { useState, useEffect } from 'react';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminLoginPage from './components/Admin/AdminLoginPage';
import DistributorDashboard from './components/Distributor/DistributorDashboard';
import './App.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const savedRaw = localStorage.getItem('atomy_admin_session') || sessionStorage.getItem('atomy_admin_session');
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        const MAX_SESSION_AGE = 24 * 60 * 60 * 1000; // 24 hours
        if (parsed?.authenticated && parsed?.adminUser && parsed?.loginTimestamp) {
          if (Date.now() - parsed.loginTimestamp < MAX_SESSION_AGE) {
            return true;
          }
        }
      }
      return false;
    } catch {
      return false;
    }
  });

  const [currentAdmin, setCurrentAdmin] = useState(() => {
    try {
      const savedRaw = localStorage.getItem('atomy_admin_session') || sessionStorage.getItem('atomy_admin_session');
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        const MAX_SESSION_AGE = 24 * 60 * 60 * 1000;
        if (parsed?.authenticated && parsed?.adminUser && parsed?.loginTimestamp) {
          if (Date.now() - parsed.loginTimestamp < MAX_SESSION_AGE) {
            return parsed.adminUser;
          }
        }
      }
      return null;
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
      ) : currentAdmin?.role === 'DISTRIBUTOR_ADMIN' ? (
        <DistributorDashboard
          distributorUser={currentAdmin}
          onLogout={handleLogout}
          onBackToStore={handleBackToStore}
        />
      ) : currentAdmin?.role === 'SUPER_ADMIN' ? (
        <AdminDashboard 
          adminProfileProp={currentAdmin}
          onLogout={handleLogout}
          onBackToStore={handleBackToStore}
        />
      ) : (
        <AdminLoginPage 
          onLoginSuccess={handleLoginSuccess}
          onBackToStore={handleBackToStore}
        />
      )}
    </div>
  );
}
