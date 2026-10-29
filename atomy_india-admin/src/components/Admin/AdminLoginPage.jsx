import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Building2
} from 'lucide-react';
import ficLogo from '../../assets/fic-symbol.png';
import IndiaMap from '../Header/IndiaMap';
import './AdminLoginPage.css';

export default function AdminLoginPage({ onLoginSuccess, onBackToStore }) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedUser = emailOrUsername.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setErrorMsg('Please enter both your Admin ID/Email and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Authorized Administrative Credentials
      const authorizedAdminUsers = [
        'naveen.admin@atomy.com',
        'admin@atomy.in',
        'admin'
      ];
      const isValid = authorizedAdminUsers.includes(trimmedUser.toLowerCase()) && trimmedPass === 'admin123';

      if (!isValid) {
        setIsLoading(false);
        setErrorMsg('Invalid administrative credentials. Access denied. Please enter the authorized administrator email and password.');
        return;
      }

      setSuccessMsg('Authentication verified. Loading Operations Console...');

      const adminUser = {
        name: trimmedUser.toLowerCase().includes('naveen') ? 'Naveen Sourabh Pal' : 'Atomy Operations Admin',
        email: trimmedUser.includes('@') ? trimmedUser : `${trimmedUser}@atomy.in`,
        role: 'Super Administrator',
        employeeId: 'AT-IN-001',
        department: 'E-Commerce Operations & Supply Chain',
        location: 'Gurugram HQ, India',
        twoFactorEnabled: true,
        lastLogin: 'Just now (IST)',
        sessionIp: '192.168.1.104 (Secure VPN)'
      };

      if (rememberMe) {
        localStorage.setItem('atomy_admin_session', JSON.stringify({
          authenticated: true,
          adminUser,
          loginTimestamp: Date.now()
        }));
      } else {
        sessionStorage.setItem('atomy_admin_session', JSON.stringify({
          authenticated: true,
          adminUser,
          loginTimestamp: Date.now()
        }));
      }

      setTimeout(() => {
        setIsLoading(false);
        if (onLoginSuccess) {
          onLoginSuccess(adminUser);
        }
      }, 500);
    }, 600);
  };

  return (
    <div className="admin-login-viewport" id="admin-login-screen">
      {/* Top Floating White Navigation Bar */}
      <header className="login-top-bar">
        <div className="login-brand-meta">
          <span className="brand-dot-pulse" />
          <span className="brand-meta-text">Forge India Connect • Administrator Portal</span>
        </div>

        <button 
          type="button" 
          id="btn-return-storefront"
          className="btn-link-store" 
          onClick={onBackToStore}
          title="Return to Customer Shopping Mall (Port 5173)"
        >
          <span>Customer Store (5173)</span>
          <ExternalLink size={14} />
        </button>
      </header>

      {/* Center Auth Card Container */}
      <main className="login-card-container">
        {/* Forge India Connect Brand Logo */}
        <div className="signin-logo-wrap" style={{ cursor: 'pointer' }} onClick={onBackToStore} title="Forge India Connect">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src={ficLogo}
              alt="Forge India Connect"
              style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 800, fontSize: '24px', letterSpacing: '0.8px', lineHeight: 1.1 }}>
                <span style={{ color: '#002C6C' }}>FORGE</span>
                <span style={{ color: '#FF9933', display: 'flex', alignItems: 'center' }}>
                  <IndiaMap style={{ width: '18px', height: '22px', fill: '#FF9933', marginRight: '1px', display: 'inline-block' }} />
                  NDIA
                </span>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px', color: '#00A3E0', marginTop: '2px' }}>
                CONNECT
              </div>
            </div>
          </div>
        </div>

        {/* Crisp White Card */}
        <div className="login-white-card">
          {/* Card Header */}
          <div className="login-header-group">
            <div className="login-header-title-row">
              <h1 className="login-title">Operations Console</h1>
              <span className="admin-pill-badge">ADMIN</span>
            </div>
            <p className="login-subtitle">
              Internal Administrative Access • Secure Workspace
            </p>
          </div>

          <div className="signin-divider-line" />

          {/* Error & Success Alerts */}
          {errorMsg && (
            <div className="login-alert-box error" role="alert" id="admin-login-error">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="login-alert-box success" role="alert" id="admin-login-success">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Input: Admin Email / Username */}
            <div className="form-field-group">
              <label htmlFor="admin-email" className="field-label">
                Official Email or Admin ID
              </label>
              <div className="input-wrap">
                <Mail size={17} className="input-icon" />
                <input
                  id="admin-email"
                  type="text"
                  autoComplete="username"
                  placeholder="e.g. naveen.admin@atomy.com"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  disabled={isLoading}
                  className="login-input"
                  required
                />
              </div>
            </div>

            {/* Input: Password */}
            <div className="form-field-group">
              <div className="field-label-row">
                <label htmlFor="admin-password" className="field-label">
                  Security Password
                </label>
              </div>
              <div className="input-wrap">
                <Lock size={17} className="input-icon" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter administrator password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="login-input"
                  required
                />
                <button
                  type="button"
                  id="btn-toggle-password-visibility"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Keep session active checkbox */}
            <div className="form-row-options">
              <label className="checkbox-label" htmlFor="check-remember-me">
                <input
                  id="check-remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="checkbox-custom" />
                <span className="checkbox-text">Keep session active on this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-admin-login-submit"
              className={`login-submit-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="submit-spinner" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Card Footer Security Badges */}
          <div className="login-card-footer">
            <div className="security-badge-item">
              <ShieldCheck size={14} />
              <span>TLS 256-Bit Encrypted</span>
            </div>
            <div className="security-badge-divider">•</div>
            <div className="security-badge-item">
              <Building2 size={14} />
              <span>Gurugram HQ Node</span>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <p className="login-legal-text">
          Authorized personnel only. All access attempts, session timestamps, and administrative actions are logged in compliance with Atomy India Enterprise IT Policy.
        </p>
      </main>
    </div>
  );
}
